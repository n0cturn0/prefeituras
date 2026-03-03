package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ClasseMaterialResponseDTO {
    @JsonProperty("resultado")
    private List<ClasseMaterialDTO> resultado;

    public List<ClasseMaterialDTO> getResultado() { return resultado; }
    public void setResultado(List<ClasseMaterialDTO> resultado) { this.resultado = resultado; }
}
