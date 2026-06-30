package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeAlreadyExistsException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

@Service
public class PayeeServiceImpl implements PayeeService, RecurringPayeeService {

    private final PayeeRepository payeeRepository;
    private final RecurringPayeeRepository recurringPayeeRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    public PayeeServiceImpl(PayeeRepository payeeRepository, RecurringPayeeRepository recurringPayeeRepository, 
        UserRepository userRepository, CustomerRepository customerRepository) {
        this.payeeRepository = payeeRepository;
        this.recurringPayeeRepository = recurringPayeeRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public PayeeResponseDTO addPayee(Long ownerId, PayeeRequestDTO payeeRequestDTO) {
        String payeeName = payeeRequestDTO.getPayeeName();
        String recipientIdentifier = payeeRequestDTO.getRecipientIdentifier();

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

        Optional<Payee> existingPayee = payeeRepository.findByOwnerIdAndRecipientId(ownerId, recipient.getId());
        if (existingPayee.isPresent()) {
            Payee payee = existingPayee.get();
            if (payee.isActive()) {
                throw new PayeeAlreadyExistsException("Payee already exists");
            }
            payee.setActive(true);
            payee.setPayeeName(payeeName);
            payeeRepository.save(payee);
            return toResponseDTO(payee);
        }

        Payee payee = Payee.builder()
                .owner(owner)
                .recipient(recipient)
                .payeeName(payeeName)
                .build();
        payeeRepository.save(payee);
        return toResponseDTO(payee);
    }

    @Override
    public List<PayeeResponseDTO> getPayeesForUser(Long ownerId) {
        List<Payee> payees = payeeRepository.findByOwnerIdAndActiveTrue(ownerId);
        return payees.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public void deletePayee(Long ownerId, Long payeeId) {
        Payee payee = payeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(payeeId, ownerId)
                .orElseThrow(() -> new PayeeNotFoundException("Payee not found"));
        payee.setActive(false);
        payeeRepository.save(payee);
    }
    @Override
    public RecurringPayeeResponseDTO addRecurringPayee(Long ownerId, RecurringPayeeRequestDTO payeeRequestDTO) {
        // Implementation for adding a recurring payee
        return null; // Placeholder return statement
    }
    @Override
    public List<RecurringPayeeResponseDTO> getRecurringPayeesForUser(Long ownerId){
        //Add implementation
        return null;
    }
    @Override
    public void deleteRecurringPayee(Long ownerId, Long payeeId){
        //Add implementation
    }

    private PayeeResponseDTO toResponseDTO(Payee payee) {
        String phoneNumber = customerRepository.findByUser(payee.getRecipient())
                .map(Customer::getPhoneNumber)
                .orElse(null);
        return new PayeeResponseDTO(
                payee.getPayeeId(),
                payee.getPayeeName(),
                payee.getRecipient().getId(),
                payee.getRecipient().getFirstName(),
                payee.getRecipient().getLastName(),
                payee.getRecipient().getEmail(),
                phoneNumber);
    }
}
