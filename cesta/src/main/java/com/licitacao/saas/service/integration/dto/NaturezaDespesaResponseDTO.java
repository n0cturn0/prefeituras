package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NaturezaDespesaResponseDTO {
    @JsonProperty("resultado")
    private List<NaturezaDespesaDTO> resultado;

    public List<NaturezaDespesaDTO> getResultado() {
        return resultado;
    }

    public void setResultado(List<NaturezaDespesaDTO> resultado) {
        this.resultado = resultado;
    }
}
