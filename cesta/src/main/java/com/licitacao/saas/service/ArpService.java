package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArpService {

    private final ComprasGovClient comprasGovClient;
    private static final Logger log = LoggerFactory.getLogger(ArpService.class);

    public List<PesquisaMaterialDTO> pesquisarArps(Integer codigoItemCatalogo) {
        log.info("Iniciando busca de ARPs para Item: {}", codigoItemCatalogo);
        List<PesquisaMaterialDTO> finalResults = new ArrayList<>();

        try {
            // 1. Get Items from ARP Module
            // Warning: API /2_consultarARPItem takes 'codigoItem'. 
            // Assuming this is Catmat/Catser ID.
            ArpItemResponseDTO itemsResponse = comprasGovClient.consultarItensArp(codigoItemCatalogo, 1, 10);
            
            if (itemsResponse != null && itemsResponse.getResultado() != null) {
                // Filter only active ARPs (dataVigenciaFinal > now) could be done here or in query if supported.
                // For now, fetch details and filter or flag.
                
                List<CompletableFuture<PesquisaMaterialDTO>> futures = itemsResponse.getResultado().stream()
                    .map(item -> CompletableFuture.supplyAsync(() -> processArpItem(item)))
                    .collect(Collectors.toList());

                CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

                for (CompletableFuture<PesquisaMaterialDTO> future : futures) {
                    PesquisaMaterialDTO result = future.get();
                    if (result != null) {
                        finalResults.add(result);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Erro buscando ARPs", e);
        }
        return finalResults;
    }

    private PesquisaMaterialDTO processArpItem(ArpItemDTO item) {
        try {
            // 2. Check Adhesion (UnidadesItem)
            boolean aceitaAdesao = false;
            try {
                ArpUnidadeItemResponseDTO adesaoResp = comprasGovClient.consultarUnidadesItem(item.getNumeroAtaRegistroPreco(), item.getNumeroItem());
                if (adesaoResp != null && adesaoResp.getResultado() != null && !adesaoResp.getResultado().isEmpty()) {
                    aceitaAdesao = adesaoResp.getResultado().get(0).isAceitaAdesao();
                }
            } catch (Exception ignored) {}

            // 3. Get Header for Link (Optional if not in Item)
            // Item DTO in JSON example has 'linkAtaPNCP' sometimes, or we fetch from Header.
            // Let's assume we might need to fetch header if link is missing.
            // But 'ArpItemDTO' for now has it added manually, we can populate if available or construct.
            // The JSON example user provided has "linkAtaPNCP" in /1_consultarARP result, but /2_consultarARPItem result 
            // doesn't explicitly show it in the example provided (it has numeroControlePncpAta).
            // So let's construct the link or fetch header.
            String link = null;
            if (item.getNumeroControlePncpAta() != null) {
                link = "https://pncp.gov.br/app/atas-registro-preco/" + item.getNumeroControlePncpAta() + "/resumo";
            }

            // Map to Unified DTO
            PesquisaMaterialDTO dto = new PesquisaMaterialDTO();
            // ID hack: ARP doesn't have idItemCompra in same way. We can leave null or hash.
            dto.setQuantidade(item.getQuantidadeHomologadaItem());
            dto.setPrecoUnitario(item.getValorUnitario());
            dto.setUnidade("Unidade"); // Not present in ARP item example explicitly?
            dto.setMarca(null); // Not present in example
            dto.setNomeFornecedor(item.getNomeRazaoSocialFornecedor());
            dto.setDataCompra(formatDate(item.getDataVigenciaFinal())); // Store Vigencia here or in specific field
            dto.setUasg(null); // or parse from codigoUnidadeGerenciadora
            dto.setNomeUasg(item.getNomeUnidadeGerenciadora());
            dto.setMunicipio(null);
            dto.setUf(null);
            
            dto.setOrigem("ARP");
            dto.setDataVigenciaFinal(item.getDataVigenciaFinal());
            dto.setAceitaAdesao(aceitaAdesao);
            dto.setLinkAtaPNCP(link);
            dto.setNumeroControlePNCP(item.getNumeroControlePncpAta());

            return dto;
        } catch (Exception e) {
            return null;
        }
    }
    
    private String formatDate(String rawDate) {
        try {
            if (rawDate == null) return null;
            if (rawDate.length() >= 10) return rawDate.substring(0, 10);
            return rawDate;
        } catch (Exception e) { return rawDate; }
    }
}
