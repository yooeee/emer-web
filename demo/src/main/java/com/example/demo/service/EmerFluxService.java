package com.example.demo.service;

import com.example.demo.dto.SearchDTO;
import com.fasterxml.jackson.databind.JsonNode;

import reactor.core.publisher.Mono;

public interface EmerFluxService {

    public  Mono<JsonNode> getSigunguDatas(String siCd);

    public  Mono<JsonNode> getSearchDatas(SearchDTO searchDTO);
    
}
