package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PesquisaMaterialDTO {
    @JsonProperty("idItemCompra")
    private Long idItemCompra;
    @JsonProperty("idCompra")
    private Long idCompra;
    @JsonProperty("dataCompra")
    private String dataCompra; // Format: YYYY-MM-DD
    @JsonProperty("precoUnitario")
    private Double precoUnitario;
    @JsonProperty("quantidade")
    private Integer quantidade;
    @JsonProperty("unidade")
    private String unidade;
    @JsonProperty("municipio")
    private String municipio;
    @JsonProperty("uf")
    private String uf;
    @JsonProperty("uasg")
    private Integer uasg;
    @JsonProperty("nomeUasg")
    private String nomeUasg;
    @JsonProperty("nomeFornecedor")
    private String nomeFornecedor;
    @JsonProperty("marca")
    private String marca;
    
    // PNCP Specific
    @JsonProperty("numeroControlePNCP")
    private String numeroControlePNCP;
    @JsonProperty("origem")
    private String origem; // "COMPRAS_GOV", "PNCP", "ARP"
    
    // ARP Specific
    @JsonProperty("dataVigenciaFinal")
    private String dataVigenciaFinal;
    @JsonProperty("aceitaAdesao")
    private Boolean aceitaAdesao;
    @JsonProperty("linkAtaPNCP")
    private String linkAtaPNCP;
    
    // Contracts Specific
    @JsonProperty("dataVigenciaInicial")
    private String dataVigenciaInicial;
    @JsonProperty("niFornecedor")
    private String niFornecedor;
    
    // Supplier Enrichment
    @JsonProperty("porteEmpresa")
    private String porteEmpresa;
    @JsonProperty("habilitadoLicitar")
    private Boolean habilitadoLicitar;
    @JsonProperty("fornecedorAtivo")
    private Boolean fornecedorAtivo;
    @JsonProperty("ufFornecedor")
    private String ufFornecedor;
    @JsonProperty("municipioFornecedor")
    private String municipioFornecedor;

    public Long getIdItemCompra() { return idItemCompra; }
    public void setIdItemCompra(Long idItemCompra) { this.idItemCompra = idItemCompra; }
    public Long getIdCompra() { return idCompra; }
    public void setIdCompra(Long idCompra) { this.idCompra = idCompra; }
    public String getDataCompra() { return dataCompra; }
    public void setDataCompra(String dataCompra) { this.dataCompra = dataCompra; }
    public Double getPrecoUnitario() { return precoUnitario; }
    public void setPrecoUnitario(Double precoUnitario) { this.precoUnitario = precoUnitario; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }
    public String getMunicipio() { return municipio; }
    public void setMunicipio(String municipio) { this.municipio = municipio; }
    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }
    public Integer getUasg() { return uasg; }
    public void setUasg(Integer uasg) { this.uasg = uasg; }
    public String getNomeUasg() { return nomeUasg; }
    public void setNomeUasg(String nomeUasg) { this.nomeUasg = nomeUasg; }
    public String getNomeFornecedor() { return nomeFornecedor; }
    public void setNomeFornecedor(String nomeFornecedor) { this.nomeFornecedor = nomeFornecedor; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    
    public String getNumeroControlePNCP() { return numeroControlePNCP; }
    public void setNumeroControlePNCP(String numeroControlePNCP) { this.numeroControlePNCP = numeroControlePNCP; }
    public String getOrigem() { return origem; }
    public void setOrigem(String origem) { this.origem = origem; }
    
    public String getDataVigenciaFinal() { return dataVigenciaFinal; }
    public void setDataVigenciaFinal(String dataVigenciaFinal) { this.dataVigenciaFinal = dataVigenciaFinal; }
    public Boolean getAceitaAdesao() { return aceitaAdesao; }
    public void setAceitaAdesao(Boolean aceitaAdesao) { this.aceitaAdesao = aceitaAdesao; }
    public String getLinkAtaPNCP() { return linkAtaPNCP; }
    public void setLinkAtaPNCP(String linkAtaPNCP) { this.linkAtaPNCP = linkAtaPNCP; }
    
    public String getDataVigenciaInicial() { return dataVigenciaInicial; }
    public void setDataVigenciaInicial(String dataVigenciaInicial) { this.dataVigenciaInicial = dataVigenciaInicial; }
    public String getNiFornecedor() { return niFornecedor; }
    public void setNiFornecedor(String niFornecedor) { this.niFornecedor = niFornecedor; }
    
    public String getPorteEmpresa() { return porteEmpresa; }
    public void setPorteEmpresa(String porteEmpresa) { this.porteEmpresa = porteEmpresa; }
    public Boolean getHabilitadoLicitar() { return habilitadoLicitar; }
    public void setHabilitadoLicitar(Boolean habilitadoLicitar) { this.habilitadoLicitar = habilitadoLicitar; }
    public Boolean getFornecedorAtivo() { return fornecedorAtivo; }
    public void setFornecedorAtivo(Boolean fornecedorAtivo) { this.fornecedorAtivo = fornecedorAtivo; }
    public String getUfFornecedor() { return ufFornecedor; }
    public void setUfFornecedor(String ufFornecedor) { this.ufFornecedor = ufFornecedor; }
    public String getMunicipioFornecedor() { return municipioFornecedor; }
    public void setMunicipioFornecedor(String municipioFornecedor) { this.municipioFornecedor = municipioFornecedor; }

    // New Fields for Orchestrator/PNCP
    @JsonProperty("descricaoItem")
    private String descricaoItem;
    @JsonProperty("cancelado")
    private Boolean cancelado;

    public String getDescricaoItem() { return descricaoItem; }
    public void setDescricaoItem(String descricaoItem) { this.descricaoItem = descricaoItem; }
    public Boolean getCancelado() { return cancelado; }
    public void setCancelado(Boolean cancelado) { this.cancelado = cancelado; }

    @JsonProperty("cnpjOrgao")
    private String cnpjOrgao;
    public String getCnpjOrgao() { return cnpjOrgao; }
    public void setCnpjOrgao(String cnpjOrgao) { this.cnpjOrgao = cnpjOrgao; }

    // BPS Specific Fields
    @JsonProperty("codigoCatmat")
    private String codigoCatmat;
    @JsonProperty("descricaoCatmat")
    private String descricaoCatmat;
    @JsonProperty("modalidade")
    private String modalidade;
    @JsonProperty("cnpjComprador")
    private String cnpjComprador;
    @JsonProperty("nomeInstituicao")
    private String nomeInstituicao;
    @JsonProperty("valorTotalCompra")
    private String valorTotalCompra;
    @JsonProperty("valorItemCompra")
    private String valorItemCompra; 
    @JsonProperty("quantidadeItemCompra")
    private String quantidadeItemCompra;

    public String getCodigoCatmat() { return codigoCatmat; }
    public void setCodigoCatmat(String codigoCatmat) { this.codigoCatmat = codigoCatmat; }
    public String getDescricaoCatmat() { return descricaoCatmat; }
    public void setDescricaoCatmat(String descricaoCatmat) { this.descricaoCatmat = descricaoCatmat; }
    public String getModalidade() { return modalidade; }
    public void setModalidade(String modalidade) { this.modalidade = modalidade; }
    public String getCnpjComprador() { return cnpjComprador; }
    public void setCnpjComprador(String cnpjComprador) { this.cnpjComprador = cnpjComprador; }
    public String getNomeInstituicao() { return nomeInstituicao; }
    public void setNomeInstituicao(String nomeInstituicao) { this.nomeInstituicao = nomeInstituicao; }
    public String getValorTotalCompra() { return valorTotalCompra; }
    public void setValorTotalCompra(String valorTotalCompra) { this.valorTotalCompra = valorTotalCompra; }
    public String getValorItemCompra() { return valorItemCompra; }
    public void setValorItemCompra(String valorItemCompra) { this.valorItemCompra = valorItemCompra; }
    public String getQuantidadeItemCompra() { return quantidadeItemCompra; }
    public void setQuantidadeItemCompra(String quantidadeItemCompra) { this.quantidadeItemCompra = quantidadeItemCompra; }

    @JsonProperty("codigoItemCatalogo")
    private String codigoItemCatalogo;
    public String getCodigoItemCatalogo() { return codigoItemCatalogo; }
    public void setCodigoItemCatalogo(String codigoItemCatalogo) { this.codigoItemCatalogo = codigoItemCatalogo; }
}
