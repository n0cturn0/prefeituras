import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Perfil</h2>}
        >
            <Head title="Perfil" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section className="max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-slate-900">Informações do Perfil</h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Em breve você poderá atualizar suas informações de conta e endereço de email aqui.
                                </p>
                            </header>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
