package com.fdmgroup.SmartPay_BackEnd.services.user;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;

import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
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
    User getUserById(Long userId);
    @Nullable
    List<User> getAllUsers();
}
