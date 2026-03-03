package com.licitacao.saas.service;

import com.licitacao.saas.service.integration.ComprasGovClient;
import com.licitacao.saas.service.integration.dto.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicoCatalogoHierarquiaService {

    private static final Logger log = LoggerFactory.getLogger(ServicoCatalogoHierarquiaService.class);

    private final ComprasGovClient comprasGovClient;

    public List<SecaoServicoDTO> listarSecoes() {
        try {
            SecaoServicoResponseDTO response = comprasGovClient.consultarSecoesServico();
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Seções de Serviço", e);
        }
        return Collections.emptyList();
    }

    public List<DivisaoServicoDTO> listarDivisoes(Integer codigoSecao) {
        try {
            DivisaoServicoResponseDTO response = comprasGovClient.consultarDivisoesServico(codigoSecao);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Divisões de Serviço", e);
        }
        return Collections.emptyList();
    }

    public List<GrupoServicoDTO> listarGrupos(Integer codigoDivisao) {
        try {
            GrupoServicoResponseDTO response = comprasGovClient.consultarGruposServico(codigoDivisao);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Grupos de Serviço", e);
        }
        return Collections.emptyList();
    }

    public List<ClasseServicoDTO> listarClasses(Integer codigoGrupo) {
        try {
            ClasseServicoResponseDTO response = comprasGovClient.consultarClassesServico(codigoGrupo);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Classes de Serviço", e);
        }
        return Collections.emptyList();
    }

    public List<SubclasseServicoDTO> listarSubclasses(Integer codigoClasse) {
        try {
            SubclasseServicoResponseDTO response = comprasGovClient.consultarSubclassesServico(codigoClasse);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Subclasses de Serviço", e);
        }
        return Collections.emptyList();
    }

    public List<ServicoCatalogoDTO> listarServicos(Integer codigoSubclasse) {
        try {
            ServicoCatalogoResponseDTO response = comprasGovClient.consultarServicos(codigoSubclasse);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Serviços", e);
        }
        return Collections.emptyList();
    }

    public List<UnidadeMedidaServicoDTO> listarUnidadesMedida(Integer codigoServico) {
        try {
            UnidadeMedidaServicoResponseDTO response = comprasGovClient.consultarUnidadesMedidaServico(codigoServico);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Unidades de Medida", e);
        }
        return Collections.emptyList();
    }

    public List<NaturezaDespesaServicoDTO> listarNaturezasDespesa(Integer codigoServico) {
        try {
            NaturezaDespesaServicoResponseDTO response = comprasGovClient.consultarNaturezasDespesaServico(codigoServico);
            if (response != null && response.getResultado() != null) {
                return response.getResultado();
            }
        } catch (Exception e) {
            log.error("Erro ao consultar Naturezas de Despesa de Serviço", e);
        }
        return Collections.emptyList();
    }
}
