package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ClasseServicoDTO {
    @JsonProperty("codigoClasse")
    private Integer codigoClasse;
    @JsonProperty("nomeClasse")
    private String nomeClasse;

    public Integer getCodigoClasse() { return codigoClasse; }
    public void setCodigoClasse(Integer codigoClasse) { this.codigoClasse = codigoClasse; }
    public String getNomeClasse() { return nomeClasse; }
    public void setNomeClasse(String nomeClasse) { this.nomeClasse = nomeClasse; }
}
