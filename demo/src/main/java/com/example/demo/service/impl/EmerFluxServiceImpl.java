package com.example.demo.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.demo.dto.SearchDTO;
import com.example.demo.service.EmerFluxService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

@Service
public class EmerFluxServiceImpl implements EmerFluxService{

    @Value("${emer_api_key}")
    private String emerApiKey;

    @Value("${vworld_api_key}")
    private String vworldApiKey;

    @Value("${vworld_domain}")
    private String vworldDomain;

    private String sigunguUrl = "https://api.vworld.kr/ned/data/admSiList?";
    private String searchUrl = "https://apis.data.go.kr/B552657/ErmctInfoInqireService/";

    @Override
    public Mono<JsonNode> getSigunguDatas(String siCd) {
        String url = UriComponentsBuilder.fromUriString(sigunguUrl)
                .queryParam("admCode", siCd)
                .queryParam("format", "json")
                .queryParam("numOfRows", 1000)
                .queryParam("pageNo", 1)
                .queryParam("key", vworldApiKey)
                .queryParam("domain", vworldDomain)
                .toUriString();
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            return Mono.just(rootNode.path("admVOList").path("admVOList"));
        } catch (Exception e) {
            e.printStackTrace();
            return Mono.empty();
        }
    }

    @Override
    public Mono<JsonNode> getSearchDatas(SearchDTO searchDTO) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(searchUrl + searchDTO.getType() + "?")
                .queryParam("pageNo", searchDTO.getPageNo())
                .queryParam("numOfRows", searchDTO.getNumOfRows())
                .queryParam("Q0", searchDTO.getQ0())
                .queryParam("Q1", searchDTO.getQ1())
                .queryParam("QN", searchDTO.getQN());
        
        // 서비스 키 인코딩 방지
        String url = builder.build(false).toUriString() + "&serviceKey=" + emerApiKey;
        
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        System.out.println("url: " + url);
        System.out.println("Response Status Code: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            return Mono.just(rootNode.path("response").path("body").path("items").path("item"));
        } catch (Exception e) {
            e.printStackTrace();
            return Mono.empty();
        }
    }
    
}
