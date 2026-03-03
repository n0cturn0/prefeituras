package com.licitacao.saas.web;

import com.licitacao.saas.service.RelatorioService;
import com.licitacao.saas.web.dto.RelatorioCestaRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService relatorioService;
    private final com.licitacao.saas.service.ProcessoService processoService;

    @PostMapping("/mapa-precos/pdf")
    public ResponseEntity<StreamingResponseBody> gerarMapaPrecosPdf(@RequestBody RelatorioCestaRequestDTO request) {
        // 1. Persist/Freeze Data (Audit)
        com.licitacao.saas.domain.CestaPreco cesta = processoService.salvarCesta(request);
        
        // 2. Generate PDF from frozen entity
        StreamingResponseBody stream = outputStream -> {
            relatorioService.gerarRelatorioMapaPrecos(cesta, outputStream);
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=mapa_precos.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(stream);
    }
}
