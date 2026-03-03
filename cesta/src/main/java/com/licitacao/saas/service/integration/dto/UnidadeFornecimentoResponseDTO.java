package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UnidadeFornecimentoResponseDTO {
    @JsonProperty("resultado")
    private List<UnidadeFornecimentoDTO> resultado;

    public List<UnidadeFornecimentoDTO> getResultado() {
        return resultado;
    }

    public void setResultado(List<UnidadeFornecimentoDTO> resultado) {
        this.resultado = resultado;
    }
}
