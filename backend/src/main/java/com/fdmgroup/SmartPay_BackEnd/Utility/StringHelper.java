package com.fdmgroup.SmartPay_BackEnd.Utility;

import org.springframework.stereotype.Component;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;

@Component
public class StringHelper {
    public String fullName(User u) {
        if (u == null) return null;
        return (u.getFirstName() + " " + u.getLastName()).trim();
    }
}
