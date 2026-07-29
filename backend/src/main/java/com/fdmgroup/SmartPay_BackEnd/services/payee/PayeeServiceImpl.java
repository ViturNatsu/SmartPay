package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidRecurringPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeAlreadyExistsException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
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
    private final AccountRepository accountRepository;
    
    public PayeeServiceImpl(
            PayeeRepository payeeRepository,
            RecurringPayeeRepository recurringPayeeRepository,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository
    ) {
        this.payeeRepository = payeeRepository;
        this.recurringPayeeRepository = recurringPayeeRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
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
    public RecurringPayeeResponseDTO addRecurringPayee(Long ownerId, RecurringPayeeRequestDTO recurringPayeeRequestDTO) {
        String recurringPayeeName = recurringPayeeRequestDTO.getPayeeName();
        String recipientIdentifier = recurringPayeeRequestDTO.getRecipientIdentifier();
        Double recurringAmount=recurringPayeeRequestDTO.getAmount();
        LocalDate date = recurringPayeeRequestDTO.getDate();
        LocalDate endDate = recurringPayeeRequestDTO.getEndDate();
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new UserNotFoundException("Owner not found"));
                
        Account recipientAccount = accountRepository
                .findByAccountNumber(recipientIdentifier)
                .orElseThrow(() ->
                        new InvalidRecurringPayeeException(
                                "Recipient account number not found"
                        )
                );

        if (!recipientAccount.getActive()) {
            throw new InvalidRecurringPayeeException(
                    "Recipient account is not active"
            );
        }

        if (recipientAccount.getUsers().isEmpty()) {
            throw new InvalidRecurringPayeeException(
                    "Recipient account has no associated user"
            );
        }

        User recipient = recipientAccount
                .getUsers()
                .iterator()
                .next();

        if (recipient.getRole().equals(Role.ADMIN)) {
            throw new InvalidRecurringPayeeException("SmartPay user not found");
        }

        if (recipient.getId().equals(ownerId)) {
            throw new InvalidRecurringPayeeException("Cannot add yourself as a payee");
        }
        if (recurringAmount<=0){
            throw new InvalidRecurringPayeeException("Payment amount must be positive");
        }

        boolean duplicateRecurringPayee =
            recurringPayeeRepository
                    .existsByOwnerIdAndAccountNumberAndPayeeNameAndAmountAndScheduleAndDateAndActiveTrue(
                            ownerId,
                            recipientIdentifier,
                            recurringPayeeName,
                            recurringAmount,
                            recurringPayeeRequestDTO.getSchedule(),
                            date
                    );

        if (duplicateRecurringPayee) {
            throw new PayeeAlreadyExistsException("Recurring payment already exists");
        }
        
        if(endDate.compareTo(date)<=-1){
            throw new InvalidRecurringPayeeException("End Date can't be before Payment Date");
        }

        RecurringPayee recurringPayee= new RecurringPayee();
        recurringPayee.setActive(true);
        recurringPayee.setOwner(owner);
        recurringPayee.setRecipient(recipient);
        recurringPayee.setPayeeName(recurringPayeeName);
        recurringPayee.setAmount(recurringAmount);
        recurringPayee.setAccountNumber(recipientIdentifier);
        recurringPayee.setSchedule(recurringPayeeRequestDTO.getSchedule());
        recurringPayee.setDate(date);
        recurringPayee.setEndDate(endDate);
        recurringPayeeRepository.save(recurringPayee);
        return toRecurringResponseDTO(recurringPayee);
    }
    @Override
    public List<RecurringPayeeResponseDTO> getRecurringPayeesForUser(Long ownerId){
        List<RecurringPayee> recurringPayees = recurringPayeeRepository.findByOwnerIdAndActiveTrue(ownerId);
        return recurringPayees.stream().map(this::toRecurringResponseDTO).collect(Collectors.toList());
    }
    @Override
    public void deleteRecurringPayee(Long ownerId, Long recurringPayeeId){
        RecurringPayee recurringPayee = recurringPayeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(recurringPayeeId, ownerId)
            .orElseThrow(() -> new PayeeNotFoundException("Payee not found"));
        recurringPayee.setActive(false);
        recurringPayeeRepository.save(recurringPayee);
    }

    @Override
    public RecurringPayeeResponseDTO updateRecurringPayee(Long ownerId, Long recurringPayeeId, RecurringPayeeRequestDTO payeeRequestDTO) {
        RecurringPayee recurringPayee = recurringPayeeRepository.findByPayeeIdAndOwnerId(recurringPayeeId, ownerId)
            .orElseThrow(() -> new PayeeNotFoundException("Payee not found"));

        if(!recurringPayee.isActive()){
            throw new InvalidRecurringPayeeException("Can't update inactive account");
        }
        if(recurringPayee.getDate().equals(payeeRequestDTO.getDate()) 
            && recurringPayee.getAmount().equals(payeeRequestDTO.getAmount())
            && recurringPayee.getEndDate().equals(payeeRequestDTO.getEndDate())){
            throw new InvalidRecurringPayeeException("No changes were detected");
        }

        if(payeeRequestDTO.getEndDate().compareTo(payeeRequestDTO.getDate())<=-1){
            throw new InvalidRecurringPayeeException("End Date can't be before Payment Date");
        }

        recurringPayee.setDate(payeeRequestDTO.getDate());
        recurringPayee.setAmount(payeeRequestDTO.getAmount());
        recurringPayee.setEndDate(payeeRequestDTO.getEndDate());
        recurringPayeeRepository.save(recurringPayee);
        return toRecurringResponseDTO(recurringPayee);
    }

    @Override
    public void cancelRecurringPayee(Long ownerId, Long payeeId){
        RecurringPayee recurringPayee = recurringPayeeRepository.findByPayeeIdAndOwnerId(payeeId, ownerId)
        .orElseThrow(() -> new PayeeNotFoundException("Payee not found"));

        if(!recurringPayee.isActive()){
            throw new InvalidRecurringPayeeException("Recurring Payee is already inactive!");
        }
        recurringPayee.setActive(false);
        recurringPayeeRepository.save(recurringPayee);
    }

    @Override
    public void reactivateRecurringPayee(Long ownerId, Long payeeId) {
        RecurringPayee recurringPayee = recurringPayeeRepository.findByPayeeIdAndOwnerId(payeeId, ownerId)
        .orElseThrow(() -> new PayeeNotFoundException("Payee not found"));

        if(recurringPayee.isActive()){
            throw new InvalidRecurringPayeeException("Recurring Payee is already active!");
        }
        recurringPayee.setActive(true);
        recurringPayeeRepository.save(recurringPayee);
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
        private RecurringPayeeResponseDTO toRecurringResponseDTO(RecurringPayee recurringPayee) {
        String phoneNumber = customerRepository.findByUser(recurringPayee.getRecipient())
                .map(Customer::getPhoneNumber)
                .orElse(null);
        return new RecurringPayeeResponseDTO(
                recurringPayee.getPayeeId(),
                recurringPayee.getPayeeName(),
                recurringPayee.getRecipient().getId(),
                recurringPayee.getRecipient().getFirstName(),
                recurringPayee.getRecipient().getLastName(),
                recurringPayee.getRecipient().getEmail(),
                phoneNumber,
                recurringPayee.getSchedule(),
                recurringPayee.getAmount(),
                recurringPayee.getDate(),
                recurringPayee.getEndDate());
    }
    
}
