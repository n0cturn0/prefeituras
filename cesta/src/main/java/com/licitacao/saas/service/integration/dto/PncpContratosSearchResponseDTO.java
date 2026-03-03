package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpContratosSearchResponseDTO {
    @JsonProperty("data")
    private List<PncpContratoDTO> data;
    @JsonProperty("totalRegistros")
    private Long totalRegistros;

    public List<PncpContratoDTO> getData() { return data; }
    public void setData(List<PncpContratoDTO> data) { this.data = data; }
    public Long getTotalRegistros() { return totalRegistros; }
    public void setTotalRegistros(Long totalRegistros) { this.totalRegistros = totalRegistros; }
}
