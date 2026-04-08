import React from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Components/Site/Layout';
import { Info, ShieldCheck, FileText, HelpCircle, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

export default function AcessoInformacao(props) {
    return (
        <Layout {...props} mainClassName="pt-32 pb-16" containerClassName="bg-gray-50">
            <Head title="Acesso à Informação - Prefeitura Municipal" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header da Página */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-blue-900 mb-4 border-b-4 border-blue-600 pb-2 inline-block">
                        Acesso à Informação
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl">
                        Esta seção reúne informações sobre a Lei de Acesso à Informação (Lei nº 12.527/2011),
                        canais de atendimento e o Portal da Transparência da Prefeitura.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Card: e-SIC */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <Mail size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 mb-3">e-SIC</h3>
                        <p className="text-gray-600 mb-6">
                            Sistema Eletrônico do Serviço de Informação ao Cidadão. Faça seu pedido de informação de forma online.
                        </p>
                        <a href="#" className="inline-flex items-center text-blue-600 font-bold hover:underline">
                            Solicitar Informação <ExternalLink size={16} className="ml-2" />
                        </a>
                    </div>

                    {/* Card: Portal da Transparência */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 mb-3">Portal da Transparência</h3>
                        <p className="text-gray-600 mb-6">
                            Consulte dados sobre receitas, despesas, licitações, contratos e servidores públicos.
                        </p>
                        <a href="#" className="inline-flex items-center text-blue-600 font-bold hover:underline">
                            Acessar Portal <ExternalLink size={16} className="ml-2" />
                        </a>
                    </div>

                    {/* Card: Perguntas Frequentes */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <HelpCircle size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 mb-3">Perguntas Frequentes</h3>
                        <p className="text-gray-600 mb-6">
                            Veja as respostas para as dúvidas mais comuns sobre a administração pública e serviços.
                        </p>
                        <a href="#" className="inline-flex items-center text-blue-600 font-bold hover:underline">
                            Ver Perguntas <ExternalLink size={16} className="ml-2" />
                        </a>
                    </div>

                    {/* Card: Solicitação de Informação */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <FileText size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 mb-3">Solicitação de Informação</h3>
                        <p className="text-gray-600 mb-6">
                            Registre um novo pedido de informação diretamente pelo nosso formulário eletrônico.
                        </p>
                        <a href={route('site.solicitacaoInformacao')} className="inline-flex items-center text-blue-600 font-bold hover:underline">
                            Abrir Formulário <ExternalLink size={16} className="ml-2" />
                        </a>
                    </div>

                    {/* Card: Ouvidoria */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <Mail size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 mb-3">Ouvidoria</h3>
                        <p className="text-gray-600 mb-6">
                            Registre sua manifestação (Denúncia, Elogio, Reclamação, Sugestão) para a administração.
                        </p>
                        <a href={route('site.ouvidoria')} className="inline-flex items-center text-blue-600 font-bold hover:underline">
                            Registrar Manifestação <ExternalLink size={16} className="ml-2" />
                        </a>
                    </div>
                </div>

                {/* Seção Informativa Inferior */}
                <div className="mt-16 bg-blue-900 text-white rounded-3xl p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-2/3">
                            <h2 className="text-3xl font-bold mb-4 text-white">Atendimento Presencial (SIC)</h2>
                            <p className="text-blue-100 mb-8 text-lg">
                                Caso prefira, você pode realizar sua solicitação presencialmente em nossa sede.
                                Nossos agentes estão prontos para auxiliar você.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-blue-400 mt-1" />
                                    <div>
                                        <p className="font-bold">Endereço</p>
                                        <p className="text-blue-100 text-sm">Praça da Matriz, 123 - Centro<br />[Cidade] - [Estado]</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="text-blue-400 mt-1" />
                                    <div>
                                        <p className="font-bold">Telefone</p>
                                        <p className="text-blue-100 text-sm">(00) 1234-5678</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <div className="w-48 h-48 bg-blue-800 rounded-full flex items-center justify-center border-8 border-blue-700">
                                <Info size={80} className="text-blue-400 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
