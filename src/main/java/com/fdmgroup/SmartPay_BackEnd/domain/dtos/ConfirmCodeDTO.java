package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ConfirmCodeDTO {

    private String email;

    @JsonProperty("access-code")
    private String accessCode;

    public ConfirmCodeDTO() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAccessCode() {
        return accessCode;
    }

    public void setAccessCode(String accessCode) {
        this.accessCode = accessCode;
    }
}