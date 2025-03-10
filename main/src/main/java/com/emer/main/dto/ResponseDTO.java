package com.emer.main.dto;

import lombok.Data;

@Data
public class ResponseDTO {
 
	private int resultCode;

    private String resultMessage; 

    private Object result;

    private int resultTotalCnt; 

    private int resultCnt; 

}
