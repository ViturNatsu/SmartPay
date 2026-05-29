package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

@Service
public class PayeeServiceImpl implements PayeeService {

    private PayeeRepository payeeRepository;
    private UserRepository userRepository;
    private CustomerRepository customerRepository;

    public PayeeServiceImpl(PayeeRepository payeeRepository, UserRepository userRepository,
            CustomerRepository customerRepository) {
        this.payeeRepository = payeeRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public PayeeResponseDTO addPayee(Long ownerId, String payeeName, String recipientIdentifier) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));
        User recipient;
        if (recipientIdentifier.contains("@")) {
            recipient = userRepository.findByEmail(recipientIdentifier)
                    .orElseThrow(() -> new IllegalArgumentException("User with the provided email does not exist"));
        } else {
            Customer customer = customerRepository.findByPhoneNumber(recipientIdentifier)
                    .orElseThrow(
                            () -> new IllegalArgumentException("User with the provided phone number does not exist"));
            recipient = customer.getUser();
        }

        if (recipient.getId().equals(ownerId)) {
            throw new IllegalArgumentException("Cannot add yourself as a payee");
        }
        boolean alreadyExists = payeeRepository.existsByOwnerIdAndRecipientId(ownerId, recipient.getId());
        if (alreadyExists) {
            throw new IllegalArgumentException("Payee already exists!");
        }

        Payee payee = Payee.builder()
                .owner(owner)
                .recipient(recipient)
                .payeeName(payeeName)
                .build();
        payeeRepository.save(payee);
        PayeeResponseDTO payeeDTO = new PayeeResponseDTO(
                payee.getPayeeId(),
                payee.getPayeeName(),
                payee.getRecipient().getId(),
                payee.getRecipient().getFirstName(),
                payee.getRecipient().getLastName(),
                payee.getRecipient().getEmail());
        return payeeDTO;
    }

    @Override
    public List<PayeeResponseDTO> getPayeesForUser(Long ownerId) {
        List<Payee> payees = payeeRepository.findByOwnerId(ownerId);
        List<PayeeResponseDTO> payeesDTO = payees.stream().map(payee -> new PayeeResponseDTO(
                payee.getPayeeId(),
                payee.getPayeeName(),
                payee.getRecipient().getId(),
                payee.getRecipient().getFirstName(),
                payee.getRecipient().getLastName(),
                payee.getRecipient().getEmail())).collect(Collectors.toList());

        return payeesDTO;

    }

}
