import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Eye, Edit, Trash2, FileText, CheckCircle, Clock } from 'lucide-react';

export default function PpaIndex({ auth, ppas, stats }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Plano Plurianual (PPA)</h2>}
        >
            <Head title="PPA - Plano Plurianual" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total de PPAs</p>
                                    <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-full">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-emerald-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Em Vigor</p>
                                    <h3 className="text-2xl font-bold text-slate-800">{stats.em_vigor}</h3>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-full">
                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-amber-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Em Revisão</p>
                                    <h3 className="text-2xl font-bold text-slate-800">{stats.em_revisao}</h3>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-full">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-slate-900">Leis do PPA</h3>
                            <Link
                                href={route('ppa.create')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-xs text-white uppercase tracking-widest hover:bg-blue-700 transition"
                            >
                                <Plus size={16} />
                                Novo PPA
                            </Link>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Período</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Status</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Programas</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Anexo</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {ppas.data.map((ppa) => (
                                        <tr key={ppa.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">
                                                    {ppa.ano_inicio} - {ppa.ano_fim}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full 
                                                    ${ppa.status === 'em_vigor' ? 'bg-emerald-100 text-emerald-700' : 
                                                      ppa.status === 'revisao' ? 'bg-amber-100 text-amber-700' : 
                                                      'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {ppa.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {ppa.programas_count} vinculados
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {ppa.pdf_lei_ppa ? (
                                                    <a 
                                                        href={`/storage/${ppa.pdf_lei_ppa}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                                        title="Baixar PDF"
                                                    >
                                                        <FileText size={20} />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex justify-end gap-2">
                                                    <Link 
                                                        href={route('programas.index', { ppa_id: ppa.id })}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition"
                                                        title="Ver Programas"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <Link 
                                                        href={route('ppa.edit', ppa.id)}
                                                        className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 p-1.5 rounded transition"
                                                        title="Editar PPA"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    {/* Optional: Add delete button with confirmation handler */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {ppas.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                                Nenhum PPA cadastrado ainda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
