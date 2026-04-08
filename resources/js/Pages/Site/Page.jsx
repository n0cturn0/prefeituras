import React from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Components/Site/Layout';
import CraftRenderer from '@/Components/Site/CraftRenderer';

/**
 * Detecta se o content_components é um JSON serializado pelo Craft.js.
 * O Craft.js sempre inclui um nó "ROOT" na raiz do JSON serializado.
 */
function isCraftJson(content) {
    try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        return parsed && typeof parsed === 'object' && 'ROOT' in parsed;
    } catch {
        return false;
    }
}

export default function Page(props) {
    const { page } = props;
    const hasCraftContent = isCraftJson(page.content_components);

    return (
        <Layout {...props} mainClassName="pt-32 pb-16" containerClassName="bg-gray-50">
            <Head title={page.title}>
                {/* Injetar CSS legado do GrapesJS apenas para páginas antigas */}
                {!hasCraftContent && page.content_css && <style>{page.content_css}</style>}
            </Head>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={page.has_sidebar ? "grid grid-cols-1 lg:grid-cols-4 gap-8" : ""}>
                        {/* Área de Conteúdo Principal */}
                        <div className={page.has_sidebar ? "lg:col-span-3" : "w-full"}>
                            <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                                <div className="p-8 sm:p-12">
                                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 border-b pb-4">
                                        {page.title}
                                    </h1>

                                    <div id="dynamic-content-wrapper">
                                        {hasCraftContent ? (
                                            /* Renderizador Craft.js (páginas novas) */
                                            <CraftRenderer json={page.content_components} />
                                        ) : (
                                            /* Fallback legado: GrapesJS HTML ou content puro */
                                            <div
                                                className="grapesjs-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: page.content_html || page.content || '',
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* Sidebar */}
                        {page.has_sidebar && (
                            <aside className="lg:col-span-1 space-y-6">
                                <SidebarRenderer
                                    content={page.sidebar_content}
                                    selectedMenu={page.selected_menu}
                                />
                            </aside>
                        )}
                    </div>
            </div>
        </Layout>
    );
}

// ─── Sidebar Renderer (sem alteração) ────────────────────────────────────────

function SidebarRenderer({ content, selectedMenu }) {
    if (selectedMenu) {
        return (
            <div className="bg-white p-6 rounded shadow border border-gray-100">
                <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">{selectedMenu.name}</h3>
                {selectedMenu.submenus && selectedMenu.submenus.map(submenu => (
                    <div key={submenu.id} className="mb-4 last:mb-0">
                        <h4 className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wider opacity-75">{submenu.name}</h4>
                        <ul className="space-y-2">
                            {submenu.items && submenu.items.map(item => (
                                <li key={item.id}>
                                    <a href={item.url} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center text-sm">
                                        <span className="mr-2 text-gray-400">›</span> {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    }

    if (!content) {
        return (
            <div className="bg-white p-4 rounded shadow border border-gray-100">
                <p className="text-gray-500 text-sm">Sidebar ativa.</p>
            </div>
        );
    }

    let data = content;
    if (typeof content === 'string') {
        try {
            data = JSON.parse(content);
        } catch {
            return (
                <div className="bg-white p-4 rounded shadow border border-gray-100">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            );
        }
    }

    if (data.type === 'links' && Array.isArray(data.items)) {
        return (
            <div className="bg-white p-6 rounded shadow border border-gray-100">
                {data.title && <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">{data.title}</h3>}
                <ul className="space-y-2">
                    {data.items.map((item, idx) => (
                        <li key={idx}>
                            <a href={item.url} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center">
                                <span className="mr-2">›</span> {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded shadow border border-gray-100">
            {data.title && <h3 className="font-bold text-lg mb-2">{data.title}</h3>}
            <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
