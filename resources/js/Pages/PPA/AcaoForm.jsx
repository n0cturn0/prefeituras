import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function AcaoForm({ auth, acao, programa_id, programas, funcoes }) {
    const isEdit = !!acao;
    const [subfuncoes, setSubfuncoes] = useState([]);

    const { data, setData, post, put, processing, errors } = useForm({
        programa_id: acao?.programa_id || programa_id || (programas.length > 0 ? programas[0].id : ''),
        codigo: acao?.codigo || '',
        nome: acao?.nome || '',
        descricao: acao?.descricao || '',
        iniciativa: acao?.iniciativa || '',
        objetivo_especifico: acao?.objetivo_especifico || '',
        produto: acao?.produto || '',
        unidade_medida: acao?.unidade_medida || 'UNIDADE',
        beneficiario: acao?.beneficiario || '',
        funcao_codigo: acao?.funcao_codigo || '',
        subfuncao_codigo: acao?.subfuncao_codigo || '',
        valor_global_acao: acao?.valor_global_acao || '',
        meta_fisica_ano1: acao?.meta_fisica_ano1 || '',
        meta_fisica_ano2: acao?.meta_fisica_ano2 || '',
        meta_fisica_ano3: acao?.meta_fisica_ano3 || '',
        meta_fisica_ano4: acao?.meta_fisica_ano4 || '',
    });

    useEffect(() => {
        if (data.funcao_codigo) {
            axios.get(`/transparencia/api/funcoes/${data.funcao_codigo}/subfuncoes`)
                .then(res => setSubfuncoes(res.data))
                .catch(err => console.error(err));
        } else {
            setSubfuncoes([]);
        }
    }, [data.funcao_codigo]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('acoes.update', acao.id));
        } else {
            post(route('acoes.store'));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">
                {isEdit ? `Editar Ação: ${acao.codigo}` : 'Nova Ação'}
            </h2>}
        >
            <Head title={isEdit ? 'Editar Ação' : 'Nova Ação'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <div className="mb-6">
                            <Link href={route('programas.show', data.programa_id)} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 w-fit">
                                <ArrowLeft size={16} /> Voltar para o Programa
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-lg border border-blue-100">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Programa Vinculado</label>
                                    <select 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 bg-white"
                                        value={data.programa_id}
                                        onChange={e => setData('programa_id', e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Selecione um programa</option>
                                        {programas.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nome}</option>)}
                                    </select>
                                    {errors.programa_id && <div className="text-red-600 text-xs mt-1">{errors.programa_id}</div>}
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/3">
                                        <label className="block text-sm font-medium text-slate-700">Cód. Ação</label>
                                        <input 
                                            type="text" 
                                            maxLength={10}
                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                            value={data.codigo}
                                            onChange={e => setData('codigo', e.target.value)}
                                            required
                                        />
                                        {errors.codigo && <div className="text-red-600 text-xs mt-1">{errors.codigo}</div>}
                                    </div>
                                    <div className="w-2/3">
                                        <label className="block text-sm font-medium text-slate-700">Nome da Ação</label>
                                        <input 
                                            type="text" 
                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                            value={data.nome}
                                            onChange={e => setData('nome', e.target.value)}
                                            required
                                        />
                                        {errors.nome && <div className="text-red-600 text-xs mt-1">{errors.nome}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Descrição</label>
                                    <textarea 
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.descricao}
                                        onChange={e => setData('descricao', e.target.value)}
                                        required
                                    />
                                    {errors.descricao && <div className="text-red-600 text-xs mt-1">{errors.descricao}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Objetivo Específico</label>
                                    <textarea 
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.objetivo_especifico}
                                        onChange={e => setData('objetivo_especifico', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Produto Entregue</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.produto}
                                        onChange={e => setData('produto', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">UN Medida (Produto)</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm placeholder:text-slate-300 uppercase"
                                        placeholder="Ex: UN, UNIDADE, EQUIPAMENTO"
                                        value={data.unidade_medida}
                                        onChange={e => setData('unidade_medida', e.target.value)}
                                        required
                                    />
                                    {errors.unidade_medida && <div className="text-red-600 text-xs mt-1">{errors.unidade_medida}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Beneficiário Direto</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.beneficiario}
                                        onChange={e => setData('beneficiario', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3 border-b pb-2">Metas Físicas (Qtd Produto)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">Ano 1</span>
                                            <input type="number" step="0.01" className="block w-full rounded-md border-slate-300 shadow-sm mt-1" value={data.meta_fisica_ano1} onChange={e => setData('meta_fisica_ano1', e.target.value)} />
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">Ano 2</span>
                                            <input type="number" step="0.01" className="block w-full rounded-md border-slate-300 shadow-sm mt-1" value={data.meta_fisica_ano2} onChange={e => setData('meta_fisica_ano2', e.target.value)} />
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">Ano 3</span>
                                            <input type="number" step="0.01" className="block w-full rounded-md border-slate-300 shadow-sm mt-1" value={data.meta_fisica_ano3} onChange={e => setData('meta_fisica_ano3', e.target.value)} />
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">Ano 4</span>
                                            <input type="number" step="0.01" className="block w-full rounded-md border-slate-300 shadow-sm mt-1" value={data.meta_fisica_ano4} onChange={e => setData('meta_fisica_ano4', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3 border-b pb-2">Investimento Total 4 Anos</label>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Valor Global da Ação (R$)</span>
                                        <input 
                                            type="number" step="0.01" min="0" 
                                            className="block w-full rounded-md border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm mt-1 font-mono text-emerald-800" 
                                            value={data.valor_global_acao} 
                                            onChange={e => setData('valor_global_acao', e.target.value)} 
                                            required
                                        />
                                        {errors.valor_global_acao && <div className="text-red-600 text-xs mt-1">{errors.valor_global_acao}</div>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Função</label>
                                    <select 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500"
                                        value={data.funcao_codigo}
                                        onChange={e => setData('funcao_codigo', e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Selecione a Função...</option>
                                        {funcoes.map(f => <option key={f.codigo} value={f.codigo}>{f.codigo} - {f.nome}</option>)}
                                    </select>
                                    {errors.funcao_codigo && <div className="text-red-600 text-xs mt-1">{errors.funcao_codigo}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Subfunção</label>
                                    <select 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500"
                                        value={data.subfuncao_codigo}
                                        onChange={e => setData('subfuncao_codigo', e.target.value)}
                                        required
                                        disabled={!data.funcao_codigo}
                                    >
                                        <option value="" disabled>Selecione a Subfunção...</option>
                                        {subfuncoes.map(sf => <option key={sf.codigo} value={sf.codigo}>{sf.codigo} - {sf.nome}</option>)}
                                    </select>
                                    {errors.subfuncao_codigo && <div className="text-red-600 text-xs mt-1">{errors.subfuncao_codigo}</div>}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
                                >
                                    <Save size={18} />
                                    {processing ? 'Salvando...' : 'Salvar Ação'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
