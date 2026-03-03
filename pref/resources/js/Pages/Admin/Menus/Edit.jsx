import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Edit as EditIcon, Trash2, Plus, ChevronDown, ChevronRight, Save, X, ExternalLink } from 'lucide-react';

export default function Edit({ auth, menu }) {
    // 1. Main Menu Form
    const { data, setData, put, processing, errors } = useForm({
        name: menu.name || '',
        status: menu.status ? true : false,
    });

    // 2. State for Modals & Accordions
    const [expandedSubmenus, setExpandedSubmenus] = useState({});

    // Submenu Modal State
    const [submenuModalOpen, setSubmenuModalOpen] = useState(false);
    const [editingSubmenu, setEditingSubmenu] = useState(null); // null = create
    const [submenuData, setSubmenuData] = useState({ name: '', url: '#', status: true });

    // Item Modal State
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // null = create
    const [parentSubmenuId, setParentSubmenuId] = useState(null); // For creating new item
    const [itemData, setItemData] = useState({ name: '', url: '', status: true, position: '' });

    // 3. Handlers
    const toggleSubmenu = (id) => {
        setExpandedSubmenus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const submitMain = (e) => {
        e.preventDefault();
        put(route('menus.update', menu.id));
    };

    // Submenu Handlers
    const openCreateSubmenu = () => {
        setEditingSubmenu(null);
        setSubmenuData({ name: '', url: '#', status: true });
        setSubmenuModalOpen(true);
    };

    const openEditSubmenu = (submenu) => {
        setEditingSubmenu(submenu);
        setSubmenuData({ name: submenu.name, url: submenu.url, status: !!submenu.status });
        setSubmenuModalOpen(true);
    };

    const saveSubmenu = () => {
        if (editingSubmenu) {
            router.put(route('submenus.update', editingSubmenu.id), submenuData, {
                onSuccess: () => setSubmenuModalOpen(false)
            });
        } else {
            router.post(route('submenus.store', menu.id), submenuData, {
                onSuccess: () => setSubmenuModalOpen(false)
            });
        }
    };

    const deleteSubmenu = (id) => {
        if (confirm('Tem certeza? Isso excluirá todos os itens dentro deste submenu.')) {
            router.delete(route('submenus.destroy', id));
        }
    };

    // Item Handlers
    const openCreateItem = (submenuId) => {
        setEditingItem(null);
        setParentSubmenuId(submenuId);
        setItemData({ name: '', url: '', status: true, position: '' });
        setItemModalOpen(true);
    };

    const openEditItem = (item) => {
        setEditingItem(item);
        setItemData({ name: item.name, url: item.url, status: !!item.status, position: item.position });
        setItemModalOpen(true);
    };

    const saveItem = () => {
        const payload = { ...itemData };
        if (editingItem) {
            router.put(route('menu-items.update', editingItem.id), payload, {
                onSuccess: () => setItemModalOpen(false)
            });
        } else {
            router.post(route('menu-items.store', parentSubmenuId), payload, {
                onSuccess: () => setItemModalOpen(false)
            });
        }
    };

    const deleteItem = (id) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            router.delete(route('menu-items.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gerenciar Menu: {menu.name}</h2>}
        >
            <Head title={`Gerenciar ${menu.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Main Menu Details */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Detalhes Principais</h3>
                            <form onSubmit={submitMain} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nome do Menu</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-xs italic">{errors.name}</div>}
                                </div>
                                <div>
                                    <label className="flex items-center space-x-2 cursor-pointer mb-3">
                                        <input
                                            type="checkbox"
                                            checked={data.status}
                                            onChange={(e) => setData('status', e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-blue-600"
                                        />
                                        <span className="text-gray-700 font-bold">Ativo</span>
                                    </label>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none flex items-center gap-2"
                                    >
                                        <Save size={16} /> Salvar Detalhes
                                    </button>
                                    <Link href={route('menus.index')} className="text-gray-600 hover:text-gray-900 py-2 px-4">Voltar</Link>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Submenus Manager */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Estrutura do Menu</h3>
                                <button onClick={openCreateSubmenu} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded flex items-center gap-2">
                                    <Plus size={16} /> Novo Submenu
                                </button>
                            </div>

                            {/* Submenus List */}
                            <div className="space-y-4">
                                {menu.submenus?.map(submenu => (
                                    <div key={submenu.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Submenu Header */}
                                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleSubmenu(submenu.id)}>
                                                {expandedSubmenus[submenu.id] ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronRight size={18} className="text-gray-500" />}
                                                <span className="font-semibold text-gray-700">{submenu.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${submenu.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {submenu.status ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEditSubmenu(submenu)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon size={16} /></button>
                                                <button onClick={() => deleteSubmenu(submenu.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                                            </div>
                                        </div>

                                        {/* Items List (Collapsible) */}
                                        {expandedSubmenus[submenu.id] && (
                                            <div className="bg-white px-4 py-3 border-t border-gray-200">
                                                <div className="mb-3 flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase">Itens de Menu</span>
                                                    <button onClick={() => openCreateItem(submenu.id)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                                                        <Plus size={12} /> Adicionar Item
                                                    </button>
                                                </div>

                                                {submenu.items?.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {submenu.items.map(item => (
                                                            <li key={item.id} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 transition-colors">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className="text-gray-400 text-xs w-6 text-center bg-gray-100 rounded">{item.position}</div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                                                        <span className="text-xs text-blue-500 truncate flex items-center gap-1">
                                                                            <ExternalLink size={10} /> {item.url}
                                                                        </span>
                                                                    </div>
                                                                    {!item.status && <span className="text-xs text-red-500 bg-red-50 px-1 rounded">Inativo</span>}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {/* Page Management Buttons */}
                                                                    {item.page ? (
                                                                        <Link href={route('pages.edit', item.page.id)} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded mr-2">
                                                                            Editar Página
                                                                        </Link>
                                                                    ) : (
                                                                        <Link href={route('pages.create', { item_id: item.id })} className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded mr-2">
                                                                            Criar Página
                                                                        </Link>
                                                                    )}

                                                                    <button onClick={() => openEditItem(item)} className="text-blue-400 hover:text-blue-600 p-1"><EditIcon size={14} /></button>
                                                                    <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic text-center py-2">Nenhum item neste submenu.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {menu.submenus?.length === 0 && (
                                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded">Este menu ainda não possui submenus.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submenu Modal */}
                {submenuModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-lg font-bold text-gray-900">{editingSubmenu ? 'Editar Submenu' : 'Novo Submenu'}</h3>
                                <button onClick={() => setSubmenuModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                    <input type="text" className="w-full border rounded px-3 py-2" value={submenuData.name} onChange={e => setSubmenuData({ ...submenuData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL (Opcional)</label>
                                    <input type="text" className="w-full border rounded px-3 py-2" value={submenuData.url} onChange={e => setSubmenuData({ ...submenuData, url: e.target.value })} placeholder="#" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 text-blue-600" checked={submenuData.status} onChange={e => setSubmenuData({ ...submenuData, status: e.target.checked })} />
                                    <span className="text-sm text-gray-700">Ativo</span>
                                </div>
                            </div>
                            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-lg">
                                <button onClick={() => setSubmenuModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
                                <button onClick={saveSubmenu} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Item Modal */}
                {itemModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-lg font-bold text-gray-900">{editingItem ? 'Editar Item' : 'Novo Item'}</h3>
                                <button onClick={() => setItemModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                    <input type="text" className="w-full border rounded px-3 py-2" value={itemData.name} onChange={e => setItemData({ ...itemData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                    <input type="text" className="w-full border rounded px-3 py-2" value={itemData.url} onChange={e => setItemData({ ...itemData, url: e.target.value })} />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordem (Opcional)</label>
                                        <input type="number" className="w-full border rounded px-3 py-2" value={itemData.position} onChange={e => setItemData({ ...itemData, position: e.target.value })} placeholder="Auto" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-6">
                                        <input type="checkbox" className="h-4 w-4 text-blue-600" checked={itemData.status} onChange={e => setItemData({ ...itemData, status: e.target.checked })} />
                                        <span className="text-sm text-gray-700">Ativo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-lg">
                                <button onClick={() => setItemModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
                                <button onClick={saveItem} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
