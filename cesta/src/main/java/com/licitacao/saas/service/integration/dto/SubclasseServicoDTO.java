package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SubclasseServicoDTO {
    @JsonProperty("codigoSubclasse")
    private Integer codigoSubclasse;
    @JsonProperty("nomeSubclasse")
    private String nomeSubclasse;

    public Integer getCodigoSubclasse() { return codigoSubclasse; }
    public void setCodigoSubclasse(Integer codigoSubclasse) { this.codigoSubclasse = codigoSubclasse; }
    public String getNomeSubclasse() { return nomeSubclasse; }
    public void setNomeSubclasse(String nomeSubclasse) { this.nomeSubclasse = nomeSubclasse; }
}
