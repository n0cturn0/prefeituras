import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// Import Role-Based Partials
import AdminDashboard from './Dashboard/Partials/AdminDashboard';
import GestorDashboard from './Dashboard/Partials/GestorDashboard';
import RedatorDashboard from './Dashboard/Partials/RedatorDashboard';

export default function Dashboard({ auth }) {
    const roles = auth?.user?.roles || [];

    // Role-Based Routing
    if (roles.includes('Admin')) {
        return <AdminDashboard auth={auth} />;
    }

    if (roles.includes('Gestor')) {
        return <GestorDashboard auth={auth} />;
    }

    if (roles.includes('Redator')) {
        return <RedatorDashboard auth={auth} />;
    }

    // Fallback: Access Pending / No Role
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Acesso Pendente</h2>}
        >
            <Head title="Acesso Pendente" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-slate-900 text-center">
                            <h3 className="text-lg font-bold mb-2">Aguardando Atribuição de Funções</h3>
                            <p className="text-slate-600">
                                Seu perfil foi criado, mas você ainda não possui permissões específicas para visualizar painéis.
                                <br />
                                Entre em contato com o administrador do sistema.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
