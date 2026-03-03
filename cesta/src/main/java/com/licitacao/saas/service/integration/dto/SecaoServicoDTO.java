package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SecaoServicoDTO {
    @JsonProperty("codigoSecao")
    private Integer codigoSecao;
    @JsonProperty("nomeSecao")
    private String nomeSecao;

    public Integer getCodigoSecao() { return codigoSecao; }
    public void setCodigoSecao(Integer codigoSecao) { this.codigoSecao = codigoSecao; }
    public String getNomeSecao() { return nomeSecao; }
    public void setNomeSecao(String nomeSecao) { this.nomeSecao = nomeSecao; }
}
