package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NaturezaDespesaServicoDTO {
    @JsonProperty("codigoNaturezaDespesa")
    private Integer codigoNaturezaDespesa;
    @JsonProperty("descricaoNaturezaDespesa")
    private String descricaoNaturezaDespesa;

    public Integer getCodigoNaturezaDespesa() { return codigoNaturezaDespesa; }
    public void setCodigoNaturezaDespesa(Integer codigoNaturezaDespesa) { this.codigoNaturezaDespesa = codigoNaturezaDespesa; }
    public String getDescricaoNaturezaDespesa() { return descricaoNaturezaDespesa; }
    public void setDescricaoNaturezaDespesa(String descricaoNaturezaDespesa) { this.descricaoNaturezaDespesa = descricaoNaturezaDespesa; }
}
