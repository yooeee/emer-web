package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ResponseDTO;
import com.example.demo.dto.SearchDTO;
import com.example.demo.service.EmerFluxService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class EmerFluxApiController {

    @Autowired
    private EmerFluxService emerFluxService;

    @GetMapping("/sigungu")
    public Mono<ResponseEntity<ResponseDTO>> getSigunguDatas(@RequestParam String siCd) {
        return emerFluxService.getSigunguDatas(siCd)
            .map(sigunguDatas -> {
                ResponseDTO responseDTO = new ResponseDTO();
                responseDTO.setResultCode(200);
                responseDTO.setResultMessage("success");
                responseDTO.setResult(sigunguDatas); // 시군구 목록을 result에 설정
                return ResponseEntity.ok(responseDTO); // ResponseEntity로 감싸서 반환
            })
            .defaultIfEmpty(ResponseEntity.ok(createEmptyResponse())); // 비어있을 경우 응답 생성
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<ResponseDTO>> getSearchDatas(SearchDTO searchDTO) {
        return emerFluxService.getSearchDatas(searchDTO)
            .map(searchDatas -> {
                ResponseDTO responseDTO = new ResponseDTO();
                responseDTO.setResultCode(200);
                responseDTO.setResultMessage("success");
                responseDTO.setResult(searchDatas);
                return ResponseEntity.ok(responseDTO);
            })
            .defaultIfEmpty(ResponseEntity.ok(createEmptyResponse()));
    }

    private ResponseDTO createEmptyResponse() {
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setResultCode(200); // 상태 코드를 200으로 설정
        responseDTO.setResultMessage("success"); // 메시지를 success로 설정
        responseDTO.setResult(null); // result를 null로 설정
        return responseDTO; // ResponseDTO 반환
    }
    
}
