import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save, ShieldAlert } from 'lucide-react';

/**
 * Reserva de Contingência — Art. 5º, III da LRF.
 */
export default function ReservaContingenciaForm({ loaId, existingReservas }) {
    const emptyRow = { descricao: '', valor_reserva: '' };

    const [rows, setRows] = useState(
        existingReservas.length > 0
            ? existingReservas.map(r => ({ descricao: r.descricao, valor_reserva: r.valor_reserva }))
            : [{ ...emptyRow }]
    );
    const [saving, setSaving] = useState(false);

    const addRow = () => setRows([...rows, { ...emptyRow }]);
    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));
    const updateRow = (idx, field, value) => { const u = [...rows]; u[idx][field] = value; setRows(u); };

    const fmtMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const total = rows.reduce((a, r) => a + (parseFloat(r.valor_reserva) || 0), 0);

    const handleSave = () => {
        setSaving(true);
        router.post(route('loa.reserva.store'), { loa_id: loaId, reservas: rows }, {
            preserveScroll: true, onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <ShieldAlert size={20} className="text-amber-500" /> Reserva de Contingência
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Art. 5º, III da LRF — passivos contingentes e riscos fiscais da LDO</p>
                </div>
                <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={16} /> Adicionar Reserva
                </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="px-3 py-3 text-left min-w-[300px]">Descrição do Risco / Contingência</th>
                            <th className="px-3 py-3 text-right w-44">Valor Reservado (R$)</th>
                            <th className="px-3 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/30">
                                <td className="px-3 py-2">
                                    <textarea rows={2} className="w-full rounded border-slate-300 text-sm resize-none" placeholder="Ex: Contingência judicial trabalhista..."
                                        value={row.descricao} onChange={(e) => updateRow(idx, 'descricao', e.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" step="0.01" min="0" className="w-full rounded border-slate-300 text-sm text-right font-mono"
                                        value={row.valor_reserva} onChange={(e) => updateRow(idx, 'valor_reserva', e.target.value)} />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    {rows.length > 1 && <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-amber-50 font-semibold text-sm">
                            <td className="px-3 py-3 text-right">Total Reserva de Contingência:</td>
                            <td className="px-3 py-3 text-right font-mono text-amber-700">{fmtMoney(total)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-end pt-2">
                <button type="button" onClick={handleSave} disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm">
                    <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Reserva'}
                </button>
            </div>
        </div>
    );
}
