package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.Role;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.SignUpDTO;
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
    public User register(SignUpDTO userDto) {
        String email = consistentEmail(userDto.getEmail());

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (user.isEmailVerified()) {
                throw new DuplicateEmailException("Email already in use");
            }
            user.setFirstName(userDto.getFirstName());
            user.setLastName(userDto.getLastName());
            user.setInstitution(userDto.getInstitution());
            user.setPassword(userDto.getPassword());

            return userService.signUpUser(user);
        }

        User newUser = User.builder()
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .institution(userDto.getInstitution())
                .email(email)
                .password(userDto.getPassword())
                .role(Role.USER) // To be changed in future implementations
                .build();
        return userService.signUpUser(newUser);
    }

    @Override
    public String consistentEmail(String email) {
        return email.trim().toLowerCase();
    }

}