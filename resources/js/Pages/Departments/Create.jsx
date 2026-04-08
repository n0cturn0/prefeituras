import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import DepartmentForm from './DepartmentForm';
import ImportadorURL from './ImportadorURL';

const EMPTY_FORM = {
    is_root: false,
    parent_id: null,
    name: '',
    acronym: '',
    description: '',
    gestor: '',
    representante_gestor: '',
    phone: '',
    fax: '',
    email: '',
    site: '',
    cep: '',
    logradouro: '',
    bairro: '',
    horario_atendimento: {},
};

export default function Create({ auth, parents }) {
    const { data, setData, post, processing, errors } = useForm(EMPTY_FORM);

    const submit = (e) => {
        e.preventDefault();
        post(route('departments.store'));
    };

    /**
     * Callback do ImportadorURL — preenche os campos do formulário
     * com os dados capturados. O usuário pode revisar antes de salvar.
     */
    const handleImport = (imported) => {
        Object.entries(imported).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                setData(key, value);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Nova Secretaria / Entidade</h2>}
        >
            <Head title="Nova Secretaria" />

            <div className="max-w-3xl mx-auto space-y-5">
                <Link href={route('departments.index')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para lista
                </Link>

                {/* ── Painel de Importação (independente do form) ── */}
                <ImportadorURL onImport={handleImport} />

                {/* ── Formulário Principal ── */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100">
                    <form onSubmit={submit} className="space-y-8">
                        <DepartmentForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            parents={parents}
                        />

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                            <Link
                                href={route('departments.index')}
                                className="underline text-sm text-slate-600 hover:text-slate-900"
                            >
                                Cancelar
                            </Link>
                            <PrimaryButton disabled={processing}>
                                Criar Entidade
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
