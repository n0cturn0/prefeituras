package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UnidadeFornecimentoDTO {
    @JsonProperty("codigoUnidade")
    private String codigoUnidade;
    @JsonProperty("nomeUnidade")
    private String nomeUnidade;

    public String getCodigoUnidade() { return codigoUnidade; }
    public void setCodigoUnidade(String codigoUnidade) { this.codigoUnidade = codigoUnidade; }
    public String getNomeUnidade() { return nomeUnidade; }
    public void setNomeUnidade(String nomeUnidade) { this.nomeUnidade = nomeUnidade; }
}
