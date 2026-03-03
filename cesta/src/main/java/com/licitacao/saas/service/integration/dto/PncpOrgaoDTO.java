package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpOrgaoDTO {
    @JsonProperty("cnpj")
    private String cnpj;
    
    @JsonProperty("razaoSocial")
    private String razaoSocial;
    
    @JsonProperty("poderId")
    private String poderId;
    
    @JsonProperty("esferaId")
    private String esferaId;
}
