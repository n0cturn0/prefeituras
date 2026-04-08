import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft, BarChart2 } from 'lucide-react';

export default function IndicadorForm({ auth, indicador, programa_id, acao_id, programas, acoes }) {
    const isEdit = !!indicador;

    const { data, setData, post, put, processing, errors } = useForm({
        programa_id: indicador?.programa_id || programa_id || '',
        acao_id: indicador?.acao_id || acao_id || '',
        nome: indicador?.nome || '',
        formula: indicador?.formula || '',
        unidade_medida: indicador?.unidade_medida || '%',
        peso: indicador?.peso || '1.00',
        meta_ano1: indicador?.meta_ano1 || '',
        meta_ano2: indicador?.meta_ano2 || '',
        meta_ano3: indicador?.meta_ano3 || '',
        meta_ano4: indicador?.meta_ano4 || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('indicadores.update', indicador.id));
        } else {
            post(route('indicadores.store'));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">
                {isEdit ? 'Editar Indicador' : 'Novo Indicador PPA'}
            </h2>}
        >
            <Head title={isEdit ? 'Editar Indicador' : 'Novo Indicador PPA'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg flex flex-col md:flex-row">
                        
                        <div className="md:w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-between">
                            <div>
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full w-fit mb-6">
                                    <BarChart2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Indicadores de Desempenho</h3>
                                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                    Os indicadores são instrumentos utilizados para medir o desempenho qualitativo e quantitativo dos programas do seu PPA. 
                                    Você pode vincular a nível Macroeconômico (Programa) ou nível Operacional (Ação).
                                </p>
                            </div>
                            
                            {data.programa_id && (
                                <Link href={route('programas.show', data.programa_id)} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
                                    <ArrowLeft size={16} /> Voltar para o Programa
                                </Link>
                            )}
                            {(data.acao_id && !data.programa_id) && (
                                <button type="button" onClick={() => window.history.back()} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 text-left">
                                    <ArrowLeft size={16} /> Voltar
                                </button>
                            )}
                        </div>

                        <div className="md:w-2/3 p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Vincular a um Programa <span className="text-xs text-slate-400 font-normal">(Opcional)</span></label>
                                        <select 
                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 text-sm"
                                            value={data.programa_id}
                                            onChange={e => setData('programa_id', e.target.value)}
                                        >
                                            <option value="">-- Não vincular a Programa --</option>
                                            {programas?.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Vincular a uma Ação <span className="text-xs text-slate-400 font-normal">(Opcional)</span></label>
                                        <select 
                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 text-sm"
                                            value={data.acao_id}
                                            onChange={e => setData('acao_id', e.target.value)}
                                        >
                                            <option value="">-- Não vincular a Ação --</option>
                                            {acoes?.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nome do Indicador</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500"
                                        placeholder="Ex: Índice de Mortalidade Infantil"
                                        value={data.nome}
                                        onChange={e => setData('nome', e.target.value)}
                                        required
                                    />
                                    {errors.nome && <div className="text-red-600 text-xs mt-1">{errors.nome}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Fórmula de Cálculo</label>
                                    <textarea 
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 font-mono text-sm placeholder:font-sans"
                                        placeholder="Ex: (Óbitos menores 1 ano / Nascidos vivos) * 1000"
                                        value={data.formula}
                                        onChange={e => setData('formula', e.target.value)}
                                        required
                                    />
                                    {errors.formula && <div className="text-red-600 text-xs mt-1">{errors.formula}</div>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Unidade de Medida</label>
                                        <input 
                                            type="text" 
                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                            placeholder="Ex: %, Taxa, Índice, Quantidade"
                                            value={data.unidade_medida}
                                            onChange={e => setData('unidade_medida', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Peso do Indicador <span className="text-xs text-slate-400 font-normal">(padrão 1.00)</span></label>
                                        <input 
                                            type="number" step="0.01" min="0" max="100"
                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                            value={data.peso}
                                            onChange={e => setData('peso', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3 border-b pb-2">Metas do Indicador por Ano (PPA)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Ano 1</span>
                                            <input type="number" step="0.01" className="w-full rounded-md border-slate-300 shadow-sm" value={data.meta_ano1} onChange={e => setData('meta_ano1', e.target.value)} />
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Ano 2</span>
                                            <input type="number" step="0.01" className="w-full rounded-md border-slate-300 shadow-sm" value={data.meta_ano2} onChange={e => setData('meta_ano2', e.target.value)} />
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Ano 3</span>
                                            <input type="number" step="0.01" className="w-full rounded-md border-slate-300 shadow-sm" value={data.meta_ano3} onChange={e => setData('meta_ano3', e.target.value)} />
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Ano 4</span>
                                            <input type="number" step="0.01" className="w-full rounded-md border-slate-300 shadow-sm" value={data.meta_ano4} onChange={e => setData('meta_ano4', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-200 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition shadow"
                                    >
                                        <Save size={18} />
                                        {processing ? 'Salvando...' : 'Salvar Indicador'}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
