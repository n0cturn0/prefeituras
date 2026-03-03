package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpInstrumentoCobrancaDTO {
    @JsonProperty("idInstrumentoCobranca")
    private Long idInstrumentoCobranca;
    @JsonProperty("numeroInstrumentoCobranca")
    private String numeroInstrumentoCobranca; // Nota Fiscal / Fatura #
    @JsonProperty("dataEmissao")
    private String dataEmissao;
    @JsonProperty("dataVencimento")
    private String dataVencimento;
    @JsonProperty("valorTotal")
    private Double valorTotal;
    @JsonProperty("tipoInstrumentoCobrancaNome")
    private String tipoInstrumentoCobrancaNome; // "Nota Fiscal", "Fatura"
    @JsonProperty("orgaoNome")
    private String orgaoNome;
    @JsonProperty("orgaoCnpj")
    private String orgaoCnpj;
    @JsonProperty("nomeRazaoSocialFornecedor")
    private String nomeRazaoSocialFornecedor;
    @JsonProperty("niFornecedor")
    private String niFornecedor;
    @JsonProperty("numeroContratoEmpenho")
    private String numeroContratoEmpenho; // Link to Contract
    
    // Getters Setters
    public Long getIdInstrumentoCobranca() { return idInstrumentoCobranca; }
    public void setIdInstrumentoCobranca(Long idInstrumentoCobranca) { this.idInstrumentoCobranca = idInstrumentoCobranca; }
    public String getNumeroInstrumentoCobranca() { return numeroInstrumentoCobranca; }
    public void setNumeroInstrumentoCobranca(String numeroInstrumentoCobranca) { this.numeroInstrumentoCobranca = numeroInstrumentoCobranca; }
    public String getDataEmissao() { return dataEmissao; }
    public void setDataEmissao(String dataEmissao) { this.dataEmissao = dataEmissao; }
    public String getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(String dataVencimento) { this.dataVencimento = dataVencimento; }
    public Double getValorTotal() { return valorTotal; }
    public void setValorTotal(Double valorTotal) { this.valorTotal = valorTotal; }
    public String getTipoInstrumentoCobrancaNome() { return tipoInstrumentoCobrancaNome; }
    public void setTipoInstrumentoCobrancaNome(String tipoInstrumentoCobrancaNome) { this.tipoInstrumentoCobrancaNome = tipoInstrumentoCobrancaNome; }
    public String getOrgaoNome() { return orgaoNome; }
    public void setOrgaoNome(String orgaoNome) { this.orgaoNome = orgaoNome; }
    public String getOrgaoCnpj() { return orgaoCnpj; }
    public void setOrgaoCnpj(String orgaoCnpj) { this.orgaoCnpj = orgaoCnpj; }
    public String getNomeRazaoSocialFornecedor() { return nomeRazaoSocialFornecedor; }
    public void setNomeRazaoSocialFornecedor(String nomeRazaoSocialFornecedor) { this.nomeRazaoSocialFornecedor = nomeRazaoSocialFornecedor; }
    public String getNiFornecedor() { return niFornecedor; }
    public void setNiFornecedor(String niFornecedor) { this.niFornecedor = niFornecedor; }
    public String getNumeroContratoEmpenho() { return numeroContratoEmpenho; }
    public void setNumeroContratoEmpenho(String numeroContratoEmpenho) { this.numeroContratoEmpenho = numeroContratoEmpenho; }
}
