import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft, FileCheck } from 'lucide-react';
import PrevisaoReceitaForm from './PrevisaoReceitaForm';
import DotacoesDespesasForm from './DotacoesDespesasForm';
import AnexoCompatibilidadeForm from './AnexoCompatibilidadeForm';
import ReservaContingenciaForm from './ReservaContingenciaForm';

const TABS = [
    { key: 'dados', label: 'Dados Gerais' },
    { key: 'receitas', label: 'Previsão de Receita' },
    { key: 'despesas', label: 'Dotações Despesas' },
    { key: 'compatibilidade', label: 'Compatibilidade PPA/LDO' },
    { key: 'reserva', label: 'Reserva Contingência' },
];

export default function LoaForm({ auth, loa, funcoes, programas, acoes, fontesRecursos, naturezasDespesa, flash }) {
    const isEdit = !!loa;
    const [activeTab, setActiveTab] = useState('dados');

    const { data, setData, post, processing, errors } = useForm({
        ano: loa?.ano || new Date().getFullYear() + 1,
        ementa: loa?.ementa || '',
        status: loa?.status || 'em_elaboracao',
        numero_texto_juridico: loa?.numero_texto_juridico || '',
        data_envio_legislativo: loa?.data_envio_legislativo?.split('T')[0] || '',
        data_devolucao_executivo: loa?.data_devolucao_executivo?.split('T')[0] || '',
        reserva_contingencia_percentual: loa?.reserva_contingencia_percentual || '0.00',
        pdf_lei: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('loa.update', loa.id), { forceFormData: true, _method: 'put' });
        } else {
            post(route('loa.store'), { forceFormData: true });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isEdit ? `Editar LOA ${loa.ano}` : 'Nova LOA'} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Link href={route('loa.index')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 w-fit">
                        <ArrowLeft size={16} /> Voltar para lista
                    </Link>

                    {flash?.success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <FileCheck size={18} /> {flash.success}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        {/* Tabs */}
                        <div className="border-b border-slate-200">
                            <nav className="flex overflow-x-auto -mb-px">
                                {TABS.map((tab) => {
                                    const disabled = !isEdit && tab.key !== 'dados';
                                    return (
                                        <button key={tab.key} type="button" disabled={disabled}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 transition-colors
                                                ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                                                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >{tab.label}</button>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="p-6 sm:p-8">
                            {/* Tab: Dados Gerais */}
                            {activeTab === 'dados' && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Exercício Financeiro *</label>
                                            <input type="number" min="2000" max="2099"
                                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.ano} onChange={(e) => setData('ano', e.target.value)} required />
                                            {errors.ano && <p className="text-red-600 text-xs mt-1">{errors.ano}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Nº da Lei</label>
                                            <input type="text" maxLength="20" placeholder="Ex: Lei 1.234/2026"
                                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.numero_texto_juridico} onChange={(e) => setData('numero_texto_juridico', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Status</label>
                                            <select className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                                <option value="em_elaboracao">Em Elaboração</option>
                                                <option value="enviado">Enviado ao Legislativo</option>
                                                <option value="aprovado">Aprovado</option>
                                                <option value="arquivado">Arquivado</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Reserva Contingência (%)</label>
                                            <input type="number" step="0.01" min="0" max="99.99"
                                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.reserva_contingencia_percentual}
                                                onChange={(e) => setData('reserva_contingencia_percentual', e.target.value)} />
                                            <p className="text-xs text-slate-400 mt-0.5">Art. 5º, III LRF</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Ementa *</label>
                                        <textarea rows={3}
                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.ementa} onChange={(e) => setData('ementa', e.target.value)}
                                            placeholder="Estima a receita e fixa a despesa do Município para o exercício financeiro de..." required />
                                        {errors.ementa && <p className="text-red-600 text-xs mt-1">{errors.ementa}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Data Envio ao Legislativo</label>
                                            <input type="date" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.data_envio_legislativo} onChange={(e) => setData('data_envio_legislativo', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Data Devolução ao Executivo</label>
                                            <input type="date" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.data_devolucao_executivo} onChange={(e) => setData('data_devolucao_executivo', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">PDF da Lei (15MB máx)</label>
                                            <input type="file" accept="application/pdf"
                                                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                onChange={(e) => setData('pdf_lei', e.target.files[0])} />
                                            {isEdit && loa.pdf_lei && (
                                                <a href={`/storage/${loa.pdf_lei}`} target="_blank" rel="noreferrer" className="text-blue-600 text-sm mt-1 inline-block hover:underline">Ver PDF atual</a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 flex justify-end">
                                        <button type="submit" disabled={processing}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
                                            <Save size={18} /> {processing ? 'Salvando...' : isEdit ? 'Atualizar LOA' : 'Criar LOA'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'receitas' && isEdit && (
                                <PrevisaoReceitaForm loaId={loa.id} existingReceitas={loa.previsao_receitas || []} />
                            )}
                            {activeTab === 'despesas' && isEdit && (
                                <DotacoesDespesasForm loaId={loa.id} existingDotacoes={loa.dotacoes_despesas || []}
                                    funcoes={funcoes} programas={programas} acoes={acoes}
                                    fontesRecursos={fontesRecursos} naturezasDespesa={naturezasDespesa} />
                            )}
                            {activeTab === 'compatibilidade' && isEdit && (
                                <AnexoCompatibilidadeForm loaId={loa.id} existingItens={loa.compatibilidade || []} />
                            )}
                            {activeTab === 'reserva' && isEdit && (
                                <ReservaContingenciaForm loaId={loa.id} existingReservas={loa.reserva_contingencia || []} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
