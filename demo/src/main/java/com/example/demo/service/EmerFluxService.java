package com.example.demo.service;

import com.fasterxml.jackson.databind.JsonNode;

import reactor.core.publisher.Mono;

public interface EmerFluxService {

    public  Mono<JsonNode> getSigunguDatas(String siCd);
    
}
