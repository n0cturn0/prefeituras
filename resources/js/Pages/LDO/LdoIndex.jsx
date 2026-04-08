import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Plus, Eye, Edit, Download, Scale, CheckCircle, Clock, FileText
} from 'lucide-react';

const STATUS_MAP = {
    em_elaboracao: { label: 'Em Elaboração', color: 'bg-amber-100 text-amber-700' },
    enviado: { label: 'Enviado ao Legislativo', color: 'bg-blue-100 text-blue-700' },
    aprovado: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700' },
    arquivado: { label: 'Arquivado', color: 'bg-slate-100 text-slate-600' },
};

export default function LdoIndex({ auth, ldos, stats, filters }) {
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">LDO — Lei de Diretrizes Orçamentárias</h2>}
        >
            <Head title="LDO — Lei de Diretrizes Orçamentárias" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* ─── Cards de Resumo ─── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard icon={Scale} color="blue" label="Total LDOs" value={stats.total} />
                        <StatCard icon={CheckCircle} color="emerald" label="Aprovadas" value={stats.aprovadas} />
                        <StatCard icon={Clock} color="amber" label="Em Elaboração" value={stats.em_elaboracao} />
                        <StatCard icon={FileText} color="violet" label="Audiências Realizadas" value={stats.audiencias_total} />
                    </div>

                    {/* ─── Filtro + Botão ─── */}
                    <div className="bg-white p-4 shadow sm:rounded-lg flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-sm text-slate-500 mb-1">Filtrar por Status</label>
                            <select
                                className="w-full rounded-md border-slate-300 text-sm"
                                defaultValue={filters?.status || ''}
                                onChange={(e) => router.get(route('ldo.index'), { status: e.target.value }, { preserveState: true })}
                            >
                                <option value="">Todos</option>
                                {Object.entries(STATUS_MAP).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <Link
                            href={route('ldo.create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-md font-medium text-xs text-white uppercase tracking-widest hover:bg-blue-700 transition shadow-sm"
                        >
                            <Plus size={16} /> Nova LDO
                        </Link>
                    </div>

                    {/* ─── Tabela ─── */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Ano</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Ementa</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Status</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200 text-center">Metas</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200 text-center">Audiências</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {ldos.data.map((ldo) => {
                                        const st = STATUS_MAP[ldo.status] || STATUS_MAP.em_elaboracao;
                                        return (
                                            <tr key={ldo.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 tabular-nums">{ldo.ano}</td>
                                                <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate" title={ldo.ementa}>{ldo.ementa}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${st.color}`}>{st.label}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600">{ldo.metas_fiscais_count}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600">{ldo.audiencias_publicas_count}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={route('ldo.show', ldo.id)} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition" title="Ver detalhes">
                                                            <Eye size={18} />
                                                        </Link>
                                                        <Link href={route('ldo.edit', ldo.id)} className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 p-1.5 rounded transition" title="Editar">
                                                            <Edit size={18} />
                                                        </Link>
                                                        {ldo.pdf_lei && (
                                                            <a href={`/storage/${ldo.pdf_lei}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded transition" title="Baixar PDF">
                                                                <Download size={18} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {ldos.data.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Nenhuma LDO cadastrada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ─── Card de Estatística Reutilizável ─── */
function StatCard({ icon: Icon, color, label, value }) {
    const colors = {
        blue: 'border-blue-500 bg-blue-50 text-blue-600',
        emerald: 'border-emerald-500 bg-emerald-50 text-emerald-600',
        amber: 'border-amber-500 bg-amber-50 text-amber-600',
        violet: 'border-violet-500 bg-violet-50 text-violet-600',
    };
    const c = colors[color] || colors.blue;
    const [border, bg, text] = c.split(' ');

    return (
        <div className={`bg-white overflow-hidden shadow-sm sm:rounded-lg p-5 border-l-4 ${border}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                </div>
                <div className={`p-3 rounded-full ${bg}`}>
                    <Icon className={`h-6 w-6 ${text}`} />
                </div>
            </div>
        </div>
    );
}
