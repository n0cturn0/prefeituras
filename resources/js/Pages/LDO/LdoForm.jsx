import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft, FileCheck, Download, Loader2, AlertCircle, CheckCircle, Globe, Database, X } from 'lucide-react';
import AnexoMetasFiscaisForm from './AnexoMetasFiscaisForm';
import AnexoRiscosFiscaisForm from './AnexoRiscosFiscaisForm';
import AudienciasPublicasForm from './AudienciasPublicasForm';
import MetasPrioridadesForm from './MetasPrioridadesForm';

const TABS = [
    { key: 'dados', label: 'Dados Gerais' },
    { key: 'metas_fiscais', label: 'Metas Fiscais' },
    { key: 'riscos_fiscais', label: 'Riscos Fiscais' },
    { key: 'audiencias', label: 'Audiências Públicas' },
    { key: 'metas_prioridades', label: 'Metas & Prioridades' },
];

export default function LdoForm({ auth, ldo, acoes, tiposMeta, meiosComunicacao, flash }) {
    const isEdit = !!ldo;
    const [activeTab, setActiveTab] = useState('dados');
    const [portalUrl, setPortalUrl] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [isPortalImporting, setIsPortalImporting] = useState(false);
    const [portalDocuments, setPortalDocuments] = useState([]);
    const [showPortalPreview, setShowPortalPreview] = useState(false);
    const [portalError, setPortalError] = useState('');
    const [portalSuccess, setPortalSuccess] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        ano: ldo?.ano || new Date().getFullYear() + 1,
        ementa: ldo?.ementa || '',
        status: ldo?.status || 'em_elaboracao',
        data_envio_legislativo: ldo?.data_envio_legislativo?.split('T')[0] || '',
        data_devolucao_executivo: ldo?.data_devolucao_executivo?.split('T')[0] || '',
        pdf_lei: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route('ldo.update', ldo.id), {
                forceFormData: true,
                _method: 'put',
            });
        } else {
            post(route('ldo.store'), { forceFormData: true });
        }
    };

    const handleImportFromPortal = async () => {
        if (!portalUrl) {
            setPortalError('Por favor, informe a URL do portal de transparência.');
            return;
        }

        setIsPortalImporting(true);
        setPortalError('');
        setPortalSuccess(false);
        setPortalDocuments([]);

        try {
            const response = await fetch(route('ldo.import-from-portal'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    portal_url: portalUrl,
                    ano: selectedYear || null,
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
            const response = await fetch(route('ldo.import-from-portal-confirm'), {
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
                throw new Error(result.error || 'Erro ao salvar LDOs');
            }

            window.location.href = route('ldo.index');
        } catch (error) {
            setPortalError(error.message);
        } finally {
            setIsPortalImporting(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-slate-800 leading-tight">
                    {isEdit ? `Editar LDO ${ldo.ano}` : 'Nova LDO'}
                </h2>
            }
        >
            <Head title={isEdit ? `Editar LDO ${ldo.ano}` : 'Nova LDO'} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Voltar */}
                    <Link href={route('ldo.index')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 w-fit">
                        <ArrowLeft size={16} /> Voltar para lista
                    </Link>

                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <FileCheck size={18} /> {flash.success}
                        </div>
                    )}

                    {/* Portal Import Section - Only on create */}
                    {!isEdit && (
                        <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Globe size={20} className="text-purple-600" />
                                Importar do Portal QualitySistemas
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Cole a URL do portal de transparência para importar automaticamente os documentos de LDO disponíveis.
                            </p>
                            
                            <div className="flex gap-3">
                                <input
                                    type="url"
                                    placeholder="https://web.qualitysistemas.com.br/planejamento_orcamentario/prefeitura_municipal_de_..."
                                    className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    value={portalUrl}
                                    onChange={(e) => setPortalUrl(e.target.value)}
                                />
                                <select
                                    className="w-32 rounded-md border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="">Todos os anos</option>
                                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
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
                    )}

                    {/* ─── Tabs ─── */}
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="border-b border-slate-200">
                            <nav className="flex overflow-x-auto -mb-px">
                                {TABS.map((tab) => {
                                    // Tabs de anexos desabilitadas se ainda não salvou a LDO
                                    const disabled = !isEdit && tab.key !== 'dados';
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`
                                                whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 transition-colors
                                                ${activeTab === tab.key
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                                }
                                                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="p-6 sm:p-8">
                            {/* ── Tab: Dados Gerais ── */}
                            {activeTab === 'dados' && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Ano de Referência *</label>
                                            <input
                                                type="number" min="2000" max="2099" step="1"
                                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.ano}
                                                onChange={(e) => setData('ano', e.target.value)}
                                                required
                                            />
                                            {errors.ano && <p className="text-red-600 text-xs mt-1">{errors.ano}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Status</label>
                                            <select
                                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                            >
                                                <option value="em_elaboracao">Em Elaboração</option>
                                                <option value="enviado">Enviado ao Legislativo</option>
                                                <option value="aprovado">Aprovado</option>
                                                <option value="arquivado">Arquivado</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">PDF da Lei (15MB máx)</label>
                                            <input
                                                type="file" accept="application/pdf"
                                                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                onChange={(e) => setData('pdf_lei', e.target.files[0])}
                                            />
                                            {errors.pdf_lei && <p className="text-red-600 text-xs mt-1">{errors.pdf_lei}</p>}
                                            {isEdit && ldo.pdf_lei && (
                                                <a href={`/storage/${ldo.pdf_lei}`} target="_blank" rel="noreferrer" className="text-blue-600 text-sm mt-1 inline-block hover:underline">
                                                    Ver PDF atual
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Ementa *</label>
                                        <textarea
                                            rows={4}
                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.ementa}
                                            onChange={(e) => setData('ementa', e.target.value)}
                                            placeholder="Dispõe sobre as diretrizes orçamentárias para o exercício financeiro de..."
                                            required
                                        />
                                        {errors.ementa && <p className="text-red-600 text-xs mt-1">{errors.ementa}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Data Envio ao Legislativo</label>
                                            <input
                                                type="date"
                                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.data_envio_legislativo}
                                                onChange={(e) => setData('data_envio_legislativo', e.target.value)}
                                            />
                                            {errors.data_envio_legislativo && <p className="text-red-600 text-xs mt-1">{errors.data_envio_legislativo}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Data Devolução ao Executivo</label>
                                            <input
                                                type="date"
                                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={data.data_devolucao_executivo}
                                                onChange={(e) => setData('data_devolucao_executivo', e.target.value)}
                                            />
                                            {errors.data_devolucao_executivo && <p className="text-red-600 text-xs mt-1">{errors.data_devolucao_executivo}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                                        >
                                            <Save size={18} />
                                            {processing ? 'Salvando...' : isEdit ? 'Atualizar LDO' : 'Criar LDO'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── Tab: Metas Fiscais ── */}
                            {activeTab === 'metas_fiscais' && isEdit && (
                                <AnexoMetasFiscaisForm
                                    ldoId={ldo.id}
                                    ldoAno={ldo.ano}
                                    existingMetas={ldo.metas_fiscais || []}
                                    tiposMeta={tiposMeta}
                                />
                            )}

                            {/* ── Tab: Riscos Fiscais ── */}
                            {activeTab === 'riscos_fiscais' && isEdit && (
                                <AnexoRiscosFiscaisForm
                                    ldoId={ldo.id}
                                    existingRiscos={ldo.riscos_fiscais || []}
                                />
                            )}

                            {/* ── Tab: Audiências Públicas ── */}
                            {activeTab === 'audiencias' && isEdit && (
                                <AudienciasPublicasForm
                                    ldoId={ldo.id}
                                    existingAudiencias={ldo.audiencias_publicas || []}
                                    meiosComunicacao={meiosComunicacao}
                                />
                            )}

                            {/* ── Tab: Metas & Prioridades ── */}
                            {activeTab === 'metas_prioridades' && isEdit && (
                                <MetasPrioridadesForm
                                    ldoId={ldo.id}
                                    ldoAno={ldo.ano}
                                    existingMetas={ldo.metasPrioridades || []}
                                    acoes={acoes}
                                />
                            )}
                        </div>
                    </div>

                    {/* Portal Preview Modal */}
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
                                            <strong>Atenção:</strong> Os documentos serão importados com o ano de referência conforme extraído do documento.
                                            Documentos duplicados (mesmo ano) serão ignorados.
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
