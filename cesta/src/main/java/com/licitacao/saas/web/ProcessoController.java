package com.licitacao.saas.web;

import com.licitacao.saas.domain.CestaPreco;
import com.licitacao.saas.service.ProcessoService;
import com.licitacao.saas.web.dto.RelatorioCestaRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/processos")
@RequiredArgsConstructor
public class ProcessoController {

    private final ProcessoService processoService;

    @PostMapping("/{numero}/cesta")
    public ResponseEntity<UUID> salvarCesta(@PathVariable String numero, @RequestBody RelatorioCestaRequestDTO request) {
        // Ensure the numero in path matches body or override
        request.setNumeroProcesso(numero);
        CestaPreco saved = processoService.salvarCesta(request);
        return ResponseEntity.ok(saved.getId());
    }
}
