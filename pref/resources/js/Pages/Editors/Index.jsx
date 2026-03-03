import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, Edit, UserPen } from 'lucide-react';

export default function Index({ auth, editors }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Minha Equipe (Redatores)</h2>}
        >
            <Head title="Minha Equipe" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="text-slate-500 text-sm">
                        Gerencie os redatores do seu departamento.
                    </div>
                    <Link
                        href={route('editors.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Redator
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Nome</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {editors.map((editor) => (
                                <tr key={editor.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <UserPen className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-slate-900">{editor.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {editor.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${editor.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {editor.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={route('editors.edit', editor.id)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Editar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {editors.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        Nenhum redator encontrado na sua equipe.
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
