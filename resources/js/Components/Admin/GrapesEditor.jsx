import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';

const GrapesEditor = ({
    initialComponents,
    initialHtml,
    initialCss,
    onSave,
    csrfToken
}) => {
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const onSaveRef = useRef(onSave);

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onSaveRef.current = onSave;
    }, [onSave]);

    useEffect(() => {
        if (!editorRef.current && containerRef.current) {
            const editor = grapesjs.init({
                container: containerRef.current,
                height: 'calc(100vh - 80px)', // Adjust for header
                width: '100%',
                storageManager: false, // Handle storage manually via onSave
                fromElement: false,
                plugins: [gjsPresetWebpage, gjsBlocksBasic],
                pluginsOpts: {
                    gjsPresetWebpage: {
                        modalImportTitle: 'Import',
                        modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
                        modalImportContent: function (editor) {
                            return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
                        },
                    },
                    gjsBlocksBasic: {
                        flexGrid: true,
                        stylePrefix: 'gjs-',
                    }
                },
                assetManager: {
                    upload: '/upload',
                    uploadName: 'files',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    autoAdd: true,
                },
                canvas: {
                    styles: [
                        // Optional: Inject Tailwind only in Canvas if we want WYSIWYG to match site
                        // 'https://cdn.tailwindcss.com' 
                    ]
                }
            });

            // Load initial data
            if (initialComponents) {
                // Check if it's a valid JSON string or object
                const components = typeof initialComponents === 'string' ? JSON.parse(initialComponents) : initialComponents;
                editor.loadProjectData(components);
            } else if (initialHtml) {
                editor.setComponents(initialHtml);
                editor.setStyle(initialCss || '');
            }

            // Custom Save Command
            editor.Commands.add('save-db', {
                run: (editor, sender) => {
                    sender && sender.set('active', 0); // Turn off the button

                    const html = editor.getHtml();
                    const css = editor.getCss();
                    const components = JSON.stringify(editor.getComponents());

                    if (onSaveRef.current) {
                        onSaveRef.current({ html, css, components });
                    }
                }
            });

            // Add a save button to the panel if not present (Preset usually adds one, but we override functionality)
            const panelManager = editor.Panels;
            const cmdPanel = panelManager.getPanel('options');
            if (cmdPanel) {
                // Ensure save button triggers our 'save-db' command
                const saveBtn = cmdPanel.get('buttons').findWhere({ id: 'save-db' });
                if (!saveBtn) {
                    panelManager.addButton('options', [{
                        id: 'save-db',
                        className: 'fa fa-floppy-o',
                        command: 'save-db',
                        attributes: { title: 'Salvar Alterações' }
                    }]);
                }
            }

            editorRef.current = editor;
        }

        return () => {
            // Cleanup
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    return (
        <div className="grapesjs-editor-container border rounded overflow-hidden h-full">
            {/* GrapesJS mounts here */}
            <div ref={containerRef}></div>
        </div>
    );
};

export default GrapesEditor;
