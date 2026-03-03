package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ArpHeaderDTO {
    @JsonProperty("numeroAtaRegistroPreco")
    private String numeroAtaRegistroPreco;
    @JsonProperty("linkAtaPNCP")
    private String linkAtaPNCP;
    @JsonProperty("dataVigenciaFinal")
    private String dataVigenciaFinal;

    public String getNumeroAtaRegistroPreco() { return numeroAtaRegistroPreco; }
    public void setNumeroAtaRegistroPreco(String numeroAtaRegistroPreco) { this.numeroAtaRegistroPreco = numeroAtaRegistroPreco; }
    public String getLinkAtaPNCP() { return linkAtaPNCP; }
    public void setLinkAtaPNCP(String linkAtaPNCP) { this.linkAtaPNCP = linkAtaPNCP; }
    public String getDataVigenciaFinal() { return dataVigenciaFinal; }
    public void setDataVigenciaFinal(String dataVigenciaFinal) { this.dataVigenciaFinal = dataVigenciaFinal; }
}
