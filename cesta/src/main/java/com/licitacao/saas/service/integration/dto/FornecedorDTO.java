package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FornecedorDTO {
    @JsonProperty("ni")
    private String ni; // CNPJ/CPF
    @JsonProperty("nome") // or razaoSocial
    private String nome;
    @JsonProperty("ativo")
    private Boolean ativo;
    @JsonProperty("habilitadoLicitar")
    private Boolean habilitadoLicitar;
    @JsonProperty("porteEmpresaNome")
    private String porteEmpresaNome; // ME, EPP, GRANDE PORTE
    @JsonProperty("ufSigla")
    private String ufSigla;
    @JsonProperty("nomeMunicipio")
    private String nomeMunicipio;
    @JsonProperty("cnae")
    private String cnae; // Code or Description?
    @JsonProperty("naturezaJuridica")
    private String naturezaJuridica;
    
    // Getters / Setters
    public String getNi() { return ni; }
    public void setNi(String ni) { this.ni = ni; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public Boolean getHabilitadoLicitar() { return habilitadoLicitar; }
    public void setHabilitadoLicitar(Boolean habilitadoLicitar) { this.habilitadoLicitar = habilitadoLicitar; }
    public String getPorteEmpresaNome() { return porteEmpresaNome; }
    public void setPorteEmpresaNome(String porteEmpresaNome) { this.porteEmpresaNome = porteEmpresaNome; }
    public String getUfSigla() { return ufSigla; }
    public void setUfSigla(String ufSigla) { this.ufSigla = ufSigla; }
    public String getNomeMunicipio() { return nomeMunicipio; }
    public void setNomeMunicipio(String nomeMunicipio) { this.nomeMunicipio = nomeMunicipio; }
    public String getCnae() { return cnae; }
    public void setCnae(String cnae) { this.cnae = cnae; }
    public String getNaturezaJuridica() { return naturezaJuridica; }
    public void setNaturezaJuridica(String naturezaJuridica) { this.naturezaJuridica = naturezaJuridica; }
}
