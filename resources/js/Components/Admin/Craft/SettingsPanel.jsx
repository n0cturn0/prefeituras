import React from 'react';
import { useEditor } from '@craftjs/core';

export const SettingsPanel = () => {
    const { selected, actions } = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected = null;

        if (currentNodeId) {
            const node = state.nodes[currentNodeId];
            selected = {
                id: currentNodeId,
                name: node.data.displayName || node.data.name,
                settings: node.related?.settings,
                isDeletable: query.node(currentNodeId).isDeletable(),
            };
        }
        return { selected };
    });

    return (
        <aside className="w-[240px] min-w-[240px] bg-gray-50 border-l border-gray-200 flex flex-col overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Propriedades</h3>
                {selected && (
                    <p className="text-xs text-blue-600 font-medium mt-0.5 truncate">
                        {selected.name}
                    </p>
                )}
            </div>

            <div className="flex-1 p-4">
                {selected ? (
                    <>
                        {selected.settings ? (
                            React.createElement(selected.settings)
                        ) : (
                            <p className="text-xs text-gray-400 italic">Sem opções para este elemento.</p>
                        )}

                        {selected.isDeletable && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2 px-3 rounded-lg border border-red-200 transition-colors"
                                    onClick={() => actions.delete(selected.id)}
                                >
                                    🗑️ Remover Bloco
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <span className="text-3xl mb-2">👆</span>
                        <p className="text-xs text-gray-400">Clique em um elemento na tela para editar suas propriedades.</p>
                    </div>
                )}
            </div>
        </aside>
    );
};
