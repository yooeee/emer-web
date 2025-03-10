package com.emer.main.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.emer.main.service.EmerService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EmerServiceImpl implements EmerService {

    @Value("${emer_api_key}")
    private String emerApiKey;

    @Value("${vworld_api_key}")
    private String vworldApiKey;

    @Value("${vworld_domain}")
    private String vworldDomain;

    private String sigunguUrl = "https://api.vworld.kr/ned/data/admSiList?";

    @Override
    public JsonNode getSigunguDatas(String siCd) {
        String url = sigunguUrl + "admCode=" + siCd + "&format=json&numOfRows=1000&pageNo=1&key=" + vworldApiKey + "&domain=" + vworldDomain;
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            return rootNode.path("admVOList").path("admVOList");
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
}
