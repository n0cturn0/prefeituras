import React from 'react';
import { ChevronRight, Calendar, FileText, Briefcase, MapPin, AlertCircle, Info } from 'lucide-react';

export default function NewsSection() {
    const news = [
        {
            id: 1,
            title: "Prefeitura inicia obras de pavimentação no bairro Centro",
            date: "16 Jan, 2026",
            image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
            category: "Obras"
        },
        {
            id: 2,
            title: "Campanha de vacinação contra a gripe começa nesta segunda",
            date: "15 Jan, 2026",
            image: "https://images.unsplash.com/photo-1632613713312-04d546b5fd7f?q=80&w=800&auto=format&fit=crop",
            category: "Saúde"
        },
        {
            id: 3,
            title: "Inscrições abertas para oficinas culturais gratuitas",
            date: "14 Jan, 2026",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
            category: "Cultura"
        }
    ];

    const quickAccess = [
        { title: "Nota Fiscal", icon: <FileText size={18} /> },
        { title: "Licitações", icon: <Briefcase size={18} /> },
        { title: "IPTU", icon: <MapPin size={18} /> },
        { title: "Concursos", icon: <AlertCircle size={18} /> },
        { title: "Portal da Transparência", icon: <Info size={18} /> },
        { title: "Horários de Ônibus", icon: <Calendar size={18} /> },
    ];

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Latest News Area */}
                    <div className="lg:w-3/4">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-500 pl-4 uppercase tracking-wide">
                                Últimas Notícias
                            </h2>
                            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center">
                                Ver todas <ChevronRight size={16} />
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {news.map((item) => (
                                <article key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <span className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1">
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center text-xs text-gray-500 mb-2 space-x-1">
                                            <Calendar size={12} />
                                            <span>{item.date}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
                                            <a href="#">{item.title}</a>
                                        </h3>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access Sidebar */}
                    <div className="lg:w-1/4">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-wide">
                            Acesso Rápido
                        </h2>
                        <ul className="space-y-3">
                            {quickAccess.map((item, index) => (
                                <li key={index}>
                                    <a href="#" className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow active:scale-95 transition-all group border-l-4 border-transparent hover:border-blue-500">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            {item.icon}
                                        </div>
                                        <span className="text-gray-700 font-medium group-hover:text-blue-700">{item.title}</span>
                                        <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-blue-500" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
