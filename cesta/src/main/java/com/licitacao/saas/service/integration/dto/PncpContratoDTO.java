package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpContratoDTO {
    @JsonProperty("idContrato")
    private Long idContrato;
    
    @JsonProperty("numeroControlePNCP")
    private String numeroControlePNCP;
    
    @JsonProperty("numeroContratoEmpenho")
    private String numeroContratoEmpenho;
    
    @JsonProperty("dataAssinatura")
    private String dataAssinatura;
    
    @JsonProperty("dataVigenciaInicio")
    private String dataVigenciaInicio;
    
    @JsonProperty("dataVigenciaFim")
    private String dataVigenciaFim;
    
    @JsonProperty("niFornecedor")
    private String niFornecedor;
    
    @JsonProperty("nomeRazaoSocialFornecedor")
    private String nomeRazaoSocialFornecedor;
    
    // Nested Objects
    @JsonProperty("orgaoEntidade")
    private PncpOrgaoDTO orgaoEntidade;

    @JsonProperty("unidadeOrgao")
    private PncpUnidadeDTO unidadeOrgao;
    
    @JsonProperty("objetoContrato")
    private String objetoContrato;
    
    @JsonProperty("valorInicial")
    private Double valorInicial;

    // Flattened getters for backward compatibility with frontend/service logic
    public String getOrgaoNome() {
        if (orgaoEntidade != null && orgaoEntidade.getRazaoSocial() != null) return orgaoEntidade.getRazaoSocial();
        if (unidadeOrgao != null && unidadeOrgao.getNomeUnidade() != null) return unidadeOrgao.getNomeUnidade();
        return null;
    }

    public String getOrgaoCnpj() {
        return orgaoEntidade != null ? orgaoEntidade.getCnpj() : null;
    }
    
    public String getUnidadeOrgaoNome() {
        return unidadeOrgao != null ? unidadeOrgao.getNomeUnidade() : null;
    }

    public String getUfSigla() {
        return unidadeOrgao != null ? unidadeOrgao.getUfSigla() : null;
    }
    
    public String getMunicipioNome() {
        return unidadeOrgao != null ? unidadeOrgao.getMunicipioNome() : null;
    }
}
