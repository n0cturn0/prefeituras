package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ClasseServicoResponseDTO {
    @JsonProperty("resultado")
    private List<ClasseServicoDTO> resultado;

    public List<ClasseServicoDTO> getResultado() { return resultado; }
    public void setResultado(List<ClasseServicoDTO> resultado) { this.resultado = resultado; }
}
