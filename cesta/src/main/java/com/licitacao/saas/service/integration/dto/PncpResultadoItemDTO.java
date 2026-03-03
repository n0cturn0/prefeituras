package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpResultadoItemDTO {
    @JsonProperty("valorUnitarioHomologado")
    private Double valorUnitarioHomologado;
    @JsonProperty("quantidadeHomologada")
    private Integer quantidadeHomologada;
    @JsonProperty("marcaNome")
    private String marcaNome;
    @JsonProperty("nomeRazaoSocialFornecedor")
    private String nomeRazaoSocialFornecedor;
    @JsonProperty("niFornecedor")
    private String niFornecedor; // CPF/CNPJ
    @JsonProperty("dataResultado")
    private String dataResultado;

    public Double getValorUnitarioHomologado() { return valorUnitarioHomologado; }
    public void setValorUnitarioHomologado(Double valorUnitarioHomologado) { this.valorUnitarioHomologado = valorUnitarioHomologado; }
    public Integer getQuantidadeHomologada() { return quantidadeHomologada; }
    public void setQuantidadeHomologada(Integer quantidadeHomologada) { this.quantidadeHomologada = quantidadeHomologada; }
    public String getMarcaNome() { return marcaNome; }
    public void setMarcaNome(String marcaNome) { this.marcaNome = marcaNome; }
    public String getNomeRazaoSocialFornecedor() { return nomeRazaoSocialFornecedor; }
    public void setNomeRazaoSocialFornecedor(String nomeRazaoSocialFornecedor) { this.nomeRazaoSocialFornecedor = nomeRazaoSocialFornecedor; }
    public String getNiFornecedor() { return niFornecedor; }
    public void setNiFornecedor(String niFornecedor) { this.niFornecedor = niFornecedor; }
    public String getDataResultado() { return dataResultado; }
    public void setDataResultado(String dataResultado) { this.dataResultado = dataResultado; }
}
