import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Target, PenTool } from 'lucide-react';

export default function MetaPrioridadeShow({ auth, meta }) {
    const fmtMoney = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Meta/Prioridade: {meta.acao_codigo || 'Sem código'}</h2>}
        >
            <Head title={`Meta/Prioridade ${meta.acao_codigo}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <Link href={route('ldo-metas-prioridades.index')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
                                <ArrowLeft size={16} /> Voltar para Metas e Prioridades
                            </Link>
                            <Link
                                href={route('ldo-metas-prioridades.edit', meta.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 border border-transparent rounded-md font-medium text-xs text-white uppercase tracking-widest hover:bg-amber-600 transition"
                            >
                                <PenTool size={14} /> Editar
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ano LDO</h4>
                                <p className="text-sm font-medium text-slate-900">{meta.ldo?.ano || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Classificação</h4>
                                <p className="text-sm font-medium text-slate-900">
                                    Função: {meta.funcao_codigo || '-'} / SubFunção: {meta.subfuncao_codigo || '-'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ação PPA</h4>
                                <p className="text-sm font-medium text-slate-900">{meta.acao_codigo || 'Sem vínculo'}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Valor Previsto</h4>
                                <p className="text-sm font-bold text-emerald-600">{fmtMoney(meta.valor_financeiro_previsto)}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descrição</h4>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{meta.descricao}</p>
                        </div>
                    </div>

                    {/* Execução Financeira */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                                <Target size={20} className="text-violet-500" /> Execução Financeira
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Valor Empenhado</h4>
                                <p className="text-2xl font-bold text-blue-700">{fmtMoney(meta.valor_empenhado)}</p>
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Valor Liquidado</h4>
                                <p className="text-2xl font-bold text-amber-700">{fmtMoney(meta.valor_liquidado)}</p>
                            </div>
                            
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                                <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Valor Pago</h4>
                                <p className="text-2xl font-bold text-emerald-700">{fmtMoney(meta.valor_pago)}</p>
                            </div>
                        </div>

                        {meta.meta_fisica_prevista && (
                            <div className="px-6 pb-6">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Meta Física Prevista</h4>
                                        <p className="text-sm font-medium text-slate-900">{meta.meta_fisica_prevista}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Unidade de Medida</h4>
                                        <p className="text-sm font-medium text-slate-900">{meta.unidade_medida || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}