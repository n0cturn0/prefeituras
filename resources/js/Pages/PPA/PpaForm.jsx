import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft, Download, Loader2, X, AlertCircle, CheckCircle, Globe, Database } from 'lucide-react';

export default function PpaForm({ auth, ppa }) {
    const isEdit = !!ppa;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        ano_inicio: ppa?.ano_inicio || '',
        ano_fim: ppa?.ano_fim || '',
        visao: ppa?.visao || '',
        valores: ppa?.valores || '',
        diretrizes: ppa?.diretrizes || '',
        status: ppa?.status || 'em_vigor',
        data_aprovacao_lei: ppa?.data_aprovacao_lei || '',
        pdf_lei_ppa: null,
    });

    const [importUrl, setImportUrl] = useState('');
    const [portalUrl, setPortalUrl] = useState('');
    const [isPortalImporting, setIsPortalImporting] = useState(false);
    const [portalDocuments, setPortalDocuments] = useState([]);
    const [showPortalPreview, setShowPortalPreview] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [importSuccess, setImportSuccess] = useState(false);
    const [portalError, setPortalError] = useState('');
    const [portalSuccess, setPortalSuccess] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('ppa.update', ppa.id), {
                forceFormData: true,
                _method: 'put',
            });
        } else {
            post(route('ppa.store'), { forceFormData: true });
        }
    };

    const handleImportUrl = async () => {
        if (!importUrl) {
            setImportError('Por favor, informe uma URL válida.');
            return;
        }

        setIsImporting(true);
        setImportError('');
        setImportSuccess(false);
        setPreviewData(null);

        try {
            const response = await fetch(route('ppa.import-from-url'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    url: importUrl,
                    dry_run: true,
                }),
            });

            // Verificar se a resposta é JSON antes de parsear
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Recebeu HTML (provavelmente redirect para login)
                window.location.reload();
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao analisar URL');
            }

            setPreviewData(result.preview);
            setShowPreview(true);
            setImportSuccess(true);
        } catch (error) {
            setImportError(error.message);
            setImportSuccess(false);
        } finally {
            setIsImporting(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!previewData) return;

        setIsImporting(true);
        setImportError('');

        try {
            const response = await fetch(route('ppa.import-confirm'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    ppa: previewData.ppa,
                    programas: previewData.programas,
                    acoes: previewData.acoes,
                    indicadores: previewData.indicadores,
                }),
            });

            // Verificar se a resposta é JSON antes de parsear
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                window.location.reload();
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao salvar PPA');
            }

            window.location.href = route('ppa.index');
        } catch (error) {
            setImportError(error.message);
        } finally {
            setIsImporting(false);
        }
    };

    const fillFormWithPreview = () => {
        if (!previewData) return;

        setData({
            ...data,
            ano_inicio: previewData.ppa.ano_inicio || '',
            ano_fim: previewData.ppa.ano_fim || '',
            visao: previewData.ppa.visao || '',
            valores: previewData.ppa.valores || '',
            diretrizes: previewData.ppa.diretrizes || '',
            status: previewData.ppa.status || 'em_vigor',
        });

        setShowPreview(false);
        setImportSuccess(false);
    };

    const handleImportFromPortal = async () => {
        if (!portalUrl) {
            setPortalError('Por favor, informe a URL do portal de transparência.');
            return;
        }

        console.log('[Frontend] Iniciando importação do portal...');
        console.log('[Frontend] URL:', portalUrl);

        setIsPortalImporting(true);
        setPortalError('');
        setPortalSuccess(false);
        setPortalDocuments([]);

        try {
            const routeUrl = route('ppa.import-from-portal');
            console.log('[Frontend] Rota:', routeUrl);

            const response = await fetch(routeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    portal_url: portalUrl,
                }),
            });

            console.log('[Frontend] Status:', response.status);
            console.log('[Frontend] Status OK:', response.ok);

            const contentType = response.headers.get('content-type');
            console.log('[Frontend] Content-Type:', contentType);

            if (!contentType || !contentType.includes('application/json')) {
                console.log('[Frontend] Recebeu HTML, recarregando...');
                window.location.reload();
                return;
            }

            const result = await response.json();
            console.log('[Frontend] Result:', result);

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao importar do portal');
            }

            setPortalDocuments(result.documentos || []);
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
        if (portalDocuments.length === 0) return;

        setIsPortalImporting(true);
        setPortalError('');

        try {
            const response = await fetch(route('ppa.import-from-portal-confirm'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    documentos: portalDocuments,
                }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                window.location.reload();
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao salvar PPAs');
            }

            window.location.href = route('ppa.index');
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
                {isEdit ? `Editar PPA : ${ppa.ano_inicio} - ${ppa.ano_fim}` : 'Novo PPA'}
            </h2>}
        >
            <Head title={isEdit ? 'Editar PPA' : 'Novo PPA'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        
                        <div className="mb-6">
                            <Link href={route('ppa.index')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 w-fit">
                                <ArrowLeft size={16} /> Voltar para lista
                            </Link>
                        </div>

                        {!isEdit && (
                            <>
                                <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Download size={20} className="text-blue-600" />
                                        Importação Automática de PPA
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Cole a URL de um PPA externo (PDF ou página HTML) de outra prefeitura ou portal de transparência.
                                        O sistema analisará e importará automaticamente os dados.
                                    </p>
                                    
                                    <div className="flex gap-3">
                                        <input
                                            type="url"
                                            placeholder="https://.../ppa.pdf ou https://.../ppa.html"
                                            className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={importUrl}
                                            onChange={(e) => setImportUrl(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleImportUrl}
                                            disabled={isImporting || !importUrl}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
                                        >
                                            {isImporting ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Analisando...
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={18} />
                                                    Analisar URL
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {importError && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle size={16} />
                                            {importError}
                                        </div>
                                    )}

                                    {importSuccess && previewData && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle size={16} />
                                            Dados extraídos com sucesso! Clique em "Ver Preview" para revisar.
                                            <button
                                                type="button"
                                                onClick={() => setShowPreview(true)}
                                                className="ml-2 underline font-medium"
                                            >
                                                Ver Preview
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Globe size={20} className="text-purple-600" />
                                        Importar do Portal QualitySistemas
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Cole a URL do portal de transparência (ex: web.qualitysistemas.com.br/planejamento_orcamentario/...) 
                                        para importar automaticamente os documentos de PPA disponíveis.
                                    </p>
                                    
                                    <div className="flex gap-3">
                                        <input
                                            type="url"
                                            placeholder="https://web.qualitysistemas.com.br/planejamento_orcamentario/prefeitura_municipal_de_..."
                                            className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                            value={portalUrl}
                                            onChange={(e) => setPortalUrl(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleImportFromPortal}
                                            disabled={isPortalImporting || !portalUrl}
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
                                        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle size={16} />
                                            {portalError}
                                        </div>
                                    )}

                                    {portalSuccess && portalDocuments.length > 0 && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle size={16} />
                                            {portalDocuments.length} documento(s) encontrado(s)! Clique em "Ver Documentos" para importar.
                                            <button
                                                type="button"
                                                onClick={() => setShowPortalPreview(true)}
                                                className="ml-2 underline font-medium"
                                            >
                                                Ver Documentos
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Ano Início</label>
                                    <input 
                                        type="number" 
                                        min="2000" 
                                        max="2099" 
                                        step="1"
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.ano_inicio}
                                        onChange={e => setData('ano_inicio', e.target.value)}
                                        required
                                    />
                                    {errors.ano_inicio && <div className="text-red-600 text-sm mt-1">{errors.ano_inicio}</div>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Ano Fim</label>
                                    <input 
                                        type="number" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.ano_fim}
                                        onChange={e => setData('ano_fim', e.target.value)}
                                        required
                                    />
                                    {errors.ano_fim && <div className="text-red-600 text-sm mt-1">{errors.ano_fim}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Visão de Futuro</label>
                                <textarea 
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.visao}
                                    onChange={e => setData('visao', e.target.value)}
                                    required
                                />
                                {errors.visao && <div className="text-red-600 text-sm mt-1">{errors.visao}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Valores</label>
                                <textarea 
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.valores}
                                    onChange={e => setData('valores', e.target.value)}
                                />
                                {errors.valores && <div className="text-red-600 text-sm mt-1">{errors.valores}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Diretrizes</label>
                                <textarea 
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.diretrizes}
                                    onChange={e => setData('diretrizes', e.target.value)}
                                    required
                                />
                                {errors.diretrizes && <div className="text-red-600 text-sm mt-1">{errors.diretrizes}</div>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Status</label>
                                    <select 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="em_vigor">Em Vigor</option>
                                        <option value="revisao">Em Revisão</option>
                                        <option value="arquivado">Arquivado</option>
                                    </select>
                                    {errors.status && <div className="text-red-600 text-sm mt-1">{errors.status}</div>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Data Aprovação Lei</label>
                                    <input 
                                        type="date" 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.data_aprovacao_lei}
                                        onChange={e => setData('data_aprovacao_lei', e.target.value)}
                                    />
                                    {errors.data_aprovacao_lei && <div className="text-red-600 text-sm mt-1">{errors.data_aprovacao_lei}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">PDF da Lei PPA (1.5MB máx)</label>
                                    <input 
                                        type="file" 
                                        accept="application/pdf"
                                        className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={e => setData('pdf_lei_ppa', e.target.files[0])}
                                    />
                                    {errors.pdf_lei_ppa && <div className="text-red-600 text-sm mt-1">{errors.pdf_lei_ppa}</div>}
                                    
                                    {isEdit && ppa.pdf_lei_ppa && (
                                        <div className="mt-2 text-sm text-blue-600">
                                            <a href={`/storage/${ppa.pdf_lei_ppa}`} target="_blank" rel="noreferrer">Ver arquivo atual</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-200 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {processing ? 'Salvando...' : 'Salvar PPA'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showPreview && previewData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-semibold text-slate-800">
                                Preview - Dados Extraídos
                            </h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-slate-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-slate-700 mb-2">Dados do PPA</h3>
                                <p><strong>Período:</strong> {previewData.ppa.ano_inicio} - {previewData.ppa.ano_fim}</p>
                                <p><strong>Visão:</strong> {previewData.ppa.visao?.substring(0, 200)}...</p>
                                <p><strong>Diretrizes:</strong> {previewData.ppa.diretrizes?.substring(0, 200)}...</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">
                                    Programas ({previewData.programas?.length || 0})
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Código</th>
                                                <th className="px-3 py-2 text-left">Nome</th>
                                                <th className="px-3 py-2 text-left">Objetivo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(previewData.programas || []).slice(0, 10).map((prog, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-3 py-2">{prog.codigo}</td>
                                                    <td className="px-3 py-2">{prog.nome}</td>
                                                    <td className="px-3 py-2">{prog.objetivo?.substring(0, 50)}...</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {(previewData.programas?.length || 0) > 10 && (
                                        <p className="p-2 text-sm text-slate-500 text-center">
                                            ... e mais {previewData.programas.length - 10} programas
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">
                                    Ações ({previewData.acoes?.length || 0})
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Código</th>
                                                <th className="px-3 py-2 text-left">Nome</th>
                                                <th className="px-3 py-2 text-left">Produto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(previewData.acoes || []).slice(0, 10).map((acao, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-3 py-2">{acao.codigo}</td>
                                                    <td className="px-3 py-2">{acao.nome}</td>
                                                    <td className="px-3 py-2">{acao.produto}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {(previewData.acoes?.length || 0) > 10 && (
                                        <p className="p-2 text-sm text-slate-500 text-center">
                                            ... e mais {previewData.acoes.length - 10} ações
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">
                                    Indicadores ({previewData.indicadores?.length || 0})
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Nome</th>
                                                <th className="px-3 py-2 text-left">Fórmula</th>
                                                <th className="px-3 py-2 text-left">Unidade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(previewData.indicadores || []).slice(0, 10).map((ind, idx) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="px-3 py-2">{ind.nome}</td>
                                                    <td className="px-3 py-2">{ind.formula}</td>
                                                    <td className="px-3 py-2">{ind.unidade_medida}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border-t bg-slate-50">
                            <button
                                onClick={fillFormWithPreview}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 underline"
                            >
                                Preencher formulário manualmente
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmImport}
                                    disabled={isImporting}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 border border-transparent rounded-md font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isImporting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Confirmar e Salvar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPortalPreview && portalDocuments.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-semibold text-slate-800">
                                Documentos Encontrados no Portal
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
                                    <strong>Atenção:</strong> Os documentos serão importados com ano_inicio = ano_fim conforme extraído da data do documento.
                                    Documentos duplicados (mesma data e título) serão ignorados.
                                </p>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Data</th>
                                            <th className="px-3 py-2 text-left">Título</th>
                                            <th className="px-3 py-2 text-left">Ano</th>
                                            <th className="px-3 py-2 text-center">PDF</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portalDocuments.map((doc, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-3 py-2">{doc.data}</td>
                                                <td className="px-3 py-2">{doc.titulo}</td>
                                                <td className="px-3 py-2">{doc.ano}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <a 
                                                        href={doc.pdf_url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Download size={16} />
                                                    </a>
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
                                    disabled={isPortalImporting}
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
                                            Importar {portalDocuments.length} Documento(s)
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
