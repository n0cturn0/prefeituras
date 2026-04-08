import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ShieldAlert, Search, Filter } from 'lucide-react';

export default function Index({ auth, logs, filters }) {
    const { url } = usePage();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-indigo-600" />
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight">Logs de Auditoria</h2>
                </div>
            }
        >
            <Head title="Logs de Auditoria" />

            <div className="space-y-6">
                {/* Filters (Simple implementation) */}
                <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                    <div className="flex-1 max-w-sm relative">
                        <input
                            type="text"
                            placeholder="Buscar por módulo (Ex: User)..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    </div>
                    {/* More filters can be added here linked to router.get */}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data/Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ação</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alvo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Origem</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {logs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {log.created_at}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{log.causer}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${log.event === 'created' ? 'bg-green-100 text-green-800' :
                                                log.event === 'updated' ? 'bg-blue-100 text-blue-800' :
                                                    log.event === 'deleted' ? 'bg-red-100 text-red-800' :
                                                        log.event === 'login' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {log.event}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {log.subject_type} #{log.subject_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="flex flex-col">
                                            <span>{log.ip}</span>
                                            <span className="text-xs text-slate-400">{log.browser}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Simple Pagination */}
                    <div className="p-4 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Mostrando {logs.data.length} de {logs.total} registros</span>
                            <div className="flex gap-2">
                                {logs.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 rounded border text-sm ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span key={i} className="px-3 py-1 rounded border border-slate-100 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
