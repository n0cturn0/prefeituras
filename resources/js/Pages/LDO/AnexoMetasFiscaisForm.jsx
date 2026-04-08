import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save } from 'lucide-react';

/**
 * Tabela editável inline de Metas Fiscais
 * Conforme Art. 4º, §1º da LC 101/2000 (LRF).
 */
export default function AnexoMetasFiscaisForm({ ldoId, ldoAno, existingMetas, tiposMeta }) {
    const anoBase = parseInt(ldoAno);
    const emptyRow = {
        tipo_meta: '',
        ano_meta: anoBase,
        valor_previsto: '',
        valor_constante: '',
        valor_realizado_ano_anterior: '',
    };

    const [rows, setRows] = useState(
        existingMetas.length > 0
            ? existingMetas.map(m => ({
                tipo_meta: m.tipo_meta,
                ano_meta: m.ano_meta,
                valor_previsto: m.valor_previsto,
                valor_constante: m.valor_constante ?? '',
                valor_realizado_ano_anterior: m.valor_realizado_ano_anterior ?? '',
            }))
            : [{ ...emptyRow }]
    );
    const [saving, setSaving] = useState(false);

    const addRow = () => setRows([...rows, { ...emptyRow }]);
    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));
    const updateRow = (idx, field, value) => {
        const updated = [...rows];
        updated[idx][field] = value;
        setRows(updated);
    };

    const handleSave = () => {
        setSaving(true);
        router.post(route('ldo.metas-fiscais.store'), {
            ldo_id: ldoId,
            metas: rows,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Anexo de Metas Fiscais</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Art. 4º, §1º da LRF — metas anuais em valores correntes e constantes</p>
                </div>
                <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={16} /> Adicionar Linha
                </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="px-3 py-3 text-left min-w-[220px]">Tipo da Meta</th>
                            <th className="px-3 py-3 text-left w-24">Ano</th>
                            <th className="px-3 py-3 text-right w-40">Valor Previsto (R$)</th>
                            <th className="px-3 py-3 text-right w-40">V. Constante (R$)</th>
                            <th className="px-3 py-3 text-right w-40">Realizado Ant. (R$)</th>
                            <th className="px-3 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30">
                                <td className="px-3 py-2">
                                    <select
                                        className="w-full rounded border-slate-300 text-sm"
                                        value={row.tipo_meta}
                                        onChange={(e) => updateRow(idx, 'tipo_meta', e.target.value)}
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        {Object.entries(tiposMeta).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" min="2000" max="2099"
                                        className="w-full rounded border-slate-300 text-sm tabular-nums"
                                        value={row.ano_meta}
                                        onChange={(e) => updateRow(idx, 'ano_meta', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" step="0.01"
                                        className="w-full rounded border-slate-300 text-sm text-right font-mono"
                                        value={row.valor_previsto}
                                        onChange={(e) => updateRow(idx, 'valor_previsto', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" step="0.01"
                                        className="w-full rounded border-slate-300 text-sm text-right font-mono"
                                        value={row.valor_constante}
                                        onChange={(e) => updateRow(idx, 'valor_constante', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" step="0.01"
                                        className="w-full rounded border-slate-300 text-sm text-right font-mono"
                                        value={row.valor_realizado_ano_anterior}
                                        onChange={(e) => updateRow(idx, 'valor_realizado_ano_anterior', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    {rows.length > 1 && (
                                        <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
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
                    {saving ? 'Salvando...' : 'Salvar Metas Fiscais'}
                </button>
            </div>
        </div>
    );
}
