package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CompraResponseDTO {

    @JsonProperty("_embedded")
    private Embedded embedded;

    public Embedded getEmbedded() {
        return embedded;
    }

    public void setEmbedded(Embedded embedded) {
        this.embedded = embedded;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Embedded {
        @JsonProperty("compras")
        private List<ItemCompraDTO> compras;

        public List<ItemCompraDTO> getCompras() {
            return compras;
        }

        public void setCompras(List<ItemCompraDTO> compras) {
            this.compras = compras;
        }
    }
}
