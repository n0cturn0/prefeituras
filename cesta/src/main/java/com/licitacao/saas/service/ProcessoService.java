package com.licitacao.saas.service;

import com.licitacao.saas.domain.*;
import com.licitacao.saas.repository.CestaPrecoRepository;
import com.licitacao.saas.repository.ProcessoAdministrativoRepository;
import com.licitacao.saas.service.integration.dto.PesquisaMaterialDTO;
import com.licitacao.saas.web.dto.RelatorioCestaRequestDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProcessoService {

    private final ProcessoAdministrativoRepository processoRepository;
    private final CestaPrecoRepository cestaRepository;

    @Transactional
    public CestaPreco salvarCesta(RelatorioCestaRequestDTO request) {
        // 1. Find or Create Processo
        ProcessoAdministrativo processo = processoRepository.findByNumeroProcesso(request.getNumeroProcesso())
                .orElseGet(() -> ProcessoAdministrativo.builder()
                        .numeroProcesso(request.getNumeroProcesso())
                        .responsavel(request.getResponsavel() != null ? request.getResponsavel() : "N/A")
                        .objeto(request.getDescricaoObjeto() != null ? request.getDescricaoObjeto() : "Objeto indefinido")
                        .build());
        
        // Save process if new
        if (processo.getId() == null) {
            processo = processoRepository.save(processo);
        }

        // 2. Create Cesta
        CestaPreco cesta = CestaPreco.builder()
                .processo(processo)
                .usuarioId(UUID.randomUUID()) // Dummy for now, or extract from context
                .objeto(processo.getObjeto())
                .dataReferencia(LocalDateTime.now())
                .tipoCalculo(TipoCalculo.MEDIANA) // Defaulting to Median as per user focus
                .indiceReajuste(IndiceCorrecao.NENHUM)
                .status(StatusCesta.EM_ELABORACAO)
                .build();

        // 3. Map Items
        // 3. Map Items (Grouped by CATMAT or Description)
        // Grouping Strategy: Groups items that represent the same material so we can calculate stats (Median)
        Map<String, List<PesquisaMaterialDTO>> groupedItems = request.getItens().stream()
                .collect(Collectors.groupingBy(item -> {
                    if (item.getCodigoCatmat() != null && !item.getCodigoCatmat().isEmpty()) {
                        return "CATMAT:" + item.getCodigoCatmat();
                    }
                    if (item.getCodigoItemCatalogo() != null) { // PDM
                         return "PDM:" + item.getCodigoItemCatalogo();
                    }
                    // Fallback to description normalization (simple trim/uppercase)
                    return "DESC:" + (item.getDescricaoItem() != null ? item.getDescricaoItem().trim().toUpperCase() : "UNKNOWN");
                }));

        List<ItemCesta> itensCesta = new ArrayList<>();
        
        for (Map.Entry<String, List<PesquisaMaterialDTO>> entry : groupedItems.entrySet()) {
            List<PesquisaMaterialDTO> sources = entry.getValue();
            if (sources.isEmpty()) continue;
            
            PesquisaMaterialDTO reference = sources.get(0); // Use first as metadata reference
            
            ItemCesta itemCesta = ItemCesta.builder()
                    .cestaPreco(cesta)
                    .descricao(reference.getDescricaoItem() != null ? reference.getDescricaoItem() : "Item Agrupado")
                    .descricaoOriginal(reference.getDescricaoItem())
                    .codigoMaterialServico(entry.getKey().replace("CATMAT:", "").replace("PDM:", "").replace("DESC:", ""))
                    .unidadeMedida(reference.getUnidade() != null ? reference.getUnidade() : "UN")
                    .quantidade(BigDecimal.valueOf(reference.getQuantidade() > 0 ? reference.getQuantidade() : 1))
                    .build();
            
            // Map Sources
            List<FonteItemCesta> fontes = sources.stream().map(dto -> {
                BigDecimal valor = dto.getPrecoUnitario() != null ? BigDecimal.valueOf(dto.getPrecoUnitario()) : BigDecimal.ZERO;
                // Fallback for tricky formats (legacy logic preserved)
                if (valor.compareTo(BigDecimal.ZERO) == 0 && dto.getValorItemCompra() != null) {
                    try { valor = new BigDecimal(dto.getValorItemCompra().replace("R$", "").replace(".", "").replace(",", ".").trim()); } catch (Exception e) {}
                }
                
                TipoFonte tipoFonte = TipoFonte.OUTRO;
                if(dto.getOrigem() != null) {
                    if(dto.getOrigem().contains("PNCP")) tipoFonte = TipoFonte.PNCP;
                    else if(dto.getOrigem().contains("BPS")) tipoFonte = TipoFonte.BPS;
                }

                return FonteItemCesta.builder()
                        .itemCesta(itemCesta)
                        .tipoFonte(tipoFonte)
                        .nomeFornecedor(dto.getNomeFornecedor() != null ? dto.getNomeFornecedor() : "Fornecedor Desconhecido")
                        .cnpjFornecedor(dto.getNiFornecedor() != null ? dto.getNiFornecedor() : dto.getCnpjOrgao())
                        .ufOrigem(dto.getUfFornecedor() != null ? dto.getUfFornecedor() : dto.getUf())
                        .nomeMunicipio(dto.getMunicipioFornecedor() != null ? dto.getMunicipioFornecedor() : dto.getMunicipio())
                        .valorUnitario(valor)
                        .dataFonte(dto.getDataCompra() != null ? java.time.LocalDate.parse(dto.getDataCompra().substring(0, 10)) : java.time.LocalDate.now())
                        .numeroControlePncp(dto.getNumeroControlePNCP())
                        .linkComprovante(dto.getLinkAtaPNCP()) // Or construct link
                        .build();
            }).collect(Collectors.toList());
            
            itemCesta.setFontes(fontes);
            
            // Calculate Stats (Median)
            // Filter valid values > 0
            List<BigDecimal> values = fontes.stream()
                .map(FonteItemCesta::getValorUnitario)
                .filter(v -> v.compareTo(BigDecimal.ZERO) > 0)
                .sorted()
                .collect(Collectors.toList());
            
            if (!values.isEmpty()) {
                BigDecimal result;
                int size = values.size();
                if (size % 2 == 1) {
                    result = values.get(size / 2);
                } else {
                    result = values.get(size / 2 - 1).add(values.get(size / 2)).divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP);
                }
                itemCesta.setValorEstimado(result);
            } else {
                itemCesta.setValorEstimado(BigDecimal.ZERO);
            }

            itensCesta.add(itemCesta);
        }

        cesta.setItens(itensCesta);

        // 4. Save
        return cestaRepository.save(cesta);
    }
}
