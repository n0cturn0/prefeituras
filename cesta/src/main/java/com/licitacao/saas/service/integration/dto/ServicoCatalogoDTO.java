package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ServicoCatalogoDTO {
    @JsonProperty("codigoServico")
    private Integer codigoServico;
    
    @JsonProperty("nomeServico")
    private String nomeServico;
    
    @JsonProperty("exclusivoCentralCompras")
    private Boolean exclusivoCentralCompras;

    public Integer getCodigoServico() { return codigoServico; }
    public void setCodigoServico(Integer codigoServico) { this.codigoServico = codigoServico; }
    public String getNomeServico() { return nomeServico; }
    public void setNomeServico(String nomeServico) { this.nomeServico = nomeServico; }
    public Boolean getExclusivoCentralCompras() { return exclusivoCentralCompras; }
    public void setExclusivoCentralCompras(Boolean exclusivoCentralCompras) { this.exclusivoCentralCompras = exclusivoCentralCompras; }
}
