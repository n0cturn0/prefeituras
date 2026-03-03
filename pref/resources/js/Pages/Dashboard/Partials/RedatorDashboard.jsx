import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatCard from '@/Components/StatCard';
import { Head, Link } from '@inertiajs/react';
import { PenTool, FileText, MessageSquare, Plus } from 'lucide-react';

export default function RedatorDashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Área de Redação</h2>}
        >
            <Head title="Redator Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Minha Produtividade</h1>
                        <p className="text-slate-500 mt-1">Seus rascunhos e publicações recentes.</p>
                    </div>
                    <Link
                        href="#" // To be implemented: route('content.create')
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Nova Notícia
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Meus Rascunhos"
                        value="3"
                        difference="0"
                        trend="neutral"
                        icon={PenTool}
                    />
                    <StatCard
                        title="Publicados (Mês)"
                        value="12"
                        difference="+2"
                        trend="up"
                        icon={FileText}
                    />
                    <StatCard
                        title="Feedback Recebido"
                        value="1"
                        difference="+1"
                        trend="neutral"
                        icon={MessageSquare}
                    />
                </div>

                {/* Drafts List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-900">Rascunhos em Andamento</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">Rascunho de Matéria #{i}</h4>
                                        <p className="text-sm text-slate-500">Última edição há {i} horas</p>
                                    </div>
                                </div>
                                <button className="text-sm font-medium text-slate-600 hover:text-blue-600">Editar</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
