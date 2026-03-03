package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CaracteristicaMaterialDTO {
    @JsonProperty("codigoCaracteristica")
    private Integer codigoCaracteristica;
    @JsonProperty("descricaoCaracteristica")
    private String descricaoCaracteristica;

    public Integer getCodigoCaracteristica() { return codigoCaracteristica; }
    public void setCodigoCaracteristica(Integer codigoCaracteristica) { this.codigoCaracteristica = codigoCaracteristica; }
    public String getDescricaoCaracteristica() { return descricaoCaracteristica; }
    public void setDescricaoCaracteristica(String descricaoCaracteristica) { this.descricaoCaracteristica = descricaoCaracteristica; }
}
