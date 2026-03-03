package com.licitacao.saas.web;

import com.licitacao.saas.service.PesquisaPrecoPraticadoService;
import com.licitacao.saas.service.integration.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/pesquisa-preco")
@RequiredArgsConstructor
public class PesquisaPrecoController {

    private final PesquisaPrecoPraticadoService pesquisaService;
    private final com.licitacao.saas.service.ContratacaoPncpService pncpService;
    private final com.licitacao.saas.service.ArpService arpService;
    private final com.licitacao.saas.service.ContratoService contratoService;
    private final com.licitacao.saas.service.FornecedorService fornecedorService;
    private final com.licitacao.saas.service.PriceResearchOrchestrator orchestrator;
    private final com.licitacao.saas.service.PncpFullCycleService pncpFullCycleService;

    @GetMapping("/materiais")
    public SseEmitter consultarPrecosMaterial(
            @RequestParam Integer codigoItemCatalogo,
            @RequestParam(defaultValue = "1") Integer pagina,
            @RequestParam(defaultValue = "10") Integer tamanhoPagina,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) String uf,
            @RequestParam(required = false) Boolean incluirBps,
            @RequestParam(required = false) String descCatmat) {
        
        SseEmitter emitter = new SseEmitter(300_000L); // 5 minutes timeout
        
        pncpFullCycleService.buscarMateriaisStream(
            emitter,
            codigoItemCatalogo.toString(), uf, pagina, incluirBps, descCatmat
        );
        
        return emitter;
    } 

    @GetMapping("/materiais/detalhe")
    public PesquisaMaterialDetalheDTO consultarPrecoMaterialDetalhe(@RequestParam Long idItemCompra) {
        return pesquisaService.consultarPrecoMaterialDetalhe(idItemCompra);
    }

    @GetMapping("/servicos")
    public List<PesquisaServicoDTO> consultarPrecosServico(
            @RequestParam Integer codigoServico,
            @RequestParam(defaultValue = "1") Integer pagina,
            @RequestParam(defaultValue = "10") Integer tamanhoPagina,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) String uf) {
        return pesquisaService.consultarPrecosServico(codigoServico, pagina, tamanhoPagina, municipio, uf);
    }
    
    @GetMapping("/servicos/detalhe")
    public PesquisaServicoDetalheDTO consultarPrecoServicoDetalhe(@RequestParam Long idItemCompra) {
        return pesquisaService.consultarPrecoServicoDetalhe(idItemCompra);
    }
    
    @GetMapping("/arp")
    public List<PesquisaMaterialDTO> consultarArp(@RequestParam Integer codigoItemCatalogo) {
        return arpService.pesquisarArps(codigoItemCatalogo);
    }

    @GetMapping("/contratos")
    public List<PesquisaMaterialDTO> consultarContratos(@RequestParam Integer codigoItemCatalogo) {
        List<PesquisaMaterialDTO> results = contratoService.pesquisarContratos(codigoItemCatalogo);
        enrichWithSupplierInfo(results);
        return results;
    }
    
    @GetMapping("/pncp")
    public List<PesquisaMaterialDTO> consultarPncp(@RequestParam Integer codigoItemCatalogo) {
        List<PesquisaMaterialDTO> results = pncpService.pesquisarItensPncp(codigoItemCatalogo);
        enrichWithSupplierInfo(results);
        return results;
    }
    
    // Helper to enrich
    private void enrichWithSupplierInfo(List<PesquisaMaterialDTO> items) {
        if (items == null || items.isEmpty()) return;
        
        items.parallelStream().forEach(item -> {
            if (item.getNiFornecedor() != null) {
                com.licitacao.saas.service.integration.dto.FornecedorDTO f = 
                    fornecedorService.consultarFornecedor(item.getNiFornecedor());
                if (f != null) {
                    item.setPorteEmpresa(f.getPorteEmpresaNome());
                    item.setHabilitadoLicitar(f.getHabilitadoLicitar());
                    item.setFornecedorAtivo(f.getAtivo());
                    item.setUfFornecedor(f.getUfSigla());
                    item.setMunicipioFornecedor(f.getNomeMunicipio());
                }
            }
        });
    }

    @GetMapping("/fornecedor")
    public com.licitacao.saas.service.integration.dto.FornecedorDTO consultarFornecedor(@RequestParam String ni) {
        return fornecedorService.consultarFornecedor(ni);
    }

    @GetMapping("/autocomplete")
    public List<com.licitacao.saas.web.dto.AutocompleteDTO> autocomplete(
            @RequestParam String term,
            @RequestParam(required = false, defaultValue = "MATERIAL") String type) {
        return pesquisaService.autocomplete(term, type);
    }
    @GetMapping("/items-by-pdm")
    public List<com.licitacao.saas.service.integration.dto.ItemMaterialDTO> getItemsByPdm(@RequestParam Integer pdm) {
        return pesquisaService.consultarItensPorPdm(pdm);
    }
    
    @GetMapping("/contratacoes/publicacao")
    public List<com.licitacao.saas.service.integration.dto.PncpContratacaoDTO> buscarContratacoesPublicacao(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate dataInicial,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate dataFinal,
            @RequestParam(required = false) String modalidade,
            @RequestParam(required = false) String uf,
            @RequestParam(required = false) String codigoMunicipioIbge,
            @RequestParam(defaultValue = "1") Integer pagina) {
        
        return pncpFullCycleService.buscarPublicacoes(dataInicial, dataFinal, modalidade, uf, codigoMunicipioIbge, pagina);
    }
    
    @GetMapping("/contratacoes/proposta")
    public List<com.licitacao.saas.service.integration.dto.PncpContratacaoDTO> buscarContratacoesProposta(
            @RequestParam(required = false) String uf,
            @RequestParam(required = false) String codigoMunicipioIbge,
            @RequestParam(defaultValue = "1") Integer pagina) {
        return pncpFullCycleService.buscarPropostasAbertas(uf, codigoMunicipioIbge, pagina);
    }
    
    @GetMapping("/execucao/contratos")
    public List<com.licitacao.saas.service.integration.dto.PncpContratoDTO> buscarContratos(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate dataInicial,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate dataFinal,
            @RequestParam(required = false) String cnpjOrgao,
            @RequestParam(required = false) String uf,
            @RequestParam(required = false) String codigoMunicipioIbge,
            @RequestParam(defaultValue = "1") Integer pagina) {

        return pncpFullCycleService.buscarContratos(dataInicial, dataFinal, cnpjOrgao, uf, codigoMunicipioIbge, pagina);
    }

    @GetMapping("/execucao/faturamento")
    public List<com.licitacao.saas.service.integration.dto.PncpInstrumentoCobrancaDTO> buscarInstrumentosCobranca(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate dataInicial,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate dataFinal,
            @RequestParam(required = false) String cnpjOrgao,
            @RequestParam(defaultValue = "1") Integer pagina) {

        return pncpFullCycleService.buscarInstrumentosCobranca(dataInicial, dataFinal, cnpjOrgao, pagina);
    }
}
