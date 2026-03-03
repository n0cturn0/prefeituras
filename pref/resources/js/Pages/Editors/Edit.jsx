import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ auth, editor, departmentName }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: editor.name || '',
        email: editor.email || '',
        password: '',
        password_confirmation: '',
        is_active: editor.is_active ? '1' : '0'
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('editors.update', editor.id), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Editar Redator</h2>}
        >
            <Head title="Editar Redator" />

            <div className="max-w-xl mx-auto space-y-6">
                <Link href={route('editors.index')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para lista
                </Link>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-slate-900">Editar Redator</h3>
                        <p className="text-sm text-slate-500">
                            Editando redator de <strong>{departmentName}</strong>.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Department (Read-only) */}
                        <div>
                            <InputLabel value="Departamento" />
                            <TextInput
                                value={departmentName}
                                className="mt-1 block w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                                disabled
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="name" value="Nome Completo" />
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

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="is_active" value="Status" />
                            <select
                                id="is_active"
                                name="is_active"
                                value={data.is_active}
                                onChange={(e) => setData('is_active', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="1">Ativo</option>
                                <option value="0">Inativo</option>
                            </select>
                            <InputError message={errors.is_active} className="mt-2" />
                        </div>

                        <div className="border-t border-slate-100 pt-6 mt-6">
                            <h3 className="text-sm font-medium text-slate-900 mb-4">Alterar Senha (Opcional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="password" value="Nova Senha" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirmar Nova Senha" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href={route('editors.index')}
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
