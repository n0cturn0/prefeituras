package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PesquisaServicoDTO {
    @JsonProperty("idItemCompra")
    private Long idItemCompra;
    @JsonProperty("idCompra")
    private Long idCompra;
    @JsonProperty("dataCompra")
    private String dataCompra;
    @JsonProperty("precoUnitario")
    private Double precoUnitario;
    @JsonProperty("quantidade")
    private Integer quantidade;
    @JsonProperty("unidade")
    private String unidade;
    @JsonProperty("municipio")
    private String municipio;
    @JsonProperty("uf")
    private String uf;
    @JsonProperty("uasg")
    private Integer uasg;
    @JsonProperty("nomeUasg")
    private String nomeUasg;
    @JsonProperty("nomeFornecedor")
    private String nomeFornecedor;

    public Long getIdItemCompra() { return idItemCompra; }
    public void setIdItemCompra(Long idItemCompra) { this.idItemCompra = idItemCompra; }
    public Long getIdCompra() { return idCompra; }
    public void setIdCompra(Long idCompra) { this.idCompra = idCompra; }
    public String getDataCompra() { return dataCompra; }
    public void setDataCompra(String dataCompra) { this.dataCompra = dataCompra; }
    public Double getPrecoUnitario() { return precoUnitario; }
    public void setPrecoUnitario(Double precoUnitario) { this.precoUnitario = precoUnitario; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }
    public String getMunicipio() { return municipio; }
    public void setMunicipio(String municipio) { this.municipio = municipio; }
    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }
    public Integer getUasg() { return uasg; }
    public void setUasg(Integer uasg) { this.uasg = uasg; }
    public String getNomeUasg() { return nomeUasg; }
    public void setNomeUasg(String nomeUasg) { this.nomeUasg = nomeUasg; }
    public String getNomeFornecedor() { return nomeFornecedor; }
    public void setNomeFornecedor(String nomeFornecedor) { this.nomeFornecedor = nomeFornecedor; }
}
