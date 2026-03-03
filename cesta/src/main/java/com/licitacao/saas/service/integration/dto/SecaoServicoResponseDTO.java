package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SecaoServicoResponseDTO {
    @JsonProperty("resultado")
    private List<SecaoServicoDTO> resultado;

    public List<SecaoServicoDTO> getResultado() { return resultado; }
    public void setResultado(List<SecaoServicoDTO> resultado) { this.resultado = resultado; }
}
