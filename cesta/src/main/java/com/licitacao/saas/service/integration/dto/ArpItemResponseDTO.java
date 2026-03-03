package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ArpItemResponseDTO {
    @JsonProperty("resultado")
    private List<ArpItemDTO> resultado;

    public List<ArpItemDTO> getResultado() { return resultado; }
    public void setResultado(List<ArpItemDTO> resultado) { this.resultado = resultado; }
}
