package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ArpUnidadeItemDTO {
    @JsonProperty("aceitaAdesao")
    private boolean aceitaAdesao;

    public boolean isAceitaAdesao() { return aceitaAdesao; }
    public void setAceitaAdesao(boolean aceitaAdesao) { this.aceitaAdesao = aceitaAdesao; }
}
