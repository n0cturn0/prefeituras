package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpContratacaoDTO {
    @JsonProperty("idContratacao")
    private Long idContratacao;
    
    @JsonProperty("numeroControlePNCP")
    private String numeroControlePNCP;
    
    @JsonProperty("dataPublicacaoPncp")
    private String dataPublicacaoPncp;
    
    // Nested Objects
    @JsonProperty("orgaoEntidade")
    private PncpOrgaoDTO orgaoEntidade;

    @JsonProperty("unidadeOrgao")
    private PncpUnidadeDTO unidadeOrgao;
    
    @JsonProperty("objetoCompra")
    private String objetoCompra;
    
    @JsonProperty("anoCompra")
    private Integer anoCompra;
    
    @JsonProperty("sequencialCompra")
    private Integer sequencialCompra;
    
    @JsonProperty("recebimentoProposta")
    private Boolean recebimentoProposta;

    // Helper methods to flatten data for Service/UI consumption
    public String getOrgaoNome() {
        if (orgaoEntidade != null && orgaoEntidade.getRazaoSocial() != null) return orgaoEntidade.getRazaoSocial();
        if (unidadeOrgao != null && unidadeOrgao.getNomeUnidade() != null) return unidadeOrgao.getNomeUnidade();
        return "Órgão não informado";
    }

    public String getUnidadeOrgaoNome() {
        return unidadeOrgao != null ? unidadeOrgao.getNomeUnidade() : null;
    }

    public String getOrgaoCnpj() {
        return orgaoEntidade != null ? orgaoEntidade.getCnpj() : null;
    }
    
    public String getUfSigla() {
        return unidadeOrgao != null ? unidadeOrgao.getUfSigla() : null;
    }
    
    public String getMunicipioNome() {
        return unidadeOrgao != null ? unidadeOrgao.getMunicipioNome() : null;
    }
    
    public Integer getUasg() {
         try {
             if (unidadeOrgao != null && unidadeOrgao.getCodigoUnidade() != null) {
                 return Integer.parseInt(unidadeOrgao.getCodigoUnidade());
             }
         } catch (Exception e) {}
         return 0;
    }
}
