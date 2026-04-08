import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Building2, Landmark, Pencil, Trash2 } from 'lucide-react';

export default function Index({ auth, departments, flash }) {
    const handleDelete = (dept) => {
        if (confirm(`Deseja realmente excluir "${dept.name}"? Esta ação não pode ser desfeita.`)) {
            router.delete(route('departments.destroy', dept.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Organograma — Entidades</h2>}
        >
            <Head title="Entidades / Secretarias" />

            <div className="space-y-4">
                {/* Flash messages */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-lg">
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500">{departments.length} entidade(s) cadastrada(s)</p>
                    <Link
                        href={route('departments.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Entidade
                    </Link>
                </div>

                {/* Tabela */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Entidade</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Gestor</th>
                                <th className="px-6 py-3">Vinculado a</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {departments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${dept.is_root ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {dept.is_root
                                                    ? <Landmark className="h-5 w-5" />
                                                    : <Building2 className="h-5 w-5" />
                                                }
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-900">{dept.name}</span>
                                                {dept.acronym && (
                                                    <span className="ml-2 text-xs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                        {dept.acronym}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {dept.is_root ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Prefeitura
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Secretaria
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {dept.gestor || <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {dept.parent
                                            ? <span className="text-slate-700">{dept.parent.name}</span>
                                            : <span className="text-slate-300">—</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Link
                                                href={route('departments.edit', dept.id)}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(dept)}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {departments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                                        Nenhuma entidade cadastrada. Comece criando a Prefeitura.
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
