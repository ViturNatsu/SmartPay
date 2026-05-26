package com.fdmgroup.SmartPay_BackEnd.services.user;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.GovernmentIdType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.user.DuplicateEmailException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.DuplicatePhoneException;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {
    private final UserService userService;
    private final UserRepository userRepository;
    private final CustomerService customerService;
    private final CustomerRepository customerRepository;

    @Override
    public User register(SignUpDTO userDto) throws DuplicateEmailException {
        String email = consistentEmail(userDto.getEmail());
       

        Optional<User> existingUser = userRepository.findByEmail(email);
        

        if(existingUser.isPresent() && existingUser.get().isEmailVerified()){
            throw new DuplicateEmailException("Email already in use");
        } 

        CustomerDTO customerDto = userDto.getCustomer();
        String normalizedPhone = normalizePhone(customerDto.getPhoneNumber());
        Optional<Customer> existingPhoneNumber = customerRepository.findByPhoneNumber(normalizedPhone);

        if (existingPhoneNumber.isPresent()) {
            Customer existingCustomer = existingPhoneNumber.get();
            if (existingUser.isEmpty() || !existingCustomer.getUser().getId().equals(existingUser.get().getId())) {
                throw new DuplicatePhoneException("This phone number is already linked to a SmartPay Account");
            }
        }

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
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
            customer.setPhoneNumber(normalizedPhone);
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
        User savedUser = userService.signUpUser(newUser);
        Customer customer = Customer.builder()
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .addressLine1(customerDto.getAddressLine1().trim())
                .addressLine2(normalizeOptional(customerDto.getAddressLine2()))
                .city(customerDto.getCity().trim())
                .province(customerDto.getProvince().trim())
                .postalCode(normalizePostalCode(customerDto.getPostalCode()))
                .country("Canada")
                .phoneNumber(normalizedPhone)
                .dob(customerDto.getDob().trim())
                .socialInsuranceNumber(normalizeSin(customerDto.getSocialInsuranceNumber()))
                .governmentIdType(
                        GovernmentIdType.valueOf(customerDto.getGovernmentIdType().trim()))
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
