import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Download, FileJson, Scale, BarChart3, AlertTriangle, Users, Target } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATUS_MAP = {
    em_elaboracao: { label: 'Em Elaboração', color: 'bg-amber-100 text-amber-700' },
    enviado: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
    aprovado: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700' },
    arquivado: { label: 'Arquivado', color: 'bg-slate-100 text-slate-600' },
};

const TABS = [
    { key: 'metas_fiscais', label: 'Metas Fiscais', icon: BarChart3 },
    { key: 'riscos_fiscais', label: 'Riscos Fiscais', icon: AlertTriangle },
    { key: 'audiencias', label: 'Audiências Públicas', icon: Users },
    { key: 'metas_prioridades', label: 'Metas & Prioridades', icon: Target },
];

export default function LdoShow({ auth, ldo, tiposMeta, meiosComunicacao }) {
    const [activeTab, setActiveTab] = useState('metas_fiscais');
    const fmtMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
    const st = STATUS_MAP[ldo.status] || STATUS_MAP.em_elaboracao;

    // Dados para gráfico de metas fiscais
    const metasFiscais = ldo.metas_fiscais || [];
    const chartLabels = [...new Set(metasFiscais.map(m => tiposMeta[m.tipo_meta] || m.tipo_meta))];
    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Valor Previsto (R$)',
                data: chartLabels.map(label => {
                    const item = metasFiscais.find(m => (tiposMeta[m.tipo_meta] || m.tipo_meta) === label);
                    return item ? parseFloat(item.valor_previsto) : 0;
                }),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: 'Realizado Ano Anterior (R$)',
                data: chartLabels.map(label => {
                    const item = metasFiscais.find(m => (tiposMeta[m.tipo_meta] || m.tipo_meta) === label);
                    return item ? parseFloat(item.valor_realizado_ano_anterior || 0) : 0;
                }),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: `Metas Fiscais — LDO ${ldo.ano}`, font: { size: 14 } },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${fmtMoney(ctx.raw)}`,
                },
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: (v) => fmtMoney(v),
                },
            },
        },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-slate-800 leading-tight flex items-center gap-2">
                    <Scale size={24} className="text-blue-600" />
                    LDO {ldo.ano}
                </h2>
            }
        >
            <Head title={`LDO ${ldo.ano}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* ─── Header ─── */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <Link href={route('ldo.index')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
                                <ArrowLeft size={16} /> Voltar
                            </Link>
                            <div className="flex gap-2">
                                <Link href={route('ldo.edit', ldo.id)} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 rounded-md text-xs font-medium text-white uppercase hover:bg-amber-600 transition">
                                    Editar
                                </Link>
                                <a
                                    href={route('ldo.exportar-esfinge', ldo.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 rounded-md text-xs font-medium text-white uppercase hover:bg-violet-700 transition"
                                >
                                    <FileJson size={14} /> Exportar e-Sfinge
                                </a>
                                {ldo.pdf_lei && (
                                    <a href={`/storage/${ldo.pdf_lei}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-md text-xs font-medium text-white uppercase hover:bg-emerald-700 transition">
                                        <Download size={14} /> PDF Lei
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</h4>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${st.color}`}>{st.label}</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Envio ao Legislativo</h4>
                                <p className="text-sm font-medium text-slate-900">{fmtDate(ldo.data_envio_legislativo)}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Devolução ao Executivo</h4>
                                <p className="text-sm font-medium text-slate-900">{fmtDate(ldo.data_devolucao_executivo)}</p>
                            </div>
                            <div className="lg:col-span-1">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ementa</h4>
                                <p className="text-sm text-slate-700 line-clamp-3">{ldo.ementa}</p>
                            </div>
                        </div>
                    </div>

                    {/* ─── Gráfico de Metas Fiscais ─── */}
                    {metasFiscais.length > 0 && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="h-72">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    )}

                    {/* ─── Tabs de Anexos ─── */}
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="border-b border-slate-200">
                            <nav className="flex overflow-x-auto -mb-px">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`
                                            whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                                            ${activeTab === tab.key
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                            }
                                        `}
                                    >
                                        <tab.icon size={16} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* ── Metas Fiscais ── */}
                            {activeTab === 'metas_fiscais' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 text-left border-b">Tipo da Meta</th>
                                                <th className="px-4 py-3 text-center border-b">Ano</th>
                                                <th className="px-4 py-3 text-right border-b">Previsto (R$)</th>
                                                <th className="px-4 py-3 text-right border-b">Constante (R$)</th>
                                                <th className="px-4 py-3 text-right border-b">Realizado Ant. (R$)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {metasFiscais.map((m, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-slate-800">{tiposMeta[m.tipo_meta] || m.tipo_meta}</td>
                                                    <td className="px-4 py-3 text-center tabular-nums">{m.ano_meta}</td>
                                                    <td className="px-4 py-3 text-right font-mono">{fmtMoney(m.valor_previsto)}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-500">{m.valor_constante ? fmtMoney(m.valor_constante) : '—'}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-500">{m.valor_realizado_ano_anterior ? fmtMoney(m.valor_realizado_ano_anterior) : '—'}</td>
                                                </tr>
                                            ))}
                                            {metasFiscais.length === 0 && (
                                                <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">Nenhuma meta fiscal cadastrada.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ── Riscos Fiscais ── */}
                            {activeTab === 'riscos_fiscais' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 text-left border-b">Descrição do Risco</th>
                                                <th className="px-4 py-3 text-right border-b w-44">Valor Estimado</th>
                                                <th className="px-4 py-3 text-left border-b">Providência</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(ldo.riscos_fiscais || []).map((r, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-slate-700">{r.descricao}</td>
                                                    <td className="px-4 py-3 text-right font-mono font-semibold text-red-600">{fmtMoney(r.valor_estimado)}</td>
                                                    <td className="px-4 py-3 text-slate-600">{r.providencia}</td>
                                                </tr>
                                            ))}
                                            {(ldo.riscos_fiscais || []).length === 0 && (
                                                <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-400">Nenhum risco fiscal cadastrado.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ── Audiências Públicas ── */}
                            {activeTab === 'audiencias' && (
                                <div className="space-y-4">
                                    {(ldo.audiencias_publicas || []).map((a, i) => (
                                        <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audiência #{i + 1}</span>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                                <div>
                                                    <span className="text-xs text-slate-500">1ª Convocação</span>
                                                    <p className="text-sm font-medium text-slate-900">{fmtDate(a.data_primeira_convocacao)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-500">Data da Audiência</span>
                                                    <p className="text-sm font-medium text-slate-900">{fmtDate(a.data_audiencia)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-500">Local</span>
                                                    <p className="text-sm font-medium text-slate-900">{a.local}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-500">Meio de Comunicação</span>
                                                    <p className="text-sm font-medium text-slate-900">{meiosComunicacao[a.tipo_meio_comunicacao] || a.tipo_meio_comunicacao}</p>
                                                </div>
                                                {a.nome_veiculo && (
                                                    <div>
                                                        <span className="text-xs text-slate-500">Veículo</span>
                                                        <p className="text-sm text-slate-900">{a.nome_veiculo}</p>
                                                    </div>
                                                )}
                                                {a.observacoes && (
                                                    <div>
                                                        <span className="text-xs text-slate-500">Obs.</span>
                                                        <p className="text-sm text-slate-700">{a.observacoes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {(ldo.audiencias_publicas || []).length === 0 && (
                                        <p className="text-center text-slate-400 py-8">Nenhuma audiência pública registrada.</p>
                                    )}
                                </div>
                            )}

                            {/* ── Metas & Prioridades ── */}
                            {activeTab === 'metas_prioridades' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 text-left border-b">Ação PPA</th>
                                                <th className="px-4 py-3 text-left border-b">Descrição</th>
                                                <th className="px-4 py-3 text-right border-b">Meta Física</th>
                                                <th className="px-4 py-3 text-left border-b">Unidade</th>
                                                <th className="px-4 py-3 text-right border-b">Valor Financeiro</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(ldo.metas_prioridades || []).map((mp, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-mono text-slate-600">{mp.acao_codigo || '—'}</td>
                                                    <td className="px-4 py-3 text-slate-800">{mp.descricao}</td>
                                                    <td className="px-4 py-3 text-right font-mono">{mp.meta_fisica_prevista || '—'}</td>
                                                    <td className="px-4 py-3 uppercase text-slate-500">{mp.unidade_medida || '—'}</td>
                                                    <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">{fmtMoney(mp.valor_financeiro_previsto)}</td>
                                                </tr>
                                            ))}
                                            {(ldo.metas_prioridades || []).length === 0 && (
                                                <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">Nenhuma meta/prioridade cadastrada.</td></tr>
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
