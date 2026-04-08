import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import CraftEditor from '@/Components/Admin/Craft/CraftEditor';

export default function Editor({ auth, item, page, menus = [], csrf_token }) {
    const { data, setData } = useForm({
        site_url_submenu_id: item.id,
        title: page?.title || item.name || '',
        content_components: page?.content_components || null,
        status: page ? page.status : true,
        has_sidebar: page ? page.has_sidebar : false,
        sidebar_content: page?.sidebar_content ? JSON.stringify(page.sidebar_content, null, 2) : '',
        selected_menu_id: page?.selected_menu_id || '',
    });

    const [showSidebarConfig, setShowSidebarConfig] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const handleCraftSave = async ({ json }) => {
        setSaving(true);
        setSaveError('');
        try {
            const payload = {
                site_url_submenu_id: data.site_url_submenu_id,
                title: data.title,
                content_components: json,
                content_html: null,
                content_css: null,
                status: data.status,
                has_sidebar: data.has_sidebar,
                sidebar_content: data.sidebar_content,
                selected_menu_id: data.selected_menu_id,
            };

            if (page) {
                router.put(route('pages.update', page.id), payload);
            } else {
                router.post(route('pages.store'), payload);
            }
        } catch (err) {
            setSaveError('Erro ao salvar. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{page ? 'Editar Página: ' + page.title : 'Criar Nova Página'}</h2>}
        >
            <Head title={page ? `Editar ${page.title}` : 'Nova Página'} />

            {/* Controles de cabeçalho (sidebar, status, voltar) */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-6 flex-wrap text-sm z-10 relative">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.has_sidebar}
                        onChange={(e) => setData('has_sidebar', e.target.checked)}
                        className="h-4 w-4 text-indigo-600"
                    />
                    <span className="text-gray-700 font-medium">Com Sidebar</span>
                </label>

                {data.has_sidebar && (
                    <button
                        onClick={() => setShowSidebarConfig(true)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-1 px-3 rounded"
                    >
                        Configurar Sidebar
                    </button>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.status}
                        onChange={(e) => setData('status', e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700 font-medium">Publicado</span>
                </label>

                <Link href={route('menus.index')} className="ml-auto text-gray-500 hover:text-gray-800 border px-3 py-1 rounded text-xs">
                    ← Voltar
                </Link>

                {saveError && <p className="text-red-500 text-xs">{saveError}</p>}
            </div>

            {/* Editor Craft.js — ocupa o restante da tela */}
            <div className="h-[calc(100vh-130px)]">
                <CraftEditor
                    initialJson={data.content_components}
                    onSave={handleCraftSave}
                    title={data.title}
                    onTitleChange={(val) => setData('title', val)}
                />
            </div>

            {/* Modal de configuração da Sidebar */}
            {showSidebarConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Configuração da Sidebar</h3>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Menu de Apoio
                            </label>
                            <select
                                value={data.selected_menu_id}
                                onChange={(e) => setData('selected_menu_id', e.target.value)}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                            >
                                <option value="">Nenhum / Personalizado (JSON Manual)</option>
                                {menus.map((menu) => (
                                    <option key={menu.id} value={menu.id}>{menu.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Conteúdo Customizado (JSON)
                            </label>
                            <textarea
                                value={data.sidebar_content}
                                onChange={(e) => setData('sidebar_content', e.target.value)}
                                className="w-full h-40 border rounded p-2 font-mono text-sm"
                                placeholder='Ex: {"type": "links", "title": "Links Úteis", "items": [{"label": "Link", "url": "#"}]}'
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowSidebarConfig(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
