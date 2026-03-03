package com.licitacao.saas.service.integration;

import com.licitacao.saas.service.integration.dto.PncpAtasResponseDTO;
import com.licitacao.saas.service.integration.dto.PncpContratacaoDTO;
import com.licitacao.saas.service.integration.dto.PncpContratacoesSearchResponseDTO;
import com.licitacao.saas.service.integration.dto.PncpContratosSearchResponseDTO;
import com.licitacao.saas.service.integration.dto.PncpCobrancaSearchResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "pncpOficialClient", url = "https://pncp.gov.br/api/consulta/v1")
public interface PncpClient {

    @GetMapping("/atas")
    PncpAtasResponseDTO consultarAtas(
        @RequestParam("dataInicial") String dataInicial, // YYYYMMDD
        @RequestParam("dataFinal") String dataFinal,     // YYYYMMDD
        @RequestParam(value = "codigoItemCatalogo", required = false) String codigoItemCatalogo,
        @RequestParam(value = "codigoServicoCatalogo", required = false) String codigoServicoCatalogo,
        @RequestParam(value = "pagina", defaultValue = "1") Integer pagina
    );
    
    // --- Módulo Contratações ---

    @GetMapping("/contratacoes/publicacao")
    PncpContratacoesSearchResponseDTO consultarContratacoesPorPublicacao(
        @RequestParam("dataInicial") String dataInicial, // YYYYMMDD
        @RequestParam("dataFinal") String dataFinal,     // YYYYMMDD
        @RequestParam(value = "codigoModalidadeContratacao", required = false) String codigoModalidadeContratacao,
        @RequestParam(value = "uf", required = false) String uf,
        @RequestParam(value = "codigoMunicipioIbge", required = false) String codigoMunicipioIbge,
        @RequestParam(value = "cnpjOrgao", required = false) String cnpjOrgao,
        @RequestParam(value = "pagina", defaultValue = "1") Integer pagina
    );
    
    @GetMapping("/contratacoes/proposta")
    PncpContratacoesSearchResponseDTO consultarContratacoesPropostaAberta(
        @RequestParam(value = "uf", required = false) String uf,
        @RequestParam(value = "codigoMunicipioIbge", required = false) String codigoMunicipioIbge,
        @RequestParam(value = "pagina", defaultValue = "1") Integer pagina
    );
    
    // Using simple approach: if updated, might need /contratacoes/atualizacao
    @GetMapping("/contratacoes/atualizacao")
    PncpContratacoesSearchResponseDTO consultarContratacoesAtualizacao(
        @RequestParam("dataInicial") String dataInicial,
        @RequestParam(value = "pagina", defaultValue = "1") Integer pagina
    );
    
    // Detail
    @GetMapping("/orgaos/{cnpj}/compras/{ano}/{sequencial}")
    PncpContratacaoDTO consultarContratacaoDetalhe(
        @org.springframework.web.bind.annotation.PathVariable("cnpj") String cnpj,
        @org.springframework.web.bind.annotation.PathVariable("ano") Integer ano,
        @org.springframework.web.bind.annotation.PathVariable("sequencial") Integer sequencial
    );

    // --- Módulo Contratos / Execução ---
    
    @GetMapping("/contratos")
    PncpContratosSearchResponseDTO consultarContratos(
        @RequestParam("dataInicial") String dataInicial, // YYYYMMDD
        @RequestParam("dataFinal") String dataFinal,     // YYYYMMDD
        @RequestParam(value = "cnpjOrgao", required = false) String cnpjOrgao,
        @RequestParam(value = "uf", required = false) String uf,
        @RequestParam(value = "codigoMunicipioIbge", required = false) String codigoMunicipioIbge,
        @RequestParam(value = "pagina", defaultValue = "1") Integer pagina
    );
    @GetMapping("/contratos/atualizacao")
    PncpContratosSearchResponseDTO consultarContratosAtualizacao(
        @RequestParam("dataInicial") String dataInicial,
        @RequestParam(value = "pagina", defaultValue = "1") Integer pagina
    );
    
    // --- Módulo Instrumentos de Cobrança ---
    
    @GetMapping("/instrumentoscobranca/inclusao")
    PncpCobrancaSearchResponseDTO consultarInstrumentosCobrancaInclusao(
        @RequestParam("dataInicial") String dataInicial, // YYYYMMDD
        @RequestParam("dataFinal") String dataFinal,     // YYYYMMDD
        @RequestParam(value = "cnpjOrgao", required = false) String cnpjOrgao,
        @RequestParam(value = "pagina", defaultValue = "1") Integer pagina
    );
}
