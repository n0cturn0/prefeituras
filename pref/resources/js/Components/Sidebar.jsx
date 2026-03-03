import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    Settings,
    Users,
    ChevronLeft,
    ChevronRight,
    Building2,
    ShieldAlert,
    X,
    Layers,
    Menu as MenuIcon
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    // const [isCollapsed, setIsCollapsed] = useState(false); // Lifted to parent

    // Safely access permissions
    const userPermissions = auth.user?.permissions || [];

    // Helper to check permissions
    const hasPermission = (permission) => {
        if (!permission) return true; // No permission needed
        return userPermissions.includes(permission);
    };

    const menuGroups = [
        {
            title: '', // Main group (no Label)
            items: [
                {
                    name: 'Dashboard',
                    href: route('dashboard'),
                    icon: LayoutDashboard,
                    active: route().current('dashboard')
                },
            ]
        },
        {
            title: 'CONTEÚDO',
            items: [
                {
                    name: 'Seções',
                    href: route('sections.index'),
                    icon: Layers,
                    active: url.startsWith('/sections'),
                    roles: ['Admin', 'Gestor']
                },
                {
                    name: 'Notícias',
                    href: '#',
                    icon: FileText,
                    active: url.startsWith('/news'),
                    permission: 'manage_news' // Example permission
                },
                {
                    name: 'e-SIC',
                    href: '#',
                    icon: ShieldAlert,
                    active: url.startsWith('/esic'),
                    permission: 'manage_esic'
                },
            ]
        },
        {
            title: 'ADMINISTRAÇÃO',
            items: [
                {
                    name: 'Usuários',
                    href: route('users.index'),
                    icon: Users,
                    active: url.startsWith('/users'),
                    permission: 'gerenciar_usuarios', // Keeps Admin access
                    roles: ['Admin'] // Explicitly Admin only
                },
                {
                    name: 'Menus do Site',
                    href: route('menus.index'),
                    icon: MenuIcon,
                    active: url.startsWith('/menus'),
                    roles: ['Admin']
                },
                {
                    name: 'Minha Equipe',
                    href: route('editors.index'),
                    icon: Users,
                    active: url.startsWith('/editors'),
                    roles: ['Gestor'] // Only for Mangers
                },
                {
                    name: 'Departamentos',
                    href: route('departments.index'),
                    icon: Building2,
                    active: url.startsWith('/departments'),
                    permission: 'gerenciar_departamentos'
                },
                {
                    name: 'Configurações',
                    href: '#',
                    icon: Settings,
                    active: url.startsWith('/settings'),
                    permission: 'manage_settings'
                },
                {
                    name: 'Auditoria',
                    href: route('audit.index'),
                    icon: ShieldAlert,
                    active: url.startsWith('/audit'),
                    roles: ['Admin']
                },
            ]
        }
    ];

    // Dynamic Sections for Manager
    const managerSections = auth.user?.manager_sections || [];
    if (managerSections.length > 0) {
        menuGroups.push({
            title: 'MINHAS SEÇÕES',
            items: managerSections.map(section => ({
                name: section.name,
                href: route('subsections.index', section.uuid), // Route we will create
                icon: FileText, // Or other icon
                active: url.startsWith(`/sections/${section.uuid}`),
                roles: ['Gestor']
            }))
        });
    }

    const sidebarClasses = `
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        w-64
    `;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={sidebarClasses}>
                {/* Header */}
                <div className={`flex h-16 items-center border-b border-slate-100 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-800">
                        <Building2 className="h-7 w-7 text-blue-600" />
                        {!isCollapsed && <span>Prefeituras</span>}
                    </div>

                    {/* Cloud/Mobile Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="py-6 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
                    {menuGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-6">
                            {group.title && !isCollapsed && (
                                <h3 className="px-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    {group.title}
                                </h3>
                            )}
                            {group.title && isCollapsed && (
                                <div className="h-px bg-slate-100 mx-4 mb-4" />
                            )}

                            <div className="space-y-1 px-3">
                                {group.items.map((item) => {
                                    // Check permission
                                    if (item.permission && !hasPermission(item.permission)) {
                                        return null;
                                    }

                                    // Check roles
                                    // auth.user.roles is an array of strings (e.g. ['Gestor'])
                                    if (item.roles && !item.roles.some(role => auth.user.roles.includes(role))) {
                                        return null;
                                    }

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                                ${item.active
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }
                                                ${isCollapsed ? 'justify-center' : ''}
                                            `}
                                        >
                                            {item.active && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                            )}

                                            <item.icon className={`
                                                shrink-0 transition-colors
                                                ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}
                                                ${item.active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                                            `} />

                                            {!isCollapsed && (
                                                <span className="font-medium text-sm">{item.name}</span>
                                            )}

                                            {/* Tooltip for collapsed mode */}
                                            {isCollapsed && (
                                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md transform translate-x-1 transition-all">
                                                    {item.name}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Collapse Toggle (Desktop only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                {/* Sidebar Footer - Logout */}
                <div className="border-t border-slate-100 p-4">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors text-slate-500 hover:bg-slate-50 hover:text-red-600 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {/* Using LogOut icon from lucide-react, need to ensure it is imported if not already */}
                        <div className="shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${isCollapsed ? 'h-6 w-6' : ''}`}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        </div>
                        {!isCollapsed && <span className="font-medium text-sm">Sair</span>}
                    </Link>
                </div>
            </aside>
        </>
    );
}
