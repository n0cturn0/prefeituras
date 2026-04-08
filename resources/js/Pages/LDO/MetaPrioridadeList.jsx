import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Eye, Target } from 'lucide-react';

export default function MetaPrioridadeList({ auth, metas, filters, anos }) {
    const fmtMoney = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Metas e Prioridades da LDO</h2>}
        >
            <Head title="Metas e Prioridades da LDO" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white p-4 shadow sm:rounded-lg mb-6 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm text-slate-500 mb-1">Filtrar por Ano</label>
                            <select
                                className="w-full rounded-md border-slate-300 text-sm"
                                defaultValue={filters.ano || ''}
                                onChange={(e) => {
                                    window.location.href = route('ldo-metas-prioridades.index', { ano: e.target.value });
                                }}
                            >
                                <option value="">Todos os Anos</option>
                                {anos.map(ano => (
                                    <option key={ano} value={ano}>{ano}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex-none">
                            <Link
                                href={route('ldo-metas-prioridades.create')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 border border-transparent rounded-md font-medium text-xs text-white uppercase tracking-widest hover:bg-violet-700 transition"
                            >
                                <Plus size={16} />
                                Nova Meta
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3 font-medium border-b border-slate-200">Ano</th>
                                        <th className="px-4 py-3 font-medium border-b border-slate-200">Função</th>
                                        <th className="px-4 py-3 font-medium border-b border-slate-200">Sub</th>
                                        <th className="px-4 py-3 font-medium border-b border-slate-200">Ação</th>
                                        <th className="px-4 py-3 font-medium border-b border-slate-200 min-w-[200px]">Descrição</th>
                                        <th className="px-4 py-3 font-medium border-b border-slate-200 text-right">Previsto</th>
                                        <th className="px-4 py-3 font-medium border-b border-slate-200 text-right">Empenhado</th>
                                        <th className="px-4 py-3 font-medium border-b border-slate-200 text-right">Liquidado</th>
                                        <th className="px-4 py-3 font-medium border-b border-slate-200 text-right">Pago</th>
                                        <th className="px-4 py-3 font-medium border-b border-slate-200 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {metas.data.map((meta) => (
                                        <tr key={meta.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                {meta.ldo?.ano || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                {meta.funcao_codigo || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                {meta.subfuncao_codigo || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                {meta.acao_codigo || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 max-w-[250px] truncate" title={meta.descricao}>
                                                {meta.descricao}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-600 text-right">
                                                {fmtMoney(meta.valor_financeiro_previsto)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-right">
                                                {fmtMoney(meta.valor_empenhado)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-right">
                                                {fmtMoney(meta.valor_liquidado)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-right">
                                                {fmtMoney(meta.valor_pago)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                                <Link 
                                                    href={route('ldo-metas-prioridades.show', meta.id)}
                                                    className="inline-flex items-center text-violet-600 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded transition"
                                                >
                                                    <Eye size={16} className="mr-1.5" /> Detalhar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {metas.data.length === 0 && (
                                        <tr>
                                            <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                                                Nenhuma meta/prioridade encontrada para os filtros atuais.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {metas.data.length > 0 && (
                            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                    Showing {metas.from} to {metas.to} of {metas.total} results
                                </div>
                                <div className="flex gap-1">
                                    {metas.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded text-sm ${
                                                link.active 
                                                    ? 'bg-violet-600 text-white' 
                                                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}