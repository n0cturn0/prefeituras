package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.ServicoCatalogoDTO;
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
public class ServiceCacheService {

    private final ComprasGovClient client;
    private final List<ServicoCatalogoDTO> cache = new ArrayList<>();
    private boolean isLoaded = false;

    @PostConstruct
    public void init() {
        // Run loading in separate thread not to block application startup
        new Thread(this::loadCache).start();
    }

    @Scheduled(cron = "0 0 5 * * *") // Daily refresh at 5am
    public void loadCache() {
        try {
            log.info("Iniciando carregamento do Cache de Servicos Completos...");
            long start = System.currentTimeMillis();

            int paginaAtual = 1;
            int tamanhoPagina = 500;
            int totalPaginas = 1;
            
            List<ServicoCatalogoDTO> todosServicos = new ArrayList<>();

            do {
                var response = client.consultarServicosPaginado(paginaAtual, tamanhoPagina);
                if (response != null && response.getResultado() != null) {
                    todosServicos.addAll(response.getResultado());
                    
                    if (response.getTotalPaginas() != null) {
                        totalPaginas = response.getTotalPaginas();
                    }
                    
                    if (paginaAtual % 5 == 0) {
                       log.info("Carregando Servicos... Pagina {} de {}", paginaAtual, totalPaginas);
                    }
                } else {
                    log.warn("Falha ao obter página {} de serviços", paginaAtual);
                    break;
                }
                paginaAtual++;
                
                // Pause to avoid hammering public API
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }

            } while (paginaAtual <= totalPaginas);

            if (!todosServicos.isEmpty()) {
                synchronized (cache) {
                    cache.clear();
                    cache.addAll(todosServicos);
                }
                isLoaded = true;
                log.info("Cache de Servicos Completo carregado. Total: {} ({} ms)", cache.size(), System.currentTimeMillis() - start);
            } else {
                log.warn("Nenhum Servico foi carregado no cache.");
            }

        } catch (Exception e) {
            log.error("Erro ao carregar cache completo de servicos", e);
        }
    }

    public List<ServicoCatalogoDTO> search(String term) {
        if (!isLoaded || term == null || term.trim().length() < 3) return new ArrayList<>();

        String lowerTerm = term.toLowerCase().trim();
        
        synchronized (cache) {
            return cache.stream()
                    .filter(s -> s.getNomeServico() != null && s.getNomeServico().toLowerCase().contains(lowerTerm))
                    .limit(20)
                    .collect(Collectors.toList());
        }
    }
}
