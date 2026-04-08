import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft, Download, Loader2, X, AlertCircle, CheckCircle, Globe, Database } from 'lucide-react';
import axios from 'axios';

export default function ProgramaForm({ auth, programa, ppas, funcoes }) {
    const isEdit = !!programa;
    const [subfuncoes, setSubfuncoes] = useState([]);

    // Portal import states
    const [portalUrl, setPortalUrl] = useState('');
    const [selectedAnoForImport, setSelectedAnoForImport] = useState('');
    const [isPortalImporting, setIsPortalImporting] = useState(false);
    const [portalProgramas, setPortalProgramas] = useState([]);
    const [showPortalPreview, setShowPortalPreview] = useState(false);
    const [portalError, setPortalError] = useState('');
    const [portalSuccess, setPortalSuccess] = useState(false);
    const [portalPpaSelecionado, setPortalPpaSelecionado] = useState(null);

    const { data, setData, post, put, processing, errors } = useForm({
        ppa_id: programa?.ppa_id || (ppas.length > 0 ? ppas[0].id : ''),
        codigo: programa?.codigo || '',
        nome: programa?.nome || '',
        objetivo: programa?.objetivo || '',
        problema: programa?.problema || '',
        publico_alvo: programa?.publico_alvo || '',
        tipo_programa: programa?.tipo_programa || 'finalistico',
        responsavel: programa?.responsavel || '',
        unidade_gestora: programa?.unidade_gestora || '',
        valor_global: programa?.valor_global || '',
        meta_financeira_total: programa?.meta_financeira_total || '',
        funcao_codigo: programa?.funcao_codigo || '',
        subfuncao_codigo: programa?.subfuncao_codigo || '',
        fonte_financiamento_fiscal: programa?.fonte_financiamento_fiscal || 'S',
        fonte_financiamento_seguridade: programa?.fonte_financiamento_seguridade || 'N',
        data_inicio: programa?.data_inicio || '',
        data_fim: programa?.data_fim || '',
    });

    useEffect(() => {
        if (data.funcao_codigo) {
            axios.get(`/transparencia/api/funcoes/${data.funcao_codigo}/subfuncoes`)
                .then(res => {
                    setSubfuncoes(res.data);
                })
                .catch(err => console.error(err));
        } else {
            setSubfuncoes([]);
        }
    }, [data.funcao_codigo]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('programas.update', programa.id));
        } else {
            post(route('programas.store'));
        }
    };

    const handleImportFromPortal = async () => {
        if (!portalUrl) {
            setPortalError('Por favor, informe a URL do portal de transparência.');
            return;
        }
        if (!selectedAnoForImport) {
            setPortalError('Por favor, selecione o ano.');
            return;
        }

        setIsPortalImporting(true);
        setPortalError('');
        setPortalSuccess(false);
        setPortalProgramas([]);
        setPortalPpaSelecionado(null);

        try {
            const response = await fetch(route('programas.import-from-portal'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    portal_url: portalUrl,
                    ano: parseInt(selectedAnoForImport),
                }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                window.location.reload();
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao importar do portal');
            }

            setPortalProgramas(result.programas || []);
            setPortalPpaSelecionado(result.ppa_selecionado || null);
            setShowPortalPreview(true);
            setPortalSuccess(true);
        } catch (error) {
            setPortalError(error.message);
            setPortalSuccess(false);
        } finally {
            setIsPortalImporting(false);
        }
    };

    const handleConfirmPortalImport = async () => {
        if (portalProgramas.length === 0) return;

        setIsPortalImporting(true);
        setPortalError('');

        try {
            const response = await fetch(route('programas.import-from-portal-confirm'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    programas: portalProgramas,
                    ano: parseInt(selectedAnoForImport),
                    ppa_id: portalPpaSelecionado?.id || null,
                }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                window.location.reload();
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                setPortalError(result.message || result.error || 'Erro ao salvar programas');
                return;
            }

            if (result.sucesso === 0 && result.ignorados > 0) {
                setPortalError(result.message);
                return;
            }

            window.location.href = route('programas.index');
        } catch (error) {
            setPortalError(error.message);
        } finally {
            setIsPortalImporting(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">
                {isEdit ? 'Editar Programa' : 'Novo Programa'}
            </h2>}
        >
            <Head title={isEdit ? 'Editar Programa' : 'Novo Programa'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <div className="mb-6">
                            <Link href={route('programas.index')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 w-fit">
                                <ArrowLeft size={16} /> Voltar para lista
                            </Link>
                        </div>

                        {!isEdit && (
                            <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Globe size={20} className="text-purple-600" />
                                    Importar Metas Financeiras do PPA
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Cole a URL do portal de transparência para importar automaticamente os programas e suas metas financeiras.
                                </p>
                                
                                <div className="flex gap-3 mb-3">
                                    <input
                                        type="url"
                                        placeholder="https://web.qualitysistemas.com.br/planejamento_orcamentario/prefeitura_municipal_de_..."
                                        className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                        value={portalUrl}
                                        onChange={(e) => setPortalUrl(e.target.value)}
                                    />
                                    <select
                                        className="rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                        value={selectedAnoForImport}
                                        onChange={(e) => setSelectedAnoForImport(e.target.value)}
                                    >
                                        <option value="">Selecione o ano...</option>
                                        {[2026,2025,2024,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010].map(ano => (
                                            <option key={ano} value={ano}>{ano}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleImportFromPortal}
                                        disabled={isPortalImporting || !portalUrl || !selectedAnoForImport}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-md font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50"
                                    >
                                        {isPortalImporting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Importando...
                                            </>
                                        ) : (
                                            <>
                                                <Database size={18} />
                                                Importar do Portal
                                            </>
                                        )}
                                    </button>
                                </div>

                                {portalError && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircle size={16} />
                                        {portalError}
                                    </div>
                                )}

                                {portalSuccess && portalProgramas.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <CheckCircle size={16} />
                                        {portalProgramas.length} programa(s) encontrado(s)! Clique em "Ver Programas" para importar.
                                        <button
                                            type="button"
                                            onClick={() => setShowPortalPreview(true)}
                                            className="ml-2 underline font-medium"
                                        >
                                            Ver Programas
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Bloco: Dados Superiores */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700">PPA Referência</label>
                                    <select 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500"
                                        value={data.ppa_id}
                                        onChange={e => setData('ppa_id', e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Selecione um PPA</option>
                                        {ppas.map(p => <option key={p.id} value={p.id}>{p.ano_inicio} a {p.ano_fim}</option>)}
                                    </select>
                                    {errors.ppa_id && <div className="text-red-600 text-xs mt-1">{errors.ppa_id}</div>}
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700">Cód. do Programa</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: 0010"
                                        maxLength={10}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500"
                                        value={data.codigo}
                                        onChange={e => setData('codigo', e.target.value)}
                                        required
                                    />
                                    {errors.codigo && <div className="text-red-600 text-xs mt-1">{errors.codigo}</div>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700">Nome do Programa</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500"
                                        value={data.nome}
                                        onChange={e => setData('nome', e.target.value)}
                                        required
                                    />
                                    {errors.nome && <div className="text-red-600 text-xs mt-1">{errors.nome}</div>}
                                </div>
                            </div>

                            {/* Bloco: Classificação Institucional */}
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Tipo de Programa</label>
                                    <select 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500"
                                        value={data.tipo_programa}
                                        onChange={e => setData('tipo_programa', e.target.value)}
                                        required
                                    >
                                        <option value="finalistico">Finalístico</option>
                                        <option value="gestao_manutencao">Gestão / Manutenção</option>
                                        <option value="operacoes_especiais">Operações Especiais</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Responsável</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.responsavel}
                                        onChange={e => setData('responsavel', e.target.value)}
                                        required
                                    />
                                    {errors.responsavel && <div className="text-red-600 text-xs mt-1">{errors.responsavel}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Unidade Gestora</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.unidade_gestora}
                                        onChange={e => setData('unidade_gestora', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-slate-100 py-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Objetivo</label>
                                    <textarea 
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.objetivo}
                                        onChange={e => setData('objetivo', e.target.value)}
                                        required
                                    />
                                    {errors.objetivo && <div className="text-red-600 text-xs mt-1">{errors.objetivo}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Público-Alvo</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm mb-4"
                                        value={data.publico_alvo}
                                        onChange={e => setData('publico_alvo', e.target.value)}
                                    />
                                    
                                    <label className="block text-sm font-medium text-slate-700">Problema a ser resolvido</label>
                                    <textarea 
                                        rows={2}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.problema}
                                        onChange={e => setData('problema', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Data Início</label>
                                    <input 
                                        type="date" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.data_inicio}
                                        onChange={e => setData('data_inicio', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Data Fim</label>
                                    <input 
                                        type="date" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                                        value={data.data_fim}
                                        onChange={e => setData('data_fim', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Valor Global (R$)</label>
                                    <input 
                                        type="number" step="0.01" min="0"
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm font-mono"
                                        value={data.valor_global}
                                        onChange={e => setData('valor_global', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Meta Financeira (R$)</label>
                                    <input 
                                        type="number" step="0.01" min="0"
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm font-mono"
                                        value={data.meta_financeira_total}
                                        onChange={e => setData('meta_financeira_total', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 border border-transparent rounded-md font-medium text-white hover:bg-emerald-700 transition"
                                >
                                    <Save size={18} />
                                    {processing ? 'Salvando...' : 'Salvar Programa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showPortalPreview && portalProgramas.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-semibold text-slate-800">
                                Programas Encontrados no Portal
                            </h2>
                            <button
                                onClick={() => setShowPortalPreview(false)}
                                className="p-2 hover:bg-slate-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="bg-amber-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-amber-800">
                                    <strong>Atenção:</strong> Os programas serão importados para o ano {selectedAnoForImport}.
                                    {portalPpaSelecionado ? ` O PPA encontrado é ${portalPpaSelecionado.ano_inicio} a ${portalPpaSelecionado.ano_fim}.` : ' Nenhum PPA local encontrado para este ano.'}
                                    Programas duplicados (mesmo código e PPA) serão ignorados.
                                </p>
                            </div>

                            {portalPpaSelecionado && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Vincular ao PPA:</label>
                                    <select
                                        className="rounded-md border-slate-300 shadow-sm focus:border-purple-500 bg-slate-100"
                                        value={portalPpaSelecionado.id}
                                        disabled
                                    >
                                        <option value={portalPpaSelecionado.id}>
                                            {portalPpaSelecionado.ano_inicio} a {portalPpaSelecionado.ano_fim}
                                        </option>
                                    </select>
                                </div>
                            )}

                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Código</th>
                                            <th className="px-3 py-2 text-left">Nome</th>
                                            <th className="px-3 py-2 text-right">Valor Global (R$)</th>
                                            <th className="px-3 py-2 text-right">Meta Financeira (R$)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portalProgramas.map((prog, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-3 py-2 font-mono">{prog.codigo}</td>
                                                <td className="px-3 py-2">{prog.nome}</td>
                                                <td className="px-3 py-2 text-right font-mono">
                                                    {parseFloat(prog.valor_global || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-right font-mono">
                                                    {parseFloat(prog.meta_financeira_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border-t bg-slate-50">
                            <button
                                onClick={() => setShowPortalPreview(false)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 underline"
                            >
                                Cancelar
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleConfirmPortalImport}
                                    disabled={isPortalImporting || portalProgramas.length === 0}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 border border-transparent rounded-md font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {isPortalImporting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Importar {portalProgramas.length} Programa(s)
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
