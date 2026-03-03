package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpItemDTO {
    @JsonProperty("idItemContratacao")
    private Long idItemContratacao;
    @JsonProperty("idContratacao")
    private Long idContratacao;
    @JsonProperty("numeroItem")
    private Integer numeroItem;
    @JsonProperty("descricao")
    private String descricao;
    @JsonProperty("quantidade")
    private Integer quantidade;
    @JsonProperty("valorUnitarioEstimado")
    private Double valorUnitarioEstimado;
    @JsonProperty("unidadeMedida")
    private String unidadeMedida;
    @JsonProperty("codigoItemCatalogo")
    private Integer codigoItemCatalogo;
    @JsonProperty("criterioJulgamentoNome")
    private String criterioJulgamentoNome;

    public Long getIdItemContratacao() { return idItemContratacao; }
    public void setIdItemContratacao(Long idItemContratacao) { this.idItemContratacao = idItemContratacao; }
    public Long getIdContratacao() { return idContratacao; }
    public void setIdContratacao(Long idContratacao) { this.idContratacao = idContratacao; }
    public Integer getNumeroItem() { return numeroItem; }
    public void setNumeroItem(Integer numeroItem) { this.numeroItem = numeroItem; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public Double getValorUnitarioEstimado() { return valorUnitarioEstimado; }
    public void setValorUnitarioEstimado(Double valorUnitarioEstimado) { this.valorUnitarioEstimado = valorUnitarioEstimado; }
    public String getUnidadeMedida() { return unidadeMedida; }
    public void setUnidadeMedida(String unidadeMedida) { this.unidadeMedida = unidadeMedida; }
    public Integer getCodigoItemCatalogo() { return codigoItemCatalogo; }
    public void setCodigoItemCatalogo(Integer codigoItemCatalogo) { this.codigoItemCatalogo = codigoItemCatalogo; }
    public String getCriterioJulgamentoNome() { return criterioJulgamentoNome; }
    public void setCriterioJulgamentoNome(String criterioJulgamentoNome) { this.criterioJulgamentoNome = criterioJulgamentoNome; }
}
