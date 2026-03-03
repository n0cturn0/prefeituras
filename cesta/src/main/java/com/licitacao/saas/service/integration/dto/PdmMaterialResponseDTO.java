package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PdmMaterialResponseDTO {
    @JsonProperty("resultado")
    private List<PdmMaterialDTO> resultado;

    public List<PdmMaterialDTO> getResultado() { return resultado; }
    public void setResultado(List<PdmMaterialDTO> resultado) { this.resultado = resultado; }
}
