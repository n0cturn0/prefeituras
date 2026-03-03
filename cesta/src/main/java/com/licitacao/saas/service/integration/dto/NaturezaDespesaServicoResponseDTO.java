package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class NaturezaDespesaServicoResponseDTO {
    @JsonProperty("resultado")
    private List<NaturezaDespesaServicoDTO> resultado;

    public List<NaturezaDespesaServicoDTO> getResultado() { return resultado; }
    public void setResultado(List<NaturezaDespesaServicoDTO> resultado) { this.resultado = resultado; }
}
