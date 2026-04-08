import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import { UserPlus, X } from 'lucide-react';

export default function WriterManager({ subsection, availableWriters, onClose, show }) {
    const [selectedWriter, setSelectedWriter] = useState('');

    // Derived state: Writers currently assigned
    const assignedWriters = subsection.writers || []; // Need to ensure Controller loads this relationship or pass it separately
    // Note: In Index.jsx I should ensure `subsections` query includes `writers`

    const handleAssign = (e) => {
        e.preventDefault();
        router.post(route('subsections.assign', subsection.uuid), {
            user_id: selectedWriter
        }, {
            preserveScroll: true,
            onSuccess: () => setSelectedWriter('')
        });
    };

    const handleRemove = (userId) => {
        if (confirm('Remover este redator?')) {
            router.delete(route('subsections.remove', subsection.uuid), {
                data: { user_id: userId },
                preserveScroll: true,
            });
        }
    };

    // Filter available writers to exclude already assigned ones
    const unassignedWriters = availableWriters.filter(
        w => !assignedWriters.find(aw => aw.id === w.id)
    );

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-slate-900">
                        Gerenciar Redatores: <span className="text-blue-600">{subsection.name}</span>
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* List Assigned */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Redatores Atribuídos</h4>

                        {assignedWriters.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">Nenhum redator atribuído.</p>
                        ) : (
                            <ul className="space-y-2">
                                {assignedWriters.map(writer => (
                                    <li key={writer.id} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-md">
                                        <span className="text-sm text-slate-700">{writer.name}</span>
                                        <button
                                            onClick={() => handleRemove(writer.id)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Remover
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Add New */}
                    <div className="border-t border-slate-100 pt-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Adicionar Redator</h4>
                        <form onSubmit={handleAssign} className="flex gap-2">
                            <select
                                value={selectedWriter}
                                onChange={e => setSelectedWriter(e.target.value)}
                                className="block w-full text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="">Selecione um redator...</option>
                                {unassignedWriters.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            <PrimaryButton disabled={!selectedWriter}>
                                <UserPlus className="h-4 w-4" />
                            </PrimaryButton>
                        </form>
                        {unassignedWriters.length === 0 && (
                            <p className="text-xs text-orange-500 mt-1">Todos os redatores disponíveis já foram atribuídos.</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Fechar</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}
