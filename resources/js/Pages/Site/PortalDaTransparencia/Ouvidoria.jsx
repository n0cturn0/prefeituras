import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Layout from '@/Components/Site/Layout';
import { Send, User, Mail, Phone, MapPin, FileText, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function Ouvidoria(props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        assunto: '',
        departamento: '',
        tipo: '',
        mensagem: '',
        identificacao_tipo: 'sem_restricao', // sem_restricao, com_restricao, anonimo
        nome: '',
        documento: '',
        email: '',
        estado: '',
        cidade: '',
        cep: '',
        endereco: '',
        telefone1: '',
        telefone2: '',
    });

    // Máscaras
    const maskCPF = (value) => {
        return value.replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskPhone = (value) => {
        return value.replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const maskCEP = (value) => {
        return value.replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('site.ouvidoria.store'));
    };

    return (
        <Layout {...props} mainClassName="pt-32 pb-20" containerClassName="bg-gray-100">
            <Head title="Ouvidoria - Manifestação - Prefeitura" />

            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-blue-900 mb-2">Ouvidoria</h1>
                    <p className="text-gray-600 text-lg">Manifeste sua opinião, sugestão, elogio, reclamação ou denúncia.</p>
                </div>

                {props.flash.success ? (
                    <div className="bg-white border-t-8 border-green-500 rounded-2xl p-10 text-center shadow-xl animate-fade-in">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Manifestação Registrada!</h2>
                        <p className="text-gray-600 mb-8 text-lg">{props.flash.success}</p>
                        
                        {props.flash.protocolo && (
                            <div className="bg-gray-50 border border-dashed border-green-300 inline-block px-10 py-5 rounded-2xl mb-8">
                                <span className="text-sm text-green-600 block uppercase font-bold mb-2">Número do Protocolo</span>
                                <span className="text-4xl font-mono font-bold text-gray-800 tracking-widest">
                                    {props.flash.protocolo}
                                </span>
                            </div>
                        )}
                        
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => window.location.reload()}
                                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
                            >
                                Nova Manifestação
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Seção 1: Dados da Manifestação */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <FileText className="mr-2 text-blue-600" size={24} /> 
                                    Cadastrar <span className="font-normal ml-1">nova manifestação</span>
                                </h2>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">*Assunto:</label>
                                        <input 
                                            type="text" 
                                            value={data.assunto}
                                            onChange={e => setData('assunto', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none ${errors.assunto ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                        {errors.assunto && <span className="text-red-500 text-xs">{errors.assunto}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Departamento:</label>
                                        <select 
                                            value={data.departamento}
                                            onChange={e => setData('departamento', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700"
                                        >
                                            <option value="">- Nenhum departamento -</option>
                                            <option value="gabinete">Gabinete do Prefeito</option>
                                            <option value="admin">Secretaria da Administração</option>
                                            <option value="fazenda">Secretaria da Fazenda</option>
                                            <option value="saude">Secretaria da Saúde</option>
                                            <option value="educacao">Secretaria da Educação</option>
                                            <option value="obras">Secretaria de Obras</option>
                                            <option value="social">Secretaria de Assistência Social</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">*Tipo:</label>
                                        <select 
                                            value={data.tipo}
                                            onChange={e => setData('tipo', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium ${errors.tipo ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        >
                                            <option value="">- Selecione um tipo -</option>
                                            <option value="denuncia">Denúncia</option>
                                            <option value="elogio">Elogio</option>
                                            <option value="reclamacao">Reclamação</option>
                                            <option value="solicitacao">Solicitação</option>
                                            <option value="sugestao">Sugestão</option>
                                            <option value="outro">Outro</option>
                                            <option value="lgpd">Solicitação da LGPD</option>
                                        </select>
                                        {errors.tipo && <span className="text-red-500 text-xs">{errors.tipo}</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">*Mensagem:</label>
                                    <textarea 
                                        rows="6"
                                        value={data.mensagem}
                                        onChange={e => setData('mensagem', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none ${errors.mensagem ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    ></textarea>
                                    {errors.mensagem && <span className="text-red-500 text-xs">{errors.mensagem}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Identificação */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 text-center">
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Informar <span className="font-normal">o solicitante</span>
                                </h2>
                            </div>
                            <div className="p-8">
                                {/* Opções de Identificação */}
                                <div className="flex flex-col md:flex-row justify-center gap-10 mb-10">
                                    {[
                                        { id: 'sem_restricao', label: 'Desejo me identificar sem restrição', sub: '(Permito acesso aos meus dados pessoais)' },
                                        { id: 'com_restricao', label: 'Desejo me identificar com restrição', sub: '(Não permito acesso aos meus dados pessoais)' },
                                        { id: 'anonimo', label: 'Desejo o anonimato', sub: '' }
                                    ].map((opt) => (
                                        <label key={opt.id} className="flex flex-col items-center cursor-pointer group max-w-[220px] text-center">
                                            <div className="relative mb-3">
                                                <input 
                                                    type="radio" 
                                                    name="identificacao_tipo" 
                                                    value={opt.id}
                                                    checked={data.identificacao_tipo === opt.id}
                                                    onChange={e => setData('identificacao_tipo', e.target.value)}
                                                    className="hidden"
                                                />
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${data.identificacao_tipo === opt.id ? 'border-blue-600 bg-white' : 'border-gray-300 bg-white'}`}>
                                                    {data.identificacao_tipo === opt.id && <div className="w-4 h-4 rounded-full bg-blue-600 animate-scale-in"></div>}
                                                </div>
                                            </div>
                                            <span className={`text-sm font-bold mb-1 transition-colors ${data.identificacao_tipo === opt.id ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {opt.label}
                                            </span>
                                            {opt.sub && <span className="text-[10px] text-gray-400 leading-tight">{opt.sub}</span>}
                                        </label>
                                    ))}
                                </div>

                                {/* Avisos Condicionais */}
                                {data.identificacao_tipo === 'anonimo' && (
                                    <div className="bg-amber-100 border-l-4 border-amber-500 p-6 mb-8 animate-fade-in shadow-sm rounded-r-xl">
                                        <div className="flex flex-col items-center text-center">
                                            <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                                                <AlertTriangle size={20} /> Aviso
                                            </h4>
                                            <p className="text-amber-900 text-sm leading-relaxed max-w-3xl">
                                                As manifestações registradas de maneira anônima são consideradas <span className="font-bold">"Comunicações"</span> e <span className="text-red-600 font-bold underline">não é obrigatório sua resposta pela prefeitura</span>. 
                                                Caso deseje acompanhar o andamento da sua manifestação e receber uma resposta do órgão ou entidade, por favor identifique-se.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {data.identificacao_tipo === 'com_restricao' && (
                                    <div className="bg-amber-50 border border-amber-200 p-6 mb-8 animate-fade-in rounded-xl shadow-sm">
                                        <div className="flex flex-col items-center text-center">
                                            <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                                                <ShieldAlert size={20} /> Atenção!
                                            </h4>
                                            <p className="text-amber-900 text-sm leading-relaxed max-w-3xl">
                                                Por força da <span className="font-bold">Lei nº 12.527/11 (Lei de Acesso à Informação)</span>, os órgãos e entidades públicas devem proteger suas informações pessoais, restringindo o acesso a quaisquer dados relativos à intimidade, vida privada, honra e imagem, <span className="font-bold">exceto</span> nos casos em que é obrigada a divulgá-las por previsão em lei ou ordem judicial.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Campos de Identificação (Ocultos se Anonimo) */}
                                {data.identificacao_tipo !== 'anonimo' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                                        <div className="col-span-1">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Nome:</label>
                                            <input 
                                                type="text" 
                                                value={data.nome}
                                                onChange={e => setData('nome', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">CPF:</label>
                                            <input 
                                                type="text" 
                                                value={data.documento}
                                                onChange={e => setData('documento', maskCPF(e.target.value))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="000.000.000-00"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">E-mail:</label>
                                            <input 
                                                type="email" 
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="email@exemplo.com"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Estado:</label>
                                            <select 
                                                value={data.estado}
                                                onChange={e => setData('estado', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                                required
                                            >
                                                <option value="">- Selecione um estado -</option>
                                                <option value="SP">São Paulo</option>
                                                <option value="RJ">Rio de Janeiro</option>
                                                {/* Outros estados seriam carregados via API ou JSON */}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Cidade:</label>
                                            <select 
                                                value={data.cidade}
                                                onChange={e => setData('cidade', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                                required
                                            >
                                                <option value="">- Selecione uma cidade -</option>
                                                {/* Cidades dependentes do estado */}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">CEP:</label>
                                            <input 
                                                type="text" 
                                                value={data.cep}
                                                onChange={e => setData('cep', maskCEP(e.target.value))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="00000-000"
                                                required
                                            />
                                        </div>

                                        <div className="col-span-full">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Endereço:</label>
                                            <input 
                                                type="text" 
                                                value={data.endereco}
                                                onChange={e => setData('endereco', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Telefone 1:</label>
                                            <input 
                                                type="text" 
                                                value={data.telefone1}
                                                onChange={e => setData('telefone1', maskPhone(e.target.value))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="(00) 00000-0000"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Telefone 2:</label>
                                            <input 
                                                type="text" 
                                                value={data.telefone2}
                                                onChange={e => setData('telefone2', maskPhone(e.target.value))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-8 border-t border-gray-100 flex justify-center bg-gray-50">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full md:w-64 bg-green-600 text-white px-10 py-3 rounded-md font-bold hover:bg-green-700 transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processing ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </Layout>
    );
}
