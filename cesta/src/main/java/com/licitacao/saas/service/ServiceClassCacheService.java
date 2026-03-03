package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.ClasseServicoDTO;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceClassCacheService {

    private final ComprasGovClient client;
    private final List<ClasseServicoDTO> cache = new ArrayList<>();
    private boolean isLoaded = false;

    @PostConstruct
    public void init() {
        // Load async to not block startup
        new Thread(this::loadCache).start();
    }

    @Scheduled(cron = "0 0 4 * * *") // Daily refresh at 4am
    public void loadCache() {
        try {
            log.info("Iniciando carregamento do Cache de Classes de Servico...");
            long start = System.currentTimeMillis();

            // Fetch all groups? No, directly fetch all classes.
            // 4_consultarClasseServico lists all if no filter is provided? 
            // We verified this returns ~300 items in page 1.
            // But we need to check if there are multiple pages.
            // The step 2026 output showed "totalRegistros":313, "totalPaginas":1.
            // So one call is enough!
            
            var response = client.consultarClassesServico(null); // Assuming null lists all
            if (response != null && response.getResultado() != null) {
                synchronized (cache) {
                    cache.clear();
                    cache.addAll(response.getResultado());
                }
                isLoaded = true;
                log.info("Cache de Classes de Servico carregado. Total: {} ({} ms)", cache.size(), System.currentTimeMillis() - start);
            } else {
                 // Try fetching by group if direct listing fails? 
                 // But manual curl worked.
                 log.warn("Nenhuma classe de servico encontrada.");
            }

        } catch (Exception e) {
            log.error("Erro ao carregar cache de servicos", e);
        }
    }

    public List<ClasseServicoDTO> search(String term) {
        if (!isLoaded || term == null || term.length() < 3) return new ArrayList<>();

        String lower = term.toLowerCase();
        synchronized (cache) {
            return cache.stream()
                    .filter(c -> c.getNomeClasse() != null && c.getNomeClasse().toLowerCase().contains(lower))
                    .limit(20)
                    .collect(Collectors.toList());
        }
    }
}
