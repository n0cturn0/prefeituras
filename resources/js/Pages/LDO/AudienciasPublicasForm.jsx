import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save } from 'lucide-react';

/**
 * Formulário de Audiências Públicas da LDO
 * Conforme Art. 48 da LRF e Resolução TCE-MS 88/2018.
 */
export default function AudienciasPublicasForm({ ldoId, existingAudiencias, meiosComunicacao }) {
    const emptyRow = {
        data_primeira_convocacao: '',
        data_audiencia: '',
        local: '',
        tipo_meio_comunicacao: '',
        nome_veiculo: '',
        observacoes: '',
    };

    const [rows, setRows] = useState(
        existingAudiencias.length > 0
            ? existingAudiencias.map(a => ({
                data_primeira_convocacao: a.data_primeira_convocacao?.split('T')[0] || '',
                data_audiencia: a.data_audiencia?.split('T')[0] || '',
                local: a.local,
                tipo_meio_comunicacao: a.tipo_meio_comunicacao,
                nome_veiculo: a.nome_veiculo || '',
                observacoes: a.observacoes || '',
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
        router.post(route('ldo.audiencias.store'), {
            ldo_id: ldoId,
            audiencias: rows,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Audiências Públicas</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Art. 48 LRF / Resolução TCE-MS 88/2018 — registro obrigatório</p>
                </div>
                <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={16} /> Adicionar Audiência
                </button>
            </div>

            <div className="space-y-4">
                {rows.map((row, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 relative">
                        {rows.length > 1 && (
                            <button type="button" onClick={() => removeRow(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                                <Trash2 size={16} />
                            </button>
                        )}
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Audiência #{idx + 1}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Data 1ª Convocação *</label>
                                <input type="date"
                                    className="w-full rounded border-slate-300 text-sm"
                                    value={row.data_primeira_convocacao}
                                    onChange={(e) => updateRow(idx, 'data_primeira_convocacao', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Data da Audiência *</label>
                                <input type="date"
                                    className="w-full rounded border-slate-300 text-sm"
                                    value={row.data_audiencia}
                                    onChange={(e) => updateRow(idx, 'data_audiencia', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Local *</label>
                                <input type="text"
                                    className="w-full rounded border-slate-300 text-sm"
                                    placeholder="Ex: Câmara Municipal"
                                    value={row.local}
                                    onChange={(e) => updateRow(idx, 'local', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Meio de Comunicação *</label>
                                <select
                                    className="w-full rounded border-slate-300 text-sm"
                                    value={row.tipo_meio_comunicacao}
                                    onChange={(e) => updateRow(idx, 'tipo_meio_comunicacao', e.target.value)}
                                >
                                    <option value="" disabled>Selecione...</option>
                                    {Object.entries(meiosComunicacao).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Veículo</label>
                                <input type="text"
                                    className="w-full rounded border-slate-300 text-sm"
                                    placeholder="Ex: Diário Oficial do MS"
                                    value={row.nome_veiculo}
                                    onChange={(e) => updateRow(idx, 'nome_veiculo', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                                <input type="text"
                                    className="w-full rounded border-slate-300 text-sm"
                                    value={row.observacoes}
                                    onChange={(e) => updateRow(idx, 'observacoes', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
                >
                    <Save size={18} />
                    {saving ? 'Salvando...' : 'Salvar Audiências'}
                </button>
            </div>
        </div>
    );
}
