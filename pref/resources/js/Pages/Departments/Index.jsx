import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, Building2 } from 'lucide-react';

export default function Index({ auth, departments }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Gerenciar Departamentos</h2>}
        >
            <Head title="Departamentos" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        {/* Placeholder for Search if needed */}
                    </div>
                    <Link
                        href={route('departments.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Secretaria
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Nome da Secretaria</th>
                                <th className="px-6 py-3">Descrição</th>
                                <th className="px-6 py-3">Slug (Identificador)</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {departments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-slate-900">{dept.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={dept.description}>
                                        {dept.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                        {dept.slug}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {departments.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        Nenhuma secretaria cadastrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
