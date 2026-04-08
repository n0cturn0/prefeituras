import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save } from 'lucide-react';

/**
 * Previsão de Receitas — tabela editável inline
 * Art. 12 da LRF e Lei 4.320/1964 Art. 2º, §1º.
 */
export default function PrevisaoReceitaForm({ loaId, existingReceitas }) {
    const emptyRow = { codigo_receita: '', descricao: '', valor_previsto: '', valor_constante: '', valor_realizado_ano_anterior: '' };

    const [rows, setRows] = useState(
        existingReceitas.length > 0
            ? existingReceitas.map(r => ({
                codigo_receita: r.codigo_receita,
                descricao: r.descricao,
                valor_previsto: r.valor_previsto,
                valor_constante: r.valor_constante ?? '',
                valor_realizado_ano_anterior: r.valor_realizado_ano_anterior ?? '',
            }))
            : [{ ...emptyRow }]
    );
    const [saving, setSaving] = useState(false);

    const addRow = () => setRows([...rows, { ...emptyRow }]);
    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));
    const updateRow = (idx, field, value) => { const u = [...rows]; u[idx][field] = value; setRows(u); };

    const fmtMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const totalPrevisto = rows.reduce((a, r) => a + (parseFloat(r.valor_previsto) || 0), 0);

    const handleSave = () => {
        setSaving(true);
        router.post(route('loa.receitas.store'), { loa_id: loaId, receitas: rows }, {
            preserveScroll: true, onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Previsão de Receitas</h3>
                    <p className="text-xs text-slate-500">Art. 12 da LRF — metodologia e premissas de receita</p>
                </div>
                <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={16} /> Adicionar Receita
                </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="px-3 py-3 text-left w-36">Código Receita</th>
                            <th className="px-3 py-3 text-left min-w-[200px]">Descrição</th>
                            <th className="px-3 py-3 text-right w-40">Valor Previsto (R$)</th>
                            <th className="px-3 py-3 text-right w-40">V. Constante (R$)</th>
                            <th className="px-3 py-3 text-right w-40">Realizado Ant. (R$)</th>
                            <th className="px-3 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-green-50/30">
                                <td className="px-3 py-2">
                                    <input type="text" maxLength="20" placeholder="1.1.1.2.04"
                                        className="w-full rounded border-slate-300 text-sm font-mono"
                                        value={row.codigo_receita} onChange={(e) => updateRow(idx, 'codigo_receita', e.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="text" placeholder="Descrição da receita..."
                                        className="w-full rounded border-slate-300 text-sm"
                                        value={row.descricao} onChange={(e) => updateRow(idx, 'descricao', e.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" step="0.01" className="w-full rounded border-slate-300 text-sm text-right font-mono"
                                        value={row.valor_previsto} onChange={(e) => updateRow(idx, 'valor_previsto', e.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" step="0.01" className="w-full rounded border-slate-300 text-sm text-right font-mono"
                                        value={row.valor_constante} onChange={(e) => updateRow(idx, 'valor_constante', e.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" step="0.01" className="w-full rounded border-slate-300 text-sm text-right font-mono"
                                        value={row.valor_realizado_ano_anterior} onChange={(e) => updateRow(idx, 'valor_realizado_ano_anterior', e.target.value)} />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    {rows.length > 1 && <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-50 font-semibold text-sm">
                            <td colSpan="2" className="px-3 py-3 text-right">Total Receitas Previstas:</td>
                            <td className="px-3 py-3 text-right font-mono text-green-700">{fmtMoney(totalPrevisto)}</td>
                            <td colSpan="3"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-end pt-2">
                <button type="button" onClick={handleSave} disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm">
                    <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Receitas'}
                </button>
            </div>
        </div>
    );
}
