package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpContratacaoResponseDTO {
    @JsonProperty("resultado")
    private PncpContratacaoDTO resultado;

    public PncpContratacaoDTO getResultado() { return resultado; }
    public void setResultado(PncpContratacaoDTO resultado) { this.resultado = resultado; }
}
