package com.emer.main.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.emer.main.dto.SearchDTO;


@RestController
@RequestMapping("/api/")
public class EmerApiController {
    

    @GetMapping("search")
    public String getSearch(@RequestBody SearchDTO searchDTO) {
        return new String();
    }
    

}
