package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.RegisterUserDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;

import lombok.AllArgsConstructor;

import java.util.List;

@Service
@AllArgsConstructor
public class RegistrationService {
    private final UserService userService;
    private final UserRepository userRepository;

    public User register(RegisterUserDTO userDto) {
        List<User> users =  userRepository.findByEmail(userDto.getEmail());
        if(users.isEmpty()){
            User user = new User(userDto.getEmail(), userDto.getPassword());
            return userService.signUpUser(user);
        }
        else {
            throw new RuntimeException("Email already in use");
        }
    }
}