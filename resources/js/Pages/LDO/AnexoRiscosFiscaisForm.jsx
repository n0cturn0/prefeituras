import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save } from 'lucide-react';

/**
 * Tabela editável inline de Riscos Fiscais
 * Conforme Art. 4º, §3º da LC 101/2000 (LRF).
 */
export default function AnexoRiscosFiscaisForm({ ldoId, existingRiscos }) {
    const emptyRow = { descricao: '', valor_estimado: '', providencia: '' };

    const [rows, setRows] = useState(
        existingRiscos.length > 0
            ? existingRiscos.map(r => ({
                descricao: r.descricao,
                valor_estimado: r.valor_estimado,
                providencia: r.providencia,
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

    const fmtMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

    const totalRiscos = rows.reduce((acc, r) => acc + (parseFloat(r.valor_estimado) || 0), 0);

    const handleSave = () => {
        setSaving(true);
        router.post(route('ldo.riscos-fiscais.store'), {
            ldo_id: ldoId,
            riscos: rows,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Anexo de Riscos Fiscais</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Art. 4º, §3º da LRF — passivos contingentes e providências</p>
                </div>
                <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={16} /> Adicionar Risco
                </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="px-3 py-3 text-left min-w-[250px]">Descrição do Risco</th>
                            <th className="px-3 py-3 text-right w-44">Valor Estimado (R$)</th>
                            <th className="px-3 py-3 text-left min-w-[250px]">Providência</th>
                            <th className="px-3 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/30">
                                <td className="px-3 py-2">
                                    <textarea
                                        rows={2}
                                        className="w-full rounded border-slate-300 text-sm resize-none"
                                        placeholder="Ex: Demanda judicial trabalhista..."
                                        value={row.descricao}
                                        onChange={(e) => updateRow(idx, 'descricao', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" step="0.01" min="0"
                                        className="w-full rounded border-slate-300 text-sm text-right font-mono"
                                        value={row.valor_estimado}
                                        onChange={(e) => updateRow(idx, 'valor_estimado', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <textarea
                                        rows={2}
                                        className="w-full rounded border-slate-300 text-sm resize-none"
                                        placeholder="Ex: Abertura de crédito adicional..."
                                        value={row.providencia}
                                        onChange={(e) => updateRow(idx, 'providencia', e.target.value)}
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
                    <tfoot>
                        <tr className="bg-slate-50 font-semibold text-sm">
                            <td className="px-3 py-3 text-right">Total de Riscos Estimados:</td>
                            <td className="px-3 py-3 text-right font-mono text-emerald-700">{fmtMoney(totalRiscos)}</td>
                            <td colSpan="2"></td>
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
                    {saving ? 'Salvando...' : 'Salvar Riscos Fiscais'}
                </button>
            </div>
        </div>
    );
}
