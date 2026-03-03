package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ArpItemDTO {
    @JsonProperty("numeroAtaRegistroPreco")
    private String numeroAtaRegistroPreco;
    @JsonProperty("codigoUnidadeGerenciadora")
    private String codigoUnidadeGerenciadora;
    @JsonProperty("dataVigenciaFinal")
    private String dataVigenciaFinal;
    @JsonProperty("numeroItem")
    private Integer numeroItem;
    @JsonProperty("codigoItem")
    private Integer codigoItem;
    @JsonProperty("descricaoItem")
    private String descricaoItem;
    
    @JsonProperty("nomeRazaoSocialFornecedor")
    private String nomeRazaoSocialFornecedor;
    @JsonProperty("niFornecedor")
    private String niFornecedor;
    
    @JsonProperty("valorUnitario")
    private Double valorUnitario;
    
    @JsonProperty("quantidadeHomologadaItem")
    private Integer quantidadeHomologadaItem;
    
    @JsonProperty("nomeUnidadeGerenciadora")
    private String nomeUnidadeGerenciadora;
    
    @JsonProperty("numeroControlePncpAta")
    private String numeroControlePncpAta;
    
    // Custom/Augmented fields
    private boolean aceitaAdesao;
    private String linkAtaPNCP;

    public String getNumeroAtaRegistroPreco() { return numeroAtaRegistroPreco; }
    public void setNumeroAtaRegistroPreco(String numeroAtaRegistroPreco) { this.numeroAtaRegistroPreco = numeroAtaRegistroPreco; }
    public String getCodigoUnidadeGerenciadora() { return codigoUnidadeGerenciadora; }
    public void setCodigoUnidadeGerenciadora(String codigoUnidadeGerenciadora) { this.codigoUnidadeGerenciadora = codigoUnidadeGerenciadora; }
    public String getDataVigenciaFinal() { return dataVigenciaFinal; }
    public void setDataVigenciaFinal(String dataVigenciaFinal) { this.dataVigenciaFinal = dataVigenciaFinal; }
    public Integer getNumeroItem() { return numeroItem; }
    public void setNumeroItem(Integer numeroItem) { this.numeroItem = numeroItem; }
    public Integer getCodigoItem() { return codigoItem; }
    public void setCodigoItem(Integer codigoItem) { this.codigoItem = codigoItem; }
    public String getDescricaoItem() { return descricaoItem; }
    public void setDescricaoItem(String descricaoItem) { this.descricaoItem = descricaoItem; }
    public String getNomeRazaoSocialFornecedor() { return nomeRazaoSocialFornecedor; }
    public void setNomeRazaoSocialFornecedor(String nomeRazaoSocialFornecedor) { this.nomeRazaoSocialFornecedor = nomeRazaoSocialFornecedor; }
    public String getNiFornecedor() { return niFornecedor; }
    public void setNiFornecedor(String niFornecedor) { this.niFornecedor = niFornecedor; }
    public Double getValorUnitario() { return valorUnitario; }
    public void setValorUnitario(Double valorUnitario) { this.valorUnitario = valorUnitario; }
    public Integer getQuantidadeHomologadaItem() { return quantidadeHomologadaItem; }
    public void setQuantidadeHomologadaItem(Integer quantidadeHomologadaItem) { this.quantidadeHomologadaItem = quantidadeHomologadaItem; }
    public String getNomeUnidadeGerenciadora() { return nomeUnidadeGerenciadora; }
    public void setNomeUnidadeGerenciadora(String nomeUnidadeGerenciadora) { this.nomeUnidadeGerenciadora = nomeUnidadeGerenciadora; }
    public String getNumeroControlePncpAta() { return numeroControlePncpAta; }
    public void setNumeroControlePncpAta(String numeroControlePncpAta) { this.numeroControlePncpAta = numeroControlePncpAta; }
    
    public boolean isAceitaAdesao() { return aceitaAdesao; }
    public void setAceitaAdesao(boolean aceitaAdesao) { this.aceitaAdesao = aceitaAdesao; }
    public String getLinkAtaPNCP() { return linkAtaPNCP; }
    public void setLinkAtaPNCP(String linkAtaPNCP) { this.linkAtaPNCP = linkAtaPNCP; }
}
