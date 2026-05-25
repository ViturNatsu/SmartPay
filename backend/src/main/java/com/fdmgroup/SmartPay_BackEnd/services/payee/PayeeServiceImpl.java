package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

@Service
public class PayeeServiceImpl implements PayeeService {

    private PayeeRepository payeeRepository;
    private UserRepository userRepository;

    public PayeeServiceImpl(PayeeRepository payeeRepository, UserRepository userRepository) {
        this.payeeRepository = payeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PayeeResponseDTO addPayee(Long ownerId, Long recipientId) {

        if(recipientId == ownerId){
            throw new IllegalArgumentException("Cannot add yourself as a payee!");
        }
        boolean alreadyExists = payeeRepository.existsByOwnerIdAndRecipientId(ownerId,recipientId);
        if(alreadyExists){
            throw new IllegalArgumentException("Payee already exists!");
        }
        User owner = userRepository.findById(ownerId).orElseThrow();
        User recipient = userRepository.findById(recipientId).orElseThrow();

        Payee payee = Payee.builder()
        .owner(owner)
        .recipient(recipient)
        .build();
        payeeRepository.save(payee);
        PayeeResponseDTO payeeDTO = new PayeeResponseDTO(
            payee.getOwner().getId(),
            payee.getRecipient().getId(), 
            payee.getRecipient().getFirstName(), 
            payee.getRecipient().getLastName(),
            payee.getRecipient().getEmail()
        );
       return payeeDTO;
    }

    @Override
    public List<PayeeResponseDTO> getPayeesForUser(Long ownerId) {
        List<Payee> payees = payeeRepository.findByOwnerId(ownerId);
        List<PayeeResponseDTO> payeesDTO = new ArrayList<>();

        for (Payee payee : payees) {
            PayeeResponseDTO payeeDTO = new PayeeResponseDTO(
                    payee.getPayeeId(),
                    payee.getRecipient().getId(),
                    payee.getRecipient().getFirstName(),
                    payee.getRecipient().getLastName(),
                    payee.getRecipient().getEmail());
            payeesDTO.add(payeeDTO);

        }
        return payeesDTO;

    }

}
