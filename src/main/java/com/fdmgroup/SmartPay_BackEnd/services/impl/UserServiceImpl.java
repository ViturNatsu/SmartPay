package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.config.EncoderConfig;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    @Autowired
    private final UserRepository userRepository;

    private final EncoderConfig encoderConfig;

    @Override
    public User signUpUser(User user) {

        String encodedPassword = encoderConfig
                .passwordEncoder()
                .encode(user.getPassword());

        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }
}
