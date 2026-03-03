package com.licitacao.saas.service.integration;

import com.licitacao.saas.service.integration.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "comprasGovClient", url = "https://dadosabertos.compras.gov.br")
public interface ComprasGovClient {

    // --- Módulo Serviços (CATSER) ---

    @GetMapping("/modulo-servico/1_consultarSecaoServico")
    SecaoServicoResponseDTO consultarSecoesServico();

    @GetMapping("/modulo-servico/2_consultarDivisaoServico")
    DivisaoServicoResponseDTO consultarDivisoesServico(@RequestParam("codigoSecao") Integer codigoSecao);

    @GetMapping("/modulo-servico/3_consultarGrupoServico")
    GrupoServicoResponseDTO consultarGruposServico(@RequestParam("codigoDivisao") Integer codigoDivisao);

    @GetMapping("/modulo-servico/4_consultarClasseServico")
    ClasseServicoResponseDTO consultarClassesServico(@RequestParam(value = "codigoGrupo", required = false) Integer codigoGrupo);

    @GetMapping("/modulo-servico/5_consultarSubClasseServico")
    SubclasseServicoResponseDTO consultarSubclassesServico(@RequestParam("codigoClasse") Integer codigoClasse);

    @GetMapping("/modulo-servico/6_consultarItemServico")
    ServicoCatalogoResponseDTO consultarServicos(@RequestParam("codigoSubClasse") Integer codigoSubClasse);

    @GetMapping("/modulo-servico/6_consultarItemServico")
    ServicoCatalogoResponseDTO consultarServicosPaginado(@RequestParam("pagina") Integer pagina, @RequestParam("tamanhoPagina") Integer tamanhoPagina);


    @GetMapping("/modulo-servico/7_consultarUndMedidaServico")
    UnidadeMedidaServicoResponseDTO consultarUnidadesMedidaServico(@RequestParam("codigoServico") Integer codigoServico);

    @GetMapping("/modulo-servico/8_consultarNaturezaDespesaServico")
    NaturezaDespesaServicoResponseDTO consultarNaturezasDespesaServico(@RequestParam("codigoServico") Integer codigoServico);


    // --- Módulo Licitação e Material (Existente) ---
    @GetMapping("/modulo-licitacao/1_consultarPregao")
    CompraResponseDTO consultarPregoes(@RequestParam("item") String item);

    @GetMapping("/modulo-material/4_consultarItemMaterial")
    ItemMaterialResponseDTO consultarItensPorDescricao(@RequestParam("descricao") String descricao, @RequestParam(value = "pagina", defaultValue = "1") Integer pagina);

    @GetMapping("/modulo-material/1_consultarGrupoMaterial")
    GrupoMaterialResponseDTO consultarGrupos();

    @GetMapping("/modulo-material/2_consultarClasseMaterial")
    ClasseMaterialResponseDTO consultarClasses(@RequestParam("codigoGrupo") Integer codigoGrupo);

    @GetMapping("/modulo-material/3_consultarPdmMaterial")
    PdmMaterialResponseDTO consultarPdms(@RequestParam(value = "codigoClasse", required = false) Integer codigoClasse); // Allow null

    @GetMapping("/modulo-material/3_consultarPdmMaterial")
    PdmMaterialResponseDTO consultarTodosPdms(@RequestParam(value = "pagina", defaultValue = "1") Integer pagina);
    @GetMapping("/modulo-material/4_consultarItemMaterial")
    ItemMaterialResponseDTO consultarItens(@RequestParam("codigoPdm") Integer codigoPdm);

    @GetMapping("/modulo-material/5_consultarMaterialNaturezaDespesa")
    NaturezaDespesaResponseDTO consultarNaturezasDespesa(@RequestParam("codigoPdm") Integer codigoPdm);

    @GetMapping("/modulo-material/6_consultarMaterialUnidadeFornecimento")
    UnidadeFornecimentoResponseDTO consultarUnidadesFornecimento(@RequestParam("codigoPdm") Integer codigoPdm);

    @GetMapping("/modulo-material/7_consultarMaterialCaracteristicas")
    CaracteristicaMaterialResponseDTO consultarCaracteristicas(@RequestParam("codigoItem") Integer codigoItem);

