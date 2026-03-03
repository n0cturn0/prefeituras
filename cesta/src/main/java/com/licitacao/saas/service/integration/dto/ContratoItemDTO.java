package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ContratoItemDTO {
    @JsonProperty("numeroContrato")
    private String numeroContrato;
    @JsonProperty("codigoUnidadeGestora")
    private String codigoUnidadeGestora;
    @JsonProperty("nomeUnidadeGestora")
    private String nomeUnidadeGestora;
    @JsonProperty("dataVigenciaInicial")
    private String dataVigenciaInicial;
    @JsonProperty("dataVigenciaFinal")
    private String dataVigenciaFinal;
    @JsonProperty("codigoItem")
    private Integer codigoItem;
    @JsonProperty("descricaoIitem") // Note: double 'i' in user example "descricaoIitem"
    private String descricaoItem;
    @JsonProperty("quantidadeItem")
    private Integer quantidadeItem;
    @JsonProperty("valorUnitarioItem")
    private Double valorUnitarioItem;
    @JsonProperty("nomeRazaoSocialFornecedor")
    private String nomeRazaoSocialFornecedor;
    @JsonProperty("niFornecedor")
    private String niFornecedor;
    @JsonProperty("numeroControlePncpContrato")
    private String numeroControlePncpContrato;
    @JsonProperty("objeto")
    private String objeto; // Often in header, sometimes in enriched item view

    public String getNumeroContrato() { return numeroContrato; }
    public void setNumeroContrato(String numeroContrato) { this.numeroContrato = numeroContrato; }
    public String getCodigoUnidadeGestora() { return codigoUnidadeGestora; }
    public void setCodigoUnidadeGestora(String codigoUnidadeGestora) { this.codigoUnidadeGestora = codigoUnidadeGestora; }
    public String getNomeUnidadeGestora() { return nomeUnidadeGestora; }
    public void setNomeUnidadeGestora(String nomeUnidadeGestora) { this.nomeUnidadeGestora = nomeUnidadeGestora; }
    public String getDataVigenciaInicial() { return dataVigenciaInicial; }
    public void setDataVigenciaInicial(String dataVigenciaInicial) { this.dataVigenciaInicial = dataVigenciaInicial; }
    public String getDataVigenciaFinal() { return dataVigenciaFinal; }
    public void setDataVigenciaFinal(String dataVigenciaFinal) { this.dataVigenciaFinal = dataVigenciaFinal; }
    public Integer getCodigoItem() { return codigoItem; }
    public void setCodigoItem(Integer codigoItem) { this.codigoItem = codigoItem; }
    public String getDescricaoItem() { return descricaoItem; }
    public void setDescricaoItem(String descricaoItem) { this.descricaoItem = descricaoItem; }
    public Integer getQuantidadeItem() { return quantidadeItem; }
    public void setQuantidadeItem(Integer quantidadeItem) { this.quantidadeItem = quantidadeItem; }
    public Double getValorUnitarioItem() { return valorUnitarioItem; }
    public void setValorUnitarioItem(Double valorUnitarioItem) { this.valorUnitarioItem = valorUnitarioItem; }
    public String getNomeRazaoSocialFornecedor() { return nomeRazaoSocialFornecedor; }
    public void setNomeRazaoSocialFornecedor(String nomeRazaoSocialFornecedor) { this.nomeRazaoSocialFornecedor = nomeRazaoSocialFornecedor; }
    public String getNiFornecedor() { return niFornecedor; }
    public void setNiFornecedor(String niFornecedor) { this.niFornecedor = niFornecedor; }
    public String getNumeroControlePncpContrato() { return numeroControlePncpContrato; }
    public void setNumeroControlePncpContrato(String numeroControlePncpContrato) { this.numeroControlePncpContrato = numeroControlePncpContrato; }
    public String getObjeto() { return objeto; }
    public void setObjeto(String objeto) { this.objeto = objeto; }
}
