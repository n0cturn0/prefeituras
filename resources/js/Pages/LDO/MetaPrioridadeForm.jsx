import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft } from 'lucide-react';

export default function MetaPrioridadeForm({ auth, meta, ldos }) {
    const isEdit = !!meta;
    
    const { data, setData, post, processing, errors } = useForm({
        ldo_id: meta?.ldo_id || (ldos?.[0]?.id || ''),
        acao_codigo: meta?.acao_codigo || '',
        funcao_codigo: meta?.funcao_codigo || '',
        subfuncao_codigo: meta?.subfuncao_codigo || '',
        descricao: meta?.descricao || '',
        meta_fisica_prevista: meta?.meta_fisica_prevista || '',
        unidade_medida: meta?.unidade_medida || '',
        valor_financeiro_previsto: meta?.valor_financeiro_previsto || '',
        valor_empenhado: meta?.valor_empenhado || '',
        valor_liquidado: meta?.valor_liquidado || '',
        valor_pago: meta?.valor_pago || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('ldo-metas-prioridades.update', meta.id), {
                forceFormData: true,
                _method: 'put',
            });
        } else {
            post(route('ldo-metas-prioridades.store'), { forceFormData: true });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">
                {isEdit ? 'Editar Meta/Prioridade' : 'Nova Meta/Prioridade'}
            </h2>}
        >
            <Head title={isEdit ? 'Editar Meta/Prioridade' : 'Nova Meta/Prioridade'} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <Link href={route('ldo-metas-prioridades.index')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 w-fit mb-4">
                        <ArrowLeft size={16} /> Voltar para lista
                    </Link>

                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">LDO *</label>
                                    <select
                                        className="w-full rounded-md border-slate-300"
                                        value={data.ldo_id}
                                        onChange={(e) => setData('ldo_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {ldos?.map(ldo => (
                                            <option key={ldo.id} value={ldo.id}>LDO {ldo.ano}</option>
                                        ))}
                                    </select>
                                    {errors.ldo_id && <p className="text-red-600 text-xs mt-1">{errors.ldo_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
                                    <input
                                        type="text"
                                        maxLength={2}
                                        className="w-full rounded-md border-slate-300"
                                        placeholder="00"
                                        value={data.funcao_codigo}
                                        onChange={(e) => setData('funcao_codigo', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SubFunção</label>
                                    <input
                                        type="text"
                                        maxLength={3}
                                        className="w-full rounded-md border-slate-300"
                                        placeholder="000"
                                        value={data.subfuncao_codigo}
                                        onChange={(e) => setData('subfuncao_codigo', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ação PPA (opcional)</label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        className="w-full rounded-md border-slate-300"
                                        placeholder="Código da ação"
                                        value={data.acao_codigo}
                                        onChange={(e) => setData('acao_codigo', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unidade de Medida</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-slate-300"
                                        placeholder="UN, Kg, m², etc"
                                        value={data.unidade_medida}
                                        onChange={(e) => setData('unidade_medida', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-md border-slate-300"
                                    placeholder="Descrição da meta ou prioridade..."
                                    value={data.descricao}
                                    onChange={(e) => setData('descricao', e.target.value)}
                                    required
                                />
                                {errors.descricao && <p className="text-red-600 text-xs mt-1">{errors.descricao}</p>}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Física</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-md border-slate-300"
                                        value={data.meta_fisica_prevista}
                                        onChange={(e) => setData('meta_fisica_prevista', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-emerald-700 mb-1">Previsto (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-md border-emerald-300"
                                        value={data.valor_financeiro_previsto}
                                        onChange={(e) => setData('valor_financeiro_previsto', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-1">Empenhado (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-md border-slate-300"
                                        value={data.valor_empenhado}
                                        onChange={(e) => setData('valor_empenhado', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-amber-700 mb-1">Liquidado (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-md border-slate-300"
                                        value={data.valor_liquidado}
                                        onChange={(e) => setData('valor_liquidado', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pago (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded-md border-slate-300"
                                        value={data.valor_pago}
                                        onChange={(e) => setData('valor_pago', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-md font-medium hover:bg-violet-700 transition disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {processing ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar Meta')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}