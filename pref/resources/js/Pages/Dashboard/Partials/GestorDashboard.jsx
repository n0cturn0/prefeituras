import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatCard from '@/Components/StatCard';
import { Head } from '@inertiajs/react';
import { FileText, Clock, CheckCircle } from 'lucide-react';

export default function GestorDashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Painel do Gestor</h2>}
        >
            <Head title="Gestor Dashboard" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Visão da Secretaria</h1>
                    <p className="text-slate-500 mt-1">Gerencie o conteúdo e as demandas da sua área.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Aguardando Aprovação"
                        value="8"
                        difference="+3"
                        trend="up" // More pending work might be "bad" or "up", context dependent.
                        icon={FileText}
                    />
                    <StatCard
                        title="Prazos e-SIC"
                        value="2"
                        difference="-1"
                        trend="down" // Less deadlines approaching is good
                        icon={Clock}
                    />
                    <StatCard
                        title="Conteúdo Publicado"
                        value="156"
                        difference="+12"
                        trend="up"
                        icon={CheckCircle}
                    />
                </div>

                {/* Priority items table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-900">Conteúdo Pendente de Revisão</h3>
                    </div>
                    {/* Simplified table structure for mock */}
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Título</th>
                                <th className="px-6 py-3">Autor</th>
                                <th className="px-6 py-3">Data Envio</th>
                                <th className="px-6 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2].map((i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">Notícia de Teste #{i}</td>
                                    <td className="px-6 py-4 text-slate-600">Redator João</td>
                                    <td className="px-6 py-4 text-slate-500">Hoje, 10:00</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:underline font-medium">Revisar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
