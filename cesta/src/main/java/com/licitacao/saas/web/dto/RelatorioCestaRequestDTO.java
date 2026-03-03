package com.licitacao.saas.web.dto;

import com.licitacao.saas.service.integration.dto.PesquisaMaterialDTO;
import lombok.Data;
import java.util.List;

@Data
public class RelatorioCestaRequestDTO {
    private String numeroProcesso;
    private String responsavel;
    private String descricaoObjeto;
    private List<PesquisaMaterialDTO> itens;
}
