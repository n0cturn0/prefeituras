import React from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/Components/Site/Header';
import Footer from '@/Components/Site/Footer';

export default function Page({
    page,
    departmentsMenu,
    publicacoesMenu,
    municipioMenu,
    informativosMenu,
    transparenciaMenu,
    contatosMenu
}) {
    // Render GrapesJS content if available, otherwise legacy
    // Inject CSS in Head

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Head title={page.title}>
                {/* Inject GrapesJS CSS */}
                {page.content_css && <style>{page.content_css}</style>}
            </Head>

            <Header
                departmentsMenu={departmentsMenu}
                publicacoesMenu={publicacoesMenu}
                municipioMenu={municipioMenu}
                informativosMenu={informativosMenu}
                transparenciaMenu={transparenciaMenu}
                contatosMenu={contatosMenu}
            />

            <main className="flex-grow pt-32 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                    <div className={page.has_sidebar ? "grid grid-cols-1 lg:grid-cols-4 gap-8" : ""}>
                        {/* Main Content Area */}
                        <div className={page.has_sidebar ? "lg:col-span-3" : "w-full"}>
                            <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                                <div className="p-8 sm:p-12">
                                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 border-b pb-4">
                                        {page.title}
                                    </h1>

                                    <div id="dynamic-content-wrapper" className="grapesjs-content">
                                        {page.content_html ? (
                                            <div dangerouslySetInnerHTML={{ __html: page.content_html }} />
                                        ) : (
                                            <div dangerouslySetInnerHTML={{ __html: page.content }} />
                                        )}
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* Sidebar Area */}
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
            </main>

            <Footer />
        </div>
    );
}

function SidebarRenderer({ content, selectedMenu }) {
    // 1. If a Menu is selected from Admin, render it with priority
    if (selectedMenu) {
        return (
            <div className="bg-white p-6 rounded shadow border border-gray-100">
                <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">{selectedMenu.name}</h3>

                {/* Loop Submenus */}
                {selectedMenu.submenus && selectedMenu.submenus.map(submenu => (
                    <div key={submenu.id} className="mb-4 last:mb-0">
                        <h4 className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wider opacity-75">{submenu.name}</h4>
                        <ul className="space-y-2">
                            {/* Loop Items */}
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

    // 2. Fallback to manually configured JSON Content
    if (!content) {
        return (
            <div className="bg-white p-4 rounded shadow border border-gray-100">
                <p className="text-gray-500 text-sm">Sidebar ativa.</p>
            </div>
        );
    }

    // Try to parse if it's a string, though Laravel casting should handle it as object/array if valid JSON
    // But safely handle mixed cases
    let data = content;
    if (typeof content === 'string') {
        try {
            data = JSON.parse(content);
        } catch (e) {
            // Treat as raw text/html if not valid JSON
            return (
                <div className="bg-white p-4 rounded shadow border border-gray-100">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            );
        }
    }

    // Example: {"type": "links", "title": "Links Úteis", "items": [{"label": "Link 1", "url": "#"}]}
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

    // Generic JSON Dump or other types
    return (
        <div className="bg-white p-4 rounded shadow border border-gray-100">
            {data.title && <h3 className="font-bold text-lg mb-2">{data.title}</h3>}
            <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
