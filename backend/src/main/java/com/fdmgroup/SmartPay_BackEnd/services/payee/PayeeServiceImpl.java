package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeAlreadyExistsException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

@Service
public class PayeeServiceImpl implements PayeeService {

    private final PayeeRepository payeeRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    public PayeeServiceImpl(PayeeRepository payeeRepository, UserRepository userRepository,
            CustomerRepository customerRepository) {
        this.payeeRepository = payeeRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public PayeeResponseDTO addPayee(Long ownerId, String payeeName, String recipientIdentifier) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new UserNotFoundException("Owner not found"));

        User recipient;
        if (recipientIdentifier.contains("@")) {
            recipient = userRepository.findByEmail(recipientIdentifier)
                    .orElseThrow(() -> new UserNotFoundException("SmartPay user not found"));
        } else {
            Customer customer = customerRepository.findByPhoneNumber(recipientIdentifier)
                    .orElseThrow(() -> new UserNotFoundException("SmartPay user not found"));
            recipient = customer.getUser();
        }

        if (recipient.getRole().equals(Role.ADMIN)) {
            throw new InvalidPayeeException("SmartPay user not found");
        }

        if (recipient.getId().equals(ownerId)) {
            throw new InvalidPayeeException("Cannot add yourself as a payee");
        }

        if (payeeRepository.existsByOwnerIdAndRecipientId(ownerId, recipient.getId())) {
            throw new PayeeAlreadyExistsException("Payee already exists");
        }

        Payee payee = Payee.builder()
                .owner(owner)
                .recipient(recipient)
                .payeeName(payeeName)
                .build();
        payeeRepository.save(payee);

        return new PayeeResponseDTO(
                payee.getPayeeId(),
                payee.getPayeeName(),
                payee.getRecipient().getId(),
                payee.getRecipient().getFirstName(),
                payee.getRecipient().getLastName(),
                payee.getRecipient().getEmail());
    }

    @Override
    public List<PayeeResponseDTO> getPayeesForUser(Long ownerId) {
        return payeeRepository.findByOwnerId(ownerId)
                .stream()
                .map(payee -> new PayeeResponseDTO(
                        payee.getPayeeId(),
                        payee.getPayeeName(),
                        payee.getRecipient().getId(),
                        payee.getRecipient().getFirstName(),
                        payee.getRecipient().getLastName(),
                        payee.getRecipient().getEmail()))
                .collect(Collectors.toList());
    }
}
