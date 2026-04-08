import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Table from '@editorjs/table';

const ContentEditor = ({ value, onChange, placeholder = 'Escreva seu conteúdo aqui...' }) => {
    const editorRef = useRef(null);
    const holderId = 'editorjs-holder';

    useEffect(() => {
        if (!editorRef.current) {
            const editor = new EditorJS({
                holder: holderId,
                placeholder: placeholder,
                tools: {
                    header: {
                        class: Header,
                        config: {
                            placeholder: 'Cabeçalho',
                            levels: [2, 3, 4],
                            defaultLevel: 2
                        }
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                    },
                    table: {
                        class: Table,
                        inlineToolbar: true,
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            // Start with simple configuration. 
                            // Real implementation would need a backend upload endpoint.
                            // For now, we might leave endpoints empty or point to a placeholder.
                        }
                    }
                },
                // Handle initial data safely
                data: value && typeof value === 'string' ? JSON.parse(value) : (value || {}),
                onChange: async (api, event) => {
                    const savedData = await api.saver.save();
                    onChange(JSON.stringify(savedData));
                },
                autofocus: false,
            });

            editorRef.current = editor;
        }

        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                const editorToDestroy = editorRef.current;
                editorToDestroy.isReady
                    .then(() => {
                        if (editorToDestroy) {
                            editorToDestroy.destroy();
                        }
                    })
                    .catch((e) => console.error("Editor cleanup error:", e));

                // CRITICAL: Reset ref synchronously so Strict Mode's second pass 
                // knows to create a new instance (the "real" one).
                editorRef.current = null;
            }
        };
    }, []); // Empty dependency array: only initialize once.

    return (
        <div
            id={holderId}
            className="prose max-w-none border border-gray-300 rounded-lg p-4 min-h-[300px] bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
        />
    );
};

export default ContentEditor;
