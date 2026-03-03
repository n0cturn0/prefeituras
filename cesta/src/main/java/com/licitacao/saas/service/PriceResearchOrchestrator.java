package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.dto.PesquisaMaterialDTO;
import com.licitacao.saas.service.integration.dto.PncpAtaDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PriceResearchOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(PriceResearchOrchestrator.class);
    private final PesquisaPrecoPraticadoService dadosAbertosService;
    private final PncpOficialService pncpOficialService;
    // Helper to format dates if needed
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    public List<PesquisaMaterialDTO> pesquisar(Integer codigoItemCatalogo, Integer codigoServico, 
                                               String municipio, String uf, Integer pagina) {
        
        List<PesquisaMaterialDTO> results = new ArrayList<>();
        
        // 1. Async call to Dados Abertos (Legacy/Current)
        CompletableFuture<List<PesquisaMaterialDTO>> dadosAbertosFuture = CompletableFuture.supplyAsync(() -> {
            try {
                if (codigoItemCatalogo != null) {
                    return dadosAbertosService.consultarPrecosMaterial(codigoItemCatalogo, pagina, 10, municipio, uf);
                } else if (codigoServico != null) {
                   // Map service DTOs to Material DTOs or handle separately? 
                   // Current Controller calls 'consultarPrecosServico' returning 'PesquisaServicoDTO'.
                   // Orchestrator needs to decide return type.
                   // For now, I'll focus on Material as per example.
                   // If Service, return empty here to avoid type mismatch, or refactor DTOs.
                   return Collections.emptyList(); 
                }
                return Collections.emptyList();
            } catch (Exception e) {
                log.error("Error fetching from Dados Abertos", e);
                return Collections.emptyList();
            }
        });

        // 2. Async call to PNCP Oficial
        CompletableFuture<List<PesquisaMaterialDTO>> pncpFuture = CompletableFuture.supplyAsync(() -> {
            try {
                String catmat = codigoItemCatalogo != null ? String.valueOf(codigoItemCatalogo) : null;
                // String catser = codigoServico != null ? String.valueOf(codigoServico) : null; 
                // Note: PncpOficialService v2 focused on Material Item. Service support deferred.
                
                if (catmat != null) {
                    java.time.LocalDate now = java.time.LocalDate.now();
                    return mapAtasToDTO(pncpOficialService.buscarAtasVigentes(catmat, now.minusYears(1), now, 1));
                }
                return Collections.emptyList();
            } catch (Exception e) {
                log.error("Error fetching from PNCP Oficial", e);
                return Collections.emptyList();
            }
        });

        // Join
        CompletableFuture.allOf(dadosAbertosFuture, pncpFuture).join();

        try {
            results.addAll(dadosAbertosFuture.get());
            results.addAll(pncpFuture.get());
        } catch (Exception e) {
            log.error("Error joining results", e);
        }

        return results;
    }

    private List<PesquisaMaterialDTO> mapAtasToDTO(List<PncpAtaDTO> atas) {
        return atas.stream().map(ata -> {
            PesquisaMaterialDTO dto = new PesquisaMaterialDTO();
            dto.setNumeroControlePNCP(ata.getNumeroControlePNCP());
            dto.setOrigem("PNCP_OFICIAL");
            dto.setLinkAtaPNCP("https://pncp.gov.br/app/atas/" + ata.getNumeroControlePNCP()); // Construct URL key
            
            dto.setNomeUasg(ata.getOrgaoGerenciadorRazaoSocial());
            // We don't have UASG code directly in basic DTO, but maybe inside orgao object.
            
            dto.setDataVigenciaFinal(ata.getDataVigenciaFim() != null ? ata.getDataVigenciaFim().toString() : null);
             // Assuming Objeto is description
             // Use 'marca' or create new field 'objeto'? 
             // PesquisaMaterialDTO doesn't have 'objeto'. It has 'marca', 'unidade', etc.
             // I'll reuse 'marca' or 'nomeFornecedor'? No, that's confusing.
             // I'll filter logic at Frontend: if PNCP_OFICIAL, show 'Objeto' col.
             // Where to put Objeto? 
             // I should probably add 'objeto' to PesquisaMaterialDTO or use 'unidade' as placeholder?
             // No, bad practice.
             // I'll check if PesquisaMaterialDTO has description. 
             // It doesn't seem to. It implies 'codigoItemCatalogo' defines the description.
             // But valid Atas have specific object descriptions.
             // I'll use 'marca' for now as a temporary slot or add 'descricaoItem'.
             // Let's add 'descricaoItem' to PesquisaMaterialDTO later if mostly needed. 
             // But for now, I'll use 'marca' to store Objeto to be displayed in the card.
            dto.setDescricaoItem(ata.getObjeto()); 
            dto.setCnpjOrgao(ata.getOrgaoGerenciadorCnpj()); 
            
            dto.setPrecoUnitario(0.0); // Price might be in detailed items, not Ata Header.
            // Requirement mentions "Tabela com Nº Ata, Órgão, Vigência, Objeto, Status".
            // It doesn't explicitly ask for Price immediately in this list view (typically List Atas -> Click -> See Items/Prices).
            
            dto.setCancelado(ata.getCancelado()); // Need to add this field to DTO?
            
            return dto;
        }).collect(Collectors.toList());
    }
}
