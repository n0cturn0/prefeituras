package com.licitacao.saas.web;

import com.licitacao.saas.service.ServicoCatalogoHierarquiaService;
import com.licitacao.saas.service.integration.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catser")
@RequiredArgsConstructor
public class ServicoCatalogoController {

    private final ServicoCatalogoHierarquiaService servicoService;

    @GetMapping("/secoes")
    public List<SecaoServicoDTO> listarSecoes() {
        return servicoService.listarSecoes();
    }

    @GetMapping("/divisoes")
    public List<DivisaoServicoDTO> listarDivisoes(@RequestParam Integer codigoSecao) {
        return servicoService.listarDivisoes(codigoSecao);
    }

    @GetMapping("/grupos")
    public List<GrupoServicoDTO> listarGrupos(@RequestParam Integer codigoDivisao) {
        return servicoService.listarGrupos(codigoDivisao);
    }

    @GetMapping("/classes")
    public List<ClasseServicoDTO> listarClasses(@RequestParam Integer codigoGrupo) {
        return servicoService.listarClasses(codigoGrupo);
    }

    @GetMapping("/subclasses")
    public List<SubclasseServicoDTO> listarSubclasses(@RequestParam Integer codigoClasse) {
        return servicoService.listarSubclasses(codigoClasse);
    }

    @GetMapping("/servicos")
    public List<ServicoCatalogoDTO> listarServicos(@RequestParam Integer codigoSubclasse) {
        return servicoService.listarServicos(codigoSubclasse);
    }

    @GetMapping("/unidades")
    public List<UnidadeMedidaServicoDTO> listarUnidades(@RequestParam Integer codigoServico) {
        return servicoService.listarUnidadesMedida(codigoServico);
    }

    @GetMapping("/naturezas")
    public List<NaturezaDespesaServicoDTO> listarNaturezas(@RequestParam Integer codigoServico) {
        return servicoService.listarNaturezasDespesa(codigoServico);
    }
}
