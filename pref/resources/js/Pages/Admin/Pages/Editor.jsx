import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react'; // Import router for manual visits if needed
import { Save } from 'lucide-react';
import GrapesEditor from '@/Components/Admin/GrapesEditor';

export default function Editor({ auth, item, page, menus = [], csrf_token }) {
    // We use a local state for GrapesJS data to ensure it's captured before submit
    // But since GrapesJS saves via its own button/command, we might adapt the flow.
    // However, user asked for "Configure 'Save' button to send...". 
    // GrapesEditor exposes onSave which gives us the data.

    // We'll keep using Inertia form for Title/Status but handle Content separately or sync it.

    const { data, setData, post, put, processing, errors } = useForm({
        site_url_submenu_id: item.id,
        title: page?.title || item.name || '',
        content_html: page?.content_html || '',
        content_css: page?.content_css || '',
        content_components: page?.content_components || null,
        status: page ? page.status : true,
        has_sidebar: page ? page.has_sidebar : false,
        sidebar_content: page?.sidebar_content ? JSON.stringify(page.sidebar_content, null, 2) : '',
        selected_menu_id: page?.selected_menu_id || '',
    });

    const [showSidebarConfig, setShowSidebarConfig] = useState(false);

    const handleGrapesSave = ({ html, css, components }) => {
        // We need to submit the form with this new data.
        // Since setData is async-ish or might not reflect immediately in a synchronous submit flow,
        // we construct the payload manually for the Inertia request.

        const payload = {
            ...data,
            content_html: html,
            content_css: css,
            content_components: components,
        };

        if (page) {
            router.put(route('pages.update', page.id), payload);
        } else {
            router.post(route('pages.store'), payload);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{page ? 'Editar Página ' + page.title : 'Criar Nova Página'}</h2>}
        >
            <Head title={page ? `Editar ${page.title}` : 'Nova Página'} />

            {/* Full Screen Editor Container */}
            <div className="h-screen flex flex-col">
                <div className="bg-white shadow p-4 z-10 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4 w-full md:w-1/3">
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Título da Página"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.has_sidebar}
                                onChange={(e) => setData('has_sidebar', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-indigo-600"
                            />
                            <span className="text-gray-700 font-bold">Com Sidebar</span>
                        </label>

                        {data.has_sidebar && (
                            <button
                                onClick={() => setShowSidebarConfig(true)}
                                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                Configurar Sidebar
                            </button>
                        )}

                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.status}
                                onChange={(e) => setData('status', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="text-gray-700 font-bold">Publicado</span>
                        </label>
                        <Link href={route('menus.index')} className="text-gray-600 hover:text-gray-900 border px-3 py-1 rounded">
                            Voltar
                        </Link>
                    </div>
                </div>

                <div className="flex-grow bg-gray-100 overflow-hidden relative">
                    {/* GrapesJS takes over this area */}
                    <GrapesEditor
                        initialHtml={data.content_html}
                        initialCss={data.content_css}
                        initialComponents={data.content_components}
                        onSave={handleGrapesSave}
                        csrfToken={csrf_token}
                    />

                    {/* Sidebar Configuration Modal Overlay */}
                    {showSidebarConfig && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded shadow-lg w-1/2">
                                <h3 className="text-lg font-bold mb-4">Configuração da Sidebar</h3>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Escolha o Menu de Apoio para esta Página
                                    </label>
                                    <select
                                        value={data.selected_menu_id}
                                        onChange={(e) => setData('selected_menu_id', e.target.value)}
                                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    >
                                        <option value="">Nenhum / Personalizado (JSON Manual)</option>
                                        {menus.map((menu) => (
                                            <option key={menu.id} value={menu.id}>
                                                {menu.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Ao selecionar um menu, o conteúdo JSON abaixo será ignorado se não houver lógica customizada na renderização.
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Conteúdo Customizado (JSON)
                                    </label>
                                    <textarea
                                        value={data.sidebar_content}
                                        onChange={(e) => setData('sidebar_content', e.target.value)}
                                        className="w-full h-48 border p-2 font-mono text-sm"
                                        placeholder='Ex: {"type": "latest_news", "count": 5}'
                                    />
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowSidebarConfig(false)}
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
