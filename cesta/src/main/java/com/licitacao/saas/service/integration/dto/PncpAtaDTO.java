package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpAtaDTO {
    private String numeroControlePNCP; // numeroControlePNCPAta
    private String numeroAtaRegistroPreco; // Nº Ata
    private String anoAta;
    
    private LocalDate dataVigenciaInicio;
    private LocalDate dataVigenciaFim; // Vigência
    
    private Boolean cancelado; // cancelado
    
    private String orgaoGerenciadorRazaoSocial; // Órgão Gerenciador
    private String orgaoGerenciadorCnpj; // cnpjOrgao
    private String orgaoGerenciadorCodigoUnidade; // codigoUnidadeOrgao ??? (Guessing)
    
    @com.fasterxml.jackson.annotation.JsonAlias({"descricao", "objetoCompra", "objetoAta"})
    private String objeto; // Objeto
    
    // For local filtering/mapping
    private String itemUrl; // Link?
}
