package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ContratoItemResponseDTO {
    @JsonProperty("resultado")
    private List<ContratoItemDTO> resultado;

    public List<ContratoItemDTO> getResultado() { return resultado; }
    public void setResultado(List<ContratoItemDTO> resultado) { this.resultado = resultado; }
}
