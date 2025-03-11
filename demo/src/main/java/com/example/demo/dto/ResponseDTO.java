package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO {
 
	private int resultCode;

    private String resultMessage; 

    private Object result;

    private int resultTotalCnt; 

    private int resultCnt; 

}
