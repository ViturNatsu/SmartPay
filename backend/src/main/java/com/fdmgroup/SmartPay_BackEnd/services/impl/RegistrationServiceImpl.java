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
        CustomerDTO customerDto = userDto.getCustomer();

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (user.isEmailVerified()) {
                throw new DuplicateEmailException("Email already in use");
            }
            user.setFirstName(userDto.getFirstName());
            user.setLastName(userDto.getLastName());
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
            customer.setAddressLine1(customerDto.getAddressLine1().trim());
            customer.setAddressLine2(normalizeOptional(customerDto.getAddressLine2()));
            customer.setCity(customerDto.getCity().trim());
            customer.setProvince(customerDto.getProvince().trim());
            customer.setCountry("Canada");
            customer.setPostalCode(normalizePostalCode(customerDto.getPostalCode()));
            customer.setPhoneNumber(normalizePhone(customerDto.getPhoneNumber()));
            customer.setDob(customerDto.getDob().trim());
            customer.setSocialInsuranceNumber(normalizeSin(customerDto.getSocialInsuranceNumber()));
            customer.setGovernmentIdType(GovernmentIdType.valueOf(customerDto.getGovernmentIdType().trim()));
            customer.setGovernmentIdNumber(normalizeGovernmentIdNumber(customerDto.getGovernmentIdNumber()));
            customer.setOccupation(customerDto.getOccupation().trim());
            customerRepository.save(customer);
                return userUpdated;

        }

        User newUser = User.builder()
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .email(email)
                .password(userDto.getPassword())
                .role(Role.USER) // To be changed in future implementations
                .build();
        User savedUser=userService.signUpUser(newUser);
        Customer customer = Customer.builder()
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .addressLine1(customerDto.getAddressLine1().trim())
                .addressLine2(normalizeOptional(customerDto.getAddressLine2()))
                .city(customerDto.getCity().trim())
                .province(customerDto.getProvince().trim())
                .postalCode(normalizePostalCode(customerDto.getPostalCode()))
                .country("Canada")
                .phoneNumber(normalizePhone(customerDto.getPhoneNumber()))
                .dob(customerDto.getDob().trim())
                .socialInsuranceNumber(normalizeSin(customerDto.getSocialInsuranceNumber()))
                .governmentIdType(
                        GovernmentIdType.valueOf(customerDto.getGovernmentIdType().trim())
                )
                .governmentIdNumber(normalizeGovernmentIdNumber(customerDto.getGovernmentIdNumber()))
                .occupation(customerDto.getOccupation().trim())
                .user(savedUser)
                .build();

        customerRepository.save(customer);
        return savedUser;
    }

    @Override
    public String consistentEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeSin(String sin) {
        return sin.replaceAll("[\\s-]", "");
    }

    private String normalizePhone(String phone) {
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() == 11 && digits.startsWith("1")) {
            return digits.substring(1);
        }
        return digits;
    }

    private String normalizePostalCode(String postalCode) {
        String condensed = postalCode.replaceAll("\\s+", "").toUpperCase();
        return condensed.substring(0, 3) + " " + condensed.substring(3);
    }

    private String normalizeGovernmentIdNumber(String governmentIdNumber) {
        return governmentIdNumber.replaceAll("\\s+", "").toUpperCase();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
