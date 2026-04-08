import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Download, FileJson, Wallet, TrendingUp, TrendingDown, ShieldAlert, Link2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const STATUS_MAP = {
    em_elaboracao: { label: 'Em Elaboração', color: 'bg-amber-100 text-amber-700' },
    enviado: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
    aprovado: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700' },
    arquivado: { label: 'Arquivado', color: 'bg-slate-100 text-slate-600' },
};

const TABS = [
    { key: 'receitas', label: 'Receitas' },
    { key: 'despesas', label: 'Despesas' },
    { key: 'compatibilidade', label: 'Compatibilidade' },
    { key: 'reserva', label: 'Reserva Contingência' },
];

const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#6366f1','#84cc16','#e11d48'];

export default function LoaShow({ auth, loa, totais, despesasPorFuncao, fontesRecursos, naturezasDespesa }) {
    const [activeTab, setActiveTab] = useState('receitas');
    const fmtMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
    const st = STATUS_MAP[loa.status] || STATUS_MAP.em_elaboracao;

    // Gráfico barras: Receita vs Despesa
    const barData = {
        labels: ['Receitas Previstas', 'Despesas Fixadas', 'Reserva Contingência'],
        datasets: [{
            label: 'Valores (R$)',
            data: [totais.receitas, totais.despesas, totais.reserva],
            backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)'],
            borderColor: ['#10b981', '#ef4444', '#f59e0b'],
            borderWidth: 1, borderRadius: 6,
        }],
    };
    const barOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: `Visão Geral — LOA ${loa.ano}` } },
        scales: { y: { ticks: { callback: (v) => fmtMoney(v) } } },
    };

    // Gráfico pizza: despesas por função
    const pieData = {
        labels: despesasPorFuncao.map(d => `Função ${d.funcao}`),
        datasets: [{
            data: despesasPorFuncao.map(d => d.total),
            backgroundColor: PIE_COLORS.slice(0, despesasPorFuncao.length),
            borderWidth: 2, borderColor: '#fff',
        }],
    };
    const pieOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Despesas por Função' }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${fmtMoney(ctx.raw)}` } } },
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`LOA ${loa.ano}`} />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <Link href={route('loa.index')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
                                <ArrowLeft size={16} /> Voltar
                            </Link>
                            <div className="flex gap-2">
                                <Link href={route('loa.edit', loa.id)} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 rounded-md text-xs font-medium text-white uppercase hover:bg-amber-600 transition">Editar</Link>
                                <a href={route('loa.exportar-esfinge', loa.id)} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 rounded-md text-xs font-medium text-white uppercase hover:bg-violet-700 transition">
                                    <FileJson size={14} /> e-Sfinge
                                </a>
                                {loa.pdf_lei && (
                                    <a href={`/storage/${loa.pdf_lei}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-md text-xs font-medium text-white uppercase hover:bg-emerald-700 transition">
                                        <Download size={14} /> PDF
                                    </a>
                                )}
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-slate-800 mt-4 flex items-center gap-2">
                            <Wallet size={28} className="text-blue-600" /> LOA {loa.ano}
                            {loa.numero_texto_juridico && <span className="text-base font-normal text-slate-500 ml-2">({loa.numero_texto_juridico})</span>}
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-5 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div><h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Status</h4><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${st.color}`}>{st.label}</span></div>
                            <div><h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Receitas</h4><p className="text-sm font-bold text-green-700 font-mono">{fmtMoney(totais.receitas)}</p></div>
                            <div><h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Despesas</h4><p className="text-sm font-bold text-red-700 font-mono">{fmtMoney(totais.despesas)}</p></div>
                            <div><h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Reserva</h4><p className="text-sm font-bold text-amber-700 font-mono">{fmtMoney(totais.reserva)}</p></div>
                            <div className="lg:col-span-1"><h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Ementa</h4><p className="text-sm text-slate-700 line-clamp-2">{loa.ementa}</p></div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white shadow-sm sm:rounded-lg p-6"><div className="h-64"><Bar data={barData} options={barOpts} /></div></div>
                        {despesasPorFuncao.length > 0 && (
                            <div className="bg-white shadow-sm sm:rounded-lg p-6"><div className="h-64"><Pie data={pieData} options={pieOpts} /></div></div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="border-b border-slate-200">
                            <nav className="flex overflow-x-auto -mb-px">
                                {TABS.map(tab => (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        className={`whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 transition-colors
                                            ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >{tab.label}</button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* Receitas */}
                            {activeTab === 'receitas' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 text-left border-b">Código</th>
                                                <th className="px-4 py-3 text-left border-b">Descrição</th>
                                                <th className="px-4 py-3 text-right border-b">Previsto</th>
                                                <th className="px-4 py-3 text-right border-b">Constante</th>
                                                <th className="px-4 py-3 text-right border-b">Realizado Ant.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(loa.previsao_receitas || []).map((r, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-mono text-slate-600">{r.codigo_receita}</td>
                                                    <td className="px-4 py-3 text-slate-800">{r.descricao}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-green-700">{fmtMoney(r.valor_previsto)}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-500">{r.valor_constante ? fmtMoney(r.valor_constante) : '—'}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-500">{r.valor_realizado_ano_anterior ? fmtMoney(r.valor_realizado_ano_anterior) : '—'}</td>
                                                </tr>
                                            ))}
                                            {(loa.previsao_receitas || []).length === 0 && (
                                                <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">Nenhuma receita cadastrada.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Despesas */}
                            {activeTab === 'despesas' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                            <tr>
                                                <th className="px-3 py-3 border-b">Função</th>
                                                <th className="px-3 py-3 border-b">Subfunção</th>
                                                <th className="px-3 py-3 border-b">Programa</th>
                                                <th className="px-3 py-3 border-b">Ação</th>
                                                <th className="px-3 py-3 border-b">Unid. Orçam.</th>
                                                <th className="px-3 py-3 border-b">Natureza</th>
                                                <th className="px-3 py-3 border-b">Fonte</th>
                                                <th className="px-3 py-3 text-right border-b">Dotado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(loa.dotacoes_despesas || []).map((d, i) => (
                                                <tr key={i} className="hover:bg-slate-50 text-xs">
                                                    <td className="px-3 py-2 font-mono">{d.funcao_codigo}</td>
                                                    <td className="px-3 py-2 font-mono">{d.subfuncao_codigo}</td>
                                                    <td className="px-3 py-2 font-mono">{d.programa_codigo}</td>
                                                    <td className="px-3 py-2 font-mono">{d.acao_codigo}</td>
                                                    <td className="px-3 py-2 text-slate-700">{d.unidade_orcamentaria}</td>
                                                    <td className="px-3 py-2 font-mono" title={naturezasDespesa[d.natureza_despesa]}>{d.natureza_despesa}</td>
                                                    <td className="px-3 py-2 font-mono" title={fontesRecursos[d.fonte_recursos]}>{d.fonte_recursos}</td>
                                                    <td className="px-3 py-2 text-right font-mono font-semibold text-red-700">{fmtMoney(d.valor_dotado)}</td>
                                                </tr>
                                            ))}
                                            {(loa.dotacoes_despesas || []).length === 0 && (
                                                <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-400">Nenhuma dotação cadastrada.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Compatibilidade */}
                            {activeTab === 'compatibilidade' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 text-left border-b">Demonstrativo</th>
                                                <th className="px-4 py-3 text-left border-b">Objetivo PPA</th>
                                                <th className="px-4 py-3 text-left border-b">Meta LDO</th>
                                                <th className="px-4 py-3 text-right border-b">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(loa.compatibilidade || []).map((c, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-slate-800">{c.demonstrativo}</td>
                                                    <td className="px-4 py-3 text-slate-600">{c.objetivo_ppa || '—'}</td>
                                                    <td className="px-4 py-3 text-slate-600">{c.meta_ldo || '—'}</td>
                                                    <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">{fmtMoney(c.valor_compatibilizado)}</td>
                                                </tr>
                                            ))}
                                            {(loa.compatibilidade || []).length === 0 && (
                                                <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">Nenhuma compatibilidade cadastrada.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Reserva Contingência */}
                            {activeTab === 'reserva' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 text-left border-b">Descrição</th>
                                                <th className="px-4 py-3 text-right border-b w-48">Valor Reservado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(loa.reserva_contingencia || []).map((r, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-slate-800">{r.descricao}</td>
                                                    <td className="px-4 py-3 text-right font-mono font-semibold text-amber-700">{fmtMoney(r.valor_reserva)}</td>
                                                </tr>
                                            ))}
                                            {(loa.reserva_contingencia || []).length === 0 && (
                                                <tr><td colSpan="2" className="px-4 py-8 text-center text-slate-400">Nenhuma reserva cadastrada.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
