import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ auth, section, departments, is_admin, current_department_name }) {
    const { data, setData, put, processing, errors } = useForm({
        name: section.name || '',
        status: section.status ? true : false,
        department_id: section.department_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('sections.update', section.uuid));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Editar Seção</h2>}
        >
            <Head title="Editar Seção" />

            <div className="max-w-xl mx-auto space-y-6">
                <Link href={route('sections.index')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para lista
                </Link>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100">
                    <form onSubmit={submit} className="space-y-6">

                        {/* Name */}
                        <div>
                            <InputLabel htmlFor="name" value="Nome da Seção" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Department - Select for Admin, Read-only for Manager */}
                        {is_admin ? (
                            <div>
                                <InputLabel htmlFor="department_id" value="Departamento Responsável" />
                                <select
                                    id="department_id"
                                    name="department_id"
                                    value={data.department_id}
                                    onChange={(e) => setData('department_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                >
                                    <option value="">Sem Departamento (Seção Global)</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.department_id} className="mt-2" />
                            </div>
                        ) : (
                            <div>
                                <InputLabel value="Departamento" />
                                <TextInput
                                    value={current_department_name}
                                    className="mt-1 block w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                                    disabled
                                />
                            </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="status"
                                checked={data.status}
                                onChange={(e) => setData('status', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <InputLabel htmlFor="status" value="Ativo" className="mb-0" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href={route('sections.index')}
                                className="underline text-sm text-slate-600 hover:text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
