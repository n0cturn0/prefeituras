package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DivisaoServicoDTO {
    @JsonProperty("codigoDivisao")
    private Integer codigoDivisao;
    @JsonProperty("nomeDivisao")
    private String nomeDivisao;

    public Integer getCodigoDivisao() { return codigoDivisao; }
    public void setCodigoDivisao(Integer codigoDivisao) { this.codigoDivisao = codigoDivisao; }
    public String getNomeDivisao() { return nomeDivisao; }
    public void setNomeDivisao(String nomeDivisao) { this.nomeDivisao = nomeDivisao; }
}
