package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UnidadeMedidaServicoResponseDTO {
    @JsonProperty("resultado")
    private List<UnidadeMedidaServicoDTO> resultado;

    public List<UnidadeMedidaServicoDTO> getResultado() { return resultado; }
    public void setResultado(List<UnidadeMedidaServicoDTO> resultado) { this.resultado = resultado; }
}
