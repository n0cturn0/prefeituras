package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.PncpClient;
import com.licitacao.saas.service.integration.dto.PncpContratoDTO;
import com.licitacao.saas.service.integration.dto.PncpContratosSearchResponseDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PncpExecutionService {

    private static final Logger log = LoggerFactory.getLogger(PncpExecutionService.class);
    private final PncpClient pncpClient;

    public List<PncpContratoDTO> buscarContratos(
            LocalDate dataInicial, LocalDate dataFinal, String cnpjOrgao, String uf, String municipioIbge, Integer pagina) {
        
        try {
            String startStr = dataInicial.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
            String endStr = dataFinal.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
            
            PncpContratosSearchResponseDTO response = pncpClient.consultarContratos(
                startStr, endStr, cnpjOrgao, uf, municipioIbge, pagina
            );
            
            if (response != null && response.getData() != null) {
                return response.getData();
            }
        } catch (Exception e) {
            log.error("Erro ao buscar contratos/execução PNCP", e);
        }
        return Collections.emptyList();
    }
}
