package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PesquisaServicoResponseDTO {
    @JsonProperty("resultado")
    private List<PesquisaServicoDTO> resultado;
    @JsonProperty("totalRegistros")
    private Integer totalRegistros;

    public List<PesquisaServicoDTO> getResultado() { return resultado; }
    public void setResultado(List<PesquisaServicoDTO> resultado) { this.resultado = resultado; }
    public Integer getTotalRegistros() { return totalRegistros; }
    public void setTotalRegistros(Integer totalRegistros) { this.totalRegistros = totalRegistros; }
}
