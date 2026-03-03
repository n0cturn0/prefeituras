import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-blue-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Column 1: Logo & Address */}
                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                {/* Placeholder for Coat of Arms */}
                                <img src="https://via.placeholder.com/48" alt="Brasão" className="w-8 h-8 opacity-80" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Prefeitura Municipal</h3>
                                <p className="text-blue-300 text-sm">Prefeitura Modelo</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm text-blue-100">
                            <div className="flex items-start space-x-2">
                                <MapPin size={16} className="mt-1 flex-shrink-0" />
                                <span>Av. Gov. Valadares, 123 - Centro<br />CEP: 12345-000</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone size={16} />
                                <span>(00) 1234-5678</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail size={16} />
                                <span>contato@prefeitura.gov.br</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 border-b border-blue-800 pb-2 inline-block">Institucional</h4>
                        <ul className="space-y-2 text-sm text-blue-100">
                            <li><a href="#" className="hover:text-white hover:underline transition">Gabinete da Prefeita</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Secretarias</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Organograma</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Servidores</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Legislação Municipal</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Services */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 border-b border-blue-800 pb-2 inline-block">Serviços Online</h4>
                        <ul className="space-y-2 text-sm text-blue-100">
                            <li><a href="#" className="hover:text-white hover:underline transition">Nota Fiscal Eletrônica</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Licitações e Contratos</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Diário Oficial</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Portal da Transparência</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Ouvidoria Municipal</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter & Social */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 border-b border-blue-800 pb-2 inline-block">Fique Informado</h4>
                        <p className="text-sm text-blue-100 mb-4">Receba as últimas notícias e novidades da prefeitura diretamente no seu e-mail.</p>
                        <form className="mb-6 flex">
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                className="w-full px-3 py-2 rounded-l-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-r-md transition font-bold">
                                Assinar
                            </button>
                        </form>
                        <div className="flex space-x-4">
                            <a href="#" className="bg-blue-800 p-2 rounded-full hover:bg-blue-700 transition"><Facebook size={20} /></a>
                            <a href="#" className="bg-blue-800 p-2 rounded-full hover:bg-blue-700 transition"><Instagram size={20} /></a>
                            <a href="#" className="bg-blue-800 p-2 rounded-full hover:bg-blue-700 transition"><Twitter size={20} /></a>
                            <a href="#" className="bg-blue-800 p-2 rounded-full hover:bg-blue-700 transition"><Youtube size={20} /></a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-blue-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-blue-300">
                    <p>&copy; 2026 Prefeitura Municipal. Todos os direitos reservados.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white">Política de Privacidade</a>
                        <a href="#" className="hover:text-white">Termos de Uso</a>
                        <a href="#" className="hover:text-white">Mapa do Site</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
