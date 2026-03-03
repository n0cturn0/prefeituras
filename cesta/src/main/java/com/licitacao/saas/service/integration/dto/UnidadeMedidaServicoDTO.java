package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UnidadeMedidaServicoDTO {
    @JsonProperty("codigoUnidadeMedida")
    private String codigoUnidadeMedida;
    @JsonProperty("nomeUnidadeMedida")
    private String nomeUnidadeMedida;

    public String getCodigoUnidadeMedida() { return codigoUnidadeMedida; }
    public void setCodigoUnidadeMedida(String codigoUnidadeMedida) { this.codigoUnidadeMedida = codigoUnidadeMedida; }
    public String getNomeUnidadeMedida() { return nomeUnidadeMedida; }
    public void setNomeUnidadeMedida(String nomeUnidadeMedida) { this.nomeUnidadeMedida = nomeUnidadeMedida; }
}
