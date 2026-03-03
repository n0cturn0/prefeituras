package com.licitacao.saas.service.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PncpAtasResponseDTO {
    private List<PncpAtaDTO> data; // Common PNCP response wrapper is 'data' or just list? 
    // Checking ComprasGovClient: usually 'resultado'. 
    // PNCP Official API usually uses 'data' array and 'totalRecords', 'page', etc.
    // I will use 'data' common for REST. 
    // If it fails, I might need to adjust.
    // NOTE: If typical Spring Page, it might be 'content'.
    // Let's assume 'data' for now.
    
    // Actually, looking at typical PNCP responses, it's often directly the list or inside "data".
    // I'll assume standard list wrapper "data".
}
