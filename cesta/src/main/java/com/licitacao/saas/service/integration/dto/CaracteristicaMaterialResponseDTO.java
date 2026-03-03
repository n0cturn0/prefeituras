package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CaracteristicaMaterialResponseDTO {
    @JsonProperty("resultado")
    private List<CaracteristicaMaterialDTO> resultado;

    public List<CaracteristicaMaterialDTO> getResultado() {
        return resultado;
    }

    public void setResultado(List<CaracteristicaMaterialDTO> resultado) {
        this.resultado = resultado;
    }
}
