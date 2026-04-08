import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save } from 'lucide-react';
import axios from 'axios';

/**
 * Dotações de Despesa — tabela editável com selects dependentes
 * Classificação funcional-programática conforme Lei 4.320/64 e e-Sfinge TCE-MS.
 * Função → Subfunção (AJAX), Programa PPA → Ação PPA (autocomplete).
 */
export default function DotacoesDespesasForm({ loaId, existingDotacoes, funcoes, programas, acoes, fontesRecursos, naturezasDespesa }) {
    const emptyRow = {
        funcao_codigo: '', subfuncao_codigo: '', programa_codigo: '', acao_codigo: '',
        unidade_orcamentaria: '', natureza_despesa: '', fonte_recursos: '',
        valor_dotado: '', projeto_atividade: '',
    };

    const [rows, setRows] = useState(
        existingDotacoes.length > 0
            ? existingDotacoes.map(d => ({
                funcao_codigo: d.funcao_codigo,
                subfuncao_codigo: d.subfuncao_codigo,
                programa_codigo: d.programa_codigo,
                acao_codigo: d.acao_codigo,
                unidade_orcamentaria: d.unidade_orcamentaria,
                natureza_despesa: d.natureza_despesa,
                fonte_recursos: d.fonte_recursos,
                valor_dotado: d.valor_dotado,
                projeto_atividade: d.projeto_atividade || '',
            }))
            : [{ ...emptyRow }]
    );
    const [subfuncoes, setSubfuncoes] = useState({});
    const [saving, setSaving] = useState(false);

    const addRow = () => setRows([...rows, { ...emptyRow }]);
    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));
    const updateRow = (idx, field, value) => { const u = [...rows]; u[idx][field] = value; setRows(u); };

    const fmtMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const totalDotado = rows.reduce((a, r) => a + (parseFloat(r.valor_dotado) || 0), 0);

    // Carregar subfunções quando função muda
    const handleFuncaoChange = async (idx, codigo) => {
        updateRow(idx, 'funcao_codigo', codigo);
        updateRow(idx, 'subfuncao_codigo', '');
        if (codigo && !subfuncoes[codigo]) {
            try {
                const { data } = await axios.get(route('funcoes.subfuncoes', codigo));
                setSubfuncoes(prev => ({ ...prev, [codigo]: data }));
            } catch (e) { /* silently fail */ }
        }
    };

    // Pré-carregar subfunções para dotações existentes
    useEffect(() => {
        const codigos = [...new Set(rows.map(r => r.funcao_codigo).filter(Boolean))];
        codigos.forEach(async (codigo) => {
            if (!subfuncoes[codigo]) {
                try {
                    const { data } = await axios.get(route('funcoes.subfuncoes', codigo));
                    setSubfuncoes(prev => ({ ...prev, [codigo]: data }));
                } catch(e) { /* */ }
            }
        });
    }, []);

    const handleSave = () => {
        setSaving(true);
        router.post(route('loa.dotacoes.store'), { loa_id: loaId, dotacoes: rows }, {
            preserveScroll: true, onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Dotações de Despesa</h3>
                    <p className="text-xs text-slate-500">Lei 4.320/64 Art. 2º §2º — Classificação funcional-programática / e-Sfinge TCE-MS</p>
                </div>
                <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={16} /> Adicionar Dotação
                </button>
            </div>

            <div className="space-y-3">
                {rows.map((row, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 relative">
                        {rows.length > 1 && (
                            <button type="button" onClick={() => removeRow(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                        )}
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dotação #{idx + 1}</span>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
                            {/* Função → Subfunção (dependente) */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Função *</label>
                                <select className="w-full rounded border-slate-300 text-sm"
                                    value={row.funcao_codigo} onChange={(e) => handleFuncaoChange(idx, e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {funcoes?.map(f => <option key={f.codigo} value={f.codigo}>{f.codigo} - {f.nome}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Subfunção *</label>
                                <select className="w-full rounded border-slate-300 text-sm"
                                    value={row.subfuncao_codigo} onChange={(e) => updateRow(idx, 'subfuncao_codigo', e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {(subfuncoes[row.funcao_codigo] || []).map(sf => <option key={sf.codigo} value={sf.codigo}>{sf.codigo} - {sf.nome}</option>)}
                                </select>
                            </div>

                            {/* Programa → Ação (do PPA) */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Programa PPA *</label>
                                <select className="w-full rounded border-slate-300 text-sm"
                                    value={row.programa_codigo} onChange={(e) => updateRow(idx, 'programa_codigo', e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {programas?.map(p => <option key={p.codigo} value={p.codigo}>{p.codigo} - {p.nome}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Ação PPA *</label>
                                <select className="w-full rounded border-slate-300 text-sm"
                                    value={row.acao_codigo} onChange={(e) => updateRow(idx, 'acao_codigo', e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {acoes?.map(a => <option key={a.codigo} value={a.codigo}>{a.codigo} - {a.nome}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Unidade Orçamentária *</label>
                                <input type="text" maxLength="100" placeholder="Ex: Sec. de Educação"
                                    className="w-full rounded border-slate-300 text-sm"
                                    value={row.unidade_orcamentaria} onChange={(e) => updateRow(idx, 'unidade_orcamentaria', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Natureza Despesa *</label>
                                <select className="w-full rounded border-slate-300 text-sm"
                                    value={row.natureza_despesa} onChange={(e) => updateRow(idx, 'natureza_despesa', e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {Object.entries(naturezasDespesa).map(([k, v]) => <option key={k} value={k}>{k} - {v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Fonte Recursos *</label>
                                <select className="w-full rounded border-slate-300 text-sm"
                                    value={row.fonte_recursos} onChange={(e) => updateRow(idx, 'fonte_recursos', e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {Object.entries(fontesRecursos).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Valor Dotado (R$) *</label>
                                <input type="number" step="0.01" min="0"
                                    className="w-full rounded border-emerald-300 text-sm text-right font-mono"
                                    value={row.valor_dotado} onChange={(e) => updateRow(idx, 'valor_dotado', e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Projeto/Atividade (descrição)</label>
                            <input type="text" placeholder="Descrição do projeto ou atividade..."
                                className="w-full rounded border-slate-300 text-sm"
                                value={row.projeto_atividade} onChange={(e) => updateRow(idx, 'projeto_atividade', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-100 rounded-lg px-4 py-3 flex justify-between items-center text-sm font-semibold">
                <span>Total Despesas Fixadas:</span>
                <span className="font-mono text-red-700 text-base">{fmtMoney(totalDotado)}</span>
            </div>

            <div className="flex justify-end pt-2">
                <button type="button" onClick={handleSave} disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm">
                    <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Dotações'}
                </button>
            </div>
        </div>
    );
}
