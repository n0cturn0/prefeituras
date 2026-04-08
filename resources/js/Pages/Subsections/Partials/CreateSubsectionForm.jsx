import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function CreateSubsectionForm({ section, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'pdf_with_title', // Default
        title: '',
        subtitle: '',
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('subsections.store', section.uuid), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Nova Subseção</h3>
            <form onSubmit={submit} className="space-y-4">

                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value="Nome da Subseção" />
                    <TextInput
                        id="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        placeholder="Ex: Edital 2024"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Type Selector (Currently fixed/hidden as per requirements only mentioned pdf_with_title, but good to have structure) */}
                <div>
                    <InputLabel htmlFor="type" value="Tipo de Conteúdo" />
                    <select
                        id="type"
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    >
                        <option value="pdf_with_title">PDF com Título e Subtítulo</option>
                    </select>
                </div>

                {/* Dynamic Fields for PDF */}
                {data.type === 'pdf_with_title' && (
                    <div className="space-y-4 border-l-2 border-blue-200 pl-4 mt-2">
                        <div>
                            <InputLabel htmlFor="title" value="Título do Documento" />
                            <TextInput
                                id="title"
                                value={data.title}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="subtitle" value="Subtítulo (Opcional)" />
                            <TextInput
                                id="subtitle"
                                value={data.subtitle}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('subtitle', e.target.value)}
                            />
                            <InputError message={errors.subtitle} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="file" value="Arquivo PDF" />
                            <input
                                id="file"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setData('file', e.target.files[0])}
                                className="mt-1 block w-full text-sm text-slate-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100"
                                required
                            />
                            <InputError message={errors.file} className="mt-2" />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <SecondaryButton onClick={onClose} type="button">Cancelar</SecondaryButton>
                    <PrimaryButton disabled={processing}>Criar Subseção</PrimaryButton>
                </div>
            </form>
        </div>
    );
}
