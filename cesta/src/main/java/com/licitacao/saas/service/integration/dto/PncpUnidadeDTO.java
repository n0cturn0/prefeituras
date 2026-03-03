package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpUnidadeDTO {
    @JsonProperty("codigoUnidade")
    private String codigoUnidade;
    
    @JsonProperty("nomeUnidade")
    private String nomeUnidade;
    
    @JsonProperty("ufSigla")
    private String ufSigla;
    
    @JsonProperty("municipioNome")
    private String municipioNome;
    
    @JsonProperty("codigoIbge")
    private String codigoIbge;
}
