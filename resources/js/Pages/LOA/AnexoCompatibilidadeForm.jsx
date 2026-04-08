import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save } from 'lucide-react';

/**
 * Compatibilidade LOA × PPA × LDO — Art. 5º, I da LRF.
 */
export default function AnexoCompatibilidadeForm({ loaId, existingItens }) {
    const emptyRow = { demonstrativo: '', objetivo_ppa: '', meta_ldo: '', valor_compatibilizado: '' };

    const [rows, setRows] = useState(
        existingItens.length > 0
            ? existingItens.map(c => ({
                demonstrativo: c.demonstrativo,
                objetivo_ppa: c.objetivo_ppa || '',
                meta_ldo: c.meta_ldo || '',
                valor_compatibilizado: c.valor_compatibilizado,
            }))
            : [{ ...emptyRow }]
    );
    const [saving, setSaving] = useState(false);

    const addRow = () => setRows([...rows, { ...emptyRow }]);
    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));
    const updateRow = (idx, field, value) => { const u = [...rows]; u[idx][field] = value; setRows(u); };

    const fmtMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const total = rows.reduce((a, r) => a + (parseFloat(r.valor_compatibilizado) || 0), 0);

    const handleSave = () => {
        setSaving(true);
        router.post(route('loa.compatibilidade.store'), { loa_id: loaId, itens: rows }, {
            preserveScroll: true, onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Compatibilidade PPA / LDO</h3>
                    <p className="text-xs text-slate-500">Art. 5º, I da LRF — demonstrativo de compatibilidade da programação orçamentária</p>
                </div>
                <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={16} /> Adicionar Item
                </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="px-3 py-3 text-left min-w-[200px]">Demonstrativo</th>
                            <th className="px-3 py-3 text-left min-w-[180px]">Objetivo PPA</th>
                            <th className="px-3 py-3 text-left min-w-[180px]">Meta LDO</th>
                            <th className="px-3 py-3 text-right w-44">Valor (R$)</th>
                            <th className="px-3 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-violet-50/30">
                                <td className="px-3 py-2"><textarea rows={2} className="w-full rounded border-slate-300 text-sm resize-none" placeholder="Demonstrar que..."
                                    value={row.demonstrativo} onChange={(e) => updateRow(idx, 'demonstrativo', e.target.value)} /></td>
                                <td className="px-3 py-2"><textarea rows={2} className="w-full rounded border-slate-300 text-sm resize-none" placeholder="Objetivo do PPA..."
                                    value={row.objetivo_ppa} onChange={(e) => updateRow(idx, 'objetivo_ppa', e.target.value)} /></td>
                                <td className="px-3 py-2"><textarea rows={2} className="w-full rounded border-slate-300 text-sm resize-none" placeholder="Meta da LDO..."
                                    value={row.meta_ldo} onChange={(e) => updateRow(idx, 'meta_ldo', e.target.value)} /></td>
                                <td className="px-3 py-2"><input type="number" step="0.01" min="0" className="w-full rounded border-slate-300 text-sm text-right font-mono"
                                    value={row.valor_compatibilizado} onChange={(e) => updateRow(idx, 'valor_compatibilizado', e.target.value)} /></td>
                                <td className="px-3 py-2 text-center">
                                    {rows.length > 1 && <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-50 font-semibold text-sm">
                            <td colSpan="3" className="px-3 py-3 text-right">Total Compatibilizado:</td>
                            <td className="px-3 py-3 text-right font-mono text-emerald-700">{fmtMoney(total)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-end pt-2">
                <button type="button" onClick={handleSave} disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm">
                    <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Compatibilidade'}
                </button>
            </div>
        </div>
    );
}
