package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpContratacoesSearchResponseDTO {
    @JsonProperty("data")
    private List<PncpContratacaoDTO> data;
    @JsonProperty("totalRegistros")
    private Long totalRegistros;
    
    public List<PncpContratacaoDTO> getData() { return data; }
    public void setData(List<PncpContratacaoDTO> data) { this.data = data; }
    public Long getTotalRegistros() { return totalRegistros; }
    public void setTotalRegistros(Long totalRegistros) { this.totalRegistros = totalRegistros; }
}
