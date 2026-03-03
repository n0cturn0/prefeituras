package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PesquisaMaterialDetalheDTO {
    @JsonProperty("descricaoDetalhadaItem")
    private String descricaoDetalhadaItem;
    @JsonProperty("objetoCompra")
    private String objetoCompra;
    // Add other relevant detail fields if needed, simplified for now based on requirements

    public String getDescricaoDetalhadaItem() { return descricaoDetalhadaItem; }
    public void setDescricaoDetalhadaItem(String descricaoDetalhadaItem) { this.descricaoDetalhadaItem = descricaoDetalhadaItem; }
    public String getObjetoCompra() { return objetoCompra; }
    public void setObjetoCompra(String objetoCompra) { this.objetoCompra = objetoCompra; }
}
