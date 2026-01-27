package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.RegisterUserDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.DuplicateEmailException;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.RegistrationService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {
    private final UserService userService;
    private final UserRepository userRepository;

    @Override
    public User register(RegisterUserDTO userDto) {
        String email = consistentEmail(userDto.getEmail());

        Optional<User> users =  userRepository.findByEmail(email);
        if(!users.isPresent()){
            User user = User.builder()
                    .firstName(userDto.getFirstName())
                    .lastName(userDto.getLastName())
                    .institution(userDto.getInstitution())
                    .email(email)
                    .password(userDto.getPassword())
                    .build();
            return userService.signUpUser(user);
        }
        else {
            throw new DuplicateEmailException("Email already in use");
        }
    }

    @Override
    public String consistentEmail(String email) {
        return email.trim().toLowerCase();
    }

}