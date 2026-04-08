import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Eye, Layers } from 'lucide-react';

export default function ProgramaList({ auth, programas, filters, anos, funcoes }) {
    // A simplified way to display large money values in pt-BR
    const fmtMoney = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Programas do PPA</h2>}
        >
            <Head title="Programas do PPA" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white p-4 shadow sm:rounded-lg mb-6 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm text-slate-500 mb-1">Filtrar por Ano</label>
                            <select
                                className="w-full rounded-md border-slate-300 text-sm"
                                defaultValue={filters.ano || ''}
                                onChange={(e) => {
                                    window.location.href = route('programas.index', { ano: e.target.value });
                                }}
                            >
                                <option value="">Todos os Anos</option>
                                {anos.map(ano => (
                                    <option key={ano} value={ano}>{ano}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex-none">
                            <Link
                                href={route('programas.create')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-xs text-white uppercase tracking-widest hover:bg-blue-700 transition"
                            >
                                <Plus size={16} />
                                Novo Programa
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Código</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Nome do Programa</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Função</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Valor Global</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {programas.data.map((prog) => (
                                        <tr key={prog.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{prog.codigo}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-900">{prog.nome}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">Responsável: {prog.responsavel}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                Cod {prog.funcao_codigo} / {prog.subfuncao_codigo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                                                {fmtMoney(prog.valor_global)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Link 
                                                    href={route('programas.show', prog.id)}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition"
                                                >
                                                    <Eye size={16} className="mr-1.5" /> Detalhar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {programas.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                                Nenhum programa encontrado para os filtros atuais.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
