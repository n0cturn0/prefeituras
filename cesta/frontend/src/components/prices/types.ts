export interface PesquisaMaterialDTO {
    idItemCompra: number;
    idCompra: number;
    dataCompra: string;
    precoUnitario: number;
    quantidade: number;
    unidade: string;
    municipio: string;
    uf: string;
    uasg: number;
    nomeUasg: string;
    nomeFornecedor: string;
    marca: string;
    numeroControlePNCP?: string;
    origem?: string; // "PNCP" | "COMPRAS_GOV" | "ARP"
    
    // ARP
    dataVigenciaFinal?: string;
    aceitaAdesao?: boolean;
    linkAtaPNCP?: string;
    
    // Contracts
    dataVigenciaInicial?: string;
    niFornecedor?: string;
    
    // Supplier Enrichment
    porteEmpresa?: string;
    habilitadoLicitar?: boolean;
    fornecedorAtivo?: boolean;
    ufFornecedor?: string;
    municipioFornecedor?: string;
    
    // PNCP Extensions
    descricaoItem?: string;
    cancelado?: boolean;
    cnpjOrgao?: string;
    recebimentoProposta?: boolean;

    // BPS Extensions
    codigoCatmat?: string;
    descricaoCatmat?: string;
    modalidade?: string;
    cnpjComprador?: string;
    nomeInstituicao?: string;
    valorTotalCompra?: string;
    valorItemCompra?: string;
    quantidadeItemCompra?: string;
}

export interface PesquisaMaterialResponseDTO {
    resultado: PesquisaMaterialDTO[];
    totalRegistros: number;
}

export interface PesquisaMaterialDetalheDTO {
    descricaoDetalhadaItem: string;
    objetoCompra: string;
}

export interface PesquisaServicoDTO {
    idItemCompra: number;
    idCompra: number;
    dataCompra: string;
    precoUnitario: number;
    quantidade: number;
    unidade: string;
    municipio: string;
    uf: string;
    uasg: number;
    nomeUasg: string;
    nomeFornecedor: string;
    niFornecedor?: string;
    marca?: string;
    numeroControlePNCP?: string;
    origem?: string;
    descricaoItem?: string;
    cnpjOrgao?: string;
    linkAtaPNCP?: string;
    recebimentoProposta?: boolean;
}

export interface PesquisaServicoResponseDTO {
    resultado: PesquisaServicoDTO[];
    totalRegistros: number;
}

export interface PesquisaServicoDetalheDTO {
    descricaoDetalhadaServico: string;
    objetoCompra: string;
}
