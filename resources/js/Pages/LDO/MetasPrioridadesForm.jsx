import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save, Globe, Database, Loader2, AlertCircle, CheckCircle, Download, X } from 'lucide-react';

/**
 * Formulário de Metas e Prioridades da LDO
 * Conforme Art. 165, §2º da CF/88.
 * Com vinculação opcional a ações do PPA e importação do portal.
 */
export default function MetasPrioridadesForm({ ldoId, existingMetas, acoes, ldoAno }) {
    const emptyRow = {
        acao_codigo: '',
        funcao_codigo: '',
        subfuncao_codigo: '',
        descricao: '',
        meta_fisica_prevista: '',
        unidade_medida: '',
        valor_financeiro_previsto: '',
        valor_empenhado: '',
        valor_liquidado: '',
        valor_pago: '',
    };

    const [rows, setRows] = useState(
        existingMetas.length > 0
            ? existingMetas.map(m => ({
                acao_codigo: m.acao_codigo || '',
                funcao_codigo: m.funcao_codigo || '',
                subfuncao_codigo: m.subfuncao_codigo || '',
                descricao: m.descricao,
                meta_fisica_prevista: m.meta_fisica_prevista ?? '',
                unidade_medida: m.unidade_medida || '',
                valor_financeiro_previsto: m.valor_financeiro_previsto,
                valor_empenhado: m.valor_empenhado ?? '',
                valor_liquidado: m.valor_liquidado ?? '',
                valor_pago: m.valor_pago ?? '',
            }))
            : [{ ...emptyRow }]
    );
    const [saving, setSaving] = useState(false);

    // Portal import state
    const [portalUrl, setPortalUrl] = useState('');
    const [selectedYear, setSelectedYear] = useState(ldoAno || new Date().getFullYear());
    const [isPortalImporting, setIsPortalImporting] = useState(false);
    const [portalMetas, setPortalMetas] = useState([]);
    const [showPortalPreview, setShowPortalPreview] = useState(false);
    const [portalError, setPortalError] = useState('');
    const [portalSuccess, setPortalSuccess] = useState(false);

    const addRow = () => setRows([...rows, { ...emptyRow }]);
    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));
    const updateRow = (idx, field, value) => {
        const updated = [...rows];
        updated[idx][field] = value;
        setRows(updated);
    };

    const fmtMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const totalFinanceiro = rows.reduce((acc, r) => acc + (parseFloat(r.valor_financeiro_previsto) || 0), 0);
    const totalEmpenhado = rows.reduce((acc, r) => acc + (parseFloat(r.valor_empenhado) || 0), 0);
    const totalLiquidado = rows.reduce((acc, r) => acc + (parseFloat(r.valor_liquidado) || 0), 0);
    const totalPago = rows.reduce((acc, r) => acc + (parseFloat(r.valor_pago) || 0), 0);

    const handleSave = () => {
        setSaving(true);
        router.post(route('ldo.metas-prioridades.store'), {
            ldo_id: ldoId,
            metas: rows,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const handleImportFromPortal = async () => {
        if (!portalUrl) {
            setPortalError('Por favor, informe a URL do portal de transparência.');
            return;
        }

        setIsPortalImporting(true);
        setPortalError('');
        setPortalSuccess(false);
        setPortalMetas([]);

        try {
            const response = await fetch(route('ldo.metas-prioridades.import-from-portal'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    portal_url: portalUrl,
                    ano: selectedYear,
                    ldo_id: ldoId,
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

            setPortalMetas(result.metas || []);
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
        if (portalMetas.length === 0) return;

        setIsPortalImporting(true);
        setPortalError('');

        try {
            const response = await fetch(route('ldo.metas-prioridades.import-from-portal-confirm'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    metas: portalMetas,
                    ano: selectedYear,
                    ldo_id: ldoId,
                }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                window.location.reload();
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao salvar metas');
            }

            // Add imported metas to existing rows
            const newMetas = portalMetas.map(m => ({
                acao_codigo: m.acao_codigo || '',
                funcao_codigo: m.funcao_codigo || '',
                subfuncao_codigo: m.subfuncao_codigo || '',
                descricao: m.descricao || '',
                meta_fisica_prevista: m.meta_fisica_prevista || '',
                unidade_medida: m.unidade_medida || '',
                valor_financeiro_previsto: m.valor_financeiro_previsto || 0,
                valor_empenhado: m.valor_empenhado || '',
                valor_liquidado: m.valor_liquidado || '',
                valor_pago: m.valor_pago || '',
            }));

            setRows([...rows, ...newMetas]);
            setShowPortalPreview(false);
            setPortalSuccess(false);
            setPortalUrl('');
        } catch (error) {
            setPortalError(error.message);
        } finally {
            setIsPortalImporting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Metas e Prioridades</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Art. 165, §2º da CF/88 — orientam a elaboração da LOA</p>
                </div>
                <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={16} /> Adicionar Meta
                </button>
            </div>

            {/* Portal Import Section */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Globe size={16} className="text-purple-600" />
                    Importar do Portal QualitySistemas
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                    Cole a URL do portal de transparência para importar automaticamente as metas e prioridades da LDO.
                </p>
                
                <div className="flex gap-2">
                    <input
                        type="url"
                        placeholder="https://web.qualitysistemas.com.br/..."
                        className="flex-1 rounded-md border-slate-300 text-sm focus:border-purple-500 focus:ring-purple-500"
                        value={portalUrl}
                        onChange={(e) => setPortalUrl(e.target.value)}
                    />
                    <select
                        className="w-24 rounded-md border-slate-300 text-sm focus:border-purple-500 focus:ring-purple-500"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleImportFromPortal}
                        disabled={isPortalImporting || !portalUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md font-medium hover:bg-purple-700 disabled:opacity-50"
                    >
                        {isPortalImporting ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                        Importar
                    </button>
                </div>

                {portalError && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                        <AlertCircle size={14} />
                        {portalError}
                    </div>
                )}

                {portalSuccess && portalMetas.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle size={14} />
                        {portalMetas.length} meta(s) encontrada(s)! 
                        <button type="button" onClick={() => setShowPortalPreview(true)} className="underline font-medium">
                            Verificar
                        </button>
                    </div>
                )}
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="px-2 py-2 text-left w-16">Func</th>
                            <th className="px-2 py-2 text-left w-16">Sub</th>
                            <th className="px-2 py-2 text-left w-20">Ação</th>
                            <th className="px-2 py-2 text-left min-w-[180px]">Descrição</th>
                            <th className="px-2 py-2 text-right w-24">Previsto (R$)</th>
                            <th className="px-2 py-2 text-right w-24">Empenhado (R$)</th>
                            <th className="px-2 py-2 text-right w-24">Liquidado (R$)</th>
                            <th className="px-2 py-2 text-right w-24">Pago (R$)</th>
                            <th className="px-2 py-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-violet-50/30">
                                <td className="px-2 py-1">
                                    <input
                                        type="text"
                                        maxLength={2}
                                        className="w-full rounded border-slate-300 text-xs"
                                        placeholder="00"
                                        value={row.funcao_codigo}
                                        onChange={(e) => updateRow(idx, 'funcao_codigo', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input
                                        type="text"
                                        maxLength={3}
                                        className="w-full rounded border-slate-300 text-xs"
                                        placeholder="000"
                                        value={row.subfuncao_codigo}
                                        onChange={(e) => updateRow(idx, 'subfuncao_codigo', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <select
                                        className="w-full rounded border-slate-300 text-xs"
                                        value={row.acao_codigo}
                                        onChange={(e) => updateRow(idx, 'acao_codigo', e.target.value)}
                                    >
                                        <option value="">—</option>
                                        {acoes?.map(a => (
                                            <option key={a.codigo} value={a.codigo}>{a.codigo}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-2 py-1">
                                    <textarea
                                        rows={1}
                                        className="w-full rounded border-slate-300 text-xs resize-none"
                                        placeholder="Descrição..."
                                        value={row.descricao}
                                        onChange={(e) => updateRow(idx, 'descricao', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded border-emerald-300 text-xs text-right font-mono"
                                        value={row.valor_financeiro_previsto}
                                        onChange={(e) => updateRow(idx, 'valor_financeiro_previsto', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded border-slate-300 text-xs text-right font-mono"
                                        value={row.valor_empenhado}
                                        onChange={(e) => updateRow(idx, 'valor_empenhado', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded border-slate-300 text-xs text-right font-mono"
                                        value={row.valor_liquidado}
                                        onChange={(e) => updateRow(idx, 'valor_liquidado', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full rounded border-slate-300 text-xs text-right font-mono"
                                        value={row.valor_pago}
                                        onChange={(e) => updateRow(idx, 'valor_pago', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1 text-center">
                                    {rows.length > 1 && (
                                        <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-50 font-semibold text-xs">
                            <td colSpan="4" className="px-2 py-2 text-right">Totais:</td>
                            <td className="px-2 py-2 text-right font-mono text-emerald-700">{fmtMoney(totalFinanceiro)}</td>
                            <td className="px-2 py-2 text-right font-mono">{fmtMoney(totalEmpenhado)}</td>
                            <td className="px-2 py-2 text-right font-mono">{fmtMoney(totalLiquidado)}</td>
                            <td className="px-2 py-2 text-right font-mono">{fmtMoney(totalPago)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
                >
                    <Save size={18} />
                    {saving ? 'Salvando...' : 'Salvar Metas & Prioridades'}
                </button>
            </div>

            {/* Portal Preview Modal */}
            {showPortalPreview && portalMetas.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold text-slate-800">
                                Metas e Prioridades Encontradas no Portal
                            </h2>
                            <button onClick={() => setShowPortalPreview(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="bg-amber-50 p-3 rounded-lg mb-3 text-xs text-amber-800">
                                <strong>Atenção:</strong> As metas serão importadas com os valores de execução (Empenhado, Liquidado, Pago).
                                Metas duplicadas (mesma descrição) serão ignoradas.
                            </div>

                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-2 py-2 text-left">Func</th>
                                            <th className="px-2 py-2 text-left">Sub</th>
                                            <th className="px-2 py-2 text-left">Código</th>
                                            <th className="px-2 py-2 text-left">Descrição</th>
                                            <th className="px-2 py-2 text-right">Previsto</th>
                                            <th className="px-2 py-2 text-right">Empenhado</th>
                                            <th className="px-2 py-2 text-right">Liquidado</th>
                                            <th className="px-2 py-2 text-right">Pago</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portalMetas.map((meta, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-2 py-2">{meta.funcao_codigo}</td>
                                                <td className="px-2 py-2">{meta.subfuncao_codigo}</td>
                                                <td className="px-2 py-2">{meta.acao_codigo}</td>
                                                <td className="px-2 py-2 max-w-[200px] truncate">{meta.descricao}</td>
                                                <td className="px-2 py-2 text-right font-mono">{fmtMoney(meta.valor_financeiro_previsto)}</td>
                                                <td className="px-2 py-2 text-right font-mono">{fmtMoney(meta.valor_empenhado)}</td>
                                                <td className="px-2 py-2 text-right font-mono">{fmtMoney(meta.valor_liquidado)}</td>
                                                <td className="px-2 py-2 text-right font-mono">{fmtMoney(meta.valor_pago)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border-t bg-slate-50">
                            <button
                                onClick={() => setShowPortalPreview(false)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmPortalImport}
                                disabled={isPortalImporting}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md font-medium hover:bg-purple-700 disabled:opacity-50"
                            >
                                {isPortalImporting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Importando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        Importar {portalMetas.length} Meta(s)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}