package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.FornecedorDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FornecedorService {

    private final ComprasGovClient comprasGovClient;
    private static final Logger log = LoggerFactory.getLogger(FornecedorService.class);

    public FornecedorDTO consultarFornecedor(String ni) {
        if (ni == null || ni.trim().isEmpty()) return null;
        
        // Sanitize NI (remove dots, slashes, dashes)
        String sanitizedNi = ni.replaceAll("[^0-9]", "");
        
        try {
            log.info("Consultando Fornecedor NI: {}", sanitizedNi);
            return comprasGovClient.consultarFornecedor(sanitizedNi);
        } catch (Exception e) {
            log.warn("Erro ao consultar fornecedor {}: {}", ni, e.getMessage());
            // Return null or empty DTO to avoid breaking flow
            return null;
        }
    }
}
