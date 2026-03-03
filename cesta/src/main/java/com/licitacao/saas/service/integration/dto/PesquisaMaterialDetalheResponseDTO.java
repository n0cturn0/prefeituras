package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PesquisaMaterialDetalheResponseDTO {
    @JsonProperty("resultado")
    private PesquisaMaterialDetalheDTO resultado;

    public PesquisaMaterialDetalheDTO getResultado() { return resultado; }
    public void setResultado(PesquisaMaterialDetalheDTO resultado) { this.resultado = resultado; }
}
