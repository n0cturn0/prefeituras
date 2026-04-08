import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Components/Site/Layout';
import { Send, User, Mail, Phone, MapPin, FileText, CheckCircle2 } from 'lucide-react';

export default function SolicitacaoInformacao(props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        tipo_pessoa: 'fisica',
        nome: '',
        documento: '',
        email: '',
        telefone: '',
        endereco: '',
        assunto: '',
        descricao: '',
        forma_recebimento: 'email',
    });

    // Máscaras Simples
    const maskDocumento = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (data.tipo_pessoa === 'fisica') {
            return numbers
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1');
        } else {
            return numbers
                .replace(/(\d{2})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1/$2')
                .replace(/(\d{4})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1');
        }
    };

    const maskTelefone = (value) => {
        const numbers = value.replace(/\D/g, '');
        return numbers
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('site.solicitacaoInformacao.store'), {
            onSuccess: () => {
                // O reset é opcional se quisermos mostrar o protocolo na mesma tela
                // reset();
            },
        });
    };

    return (
        <Layout {...props} mainClassName="pt-32 pb-20" containerClassName="bg-gray-50">
            <Head title="Solicitação de Informação (e-SIC) - Prefeitura" />

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-blue-900 mb-4">Solicitação de Informação (e-SIC)</h1>
                    <p className="text-gray-600">
                        Utilize o formulário abaixo para registrar seu pedido de informação à Prefeitura Municipal.
                    </p>
                </div>

                {props.flash.success ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-green-900 mb-2">Solicitação Enviada!</h2>
                        <p className="text-green-700 mb-2">
                            {props.flash.success}
                        </p>
                        {props.flash.protocolo && (
                            <div className="bg-white border border-green-200 inline-block px-6 py-3 rounded-xl mb-6">
                                <span className="text-sm text-green-600 block uppercase font-bold mb-1">Número do Protocolo</span>
                                <span className="text-3xl font-mono font-bold text-green-800 tracking-wider">
                                    {props.flash.protocolo}
                                </span>
                            </div>
                        )}
                        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                            Guarde este número para consultar o andamento do seu pedido posteriormente. Uma confirmação também foi enviada para o seu e-mail.
                        </p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                        >
                            Nova Solicitação
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Tipo de Pessoa */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                                <User className="mr-2 text-blue-600" size={24} /> Identificação do Solicitante
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full mb-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Tipo de Solicitante</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="tipo_pessoa" 
                                                value="fisica"
                                                checked={data.tipo_pessoa === 'fisica'}
                                                onChange={(e) => {
                                                    setData((prev) => ({ ...prev, tipo_pessoa: e.target.value, documento: '' }));
                                                }}
                                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-gray-700 group-hover:text-blue-600 font-medium">Pessoa Física</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="tipo_pessoa" 
                                                value="juridica"
                                                checked={data.tipo_pessoa === 'juridica'}
                                                onChange={(e) => {
                                                    setData((prev) => ({ ...prev, tipo_pessoa: e.target.value, documento: '' }));
                                                }}
                                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-gray-700 group-hover:text-blue-600 font-medium">Pessoa Jurídica</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {data.tipo_pessoa === 'fisica' ? 'Nome Completo' : 'Razão Social'}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={data.nome}
                                        onChange={(e) => setData('nome', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.nome ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none`}
                                        placeholder={data.tipo_pessoa === 'fisica' ? 'Digite seu nome completo' : 'Digite a razão social da empresa'}
                                        required
                                    />
                                    {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {data.tipo_pessoa === 'fisica' ? 'CPF' : 'CNPJ'}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={data.documento}
                                        onChange={(e) => setData('documento', maskDocumento(e.target.value))}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.documento ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none`}
                                        placeholder={data.tipo_pessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                                        required
                                    />
                                    {errors.documento && <p className="mt-1 text-sm text-red-600">{errors.documento}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
                                    <input 
                                        type="tel" 
                                        value={data.telefone}
                                        onChange={(e) => setData('telefone', maskTelefone(e.target.value))}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.telefone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none`}
                                        placeholder="(00) 00000-0000"
                                        required
                                    />
                                    {errors.telefone && <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>}
                                </div>

                                <div className="col-span-full">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                                    <input 
                                        type="email" 
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none`}
                                        placeholder="seu-email@exemplo.com"
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Solicitação */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                                <FileText className="mr-2 text-blue-600" size={24} /> Detalhes da Solicitação
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Assunto</label>
                                    <select 
                                        value={data.assunto}
                                        onChange={(e) => setData('assunto', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.assunto ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white`}
                                        required
                                    >
                                        <option value="">Selecione um assunto</option>
                                        <option value="licitacoes">Licitações e Contratos</option>
                                        <option value="servidores">Servidores e RH</option>
                                        <option value="financeiro">Financeiro e Orçamento</option>
                                        <option value="saude">Saúde</option>
                                        <option value="educacao">Educação</option>
                                        <option value="outros">Outros</option>
                                    </select>
                                    {errors.assunto && <p className="mt-1 text-sm text-red-600">{errors.assunto}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Descrição do Pedido</label>
                                    <textarea 
                                        rows="6"
                                        value={data.descricao}
                                        onChange={(e) => setData('descricao', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.descricao ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none`}
                                        placeholder="Descreva detalhadamente a informação que você deseja solicitar..."
                                        required
                                    ></textarea>
                                    {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Forma de Recebimento da Resposta</label>
                                    <div className="flex flex-wrap gap-4">
                                        {['email', 'presencial', 'correios'].map((opcao) => (
                                            <label key={opcao} className="flex items-center cursor-pointer group">
                                                <input 
                                                    type="radio" 
                                                    name="forma_recebimento" 
                                                    value={opcao}
                                                    checked={data.forma_recebimento === opcao}
                                                    onChange={(e) => setData('forma_recebimento', e.target.value)}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-gray-700 group-hover:text-blue-600 font-medium capitalize">{opcao === 'email' ? 'Por E-mail' : opcao}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
                            <span className="text-sm text-gray-500 italic">Campos obrigatórios são processados com segurança.</span>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? 'Enviando...' : <><Send size={18} /> Enviar Solicitação</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Layout>
    );
}
