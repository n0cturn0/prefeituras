package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PesquisaPrecoPraticadoService {

    private static final Logger log = LoggerFactory.getLogger(PesquisaPrecoPraticadoService.class);

    private final ComprasGovClient comprasGovClient;
    private final PdmCacheService pdmCacheService;
    private final ServiceClassCacheService serviceClassCacheService;
    private final ServiceCacheService serviceCacheService;

    public List<PesquisaMaterialDTO> consultarPrecosMaterial(Integer codigoItemCatalogo, Integer pagina, Integer tamanhoPagina, String municipio, String uf) {
        try {
            PesquisaMaterialResponseDTO response = comprasGovClient.consultarPrecoMaterial(codigoItemCatalogo, pagina, tamanhoPagina);
            if (response != null && response.getResultado() != null) {
                // Regional Filtering Logic
                if (municipio != null || uf != null) {
                    return response.getResultado().stream()
                            .sorted(Comparator.comparing((PesquisaMaterialDTO item) -> {
                                boolean sameMunicipality = municipio != null && municipio.equalsIgnoreCase(item.getMunicipio());
                                boolean sameState = uf != null && uf.equalsIgnoreCase(item.getUf());
                                
                                if (sameMunicipality) return 0; // Highest priority
                                if (sameState) return 1;        // Medium priority
                                return 2;                       // Low priority
                            }))
                            .collect(Collectors.toList());
                }
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Preços de Material", e);
        }
        return Collections.emptyList();
    }
    
    public PesquisaMaterialDetalheDTO consultarPrecoMaterialDetalhe(Long idItemCompra) {
         try {
            PesquisaMaterialDetalheResponseDTO response = comprasGovClient.consultarPrecoMaterialDetalhe(idItemCompra);
            if (response != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Detalhe de Preço de Material", e);
        }
        return null;
    }

    public List<PesquisaServicoDTO> consultarPrecosServico(Integer codigoServico, Integer pagina, Integer tamanhoPagina, String municipio, String uf) {
        try {
            PesquisaServicoResponseDTO response = comprasGovClient.consultarPrecoServico(codigoServico, pagina, tamanhoPagina);
            if (response != null && response.getResultado() != null) {
                 // Regional Filtering Logic
                if (municipio != null || uf != null) {
                    return response.getResultado().stream()
                            .sorted(Comparator.comparing((PesquisaServicoDTO item) -> {
                                boolean sameMunicipality = municipio != null && municipio.equalsIgnoreCase(item.getMunicipio());
                                boolean sameState = uf != null && uf.equalsIgnoreCase(item.getUf());
                                
                                if (sameMunicipality) return 0;
                                if (sameState) return 1;
                                return 2;
                            }))
                            .collect(Collectors.toList());
                }
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Preços de Serviço", e);
        }
        return Collections.emptyList();
    }
    
    public PesquisaServicoDetalheDTO consultarPrecoServicoDetalhe(Long idItemCompra) {
         try {
            PesquisaServicoDetalheResponseDTO response = comprasGovClient.consultarPrecoServicoDetalhe(idItemCompra);
            if (response != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Detalhe de Preço de Serviço", e);
        }
        return null;
    }

    public List<com.licitacao.saas.web.dto.AutocompleteDTO> autocomplete(String term, String type) {
        List<com.licitacao.saas.web.dto.AutocompleteDTO> results = new java.util.ArrayList<>();
        
        try {
            boolean searchMaterial = "MATERIAL".equalsIgnoreCase(type) || type == null;
            boolean searchService = "SERVICO".equalsIgnoreCase(type) || type == null;
            
            // Materials
            if (searchMaterial) {
                try {
                     var pdmResults = pdmCacheService.search(term);
                     pdmResults.forEach(pdm -> 
                         results.add(new com.licitacao.saas.web.dto.AutocompleteDTO(
                            String.valueOf(pdm.getCodigoPdm()), 
                            pdm.getNomePdm(), 
                            "PDM" // Using special type PDM to indicate category search
                        ))
                     );
                } catch (Exception e) { log.warn("Erro autocomplete material (PDM): " + e.getMessage()); }
            }
            
            // Services
            if (searchService) {
                try {
                    // 1. Classes de Serviço via Cache
                    var classResults = serviceClassCacheService.search(term);
                    classResults.forEach(c -> 
                         results.add(new com.licitacao.saas.web.dto.AutocompleteDTO(
                            String.valueOf(c.getCodigoClasse()), // Using Class Code
                            c.getNomeClasse(), 
                            "SERVICO_CLASS" // New type
                        ))
                    );
                    
                    // Use Cache for service exact text matching
                    if (term != null && term.length() >= 3) {
                        var servicosApi = serviceCacheService.search(term);
                        servicosApi.forEach(s ->
                            results.add(new com.licitacao.saas.web.dto.AutocompleteDTO(
                                String.valueOf(s.getCodigoServico()),
                                s.getNomeServico(),
                                "SERVICO"
                            ))
                        );
                    }

                } catch (Exception e) { log.warn("Erro autocomplete servico: " + e.getMessage()); }
            }
            
        } catch (Exception e) {
            log.error("Erro geral autocomplete", e);
        }
        
        return results;
    }
    public List<com.licitacao.saas.service.integration.dto.ItemMaterialDTO> consultarItensPorPdm(Integer pdm) {
        try {
            var response = comprasGovClient.consultarItens(pdm);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar itens por PDM", e);
        }
        return Collections.emptyList();
    }
}
