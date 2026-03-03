package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ArpHeaderResponseDTO {
    @JsonProperty("resultado")
    private List<ArpHeaderDTO> resultado;

    public List<ArpHeaderDTO> getResultado() { return resultado; }
    public void setResultado(List<ArpHeaderDTO> resultado) { this.resultado = resultado; }
}
