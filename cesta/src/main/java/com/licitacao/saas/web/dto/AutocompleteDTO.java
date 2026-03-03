package com.licitacao.saas.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AutocompleteDTO {
    @JsonProperty("id")
    private String id; // Codigo Item/Servico
    
    @JsonProperty("label")
    private String label; // Descricao
    
    @JsonProperty("type")
    private String type; // MATERIAL vs SERVICO

    public AutocompleteDTO() {}

    public AutocompleteDTO(String id, String label, String type) {
        this.id = id;
        this.label = label;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
