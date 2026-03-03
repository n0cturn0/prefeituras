package com.licitacao.saas.service.integration;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class BpsScraperClient {

    private static final Logger log = LoggerFactory.getLogger(BpsScraperClient.class);
    private final RestTemplate restTemplate;
    private final String BPS_SERVICE_URL = "http://localhost:8000";

    public BpsScraperClient() {
        // Increase timeout for large datasets (27k rows ~ 20MB)
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(60000); // 1 min connect
        factory.setReadTimeout(600000);   // 10 min read
        this.restTemplate = new RestTemplate(factory);
    }

    public BpsResponse searchBps(String descricaoCatmat, String codigoMaterial) {
        try {
            log.info("Calling BPS Scraper for: {} (Code: {})", descricaoCatmat, codigoMaterial);
            String url = BPS_SERVICE_URL + "/search-bps";
            
            // Prefer Code if available, fallback to description
            Map<String, String> payload;
            if (codigoMaterial != null && !codigoMaterial.isEmpty()) {
                 payload = Map.of("codigo_material", codigoMaterial);
            } else {
                 payload = Map.of("descricao_catmat", descricaoCatmat);
            }
            
            BpsResponse response = restTemplate.postForObject(url, payload, BpsResponse.class);
            if (response != null && response.data != null) {
                log.info("BPS Scraper response received. Items: {}", response.data.size());
            } else {
                log.warn("BPS Scraper returned null or empty response.");
            }
            return response;
            
        } catch (Exception e) {
            log.error("Failed to query BPS Scraper: {}", e.getMessage());
            return new BpsResponse();
        }
    }
    
    // DTOs
    public static class BpsResponse {
        @JsonProperty("data")
        public List<Map<String, String>> data;
        
        @JsonProperty("screenshot")
        public String screenshot; // Base64
        
        @JsonProperty("remote_logs")
        public List<String> remoteLogs;
    }
}
