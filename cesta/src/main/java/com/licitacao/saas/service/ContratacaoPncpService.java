package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContratacaoPncpService {

    private static final Logger log = LoggerFactory.getLogger(ContratacaoPncpService.class);
    private final ComprasGovClient comprasGovClient;

    public List<PesquisaMaterialDTO> pesquisarItensPncp(Integer codigoItemCatalogo) {
        log.info("Iniciando busca no PNCP para Item: {}", codigoItemCatalogo);
        List<PesquisaMaterialDTO> finalResults = new ArrayList<>();

        try {
            // 1. Search for Items
            // Limited to 1 page / 10 items for performance in this POC
            PncpItemResponseDTO itemsResponse = comprasGovClient.consultarItensPncp(codigoItemCatalogo, 1, 10);
            
            if (itemsResponse != null && itemsResponse.getResultado() != null) {
                // For each item, fetching details implies multiple requests.
                // Using CompletableFuture for basic parallelism to not block too much.
                
                List<CompletableFuture<PesquisaMaterialDTO>> futures = itemsResponse.getResultado().stream()
                    .map(item -> CompletableFuture.supplyAsync(() -> processPncpItem(item)))
                    .collect(Collectors.toList());

                CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
                
                for (CompletableFuture<PesquisaMaterialDTO> future : futures) {
                    PesquisaMaterialDTO result = future.get(); // Safe join
                    if (result != null) {
                        finalResults.add(result);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Erro geral buscando no PNCP", e);
        }

        return finalResults;
    }

    private PesquisaMaterialDTO processPncpItem(PncpItemDTO item) {
        try {
            // 2. Get Result (Price/Winner)
            PncpResultadoItemResponseDTO resResponse = comprasGovClient.consultarResultadosItensPncp(item.getIdItemContratacao());
            if (resResponse == null || resResponse.getResultado() == null || resResponse.getResultado().isEmpty()) {
                return null; // Item without result/homologation
            }
            
            // Assuming first result is the winner/homologated one for simplicity. 
            // In reality, could be multiple, but usually one active winner.
            PncpResultadoItemDTO resultado = resResponse.getResultado().get(0);

            // 3. Get Header (Contratacao Information)
            PncpContratacaoResponseDTO headerResponse = comprasGovClient.consultarContratacoesPncp(item.getIdContratacao());
            if (headerResponse == null || headerResponse.getResultado() == null) {
                return null;
            }
            PncpContratacaoDTO header = headerResponse.getResultado();

            // 4. Map to Unified DTO
            PesquisaMaterialDTO dto = new PesquisaMaterialDTO();
            dto.setIdItemCompra(item.getIdItemContratacao());
            dto.setIdCompra(item.getIdContratacao());
            dto.setQuantidade(resultado.getQuantidadeHomologada() != null ? resultado.getQuantidadeHomologada() : item.getQuantidade());
            dto.setPrecoUnitario(resultado.getValorUnitarioHomologado());
            dto.setUnidade(item.getUnidadeMedida());
            dto.setMarca(resultado.getMarcaNome());
            dto.setNomeFornecedor(resultado.getNomeRazaoSocialFornecedor());
            
            dto.setDataCompra(formatDate(header.getDataPublicacaoPncp())); // Norm to YYYY-MM-DD
            dto.setUasg(header.getUasg());
            dto.setNomeUasg(header.getOrgaoNome());
            dto.setMunicipio(header.getMunicipioNome());
            dto.setUf(header.getUfSigla());
            
            dto.setNumeroControlePNCP(header.getNumeroControlePNCP());
            dto.setOrigem("PNCP");
            
            return dto;

        } catch (Exception e) {
            log.error("Erro processando item PNCP {}", item.getIdItemContratacao(), e);
            return null;
        }
    }
    
    private String formatDate(String rawDate) {
        try {
            if (rawDate == null) return null;
            // Assuming ISO date or similar from API, converting to YYYY-MM-DD
            if (rawDate.length() >= 10) return rawDate.substring(0, 10);
            return rawDate;
        } catch (Exception e) { return rawDate; }
    }
}
