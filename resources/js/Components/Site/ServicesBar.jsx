import React from 'react';
import { FileText, Info, HelpCircle, Newspaper } from 'lucide-react';

export default function ServicesBar() {
    return (
        <section className="py-10 bg-white border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ServiceCard
                        title="Nota Fiscal"
                        subtitle="Eletrônica"
                        icon={<FileText size={32} />}
                        color="bg-orange-100 text-orange-600 border-orange-200"
                    />
                    <ServiceCard
                        title="Acesso à"
                        subtitle="Informação"
                        icon={<Info size={32} />}
                        color="bg-green-100 text-green-600 border-green-200"
                    />
                    <ServiceCard
                        title="Portal da"
                        subtitle="Transparência"
                        icon={<HelpCircle size={32} />}
                        color="bg-blue-100 text-blue-600 border-blue-200"
                    />
                    <ServiceCard
                        title="Diário"
                        subtitle="Oficial"
                        icon={<Newspaper size={32} />}
                        color="bg-gray-100 text-gray-600 border-gray-200"
                    />
                </div>
            </div>
        </section>
    );
}

function ServiceCard({ title, subtitle, icon, color }) {
    return (
        <a href="#" className={`flex items-center p-4 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg ${color} bg-opacity-50 hover:bg-opacity-100`}>
            <div className="mr-4 p-3 bg-white rounded-full shadow-sm">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold leading-none">{title}</h3>
                <span className="text-sm font-medium opacity-80">{subtitle}</span>
            </div>
        </a>
    );
}
