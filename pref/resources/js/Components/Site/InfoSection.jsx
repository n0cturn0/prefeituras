import React from 'react';
import { BookOpen, User } from 'lucide-react';

export default function InfoSection() {
    return (
        <section className="py-12 bg-blue-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Official Publications */}
                    <div className="lg:w-2/3">
                        <div className="mb-6 flex items-center space-x-2">
                            <BookOpen className="text-blue-600" />
                            <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-wide">Publicações Oficiais</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Acesse os documentos oficiais, decretos, leis e portarias. Selecione os filtros abaixo para buscar.
                        </p>

                        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
                                        <option>2026</option>
                                        <option>2025</option>
                                        <option>2024</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
                                        <option>Todos</option>
                                        <option>Janeiro</option>
                                        <option>Fevereiro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
                                        <option>Todos</option>
                                        <option>Decretos</option>
                                        <option>Leis</option>
                                        <option>Portarias</option>
                                    </select>
                                </div>
                            </div>
                            <button className="w-full md:w-auto bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition font-bold">
                                Pesquisar
                            </button>
                        </div>
                    </div>

                    {/* Secretariats / Mayor Profile */}
                    <div className="lg:w-1/3">
                        <div className="mb-6 flex items-center space-x-2">
                            <User className="text-blue-600" />
                            <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-wide">Secretarias</h2>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center border-t-4 border-blue-500">
                            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-100 shadow-inner">
                                <img
                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
                                    alt="Prefeita"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-1">Gabinete da Prefeita</h3>
                            <h4 className="text-xl font-bold text-gray-800 mb-4">Fernanda Carrilho de Freitas</h4>
                            <p className="text-sm text-gray-500 italic mb-4">
                                "Trabalhando juntos por uma cidade mais justa e desenvolvida para todos."
                            </p>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p><strong>Tel:</strong> (00) 1234-5678</p>
                                <p><strong>Email:</strong> gabin@prefeitura.gov.br</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
