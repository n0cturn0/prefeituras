package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpResultadoItemResponseDTO {
    @JsonProperty("resultado")
    private List<PncpResultadoItemDTO> resultado;

    public List<PncpResultadoItemDTO> getResultado() { return resultado; }
    public void setResultado(List<PncpResultadoItemDTO> resultado) { this.resultado = resultado; }
}
