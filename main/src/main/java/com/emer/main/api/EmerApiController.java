package com.emer.main.api;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/")
public class EmerApiController {
    

    @GetMapping("search")
    public String getSearch(@RequestParam String param) {
        return new String();
    }
    

}
