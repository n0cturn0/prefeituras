package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ServicoCatalogoResponseDTO {
    @JsonProperty("resultado")
    private List<ServicoCatalogoDTO> resultado;

    @JsonProperty("totalPaginas")
    private Integer totalPaginas;

    public List<ServicoCatalogoDTO> getResultado() { return resultado; }
    public void setResultado(List<ServicoCatalogoDTO> resultado) { this.resultado = resultado; }

    public Integer getTotalPaginas() { return totalPaginas; }
    public void setTotalPaginas(Integer totalPaginas) { this.totalPaginas = totalPaginas; }
}
