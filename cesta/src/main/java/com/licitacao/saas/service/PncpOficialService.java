package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.PncpClient;
import com.licitacao.saas.service.integration.dto.PncpAtaDTO;
import com.licitacao.saas.service.integration.dto.PncpAtasResponseDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PncpOficialService {

    private static final Logger log = LoggerFactory.getLogger(PncpOficialService.class);
    private final PncpClient pncpClient;

    public List<PncpAtaDTO> buscarAtasVigentes(String codigoItem, LocalDate dataInicial, LocalDate dataFinal, Integer pagina) {
        log.info("Buscando Atas no PNCP Oficial. Item: {}, Data: {} - {}", codigoItem, dataInicial, dataFinal);
        
        try {
            String startStr = dataInicial.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
            String endStr = dataFinal.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
            
            // Calling updated client with dates. Assuming 'codigoServico' is null for now as per use case.
            PncpAtasResponseDTO response = pncpClient.consultarAtas(startStr, endStr, codigoItem, null, pagina);
            
            if (response != null && response.getData() != null) {
                // Return data directly, API should filter by date range query, but we can verify if needed.
                return response.getData();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar PNCP Oficial", e);
            throw e; // Rethrow to let caller handle fallback if needed
        }
        
        return Collections.emptyList();
    }

    public List<com.licitacao.saas.service.integration.dto.PncpContratacaoDTO> buscarPublicacoes(
            LocalDate dataInicial, LocalDate dataFinal, String modalidade, String uf, String codigoMunicipioIbge, Integer pagina) {
        
        try {
            String startStr = dataInicial.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE); // YYYYMMDD
            String endStr = dataFinal.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
            
            var response = pncpClient.consultarContratacoesPorPublicacao(
                startStr, endStr, modalidade, uf, codigoMunicipioIbge, null, pagina
            );
            
            if (response != null && response.getData() != null) {
                return response.getData();
            }
        } catch (Exception e) {
            log.error("Erro ao buscar publicações PNCP", e);
        }
        return Collections.emptyList();
    }
    
    public List<com.licitacao.saas.service.integration.dto.PncpContratacaoDTO> buscarPropostasAbertas(String uf, String codigoMunicipioIbge, Integer pagina) {
        try {
            var response = pncpClient.consultarContratacoesPropostaAberta(uf, codigoMunicipioIbge, pagina);
            if (response != null && response.getData() != null) {
                return response.getData().stream()
                        .peek(c -> c.setRecebimentoProposta(true)) // Mark as open
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("Erro ao buscar propostas abertas PNCP", e);
        }
        return Collections.emptyList();
    }
}
