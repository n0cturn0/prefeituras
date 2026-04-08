import React from 'react';
import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

const DAYS = [
    { key: 'seg', label: 'Segunda-feira' },
    { key: 'ter', label: 'Terça-feira' },
    { key: 'qua', label: 'Quarta-feira' },
    { key: 'qui', label: 'Quinta-feira' },
    { key: 'sex', label: 'Sexta-feira' },
    { key: 'sab', label: 'Sábado' },
    { key: 'dom', label: 'Domingo' },
];

export default function DepartmentForm({ data, setData, errors, parents = [], isEdit = false }) {
    const isRoot = data.is_root;

    // Atualiza o horário de um dia específico
    const setHorario = (day, field, value) => {
        const current = data.horario_atendimento || {};
        const dayData = current[day] || { ativo: false, inicio: '07:00', fim: '13:00' };
        setData('horario_atendimento', {
            ...current,
            [day]: { ...dayData, [field]: value },
        });
    };

    const toggleDay = (day) => {
        const current = data.horario_atendimento || {};
        const dayData = current[day] || { ativo: false, inicio: '07:00', fim: '13:00' };
        setData('horario_atendimento', {
            ...current,
            [day]: { ...dayData, ativo: !dayData.ativo },
        });
    };

    return (
        <div className="space-y-8">
            {/* ── Tipo da Entidade ── */}
            <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Tipo da Entidade</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        id="is_root"
                        checked={!!data.is_root}
                        onChange={(e) => {
                            setData('is_root', e.target.checked);
                            if (e.target.checked) setData('parent_id', null);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                        <span className="font-medium text-slate-800">Esta é a Prefeitura (nó raiz do organograma)</span>
                        <p className="text-xs text-slate-500 mt-0.5">Marque apenas para a entidade principal. Não terá departamento superior.</p>
                    </div>
                </label>
                <InputError message={errors.is_root} className="mt-2" />
            </section>

            {/* ── Vinculação Hierárquica ── */}
            {!isRoot && (
                <section>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Hierarquia</h3>
                    <div>
                        <InputLabel htmlFor="parent_id" value="Vinculado a (Secretaria/Prefeitura superior)" />
                        <select
                            id="parent_id"
                            value={data.parent_id ?? ''}
                            onChange={(e) => setData('parent_id', e.target.value || null)}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                        >
                            <option value="">— Sem vínculo —</option>
                            {parents.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.is_root ? '🏛️ ' : '📁 '}{p.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.parent_id} className="mt-2" />
                    </div>
                </section>
            )}

            {/* ── Identificação ── */}
            <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Identificação</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="name" value="Nome da Entidade *" />
                        <TextInput
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="acronym" value="Sigla" />
                        <TextInput
                            id="acronym"
                            value={data.acronym}
                            onChange={(e) => setData('acronym', e.target.value.toUpperCase())}
                            className="mt-1 block w-full"
                            maxLength={20}
                            placeholder="SEMFAZ"
                        />
                        <InputError message={errors.acronym} className="mt-2" />
                    </div>
                </div>
                <div className="mt-4">
                    <InputLabel htmlFor="description" value="Descrição / Competências" />
                    <textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                        rows={3}
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>
            </section>

            {/* ── Responsáveis ── */}
            <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Responsáveis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="gestor" value="Gestor (Secretário/a)" />
                        <TextInput
                            id="gestor"
                            value={data.gestor}
                            onChange={(e) => setData('gestor', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.gestor} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="representante_gestor" value="Representante do Gestor" />
                        <TextInput
                            id="representante_gestor"
                            value={data.representante_gestor}
                            onChange={(e) => setData('representante_gestor', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.representante_gestor} className="mt-2" />
                    </div>
                </div>
            </section>

            {/* ── Contato ── */}
            <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Contato</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="phone" value="Telefone" />
                        <TextInput
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="(67) 3250-0000"
                        />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="fax" value="Fax" />
                        <TextInput
                            id="fax"
                            value={data.fax}
                            onChange={(e) => setData('fax', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.fax} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="email" value="E-mail" />
                        <TextInput
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="site" value="Site" />
                        <TextInput
                            id="site"
                            value={data.site}
                            onChange={(e) => setData('site', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="https://..."
                        />
                        <InputError message={errors.site} className="mt-2" />
                    </div>
                </div>
            </section>

            {/* ── Endereço ── */}
            <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Endereço</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <InputLabel htmlFor="cep" value="CEP" />
                        <TextInput
                            id="cep"
                            value={data.cep}
                            onChange={(e) => setData('cep', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="79.000-000"
                        />
                        <InputError message={errors.cep} className="mt-2" />
                    </div>
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="logradouro" value="Logradouro" />
                        <TextInput
                            id="logradouro"
                            value={data.logradouro}
                            onChange={(e) => setData('logradouro', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.logradouro} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="bairro" value="Bairro" />
                        <TextInput
                            id="bairro"
                            value={data.bairro}
                            onChange={(e) => setData('bairro', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.bairro} className="mt-2" />
                    </div>
                </div>
            </section>

            {/* ── Horário de Atendimento ── */}
            <section>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Horário de Atendimento</h3>
                <div className="space-y-3">
                    {DAYS.map(({ key, label }) => {
                        const dayData = (data.horario_atendimento || {})[key] || { ativo: false, inicio: '07:00', fim: '13:00' };
                        return (
                            <div key={key} className="flex items-center gap-4">
                                <label className="flex items-center gap-2 w-40 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!dayData.ativo}
                                        onChange={() => toggleDay(key)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">{label}</span>
                                </label>
                                {dayData.ativo && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">das</span>
                                        <input
                                            type="time"
                                            value={dayData.inicio}
                                            onChange={(e) => setHorario(key, 'inicio', e.target.value)}
                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm py-1 px-2"
                                        />
                                        <span className="text-xs text-slate-500">às</span>
                                        <input
                                            type="time"
                                            value={dayData.fim}
                                            onChange={(e) => setHorario(key, 'fim', e.target.value)}
                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm py-1 px-2"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <InputError message={errors.horario_atendimento} className="mt-2" />
            </section>
        </div>
    );
}
