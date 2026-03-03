package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PdmMaterialDTO {
    @JsonProperty("codigoPdm")
    private Integer codigoPdm;
    @JsonProperty("nomePdm") // Fixed mapping from API
    private String nomePdm;
    // I need to be careful with property names.
    // In step 781 (React code) I used 'nomePdm' and 'codigoPdm'.
    // Let's assume the previous Java class had these.

    public Integer getCodigoPdm() { return codigoPdm; }
    public void setCodigoPdm(Integer codigoPdm) { this.codigoPdm = codigoPdm; }
    public String getNomePdm() { return nomePdm; }
    public void setNomePdm(String nomePdm) { this.nomePdm = nomePdm; }
}
