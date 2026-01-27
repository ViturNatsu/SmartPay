package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;

public interface UserService {
    User signUpUser(User user);
    User findByEmail(String email) throws UserNotFoundException;
    void save(User user);

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
