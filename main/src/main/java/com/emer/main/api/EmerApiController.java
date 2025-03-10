package com.emer.main.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.emer.main.dto.ResponseDTO;
import com.emer.main.dto.SearchDTO;
import com.emer.main.service.EmerService;
import com.fasterxml.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/")
public class EmerApiController {

    @Autowired
    private EmerService emerService;

    @GetMapping("sigungu")
    public ResponseDTO getSigungu(@RequestParam String siCd) {
        ResponseDTO responseDTO = new ResponseDTO();

        JsonNode sigunguDatas = emerService.getSigunguDatas(siCd);
        if(sigunguDatas == null) {
            responseDTO.setResultCode(500);
            responseDTO.setResultMessage("error");
            return responseDTO;
        } else {
            responseDTO.setResultCode(200);
            responseDTO.setResultMessage("success");
            responseDTO.setResult(sigunguDatas);
        }

        return responseDTO;
    }
    
    @GetMapping("search")
    public String getSearch(@RequestBody SearchDTO searchDTO) {
        return new String();
    }
}
