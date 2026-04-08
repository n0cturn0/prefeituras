import React, { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Search, User, Eye, Phone, Facebook, Instagram, Twitter, Youtube, Menu, X, CloudSun, ChevronDown } from 'lucide-react';
import AccessibilityBar from '@/Components/AccessibilityBar';

export default function Header({ departmentsMenu, publicacoesMenu, municipioMenu, informativosMenu, transparenciaMenu, contatosMenu }) {
    const { weather } = usePage().props;
    const [activeMenu, setActiveMenu] = useState(null);

    // Transform dynamic menu data if available
    const departmentsColumns = departmentsMenu?.submenus?.map(submenu => ({
        title: submenu.name,
        className: "border-r border-gray-100",
        items: submenu.items?.map(item => ({
            label: item.name,
            link: item.url
        })) || []
    })) || [];

    // Publicações Oficiais dynamic columns
    const publicacoesColumns = publicacoesMenu?.submenus?.map(submenu => ({
        title: submenu.name === 'Destaques' ? null : submenu.name,
        className: "border-r border-gray-100",
        items: submenu.items?.map(item => ({
            label: item.name,
            link: item.url,
            bold: submenu.name === 'Destaques' // Make items bold if in Destaques column to match image
        })) || []
    })) || [];

    // O Município dynamic columns
    const municipioColumns = municipioMenu?.submenus?.map(submenu => ({
        title: submenu.name === 'Geral' ? null : submenu.name, // Suppress 'Geral' title
        className: "border-r border-gray-100",
        items: submenu.items?.map(item => ({
            label: item.name,
            link: item.url
        })) || []
    })) || [];

    // Informativos dynamic columns
    const informativosColumns = informativosMenu?.submenus?.map(submenu => ({
        title: submenu.name === 'Geral' ? null : submenu.name,
        className: "border-r border-gray-100",
        items: submenu.items?.map(item => ({
            label: item.name,
            link: item.url
        })) || []
    })) || [];

    // Transparência dynamic items (flat list from first submenu 'Geral')
    const transparenciaItems = transparenciaMenu?.submenus?.[0]?.items?.map(item => ({
        label: item.name,
        link: item.url
    })) || [];

    // Contatos dynamic items (flat list from first submenu 'Geral')
    const contatosItems = contatosMenu?.submenus?.[0]?.items?.map(item => ({
        label: item.name,
        link: item.url
    })) || [];

    const navItems = [
        { label: "Início", link: "#" },
        {
            label: "O Município",
            link: "#",
            gridCols: "grid-cols-1 md:grid-cols-4",
            // Use dynamic columns for O Município
            columns: municipioColumns.length > 0 ? [
                ...municipioColumns,
                // Static contact column
                {
                    content: (
                        <div className="text-center">
                            <img src="https://via.placeholder.com/80" alt="Brasão" className="w-20 h-20 mx-auto mb-2 opacity-80" />
                            <p className="text-gray-500 text-sm">(51) 3011-7001</p>
                            <div className="text-gray-600 text-xs mt-2">
                                <strong className="block text-gray-800">Horários de Atendimento:</strong>
                                Segunda à Sexta: 8:30 às 11:30min e<br />
                                das 13:30 às 16:30
                            </div>
                        </div>
                    )
                }
            ] : []
        },
        {
            label: "Departamentos",
            link: "#",
            gridCols: "grid-cols-1 md:grid-cols-3",
            columns: departmentsColumns.length > 0 ? departmentsColumns : []
        },
        {
            label: "Informativos",
            link: "#",
            gridCols: "grid-cols-1 md:grid-cols-4",
            columns: informativosColumns.length > 0 ? [
                ...informativosColumns,
                // Static contact column
                {
                    content: (
                        <div className="text-center">
                            <img src="https://via.placeholder.com/80" alt="Brasão" className="w-20 h-20 mx-auto mb-2 opacity-80" />
                            <p className="text-gray-500 text-sm">(51) 3011-7001</p>
                            <div className="text-gray-600 text-xs mt-2">
                                <strong className="block text-gray-800">Horários de Atendimento:</strong>
                                Segunda à Sexta: 8:30 às 11:30min e<br />
                                das 13:30 às 16:30
                            </div>
                        </div>
                    )
                }
            ] : []
        },
        {
            label: "Publicações Oficiais",
            link: "#",
            gridCols: "grid-cols-1 md:grid-cols-4",
            columns: publicacoesColumns.length > 0 ? publicacoesColumns : []
        },
        {
            label: "Transparência",
            link: "#",
            type: "dropdown",
            items: transparenciaItems.length > 0 ? transparenciaItems : [
                { label: "Acesso à Informação", link: "#" },
                { label: "Carta de Serviços", link: "#" },
                { label: "Contas Públicas", link: "#" },
                { label: "Avaliação dos Serviços", link: "#" },
                { label: "Perguntas Frequentes", link: "#" },
                { label: "e-SIC - Pedido de informações", link: "#" },
                { label: "Documentos Quanto ao Grau de Sigilo", link: "#" },
                { label: "Informações Desclassificadas", link: "#" },
                { label: "Acessibilidade", link: "#" },
                { label: "Dados Abertos", link: "#" }
            ]
        },
        {
            label: "Contatos",
            link: "#",
            type: "dropdown",
            items: contatosItems.length > 0 ? contatosItems : [
                { label: "Telefones e Endereços", link: "#" },
                { label: "Fale Conosco", link: "#" },
                { label: "Ouvidoria", link: "#" },
            ]
        }
    ];

    return (
        <header className="w-full bg-white shadow-md relative z-50">
            {/* Top Bar - Accessibility & Info */}
            {/* Top Bar - Accessibility & Info */}
            <AccessibilityBar />

            {/* Main Header Area */}
            <div className="container mx-auto px-4 py-4 md:py-6 relative z-10 bg-white">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Logo Area */}
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-500">
                            {/* Placeholder for Coat of Arms */}
                            <img src="https://via.placeholder.com/64" alt="Brasão" className="w-12 h-12 object-contain mix-blend-multiply opacity-80" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl font-bold text-blue-900 leading-tight">Prefeitura Municipal de</h1>
                            <h2 className="text-xl text-blue-600 font-light">[Prefeitura Modelo]</h2>
                        </div>
                    </div>

                    {/* Search & Utility */}
                    <div className="flex flex-col space-y-3 w-full md:w-auto">
                        <div className="flex items-center space-x-4 justify-center md:justify-end text-sm text-gray-600">
                            {weather && (
                                <div className="flex items-center space-x-1" title={weather.status}>
                                    {/* Map pictocode to icon if desired, using CloudSun as generic fallback or specific icons based on ID */}
                                    <CloudSun size={18} className="text-blue-500" />
                                    <span>{weather.temp}°C - {weather.status}</span>
                                </div>
                            )}
                            <div className="hidden md:block h-4 w-[1px] bg-gray-300"></div>
                            <a href="#" className="hover:text-blue-600 transision">Transparência</a>
                            <a href="#" className="hover:text-blue-600 transision">Contraste</a>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="O que você procura?"
                                className="w-full md:w-80 pl-4 pr-10 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50/50"
                            />
                            <button className="absolute right-0 top-0 h-full px-3 text-blue-500 hover:bg-blue-100 rounded-r-lg">
                                <Search size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secondary Actions (Quick Links) */}
                <div className="flex justify-center md:justify-end space-x-4 mt-2 text-sm text-blue-700 font-semibold">
                    <a href="#" className="flex items-center space-x-1 hover:underline">
                        <li className="list-none"><Eye size={16} /></li>
                        <span>Acesso à Informação</span>
                    </a>
                    <a href="#" className="flex items-center space-x-1 hover:underline">
                        <li className="list-none"><Phone size={16} /></li>
                        <span>Ouvidoria</span>
                    </a>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between md:justify-center items-center py-0">
                        {/* Mobile Menu Button */}
                        <button className="md:hidden py-3 flex items-center space-x-2">
                            <Menu size={24} />
                            <span className="font-bold">MENU</span>
                        </button>

                        {/* Desktop Menu */}
                        <ul className="hidden md:flex flex-wrap justify-center text-sm font-medium uppercase tracking-wide relative w-full">
                            {navItems.map((item, index) => (
                                <li
                                    key={index}
                                    className={`group ${item.type === 'dropdown' ? 'relative' : 'static'}`}
                                    onMouseEnter={() => setActiveMenu(item.label)}
                                    onMouseLeave={() => setActiveMenu(null)}
                                >
                                    <Link
                                        href={item.link}
                                        className={`flex items-center py-4 px-4 lg:px-6 hover:bg-blue-700 transition border-b-4 ${activeMenu === item.label ? 'border-orange-400 bg-blue-700' : 'border-transparent hover:border-orange-400'}`}
                                    >
                                        {item.label}
                                    </Link>

                                    {/* Mega Menu / Dropdown */}
                                    {item.columns && activeMenu === item.label && (
                                        <div className="absolute left-0 top-full w-full bg-white text-gray-800 shadow-xl border-t border-gray-100 p-8 animate-fade-in z-50">
                                            <div className={`container mx-auto grid gap-8 ${item.gridCols || 'grid-cols-4'}`}>
                                                {item.columns.map((col, colIndex) => (
                                                    <div key={colIndex} className={`px-4 ${col.className || ''}`}>
                                                        {col.title && (
                                                            <h3 className="text-xl text-gray-500 font-light mb-4">{col.title}</h3>
                                                        )}
                                                        {col.items && (
                                                            <ul className="space-y-2">
                                                                {col.items.map((subItem, subIndex) => (
                                                                    <li key={subIndex}>
                                                                        <Link href={subItem.link} className={`block hover:text-blue-600 hover:translate-x-1 transition-transform flex items-center ${subItem.bold ? 'font-bold text-blue-800' : 'text-blue-600'}`}>
                                                                            {!subItem.bold && <span className="mr-1 text-blue-400 font-bold">›</span>}
                                                                            {subItem.label}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {col.content && col.content}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Simple Dropdown for 'Transparência' style */}
                                    {item.type === 'dropdown' && activeMenu === item.label && (
                                        <div className="absolute left-0 w-64 top-full bg-white text-gray-800 shadow-xl border-t border-gray-100 py-2 animate-fade-in z-50 rounded-b-lg">
                                            <ul className="flex flex-col">
                                                {item.items.map((subItem, subIndex) => (
                                                    <li key={subIndex}>
                                                        <Link href={subItem.link} className="block px-6 py-3 hover:bg-blue-50 text-blue-600 hover:text-blue-800 border-b border-gray-50 last:border-0 transition flex items-center">
                                                            <span className="mr-2 text-blue-400 font-bold">›</span>
                                                            {subItem.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}
