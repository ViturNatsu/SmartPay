package com.fdmgroup.SmartPay_BackEnd.services.payee;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PayeeServiceImpl implements PayeeService {

    private final PayeeRepository payeeRepository;
    private final UserRepository userRepository;

    public PayeeServiceImpl(PayeeRepository payeeRepository, UserRepository userRepository) {
        this.payeeRepository = payeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<PayeeDTO> getPayeesByOwnerId(Long ownerId) {
        return payeeRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public PayeeDTO addPayee(Long ownerId, String recipientEmail) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new UserNotFoundException("Owner not found"));

        User recipient = userRepository.findByEmail(recipientEmail.trim().toLowerCase())
                .orElseThrow(() -> new UserNotFoundException("No SmartPay user found with that email"));

        if (owner.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Cannot add yourself as a payee");
        }

        // Reuse existing payee if already saved
        return payeeRepository.findByOwnerIdAndRecipientId(ownerId, recipient.getId())
                .map(this::toDTO)
                .orElseGet(() -> {
                    Payee payee = new Payee();
                    payee.setOwner(owner);
                    payee.setRecipient(recipient);
                    return toDTO(payeeRepository.save(payee));
                });
    }

    private PayeeDTO toDTO(Payee payee) {
        User r = payee.getRecipient();
        return new PayeeDTO(
                payee.getPayeeId(),
                r.getId(),
                r.getFirstName(),
                r.getLastName(),
                r.getEmail()
        );
    }
}
