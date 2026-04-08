import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FileText, Plus, Users, ChevronRight } from 'lucide-react';
import CreateSubsectionForm from './Partials/CreateSubsectionForm';
import WriterManager from './Partials/WriterManager';

export default function Index({ auth, section, subsections, availableWriters }) {
    const [isCreating, setIsCreating] = useState(false);

    // Writer Manager State
    const [managingWriterSubsection, setManagingWriterSubsection] = useState(null);

    const openWriterManager = (subsection) => {
        setManagingWriterSubsection(subsection);
    };

    const closeWriterManager = () => {
        setManagingWriterSubsection(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight">
                        Gerenciar Seção: {section.name}
                    </h2>
                </div>
            }
        >
            <Head title={`Gerenciar ${section.name}`} />

            <div className="space-y-6">
                {/* Header / Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="text-slate-500 text-sm">
                            Gerencie as subseções e conteúdos desta seção.
                        </p>
                    </div>

                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Nova Subseção
                        </button>
                    )}
                </div>

                {/* Create Form */}
                {isCreating && (
                    <CreateSubsectionForm
                        section={section}
                        onClose={() => setIsCreating(false)}
                    />
                )}

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {subsections.map((subsection) => (
                            <li key={subsection.uuid} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                            {/* Dynamic Icon based on type could go here */}
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{subsection.name}</h3>
                                            <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                                                <p>Tipo: <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-xs">PDF</span></p>
                                                {subsection.content && (
                                                    <p>Arquivo: {subsection.content.title}</p>
                                                )}
                                                <p className="flex items-center gap-1 mt-2">
                                                    <Users className="h-3 w-3" />
                                                    <span className="text-xs">
                                                        {subsection.writers && subsection.writers.length > 0
                                                            ? `${subsection.writers.length} redator(es) atribuído(s)`
                                                            : 'Nenhum redator atribuído'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openWriterManager(subsection)}
                                            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            Gerenciar Redatores
                                        </button>
                                        {/* Edit/Delete buttons could go here */}
                                    </div>
                                </div>
                            </li>
                        ))}
                        {subsections.length === 0 && (
                            <li className="p-8 text-center text-slate-500">
                                Nenhuma subseção criada ainda.
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Writer Manager Modal */}
            {managingWriterSubsection && (
                <WriterManager
                    show={!!managingWriterSubsection}
                    subsection={managingWriterSubsection}
                    availableWriters={availableWriters}
                    onClose={closeWriterManager}
                />
            )}
        </AuthenticatedLayout>
    );
}
