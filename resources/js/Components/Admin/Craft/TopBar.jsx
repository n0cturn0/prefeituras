import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Undo2, Redo2, Save, Eye, EyeOff } from 'lucide-react';

export const TopBar = ({ onSave, title, onTitleChange }) => {
    const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
        canUndo: query.history.canUndo(),
        canRedo: query.history.canRedo(),
    }));

    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const json = query.serialize();
            await onSave({ json });
        } finally {
            setSaving(false);
        }
    };

    const togglePreview = () => {
        actions.setOptions((options) => {
            options.enabled = previewMode;
        });
        setPreviewMode(!previewMode);
    };

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm z-20 flex-shrink-0">
            {/* Left: Undo/Redo */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => actions.history.undo()}
                    disabled={!canUndo}
                    title="Desfazer (Ctrl+Z)"
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Undo2 size={18} />
                </button>
                <button
                    onClick={() => actions.history.redo()}
                    disabled={!canRedo}
                    title="Refazer (Ctrl+Y)"
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Redo2 size={18} />
                </button>
            </div>

            {/* Center: Page Title */}
            <div className="flex-1 mx-4 max-w-md">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="w-full text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Título da Página"
                />
            </div>

            {/* Right: Preview + Save */}
            <div className="flex items-center gap-2">
                <button
                    onClick={togglePreview}
                    title={previewMode ? 'Voltar à edição' : 'Pré-visualizar'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        previewMode
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                    {previewMode ? 'Editar' : 'Preview'}
                </button>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                    <Save size={16} />
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    );
};
