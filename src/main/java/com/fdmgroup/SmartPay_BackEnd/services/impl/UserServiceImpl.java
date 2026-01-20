package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.config.PasswordEncoderConfig;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    // TODO

    @Autowired
    private final UserRepository userRepository;

    private final PasswordEncoderConfig passwordEncoderConfig;

    @Override
    public User signUpUser(User user) {

        // TODO encoder user password before saving

        return userRepository.save(user);
    }
}
