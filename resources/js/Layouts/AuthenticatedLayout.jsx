import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    Menu,
    X,
    Search,
    Bell,
    User,
    ChevronDown,
    Settings,
    LogOut,
    Building2,
    Users
} from 'lucide-react';
import Sidebar from '@/Components/Sidebar';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop slim state

    const { auth } = usePage().props;
    const { url } = usePage(); // Get URL directly from usePage context hook
    const roles = auth?.user?.roles || []; // Access user roles properly

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: route().current('dashboard') },
        // Example checking for role 'admin' or 'secretary' - adjust based on actual role names
        /*
        { 
            name: 'Documentos', 
            href: '/documents', 
            icon: FileText, 
            current: route().current('documents'),
            show: roles.includes('secretary') || roles.includes('admin') 
        },
        */
        // Static examples for now
        { name: 'Notícias', href: '#', icon: FileText, current: false },
        { name: 'e-SIC', href: '#', icon: FileText, current: false },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar Component */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            {/* Main Content Wrapper */}
            <div className={`min-h-screen flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

                {/* Topbar */}
                <header className="bg-white h-16 border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-700">
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Breadcrumbs (Simple Dynamic) */}
                        <nav className="hidden sm:flex" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2">
                                <li>
                                    <Link href={route('dashboard')} className="text-slate-400 hover:text-slate-500 text-sm">
                                        Home
                                    </Link>
                                </li>
                                <li><span className="text-slate-300">/</span></li>
                                <li>
                                    <span className="text-sm font-medium text-slate-900 capitalize" aria-current="page">
                                        {url.split('/')[1] || 'Dashboard'}
                                    </span>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Global Search */}
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="pl-9 pr-4 py-1.5 w-64 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        {/* Profile Dropdown */}
                        <div className="relative ml-3">
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            >
                                <span className="text-sm font-medium text-slate-700 hidden md:block">Minha Conta</span>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showingNavigationDropdown ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown Menu */}
                            {showingNavigationDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowingNavigationDropdown(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-slate-900 truncate">{auth.user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{auth.user.email}</p>
                                        </div>
                                        <Link
                                            href={route('profile.edit')} // Assuming this route exists or will exist, otherwise use #
                                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                            onClick={() => setShowingNavigationDropdown(false)}
                                        >
                                            <User className="h-4 w-4" />
                                            Perfil
                                        </Link>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sair
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}
