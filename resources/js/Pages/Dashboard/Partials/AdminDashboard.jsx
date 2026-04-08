import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatCard from '@/Components/StatCard';
import { Head } from '@inertiajs/react';
import { Users, HardDrive, AlertTriangle, Activity } from 'lucide-react';

export default function AdminDashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Painel Administrativo</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Intro Section */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Centro de Controle</h1>
                    <p className="text-slate-500 mt-1">Visão geral do sistema e monitoramento de recursos.</p>
                </div>

                {/* Stats Grid - Control Center Focus */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Usuários Online"
                        value="48"
                        difference="+12"
                        trend="up"
                        icon={Users}
                    />
                    <StatCard
                        title="Espaço em Disco"
                        value="45%"
                        difference="+2%"
                        trend="up" // Usage went up, usually bad for disk but consistent logic
                        icon={HardDrive}
                    />
                    <StatCard
                        title="Pendências Globais"
                        value="15"
                        difference="-5"
                        trend="down" // Down is good for errors/pending
                        icon={AlertTriangle}
                    />
                    <StatCard
                        title="Erros de Sistema"
                        value="0"
                        difference="0"
                        trend="neutral"
                        icon={Activity}
                    />
                </div>

                {/* System Health / Management Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Logs do Sistema & Auditoria</h3>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Ver Logs Completos</button>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">Backup Automático Realizado</p>
                                            <p className="text-sm text-slate-500">Banco de dados principal</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-400">Há {i * 15} min</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
