import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { ArrowLeft } from 'lucide-react';

export default function Create({ auth, departmentName }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('editors.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Novo Redator</h2>}
        >
            <Head title="Novo Redator" />

            <div className="max-w-xl mx-auto space-y-6">
                <Link href={route('editors.index')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para lista
                </Link>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-slate-900">Adicionar Redator</h3>
                        <p className="text-sm text-slate-500">
                            Novo redator para <strong>{departmentName}</strong>.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Department (Read-only) */}
                        <div>
                            <InputLabel value="Departamento (Automático)" />
                            <TextInput
                                value={departmentName}
                                className="mt-1 block w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                                disabled
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                O redator será vinculado automaticamente ao seu departamento.
                            </p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="password" value="Senha" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirmar Senha" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
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
                                Criar Redator
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
