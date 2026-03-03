package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ItemMaterialDTO {
    @JsonProperty("codigoItem")
    private Integer codigoItem;
    
    @JsonProperty("descricaoItem")
    private String descricaoItem;
    
    @JsonProperty("statusItem")
    private String statusItem;
    
    @JsonProperty("itemSustentavel")
    private Boolean itemSustentavel;
    
    @JsonProperty("codigoNcm")
    private String codigoNcm;

    public Integer getCodigoItem() { return codigoItem; }
    public void setCodigoItem(Integer codigoItem) { this.codigoItem = codigoItem; }
    public String getDescricaoItem() { return descricaoItem; }
    public void setDescricaoItem(String descricaoItem) { this.descricaoItem = descricaoItem; }
    public String getStatusItem() { return statusItem; }
    public void setStatusItem(String statusItem) { this.statusItem = statusItem; }
    public Boolean getItemSustentavel() { return itemSustentavel; }
    public void setItemSustentavel(Boolean itemSustentavel) { this.itemSustentavel = itemSustentavel; }
    public String getCodigoNcm() { return codigoNcm; }
    public void setCodigoNcm(String codigoNcm) { this.codigoNcm = codigoNcm; }
}
