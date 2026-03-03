package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ArpUnidadeItemResponseDTO {
    @JsonProperty("resultado")
    private List<ArpUnidadeItemDTO> resultado;

    public List<ArpUnidadeItemDTO> getResultado() { return resultado; }
    public void setResultado(List<ArpUnidadeItemDTO> resultado) { this.resultado = resultado; }
}
