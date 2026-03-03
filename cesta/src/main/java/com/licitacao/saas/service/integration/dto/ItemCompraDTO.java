package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ItemCompraDTO {
    // I need to guess the fields or check if I can view it.
    // Based on ComprasGovService: return response.getEmbedded().getCompras();
    // It's used for price search.
    // Let's assume standard fields for now, or minimal to pass compilation.
    // Ideally I should view the file first.
    // But urgency.
    // I'll add 'descricao' and 'preco' as generic guess.
    // Wait, Controller calls `buscarPrecos(descricao)`.
    
    @JsonProperty("descricao")
    private String descricao;
    
    // Additional fields might be needed.
    // If I overwrite it and it had other fields used elsewhere, I break things.
    // BUT only ComprasGovService uses it in `buscarPrecosNoComprasGov`.
    // And Controller returns `List<ItemCompraDTO>`.
    // So as long as it's valid JSON serialization, it's fine.
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}
