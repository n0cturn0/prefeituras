package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GrupoServicoResponseDTO {
    @JsonProperty("resultado")
    private List<GrupoServicoDTO> resultado;

    public List<GrupoServicoDTO> getResultado() { return resultado; }
    public void setResultado(List<GrupoServicoDTO> resultado) { this.resultado = resultado; }
}
