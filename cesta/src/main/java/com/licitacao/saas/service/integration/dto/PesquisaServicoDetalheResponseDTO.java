package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PesquisaServicoDetalheResponseDTO {
    @JsonProperty("resultado")
    private PesquisaServicoDetalheDTO resultado;

    public PesquisaServicoDetalheDTO getResultado() { return resultado; }
    public void setResultado(PesquisaServicoDetalheDTO resultado) { this.resultado = resultado; }
}
