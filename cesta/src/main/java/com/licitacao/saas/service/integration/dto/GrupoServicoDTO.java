package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GrupoServicoDTO {
    @JsonProperty("codigoGrupo")
    private Integer codigoGrupo;
    @JsonProperty("nomeGrupo")
    private String nomeGrupo;

    public Integer getCodigoGrupo() { return codigoGrupo; }
    public void setCodigoGrupo(Integer codigoGrupo) { this.codigoGrupo = codigoGrupo; }
    public String getNomeGrupo() { return nomeGrupo; }
    public void setNomeGrupo(String nomeGrupo) { this.nomeGrupo = nomeGrupo; }
}
