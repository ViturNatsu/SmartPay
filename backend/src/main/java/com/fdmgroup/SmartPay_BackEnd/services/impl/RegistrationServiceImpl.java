package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.GovernmentIdType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Role;
import com.fdmgroup.SmartPay_BackEnd.repositories.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.services.CustomerService;
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
    private  final CustomerService customerService;
    private  final CustomerRepository customerRepository;

    @Override
    public User register(SignUpDTO userDto) throws  DuplicateEmailException {
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

            User userUpdated = userService.signUpUser(user);
            // Check if customer exists for this user
            // Find existing customer
            Customer customer = customerRepository.findByUser(user)
                    .orElse(Customer.builder() // If not found, create new
                            .user(user)
                            .build());

            // Update customer fields
            customer.setFirstName(userDto.getFirstName());
            customer.setLastName(userDto.getLastName());
            customer.setAddressLine1(userDto.getCustomer().getAddressLine1());
            customer.setAddressLine2(userDto.getCustomer().getAddressLine2());
            customer.setCity(userDto.getCustomer().getCity());
            customer.setProvince(userDto.getCustomer().getProvince());
            customer.setCountry(userDto.getCustomer().getCountry());
            customer.setPostalCode(userDto.getCustomer().getPostalCode());
            customer.setPhoneNumber(userDto.getCustomer().getPhoneNumber());
            customer.setDob(userDto.getCustomer().getDob());
            customer.setSocialInsuranceNumber(userDto.getCustomer().getSocialInsuranceNumber());
            customer.setGovernmentIdType(GovernmentIdType.valueOf(userDto.getCustomer().getGovernmentIdType()));
            customer.setGovernmentIdNumber(userDto.getCustomer().getGovernmentIdNumber());
            customer.setOccupation(userDto.getCustomer().getOccupation());
            customerRepository.save(customer);
                return userUpdated;

        }

        User newUser = User.builder()
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .institution(userDto.getInstitution())
                .email(email)
                .password(userDto.getPassword())
                .role(Role.USER) // To be changed in future implementations
                .build();
        User savedUser=userService.signUpUser(newUser);
        Customer customer = Customer.builder()
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .addressLine1(userDto.getCustomer().getAddressLine1())
                .city(userDto.getCustomer().getCity())
                .province(userDto.getCustomer().getProvince())
                .postalCode(userDto.getCustomer().getPostalCode())
                .country(userDto.getCustomer().getCountry())
                .phoneNumber(userDto.getCustomer().getPhoneNumber())
                .dob(userDto.getCustomer().getDob())
                .socialInsuranceNumber(userDto.getCustomer().getSocialInsuranceNumber())
                .governmentIdType(
                        GovernmentIdType.valueOf(userDto.getCustomer().getGovernmentIdType())
                )
                .governmentIdNumber(userDto.getCustomer().getGovernmentIdNumber())
                .occupation(userDto.getCustomer().getOccupation())
                .user(savedUser)
                .build();

        customerRepository.save(customer);
        return savedUser;
    }

    @Override
    public String consistentEmail(String email) {
        return email.trim().toLowerCase();
    }

}