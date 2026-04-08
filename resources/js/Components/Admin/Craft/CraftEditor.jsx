import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Text, Container, Image, Button, HeroSection } from './components';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { TopBar } from './TopBar';

/**
 * CraftEditor — substitui o GrapesEditor.jsx
 *
 * Props:
 *  - initialJson: string JSON serializado do Craft.js (content_components)
 *  - onSave: ({ json }) => void  — chamado ao salvar
 *  - title: string — título da página
 *  - onTitleChange: (val: string) => void
 */
const CraftEditor = ({ initialJson, onSave, title, onTitleChange }) => {
    return (
        <Editor
            resolver={{ Text, Container, Image, Button, HeroSection }}
            onNodesChange={(query) => {
                // Opcional: auto-save ou tracking de mudanças
            }}
        >
            <div className="flex flex-col h-full">
                {/* Barra superior com salvar/undo/redo/preview */}
                <TopBar onSave={onSave} title={title} onTitleChange={onTitleChange} />

                {/* Área principal do editor */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Painel de blocos (esquerda) */}
                    <Toolbox />

                    {/* Canvas central */}
                    <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
                        <div className="max-w-4xl mx-auto bg-white min-h-[600px] rounded-xl shadow-sm border border-gray-200 p-6">
                            <Frame data={initialJson || undefined}>
                                <Element
                                    is={Container}
                                    canvas
                                    padding="p-4"
                                    bg="bg-white"
                                    layout="block"
                                    rounded="rounded-none"
                                    shadow=""
                                />
                            </Frame>
                        </div>
                    </main>

                    {/* Painel de propriedades (direita) */}
                    <SettingsPanel />
                </div>
            </div>
        </Editor>
    );
};

export default CraftEditor;
