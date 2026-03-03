package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContratoService {

    private final ComprasGovClient comprasGovClient;
    private static final Logger log = LoggerFactory.getLogger(ContratoService.class);

    public List<PesquisaMaterialDTO> pesquisarContratos(Integer codigoItemCatalogo) {
        log.info("Iniciando busca de Contratos para Item: {}", codigoItemCatalogo);
        List<PesquisaMaterialDTO> finalResults = new ArrayList<>();

        try {
            // Search Items directly in Contracts Module
            // Parameter 'codigoItem' matches CATMAT/CATSER.
            ContratoItemResponseDTO itemsResponse = comprasGovClient.consultarItensContrato(codigoItemCatalogo, 1, 10);
            
            if (itemsResponse != null && itemsResponse.getResultado() != null) {
                for (ContratoItemDTO item : itemsResponse.getResultado()) {
                   try {
                       PesquisaMaterialDTO dto = new PesquisaMaterialDTO();
                       
                       dto.setQuantidade(item.getQuantidadeItem());
                       dto.setPrecoUnitario(item.getValorUnitarioItem());
                       dto.setUnidade("Unidade"); 
                       dto.setNomeFornecedor(item.getNomeRazaoSocialFornecedor());
                       dto.setNiFornecedor(item.getNiFornecedor());
                       dto.setMarca(null); // Contracts usually don't specify marque in aggregation, or it's in detailed desc.
                       
                       dto.setUasg(null); 
                       dto.setNomeUasg(item.getNomeUnidadeGestora()); 
                       // Could parse UaS from codigoUnidadeGestora if needed (usually matches).

                       // Dates
                       dto.setDataCompra(formatDate(item.getDataVigenciaInicial())); // Use start date as reference? Or inclusion?
                       dto.setDataVigenciaInicial(item.getDataVigenciaInicial());
                       dto.setDataVigenciaFinal(item.getDataVigenciaFinal());
                       
                       dto.setOrigem("CONTRATO");
                       dto.setNumeroControlePNCP(item.getNumeroControlePncpContrato());
                       
                       finalResults.add(dto);
                   } catch (Exception e) {
                       log.error("Erro mapeando item contrato", e);
                   }
                }
            }
        } catch (Exception e) {
            log.error("Erro geral buscando Contratos", e);
        }
        return finalResults;
    }
    
    private String formatDate(String rawDate) {
        try {
            if (rawDate == null) return null;
            if (rawDate.length() >= 10) return rawDate.substring(0, 10);
            return rawDate;
        } catch (Exception e) { return rawDate; }
    }
}
