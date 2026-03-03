import React from 'react';
import { Map, Video, PlayCircle } from 'lucide-react';

export default function MultimediaSection() {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Tourist Attractions */}
                    <div className="lg:w-2/3">
                        <div className="mb-6 flex items-center space-x-2">
                            <Map className="text-blue-500" />
                            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Atrações Turísticas</h2>
                        </div>
                        <div className="relative group overflow-hidden rounded-xl shadow-lg h-[400px]">
                            <img
                                src="https://images.unsplash.com/photo-1565554167389-0640f0907d4f?q=80&w=2670&auto=format&fit=crop"
                                alt="Atração Turística"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-white text-3xl font-bold mb-2">Estádio Municipal</h3>
                                <p className="text-gray-200 mb-4 line-clamp-2">
                                    Conheça o maior palco esportivo da região, sede de grandes eventos e competições. Uma estrutura moderna para todos.
                                </p>
                                <button className="self-start px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition">
                                    Conhecer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Multimedia / Video */}
                    <div className="lg:w-1/3">
                        <div className="mb-6 flex items-center space-x-2">
                            <Video className="text-blue-500" />
                            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Multimídia</h2>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
                            <div className="relative flex-1 bg-gray-200 rounded-lg overflow-hidden group cursor-pointer">
                                <img
                                    src="https://images.unsplash.com/photo-1492619877684-297ebcc55476?q=80&w=2667&auto=format&fit=crop"
                                    alt="Video Thumbnail"
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle size={64} className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-bold text-gray-800 mb-2">Conheça nossa cidade</h3>
                                <p className="text-sm text-gray-600">
                                    Um passeio pelos principais pontos turísticos e históricos.
                                </p>
                                <a href="#" className="mt-2 inline-block text-blue-600 text-sm font-semibold hover:underline">
                                    Ver todos os vídeos
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
