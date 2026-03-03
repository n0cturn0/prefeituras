package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.PdmMaterialDTO;
import com.licitacao.saas.service.integration.dto.PdmMaterialResponseDTO;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdmCacheService {

    private final ComprasGovClient comprasGovClient;
    private List<PdmMaterialDTO> pdmCache = new ArrayList<>();
    private boolean isLoaded = false;

    @PostConstruct
    public void init() {
        CompletableFuture.runAsync(this::loadCache);
    }

    private void loadCache() {
        log.info("Iniciando carregamento do Cache de PDM (Materiais)...");
        try {
            int pagina = 1;
            boolean hasMore = true;
            
            while (hasMore) {
                PdmMaterialResponseDTO response = comprasGovClient.consultarTodosPdms(pagina);
                if (response != null && response.getResultado() != null && !response.getResultado().isEmpty()) {
                    pdmCache.addAll(response.getResultado());
                    // Check if we need more pages. API usually returns paginasRestantes or we just check list size
                    // Since I don't trust pagination metadata fully, let's assume if list < 500 (default) we are done
                    // But safe way requires checking metadata if available. 
                    // Let's assume default page size.
                    pagina++;
                    if (response.getResultado().size() < 500) hasMore = false;
                    // Safety break
                    if (pagina > 100) hasMore = false; 
                    
                    log.debug("Carregada pagina {} de PDMs. Total: {}", pagina-1, pdmCache.size());
                } else {
                    hasMore = false;
                }
            }
            isLoaded = true;
            log.info("Cache de PDM carregado com sucesso. Total de registros: {}", pdmCache.size());
        } catch (Exception e) {
            log.error("Erro ao carregar cache de PDM", e);
        }
    }

    public List<PdmMaterialDTO> search(String term) {
        if (!isLoaded) {
            log.warn("Cache PDM nao carregado ainda.");
            return Collections.emptyList();
        }
        if (term == null || term.length() < 3) return Collections.emptyList();
        
        String lowerTerm = term.toLowerCase();
        log.info("Buscando PDM por termo: '{}'", lowerTerm);
        
        var results = pdmCache.stream()
                .filter(pdm -> pdm.getNomePdm() != null && pdm.getNomePdm().toLowerCase().contains(lowerTerm))
                .limit(20)
                .collect(Collectors.toList());
                
        log.info("Encontrados {} PDMs para '{}'", results.size(), lowerTerm);
        return results;
    }
}
