package com.licitacao.saas.web;

import com.licitacao.saas.service.ComprasGovService;
import com.licitacao.saas.service.integration.dto.ClasseMaterialDTO;
import com.licitacao.saas.service.integration.dto.GrupoMaterialDTO;
import com.licitacao.saas.service.integration.dto.ItemCompraDTO;
import com.licitacao.saas.service.integration.dto.PdmMaterialDTO;
import com.licitacao.saas.service.integration.dto.ItemMaterialDTO;
import com.licitacao.saas.service.integration.dto.NaturezaDespesaDTO;
import com.licitacao.saas.service.integration.dto.UnidadeFornecimentoDTO;
import com.licitacao.saas.service.integration.dto.CaracteristicaMaterialDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/compras-gov")
@RequiredArgsConstructor
public class ComprasGovController {

    private final ComprasGovService comprasGovService;

    @GetMapping("/grupos")
    public List<GrupoMaterialDTO> listarGrupos() {
        return comprasGovService.listarGruposMateriais();
    }

    @GetMapping("/classes")
    public List<ClasseMaterialDTO> listarClasses(@RequestParam Integer codigoGrupo) {
        return comprasGovService.listarClassesMateriais(codigoGrupo);
    }

    @GetMapping("/pdms")
    public List<PdmMaterialDTO> listarPdms(@RequestParam Integer codigoClasse) {
        return comprasGovService.listarPdmsMateriais(codigoClasse);
    }

    @GetMapping("/itens")
    public List<ItemMaterialDTO> listarItens(@RequestParam Integer codigoPdm) {
        return comprasGovService.listarItensMateriais(codigoPdm);
    }

    @GetMapping("/naturezas")
    public List<NaturezaDespesaDTO> listarNaturezas(@RequestParam Integer codigoPdm) {
        return comprasGovService.listarNaturezasDespesa(codigoPdm);
    }

    @GetMapping("/unidades")
    public List<UnidadeFornecimentoDTO> listarUnidades(@RequestParam Integer codigoPdm) {
        return comprasGovService.listarUnidadesFornecimento(codigoPdm);
    }

    @GetMapping("/caracteristicas")
    public List<CaracteristicaMaterialDTO> listarCaracteristicas(@RequestParam Integer codigoItem) {
        return comprasGovService.listarCaracteristicasMaterial(codigoItem);
    }

    @GetMapping("/precos")
    public List<ItemCompraDTO> buscarPrecos(@RequestParam String descricao) {
        return comprasGovService.buscarPrecosNoComprasGov(descricao);
    }
}
