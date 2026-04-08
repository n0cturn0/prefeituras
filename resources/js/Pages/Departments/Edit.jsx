import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import DepartmentForm from './DepartmentForm';
import ImportadorURL from './ImportadorURL';

export default function Edit({ auth, department, parents }) {
    const { data, setData, put, processing, errors } = useForm({
        is_root: department.is_root ?? false,
        parent_id: department.parent_id ?? null,
        name: department.name ?? '',
        acronym: department.acronym ?? '',
        description: department.description ?? '',
        gestor: department.gestor ?? '',
        representante_gestor: department.representante_gestor ?? '',
        phone: department.phone ?? '',
        fax: department.fax ?? '',
        email: department.email ?? '',
        site: department.site ?? '',
        cep: department.cep ?? '',
        logradouro: department.logradouro ?? '',
        bairro: department.bairro ?? '',
        horario_atendimento: department.horario_atendimento ?? {},
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('departments.update', department.id));
    };

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
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Editar: {department.name}</h2>}
        >
            <Head title={`Editar: ${department.name}`} />

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
                            isEdit={true}
                        />

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                            <Link
                                href={route('departments.index')}
                                className="underline text-sm text-slate-600 hover:text-slate-900"
                            >
                                Cancelar
                            </Link>
                            <PrimaryButton disabled={processing}>
                                Salvar Alterações
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
