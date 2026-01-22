package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;

public interface UserService {
    User signUpUser(User user);
    User findUserByEmail(String email) throws UserNotFoundException;
    void save(User user);
}
