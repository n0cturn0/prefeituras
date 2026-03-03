package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.CompraResponseDTO;
import com.licitacao.saas.service.integration.dto.ClasseMaterialDTO;
import com.licitacao.saas.service.integration.dto.ClasseMaterialResponseDTO;
import com.licitacao.saas.service.integration.dto.GrupoMaterialDTO;
import com.licitacao.saas.service.integration.dto.GrupoMaterialResponseDTO;
import com.licitacao.saas.service.integration.dto.ItemCompraDTO;
import com.licitacao.saas.service.integration.dto.PdmMaterialDTO;
import com.licitacao.saas.service.integration.dto.PdmMaterialResponseDTO;
import com.licitacao.saas.service.integration.dto.ItemMaterialDTO;
import com.licitacao.saas.service.integration.dto.ItemMaterialResponseDTO;
import com.licitacao.saas.service.integration.dto.NaturezaDespesaDTO;
import com.licitacao.saas.service.integration.dto.NaturezaDespesaResponseDTO;
import com.licitacao.saas.service.integration.dto.UnidadeFornecimentoDTO;
import com.licitacao.saas.service.integration.dto.UnidadeFornecimentoResponseDTO;
import com.licitacao.saas.service.integration.dto.CaracteristicaMaterialDTO;
import com.licitacao.saas.service.integration.dto.CaracteristicaMaterialResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComprasGovService {

    private static final Logger log = LoggerFactory.getLogger(ComprasGovService.class);

    private final ComprasGovClient comprasGovClient;

    public List<ItemCompraDTO> buscarPrecosNoComprasGov(String descricao) {
        log.info("Consultando Compras.gov para: {}", descricao);
        try {
            CompraResponseDTO response = comprasGovClient.consultarPregoes(descricao);
            if (response != null && response.getEmbedded() != null) {
                return response.getEmbedded().getCompras();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Compras.gov", e);
        }
        return Collections.emptyList();
    }

    public List<GrupoMaterialDTO> listarGruposMateriais() {
        log.info("Consultando Grupos de Materiais no Compras.gov");
        try {
            GrupoMaterialResponseDTO response = comprasGovClient.consultarGrupos();
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Grupos de Materiais", e);
        }
        return Collections.emptyList();
    }

    public List<ClasseMaterialDTO> listarClassesMateriais(Integer codigoGrupo) {
        log.info("Consultando Classes de Materiais no Compras.gov para grupo: {}", codigoGrupo);
        try {
            ClasseMaterialResponseDTO response = comprasGovClient.consultarClasses(codigoGrupo);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Classes de Materiais", e);
        }
        return Collections.emptyList();
    }

    public List<PdmMaterialDTO> listarPdmsMateriais(Integer codigoClasse) {
        log.info("Consultando PDMs de Materiais no Compras.gov para classe: {}", codigoClasse);
        try {
            PdmMaterialResponseDTO response = comprasGovClient.consultarPdms(codigoClasse);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar PDMs de Materiais", e);
        }
        return Collections.emptyList();
    }

    public List<ItemMaterialDTO> listarItensMateriais(Integer codigoPdm) {
        log.info("Consultando Itens de Materiais no Compras.gov para PDM: {}", codigoPdm);
        try {
            ItemMaterialResponseDTO response = comprasGovClient.consultarItens(codigoPdm);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Itens de Materiais", e);
        }
        return Collections.emptyList();
    }

    public List<NaturezaDespesaDTO> listarNaturezasDespesa(Integer codigoPdm) {
        log.info("Consultando Naturezas de Despesa no Compras.gov para PDM: {}", codigoPdm);
        try {
            NaturezaDespesaResponseDTO response = comprasGovClient.consultarNaturezasDespesa(codigoPdm);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Naturezas de Despesa", e);
        }
        return Collections.emptyList();
    }

    public List<UnidadeFornecimentoDTO> listarUnidadesFornecimento(Integer codigoPdm) {
        log.info("Consultando Unidades de Fornecimento no Compras.gov para PDM: {}", codigoPdm);
        try {
            UnidadeFornecimentoResponseDTO response = comprasGovClient.consultarUnidadesFornecimento(codigoPdm);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Unidades de Fornecimento", e);
        }
        return Collections.emptyList();
    }

    public List<CaracteristicaMaterialDTO> listarCaracteristicasMaterial(Integer codigoItem) {
        log.info("Consultando Características do Material no Compras.gov para Item: {}", codigoItem);
        try {
            CaracteristicaMaterialResponseDTO response = comprasGovClient.consultarCaracteristicas(codigoItem);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Características do Material", e);
        }
        return Collections.emptyList();
    }
}
