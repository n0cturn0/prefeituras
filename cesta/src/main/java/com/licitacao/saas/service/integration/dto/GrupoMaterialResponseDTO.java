package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GrupoMaterialResponseDTO {
    @JsonProperty("resultado")
    private List<GrupoMaterialDTO> resultado;

    public List<GrupoMaterialDTO> getResultado() { return resultado; }
    public void setResultado(List<GrupoMaterialDTO> resultado) { this.resultado = resultado; }
}
