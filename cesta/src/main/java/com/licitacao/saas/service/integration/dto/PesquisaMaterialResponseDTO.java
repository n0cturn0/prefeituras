package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PesquisaMaterialResponseDTO {
    @JsonProperty("resultado")
    private List<PesquisaMaterialDTO> resultado;
    @JsonProperty("totalRegistros")
    private Integer totalRegistros;

    public List<PesquisaMaterialDTO> getResultado() { return resultado; }
    public void setResultado(List<PesquisaMaterialDTO> resultado) { this.resultado = resultado; }
    public Integer getTotalRegistros() { return totalRegistros; }
    public void setTotalRegistros(Integer totalRegistros) { this.totalRegistros = totalRegistros; }
}
