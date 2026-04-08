import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Target, Settings, Plus, LayoutList, PenTool, Trash2 } from 'lucide-react';

export default function ProgramaShow({ auth, programa }) {
    const fmtMoney = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Programa: {programa.codigo} - {programa.nome}</h2>}
        >
            <Head title={`Programa ${programa.codigo}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <Link href={route('programas.index')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
                                <ArrowLeft size={16} /> Voltar para Programas
                            </Link>
                            <Link
                                href={route('programas.edit', programa.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 border border-transparent rounded-md font-medium text-xs text-white uppercase tracking-widest hover:bg-amber-600 transition"
                            >
                                <PenTool size={14} /> Editar Programa
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Responsável</h4>
                                <p className="text-sm font-medium text-slate-900">{programa.responsavel}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Classificação</h4>
                                <p className="text-sm font-medium text-slate-900">{programa.funcao_codigo} / {programa.subfuncao_codigo}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Período</h4>
                                <p className="text-sm font-medium text-slate-900">{programa.data_inicio} até {programa.data_fim}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Valor Global</h4>
                                <p className="text-sm font-bold text-emerald-600">{fmtMoney(programa.valor_global)}</p>
                            </div>
                            <div className="md:col-span-2 lg:col-span-4">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Objetivo</h4>
                                <p className="text-sm text-slate-700">{programa.objetivo}</p>
                            </div>
                        </div>
                    </div>

                    {/* Ações Section */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2"><Target size={20} className="text-blue-500" /> Ações do Programa</h3>
                            <Link
                                href={route('acoes.create', { programa_id: programa.id })}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-md font-medium text-xs text-white uppercase hover:bg-blue-700 transition"
                            >
                                <Plus size={14} /> Nova Ação
                            </Link>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                                        <th className="px-6 py-3">Código / Nome</th>
                                        <th className="px-6 py-3">Produto</th>
                                        <th className="px-6 py-3">Valor</th>
                                        <th className="px-6 py-3 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {programa.acoes && programa.acoes.length > 0 ? programa.acoes.map(acao => (
                                        <tr key={acao.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 mb-1">{acao.codigo} - {acao.nome}</div>
                                                <div className="text-xs text-slate-500 line-clamp-2">{acao.descricao}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{acao.produto || '-'}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{fmtMoney(acao.valor_global_acao)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('acoes.edit', acao.id)} className="text-amber-500 hover:text-amber-700 p-1">
                                                        <PenTool size={16} />
                                                    </Link>
                                                    {/* Add delete form here optionally */}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="px-6 py-6 text-center text-slate-500 text-sm">Nenhuma ação vinculada a este programa.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Indicadores Section */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden flex-1">
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2"><LayoutList size={20} className="text-emerald-500" /> Indicadores do Programa</h3>
                            <Link
                                href={route('indicadores.create', { programa_id: programa.id })}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-md font-medium text-xs text-white uppercase hover:bg-emerald-700 transition"
                            >
                                <Plus size={14} /> Novo Indicador
                            </Link>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                                        <th className="px-6 py-3 min-w-[200px]">Nome do Indicador</th>
                                        <th className="px-6 py-3">Fórmula</th>
                                        <th className="px-6 py-3">Unidade</th>
                                        <th className="px-6 py-3 text-center">Metas (Anos 1 a 4)</th>
                                        <th className="px-6 py-3 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {programa.indicadores && programa.indicadores.length > 0 ? programa.indicadores.map(ind => (
                                        <tr key={ind.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-4 font-semibold text-slate-900 text-sm text-balance">{ind.nome}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-500 max-w-[200px] truncate" title={ind.formula}>{ind.formula}</td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-700 uppercase">{ind.unidade_medida}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <span className="bg-white border rounded px-1.5 py-0.5 text-xs text-slate-500">{ind.meta_ano1 || '-'}</span>
                                                    <span className="bg-white border rounded px-1.5 py-0.5 text-xs text-slate-500">{ind.meta_ano2 || '-'}</span>
                                                    <span className="bg-white border rounded px-1.5 py-0.5 text-xs text-slate-500">{ind.meta_ano3 || '-'}</span>
                                                    <span className="bg-white border rounded px-1.5 py-0.5 text-xs text-slate-500">{ind.meta_ano4 || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={route('indicadores.edit', ind.id)} className="text-amber-500 hover:text-amber-700 p-1 inline-block">
                                                    <PenTool size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-6 py-6 text-center text-slate-500 text-sm">Nenhum indicador de programa vinculado.</td></tr>
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