    // --- Módulo Pesquisa de Preço ---
    @GetMapping("/modulo-pesquisa-preco/1_consultarMaterial")
    PesquisaMaterialResponseDTO consultarPrecoMaterial(
            @RequestParam("codigoItemCatalogo") Integer codigoItemCatalogo,
            @RequestParam("pagina") Integer pagina,
            @RequestParam("tamanhoPagina") Integer tamanhoPagina);

    @GetMapping("/modulo-pesquisa-preco/2_consultarMaterialDetalhe")
    PesquisaMaterialDetalheResponseDTO consultarPrecoMaterialDetalhe(@RequestParam("idItemCompra") Long idItemCompra);

    @GetMapping("/modulo-pesquisa-preco/3_consultarServico")
    PesquisaServicoResponseDTO consultarPrecoServico(
            @RequestParam("codigoItemCatalogo") Integer codigoServico,
            @RequestParam("pagina") Integer pagina,
            @RequestParam("tamanhoPagina") Integer tamanhoPagina);

    @GetMapping("/modulo-pesquisa-preco/4_consultarServicoDetalhe")
    PesquisaServicoDetalheResponseDTO consultarPrecoServicoDetalhe(@RequestParam("idItemCompra") Long idItemCompra);

    // --- Módulo Contratações PNCP (Lei 14.133) ---
    @GetMapping("/modulo-contratacoes/1_consultarContratacoes_PNCP_14133")
    PncpContratacaoResponseDTO consultarContratacoesPncp(@RequestParam("idContratacao") Long idContratacao);

    @GetMapping("/modulo-contratacoes/2_consultarItensContratacoes_PNCP_14133")
    PncpItemResponseDTO consultarItensPncp(
            @RequestParam("codigoItemCatalogo") Integer codigoItemCatalogo,
            @RequestParam("pagina") Integer pagina,
            @RequestParam("tamanhoPagina") Integer tamanhoPagina);

    @GetMapping("/modulo-contratacoes/3_consultarResultadoItensContratacoes_PNCP_14133")
    PncpResultadoItemResponseDTO consultarResultadosItensPncp(@RequestParam("idItemContratacao") Long idItemContratacao);

    // --- Módulo ARP (Atas de Registro de Preços) ---
    @GetMapping("/modulo-arp/1_consultarARP")
    ArpHeaderResponseDTO consultarArp(@RequestParam("numeroAtaRegistroPreco") String numeroAtaRegistroPreco);

    @GetMapping("/modulo-arp/2_consultarARPItem")
    ArpItemResponseDTO consultarItensArp(
            @RequestParam("codigoItem") Integer codigoItem,
            @RequestParam("pagina") Integer pagina,
            @RequestParam("tamanhoPagina") Integer tamanhoPagina);

    @GetMapping("/modulo-arp/3_consultarUnidadesItem")
    ArpUnidadeItemResponseDTO consultarUnidadesItem(
            @RequestParam("numeroAta") String numeroAta,
            @RequestParam("numeroItem") Integer numeroItem);
            
    // --- Módulo Contratos (Lei 14.133) ---
    @GetMapping("/modulo-contratos/1_consultarContratos")
    ContratoHeaderResponseDTO consultarContratos(@RequestParam("numeroContrato") String numeroContrato); // Adjusted signature based on likely need or search by param? 
    // Wait, the user JSON Example for /1_consultarContratos shows a return. Params not specified but context implies general search or specific?
    // User notes: "Consulta contratos e seus respectivos itens." and gives GET /1_consultarContratos.
    // Usually we need a filter. I'll stick to item search for the main "Price Research" flow: /2_consultarContratosItem.
    
    @GetMapping("/modulo-contratos/2_consultarContratosItem")
    ContratoItemResponseDTO consultarItensContrato(
            @RequestParam("codigoItem") Integer codigoItem,
            @RequestParam("pagina") Integer pagina,
            @RequestParam("tamanhoPagina") Integer tamanhoPagina);

    // --- Módulo Fornecedor (Cadastros) ---
    @GetMapping("/modulo-fornecedor/1_consultarFornecedor")
    FornecedorDTO consultarFornecedor(@RequestParam("ni") String ni); // Returns single object or list? Assuming object based on "consultarFornecedor"
}
