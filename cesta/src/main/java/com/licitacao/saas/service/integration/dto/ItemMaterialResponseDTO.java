package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ItemMaterialResponseDTO {
    @JsonProperty("resultado")
    private List<ItemMaterialDTO> resultado;

    public List<ItemMaterialDTO> getResultado() {
        return resultado;
    }

    public void setResultado(List<ItemMaterialDTO> resultado) {
        this.resultado = resultado;
    }
}
