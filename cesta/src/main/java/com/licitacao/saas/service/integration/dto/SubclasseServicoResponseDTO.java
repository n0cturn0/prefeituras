package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SubclasseServicoResponseDTO {
    @JsonProperty("resultado")
    private List<SubclasseServicoDTO> resultado;

    public List<SubclasseServicoDTO> getResultado() { return resultado; }
    public void setResultado(List<SubclasseServicoDTO> resultado) { this.resultado = resultado; }
}
