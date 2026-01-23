package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;

public interface UserService {
    User signUpUser(User user);

    /**
     * US-F02-02-01 (Sign In)
     * Validates login credentials for an existing user.
     *
     * @param email user email
     * @param password raw password
     * @return User if credentials are valid
     */
    User validateCredentials(String email, String password);
}
