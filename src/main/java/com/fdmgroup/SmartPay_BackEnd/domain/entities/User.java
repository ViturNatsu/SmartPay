package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class User {
    @Id
    private Long id;

    public Object getEmail() {
        return null;
    }
    // TODO
}
