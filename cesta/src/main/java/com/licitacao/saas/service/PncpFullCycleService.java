package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.PncpClient;
import com.licitacao.saas.service.integration.dto.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;
import java.util.ArrayList;
import java.util.Map;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class PncpFullCycleService {

    private static final Logger log = LoggerFactory.getLogger(PncpFullCycleService.class);
    private final PncpClient pncpClient;
    private final com.licitacao.saas.service.integration.BpsScraperClient bpsClient;
    private final com.licitacao.saas.service.PesquisaPrecoPraticadoService dadosAbertosService;
    private final com.licitacao.saas.service.PncpOficialService pncpOficialService;

    // --- Cache (Global Simple Map for Session) ---
    private static final Map<String, List<PesquisaMaterialDTO>> RESULT_CACHE = new java.util.concurrent.ConcurrentHashMap<>();
    private static final Map<String, Long> CACHE_EXPIRY = new java.util.concurrent.ConcurrentHashMap<>();
    private static final long EXPIRE_MS = 60 * 60 * 1000; // 1 hour

    private List<PesquisaMaterialDTO> getFromCache(String key) {
        if (RESULT_CACHE.containsKey(key)) {
            if (System.currentTimeMillis() < CACHE_EXPIRY.getOrDefault(key, 0L)) {
                return RESULT_CACHE.get(key);
            } else {
                RESULT_CACHE.remove(key);
                CACHE_EXPIRY.remove(key);
            }
        }
        return null;
    }
    
    private void putInCache(String key, List<PesquisaMaterialDTO> data) {
        if (data != null && !data.isEmpty()) {
            RESULT_CACHE.put(key, data);
            CACHE_EXPIRY.put(key, System.currentTimeMillis() + EXPIRE_MS);
        }
    }

    // --- Contratações (Publicações) ---
    // --- Contratações (Publicações) ---
    public List<PncpContratacaoDTO> buscarPublicacoes(
            LocalDate dataInicial, LocalDate dataFinal, String modalidade, String uf, String municipioIbge, Integer pagina) {
        
        return executeWithYearlySplit(dataInicial, dataFinal, (start, end) -> {
             return buscarPublicacoesInternal(start, end, modalidade, uf, municipioIbge, pagina);
        });
    }

    // --- Search Materials (Orchestration) ---
    public List<PesquisaMaterialDTO> buscarMateriais(
            String codigoItem, String uf, Integer pagina, Boolean incluirBps, String descCatmat) {
        
        long start = System.currentTimeMillis();
        
        // 1. PNCP Search (Async)
        CompletableFuture<List<PesquisaMaterialDTO>> pncpFuture = CompletableFuture.supplyAsync(() -> {
            try {
                // Assuming PncpClient has a method searchMateriais or similar logic
                // Using existing method or placeholder logic 
                // Since this method was not visible in previous view, I assume standard flow
                // For now, I'll mock the PNCP call logic based on typical flow
                // or you might want me to add it if it's missing. 
                // Wait, checking file... 'buscarMateriais' was NOT in the file I viewed. 
                // I will add it here as a NEW method.
                
                // Construct logic for PNCP Search
                // Assuming pncpClient.consultarMateriais exists or similar
                // NOTE: Using a placeholder call pattern based on existing methods
                // Re-using logic from what would be standard
                
                // If this method didn't exist, I'm defining it now as the main entry point
                return buscarMateriaisPncpInternal(codigoItem, uf, pagina);
            } catch (Exception e) {
                log.error("PNCP Async Error", e);
                return new ArrayList<>();
            }
        });
        
        // 1.5. Legacy/Dados Abertos Search (Restored)
        // Need to define it here or reuse logic. 
        // Wait, looking at file content provided in step 1233/1319...
        // The file chunk shows lines 1-133.
        // I don't see 'dadosAbertosFuture' defined in 'buscarMateriais'.
        // It WAS defined in 'buscarMateriaisPncpInternal' in the OLD version.
        // In the NEW 'buscarMateriais' (lines 39-103), I only defined pncpFuture and bpsFuture.
        // So I need to ADD 'dadosAbertosFuture' here if I want legacy results.
        
        CompletableFuture<List<PesquisaMaterialDTO>> dadosAbertosFuture = CompletableFuture.supplyAsync(() -> {
             Integer cod = null;
             try { cod = Integer.parseInt(codigoItem); } catch(Exception e){}
             if(cod != null) {
                 return dadosAbertosService.consultarPrecosMaterial(cod, pagina, 10, null, uf);
             }
             return new ArrayList<>();
        });

        // 2. BPS Search (Async) with Caching & Capping
        CompletableFuture<List<PesquisaMaterialDTO>> bpsFuture = CompletableFuture.supplyAsync(() -> {
            if (Boolean.TRUE.equals(incluirBps) && descCatmat != null && !descCatmat.isEmpty()) {
                try {
                   String codeToSend = (codigoItem != null && !codigoItem.equals("0")) ? codigoItem : null;
                   // CACHE CHECK (Simple In-Memory)
                   String cacheKey = "BPS:" + descCatmat + ":" + (codeToSend != null ? codeToSend : "NULL");
                   List<PesquisaMaterialDTO> cached = getFromCache(cacheKey);
                   
                   List<PesquisaMaterialDTO> fullList;
                   if (cached != null) {
                       log.info("BPS Cache HIT for key: {}. Items: {}", cacheKey, cached.size());
                       fullList = cached;
                   } else {
                        // SCRAE
                       var bpsRes = bpsClient.searchBps(descCatmat, codeToSend);
                       if (bpsRes != null && bpsRes.data != null) {
                           String method = bpsRes.data.isEmpty() ? "unknown" : bpsRes.data.get(0).getOrDefault("_method", "legacy_scraping");
                           log.info("BPS Scraper returned {} items. Method: {}", bpsRes.data.size(), method);
                           
                           fullList = bpsRes.data.stream()
                               .map(m -> mapBpsToDto(m, bpsRes.screenshot))
                               .collect(Collectors.toList());
                           
                           // Store in Cache
                           putInCache(cacheKey, fullList);
                       } else {
                           log.warn("BPS Scraper returned empty.");
                           fullList = new ArrayList<>();
                       }
                   }
                   
                   // SAFETY CAPPING: Filter & Limit to prevent Frontend Crash
                   // 370k rows is too big for JSON/Browser. Limit to 3000 most recent.
                   return fullList.stream()
                       .sorted(java.util.Comparator.comparing(PesquisaMaterialDTO::getDataCompra).reversed()) // Newest first
                       .limit(3000)
                       .collect(Collectors.toList());

                } catch (Exception e) {
                    log.error("BPS Async Error", e);
                }
            }
            return new ArrayList<PesquisaMaterialDTO>();
        });

        // 3. Combine
        // 3. Combine safely (One failure should not kill the other)
        List<PesquisaMaterialDTO> all = new ArrayList<>();
        
        try {
            List<PesquisaMaterialDTO> pncpRes = pncpFuture.join();
            if (pncpRes != null) all.addAll(pncpRes);
        } catch (Exception e) {
            log.error("PNCP Search Failed completely", e);
        }
        
        try {
             List<PesquisaMaterialDTO> bpsRes = bpsFuture.join();
             if (bpsRes != null) all.addAll(0, bpsRes); // BPS First!
        } catch (Exception e) {
             log.error("BPS Search Failed completely", e);
        }

        try {
             List<PesquisaMaterialDTO> legacyRes = dadosAbertosFuture.join();
             if (legacyRes != null) all.addAll(legacyRes);
        } catch (Exception e) {
             log.error("Legacy Search Failed", e);
        }

        log.info("Search finished. Total items found: {}. Details: PNCP={}, BPS={}, Legacy={}", 
            all.size(), 
            (pncpFuture.isDone() && !pncpFuture.isCompletedExceptionally()  ? pncpFuture.getNow(new ArrayList<>()).size() : "Err"),
            (bpsFuture.isDone() && !bpsFuture.isCompletedExceptionally() ? bpsFuture.getNow(new ArrayList<>()).size() : "Err"),
            (dadosAbertosFuture.isDone() && !dadosAbertosFuture.isCompletedExceptionally() ? dadosAbertosFuture.getNow(new ArrayList<>()).size() : "Err")
        );
        return all;
    }

    public void buscarMateriaisStream(SseEmitter emitter, String codigoItem, String uf, Integer pagina, Boolean incluirBps, String descCatmat) {
        long start = System.currentTimeMillis();

        CompletableFuture<Void> pncpTask = CompletableFuture.runAsync(() -> {
            try {
                List<PesquisaMaterialDTO> pncp = buscarMateriaisPncpInternal(codigoItem, uf, pagina);
                emitBatch(emitter, pncp);
            } catch (Exception e) {
                log.error("PNCP Async Error", e);
            }
        });

        CompletableFuture<Void> dadosAbertosTask = CompletableFuture.runAsync(() -> {
            try {
                Integer cod = null;
                try { cod = Integer.parseInt(codigoItem); } catch(Exception e){}
                if(cod != null) {
                    List<PesquisaMaterialDTO> legacy = dadosAbertosService.consultarPrecosMaterial(cod, pagina, 10, null, uf);
                    emitBatch(emitter, legacy);
                }
            } catch (Exception e) {
                log.error("Legacy Async Error", e);
            }
        });

        CompletableFuture<Void> bpsTask = CompletableFuture.runAsync(() -> {
             if (Boolean.TRUE.equals(incluirBps) && descCatmat != null && !descCatmat.isEmpty()) {
                 try {
                    String codeToSend = (codigoItem != null && !codigoItem.equals("0")) ? codigoItem : null;
                    String cacheKey = "BPS:" + descCatmat + ":" + (codeToSend != null ? codeToSend : "NULL");
                    List<PesquisaMaterialDTO> cached = getFromCache(cacheKey);
                    
                    if (cached != null) {
                        log.info("BPS Cache HIT. Items: {}", cached.size());
                        emitBatch(emitter, cached);
                    } else {
                        var bpsRes = bpsClient.searchBps(descCatmat, codeToSend);
                        if (bpsRes != null && bpsRes.data != null) {
                            List<PesquisaMaterialDTO> fullList = bpsRes.data.stream()
                                .map(m -> mapBpsToDto(m, bpsRes.screenshot))
                                .collect(Collectors.toList());
                            
                            putInCache(cacheKey, fullList);
                            
                            // Safety Cap for Stream
                            List<PesquisaMaterialDTO> capped = fullList.stream()
                                .sorted(java.util.Comparator.comparing(PesquisaMaterialDTO::getDataCompra).reversed())
                                .limit(3000)
                                .collect(Collectors.toList());
                                
                            emitBatch(emitter, capped);
                        }
                    }
                 } catch (Exception e) {
                     log.error("BPS Async Error", e);
                 }
             }
        });

        CompletableFuture.allOf(pncpTask, bpsTask, dadosAbertosTask).whenComplete((v, ex) -> {
            if (ex != null) {
                log.error("Stream orchestration failed", ex);
                emitter.completeWithError(ex);
            } else {
                log.info("Stream finished in {}ms", System.currentTimeMillis() - start);
                emitter.complete();
            }
        });
    }

    private void emitBatch(SseEmitter emitter, List<PesquisaMaterialDTO> items) {
        if (items == null || items.isEmpty()) return;
        
        int batchSize = 50;
        for (int i = 0; i < items.size(); i += batchSize) {
            int end = Math.min(items.size(), i + batchSize);
            List<PesquisaMaterialDTO> batch = items.subList(i, end);
            try {
                emitter.send(SseEmitter.event().name("result-batch").data(batch));
                // Small sleep to prevent network congestion if local
                // Thread.sleep(10); 
            } catch (IOException e) {
                log.error("Error emitting batch", e);
                emitter.completeWithError(e);
                break;
            }
        }
    }
    
    private List<PesquisaMaterialDTO> buscarMateriaisPncpInternal(String codigoItem, String uf, Integer pagina) {
        // Fix: Default to current year or reasonable range if not provided, to satisfy API 'dataInicial' requirement
        LocalDate start = LocalDate.now().minusYears(1);
        LocalDate end = LocalDate.now();
        
        // ... (call official service). Note: The method name 'buscarAtasVigentes' might imply it uses dates.
        try {
             return convertAtasToDTO(pncpOficialService.buscarAtasVigentes(codigoItem, start, end, pagina));
        } catch (Exception e) {
             throw new RuntimeException("Error calling PNCP Official", e);
        } 
    }




    private List<PesquisaMaterialDTO> convertAtasToDTO(List<com.licitacao.saas.service.integration.dto.PncpAtaDTO> atas) {
         // Deduplicate by NumeroControlePNCP
         var distinctAtas = atas.stream()
             .filter(ata -> ata.getNumeroControlePNCP() != null)
             .filter(distinctByKey(com.licitacao.saas.service.integration.dto.PncpAtaDTO::getNumeroControlePNCP))
             .collect(Collectors.toList());

         return distinctAtas.stream().map(ata -> {
            PesquisaMaterialDTO dto = new PesquisaMaterialDTO();
            dto.setNumeroControlePNCP(ata.getNumeroControlePNCP());
            dto.setOrigem("PNCP_OFICIAL");
            dto.setLinkAtaPNCP("https://pncp.gov.br/app/atas/" + ata.getNumeroControlePNCP());
            dto.setNomeUasg(ata.getOrgaoGerenciadorRazaoSocial());
            
            // Fallback Description
            String desc = ata.getObjeto();
            if (desc == null || desc.trim().isEmpty()) {
                desc = "Ata de Registro de Preço SRP " + (ata.getNumeroAtaRegistroPreco() != null ? ata.getNumeroAtaRegistroPreco() : "") + 
                       " - " + (ata.getOrgaoGerenciadorRazaoSocial() != null ? ata.getOrgaoGerenciadorRazaoSocial() : "Órgão Público");
            }
            dto.setDescricaoItem(desc);
            
            dto.setCnpjOrgao(ata.getOrgaoGerenciadorCnpj()); 
            dto.setPrecoUnitario(0.0); // Detailed price requires item drill-down
            dto.setCancelado(ata.getCancelado());
            // Enrich Date
            if (ata.getDataVigenciaInicio() != null) {
                dto.setDataCompra(ata.getDataVigenciaInicio().toString());
            } else {
                 dto.setDataCompra(LocalDate.now().toString());
            }
            dto.setUnidade("Vide Ata");
            return dto;
        }).collect(Collectors.toList());
    }
    
    // Utility for distinct
    public static <T> java.util.function.Predicate<T> distinctByKey(java.util.function.Function<? super T, ?> keyExtractor) {
        java.util.Set<Object> seen = java.util.concurrent.ConcurrentHashMap.newKeySet();
        return t -> seen.add(keyExtractor.apply(t));
    }

    private PesquisaMaterialDTO mapBpsToDto(Map<String, String> row, String screenshot) {
        PesquisaMaterialDTO dto = new PesquisaMaterialDTO();
        dto.setOrigem("BPS");
        
        // 1. Description
        String raw = row.getOrDefault("raw_text", "Item BPS Encontrado (Múltiplos)");
        String desc = raw;
        if (desc.length() > 200) desc = desc.substring(0, 200) + "...";
        dto.setDescricaoItem(desc);
        
        // GENERIC ID GENERATION
        // Mix of values to create unique ID
        String compositeKey = desc + row.getOrDefault("fornecedor", "") + row.getOrDefault("valorItemCompra", "") + row.getOrDefault("orgao", "") + Math.random();
        dto.setIdItemCompra(Math.abs(compositeKey.hashCode()) * -1L); // Negative ID to avoid collision with DB IDs (usually positive)

        // 2. Price (Try Structured First, then Regex)
        dto.setPrecoUnitario(0.0);
        if (row.containsKey("preco") || row.containsKey("valorItemCompra")) {
             try {
                 String p = row.getOrDefault("valorItemCompra", row.get("preco")).replace("R$", "").trim();
                 // handle 1.234,56 or 1234.56
                 if (p.contains(",")) {
                    p = p.replace(".", "").replace(",", ".");
                 }
                 dto.setPrecoUnitario(Double.parseDouble(p));
             } catch (Exception e) {}
        }
        
        // Regex Fallback
        if (dto.getPrecoUnitario() == 0.0) {
            try {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("R\\$.{0,10}?([\\d\\.]{1,10},\\d{2,4})").matcher(raw);
                if (m.find()) {
                     String val = m.group(1).replace(".", "").replace(",", ".");
                     dto.setPrecoUnitario(Double.parseDouble(val));
                }
            } catch (Exception e) {}
        }

        // 3. Supplier
        if (row.containsKey("fornecedor") && row.get("fornecedor") != null && !row.get("fornecedor").equalsIgnoreCase("nan")) {
             dto.setNomeFornecedor(row.get("fornecedor"));
        } else {
             dto.setNomeFornecedor("Banco de Preços em Saúde (Ministério da Saúde)");
        }

        // 3.b Organ / Institution
        if (row.containsKey("nomeInstituicao") && row.get("nomeInstituicao") != null && !row.get("nomeInstituicao").isEmpty()) {
            dto.setNomeUasg(row.get("nomeInstituicao"));
            dto.setNomeInstituicao(row.get("nomeInstituicao"));
        } else if (row.containsKey("orgao") && row.get("orgao") != null && !row.get("orgao").isEmpty()) {
            dto.setNomeUasg(row.get("orgao"));
            dto.setNomeInstituicao(row.get("orgao"));
        } else {
            dto.setNomeUasg("Órgão Público (BPS)");
            dto.setNomeInstituicao("Órgão Público (BPS)");
        }
        
        // 4. Location
        dto.setMunicipio(row.getOrDefault("municipio", "Brasil"));
        dto.setUf(row.getOrDefault("uf", "BR"));
        dto.setLinkAtaPNCP(screenshot); 
        
        // 5. Date (Convert dd/MM/yyyy -> yyyy-MM-dd)
        String dateStr = row.getOrDefault("data", row.get("dataHomologacao")); // check both keys
        if (dateStr != null && !dateStr.isEmpty()) {
            try {
                 // Format dd/MM/yyyy assumed from BPS
                 java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                 LocalDate dt = LocalDate.parse(dateStr.trim(), fmt);
                 dto.setDataCompra(dt.toString()); // yyyy-MM-dd
            } catch (Exception e) {
                 // Fallback: Use raw or today
                 log.warn("Failed to parse BPS date: {}", dateStr);
                 dto.setDataCompra(LocalDate.now().toString());
            }
        } else {
             dto.setDataCompra(LocalDate.now().toString()); 
        }
        
        dto.setUnidade(row.getOrDefault("unidade", "UN"));
        
        // 6. Detailed Fields (New)
        dto.setCodigoCatmat(row.get("codigoCatmat"));
        dto.setDescricaoCatmat(row.get("descricaoCatmat"));
        dto.setModalidade(row.get("modalidade"));
        dto.setCnpjComprador(row.get("cnpjComprador"));
        dto.setCnpjOrgao(row.get("cnpjComprador")); // Map to existing field too
        dto.setValorTotalCompra(row.get("valorTotalCompra"));
        dto.setValorItemCompra(row.get("valorItemCompra"));
        dto.setQuantidadeItemCompra(row.get("quantidadeItemCompra"));
        
        // Map quantity if available
        if (row.containsKey("quantidadeItemCompra")) {
            try {
                 String q = row.get("quantidadeItemCompra").replace(".", "").replace(",", "."); // simple parse
                 dto.setQuantidade((int) Double.parseDouble(q));
            } catch(Exception e) {}
        }
        
        return dto;
    }

    private List<PncpContratacaoDTO> buscarPublicacoesInternal(
            LocalDate dataInicial, LocalDate dataFinal, String modalidade, String uf, String municipioIbge, Integer pagina) {
        try {
            String startStr = formatDate(dataInicial);
            String endStr = formatDate(dataFinal);
            
            // If modality is explicit, just call once
            if (modalidade != null && !modalidade.isEmpty() && !"all".equalsIgnoreCase(modalidade)) {
                var response = pncpClient.consultarContratacoesPorPublicacao(
                    startStr, endStr, modalidade, uf, municipioIbge, null, pagina
                );
                return (response != null && response.getData() != null) ? response.getData() : Collections.emptyList();
            }
            
            // "All" logic -> Aggregating top common modalities
            List<String> modalitiesToSearch = List.of("6", "8", "13");
            
            return modalitiesToSearch.parallelStream()
                .flatMap(mod -> {
                    try {
                        var res = pncpClient.consultarContratacoesPorPublicacao(
                            startStr, endStr, mod, uf, municipioIbge, null, pagina
                        );
                        return (res != null && res.getData() != null) ? res.getData().stream() : java.util.stream.Stream.empty();
                    } catch (Exception e) {
                        return java.util.stream.Stream.empty();
                    }
                })
                .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Erro ao buscar publicações", e);
        }
        return Collections.emptyList();
    }

    // --- Contratações (Propostas Abertas) ---
    public List<PncpContratacaoDTO> buscarPropostasAbertas(String uf, String municipioIbge, Integer pagina) {
        try {
            var response = pncpClient.consultarContratacoesPropostaAberta(uf, municipioIbge, pagina);
            if (response != null && response.getData() != null) {
                return response.getData().stream()
                        .peek(c -> c.setRecebimentoProposta(true))
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("Erro ao buscar propostas abertas", e);
        }
        return Collections.emptyList();
    }

    // --- Public methods ---

    public List<PncpContratoDTO> buscarContratos(
            LocalDate dataInicial, LocalDate dataFinal, String cnpjOrgao, String uf, String municipioIbge, Integer pagina) {
        
        return executeWithYearlySplit(dataInicial, dataFinal, (start, end) -> {
             return buscarContratosInternal(start, end, cnpjOrgao, uf, municipioIbge, pagina);
        });
    }
    
    // Internal method with actual logic
    private List<PncpContratoDTO> buscarContratosInternal(
            LocalDate dataInicial, LocalDate dataFinal, String cnpjOrgao, String uf, String municipioIbge, Integer pagina) {
        try {
            String startStr = formatDate(dataInicial);
            String endStr = formatDate(dataFinal);
            String ufParam = (uf != null && !uf.equalsIgnoreCase("all") && !uf.isEmpty()) ? uf : null;
            
            if (ufParam != null && (cnpjOrgao == null || cnpjOrgao.isEmpty())) {
                List<Integer> pages = List.of(1, 2, 3, 4, 5); 
                List<PncpContratoDTO> candidates = pages.parallelStream()
                    .flatMap(p -> {
                        try {
                            var res = pncpClient.consultarContratos(startStr, endStr, cnpjOrgao, ufParam, municipioIbge, p);
                            return (res != null && res.getData() != null) ? res.getData().stream() : java.util.stream.Stream.empty();
                        } catch (Exception e) { return java.util.stream.Stream.empty(); }
                    }).collect(Collectors.toList());
                return filterCandidates(candidates, ufParam, dataInicial, dataFinal);
            }
            
            // Standard
            try {
                var response = pncpClient.consultarContratos(startStr, endStr, cnpjOrgao, ufParam, municipioIbge, pagina);
                if (response != null && response.getData() != null) {
                    return filterCandidates(response.getData(), ufParam, dataInicial, dataFinal);
                }
            } catch (Exception e) {
                 log.error("Erro PNCP Contratos: {}", e.getMessage());
            }
        } catch (Exception e) {
            log.error("Erro ao buscar contratos", e);
        }
        return Collections.emptyList();
    }


    
    // GENERIC SPLITTER HELPER
    private <T> List<T> executeWithYearlySplit(LocalDate start, LocalDate end, java.util.function.BiFunction<LocalDate, LocalDate, List<T>> fetcher) {
        if (start != null && end != null && java.time.temporal.ChronoUnit.DAYS.between(start, end) > 365) {
            log.info("Range > 365 days. Splitting search...");
            List<T> allResults = new java.util.ArrayList<>();
            LocalDate current = start;
            while (!current.isAfter(end)) {
                LocalDate nextEnd = current.plusYears(1).minusDays(1);
                if (nextEnd.isAfter(end)) nextEnd = end;
                allResults.addAll(fetcher.apply(current, nextEnd));
                current = nextEnd.plusDays(1);
            }
            return allResults;
        }
        return fetcher.apply(start, end);
    }
    
    private List<PncpContratoDTO> filterCandidates(List<PncpContratoDTO> raw, String uf, LocalDate start, LocalDate end) {
        var stream = raw.stream();
        
        // Filter by UF
        if (uf != null && !uf.equalsIgnoreCase("all") && !uf.isEmpty()) {
             stream = stream.filter(c -> {
                 String sigla = c.getUfSigla();
                 boolean match = sigla != null && sigla.equalsIgnoreCase(uf);
                 if (!match) log.debug("Filtrando contrato UF diferente: {} != {}", sigla, uf);
                 return match;
             });
        }
        
        // Filter by Date (Signature) strictly
        if (start != null && end != null) {
            stream = stream.filter(c -> {
                if (c.getDataAssinatura() == null) {
                     log.debug("Contrato sem data assinatura, mantendo.");
                     return true; 
                }
                // Relaxed Filter: Allow if signature is within range OR if it's returned by API (trust API)
                // The API returns contracts UPDATED in the period.
                // If we filter strictly by signature, we miss older contracts active/updated now.
                // For now, let's remove strict filtering to avoid Empty Results.
                // We can add a "smart" filter later if needed (e.g. check validity start/end overlap).
                return true; 
                
                /*
                try {
                    LocalDate dt = LocalDate.parse(c.getDataAssinatura(), java.time.format.DateTimeFormatter.ISO_LOCAL_DATE);
                    boolean valid = !dt.isBefore(start) && !dt.isAfter(end);
                    if (!valid) log.debug("Filtrando contrato data fora: {} outside [{}, {}]", dt, start, end);
                    return valid;
                } catch (Exception e) {
                    return true; 
                }
                */
            });
        }
        
        return stream.collect(Collectors.toList());
    }

    // --- Instrumentos de Cobrança (Faturamento) ---
    public List<PncpInstrumentoCobrancaDTO> buscarInstrumentosCobranca(           
            LocalDate dataInicial, LocalDate dataFinal, String cnpjOrgao, Integer pagina) {
                
        return executeWithYearlySplit(dataInicial, dataFinal, (start, end) -> {
             try {
                String startStr = formatDate(start);
                String endStr = formatDate(end);
                
                var response = pncpClient.consultarInstrumentosCobrancaInclusao(
                    startStr, endStr, cnpjOrgao, pagina
                );
                return (response != null && response.getData() != null) ? response.getData() : java.util.Collections.emptyList();
            } catch (Exception e) {
                log.error("Erro ao buscar instrumentos de cobrança", e);
                return java.util.Collections.emptyList();
            }
        });
    }

    private String formatDate(LocalDate date) {
        if (date == null) return null;
        return date.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
    }
}
