package com.fdmgroup.SmartPay_BackEnd.domain.dtos.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
public class ExceptionShapeDTO {

    private final int status;
    private final String error;
    private final String message;

    public ExceptionShapeDTO(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
    }
}