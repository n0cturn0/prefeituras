package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PesquisaServicoDetalheDTO {
    @JsonProperty("descricaoDetalhadaServico")
    private String descricaoDetalhadaServico;
    @JsonProperty("objetoCompra")
    private String objetoCompra;
    
    public String getDescricaoDetalhadaServico() { return descricaoDetalhadaServico; }
    public void setDescricaoDetalhadaServico(String descricaoDetalhadaServico) { this.descricaoDetalhadaServico = descricaoDetalhadaServico; }
    public String getObjetoCompra() { return objetoCompra; }
    public void setObjetoCompra(String objetoCompra) { this.objetoCompra = objetoCompra; }
}
