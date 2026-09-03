package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringBillingScheduleUtil;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.*;
import jakarta.transaction.Transactional;

import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.ResumeRecurringPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.PaymentMethodNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentMethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentMethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.Utility.MaskingUtil;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
@Service
public class PayeeServiceImpl implements PayeeService, RecurringPayeeService {

    // US 12-02-12: every recurring payee (bill or subscription) is routed to SmartPay's own
    // seeded merchant account (see DataBaseInitializer) rather than a real peer-to-peer
    // recipient. The destination is assigned server-side so the frontend never needs to know
    // this "merchant account" magic value and cannot override the routing.
    private static final String RECURRING_MERCHANT_ACCOUNT_NUMBER = "99990001";

    private final PayeeRepository payeeRepository;
    private final RecurringPayeeRepository recurringPayeeRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final MaskingUtil maskingUtil;

    public PayeeServiceImpl(
            PayeeRepository payeeRepository,
            RecurringPayeeRepository recurringPayeeRepository,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            PaymentRepository paymentRepository,
            MaskingUtil maskingUtil
    ) {
        this.payeeRepository = payeeRepository;
        this.recurringPayeeRepository = recurringPayeeRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
        this.maskingUtil = maskingUtil;
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
        List<Payee> payees = payeeRepository.findRegularPayeesByOwnerId(ownerId);
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
        // US 12-02-12: ignore any client-supplied destination and always route to the hardcoded
        // merchant account, regardless of the display name or payee type (bill or subscription).
        String recipientIdentifier = RECURRING_MERCHANT_ACCOUNT_NUMBER;
        BigDecimal recurringAmount=recurringPayeeRequestDTO.getAmount();
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

        if (recurringAmount == null) {
            throw new InvalidRecurringPayeeException(
                    "Amount is required"
            );
        }

        if (recurringAmount.compareTo(BigDecimal.ONE) < 0) {
            throw new InvalidRecurringPayeeException(
                    "Minimum amount is $1.00"
            );
        }

        if (recurringAmount.compareTo(new BigDecimal("10000.00")) > 0) {
            throw new InvalidRecurringPayeeException(
                    "Maximum amount is $10,000.00"
            );
        }

        if (date == null) {
            throw new InvalidRecurringPayeeException(
                    "Payment date is required"
            );
        }

        if (date.isBefore(LocalDate.now())) {
            throw new InvalidRecurringPayeeException(
                    "Payment date cannot be in the past"
            );
        }

        if (endDate != null && endDate.isBefore(LocalDate.now())) {
            throw new InvalidRecurringPayeeException(
                    "End date cannot be in the past"
            );
        }

        if (endDate != null && endDate.isBefore(date)) {
            throw new InvalidRecurringPayeeException(
                    "End date cannot be before payment date"
            );
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
        


        RecurringPayee recurringPayee= new RecurringPayee();
        recurringPayee.setType(recurringPayeeRequestDTO.getType());
        recurringPayee.setActive(true);
        recurringPayee.setOwner(owner);
        recurringPayee.setRecipient(recipient);
        recurringPayee.setPayeeName(recurringPayeeName);
        recurringPayee.setAmount(recurringAmount);
        recurringPayee.setAccountNumber(recipientIdentifier);
        recurringPayee.setSchedule(recurringPayeeRequestDTO.getSchedule());
        recurringPayee.setDate(date);
        recurringPayee.setEndDate(endDate);

        if (recurringPayeeRequestDTO.getType() == RecurringPaymentType.SUBSCRIPTION) {
            PaymentMethod paymentMethod = paymentRepository
                    .findByPaymentMethodIdAndUser_Id(recurringPayeeRequestDTO.getPaymentMethodId(), ownerId)
                    .orElseThrow(() -> new PaymentMethodNotFoundException("Payment method not found"));

            if (!Boolean.TRUE.equals(paymentMethod.getActive())) {
                throw new InvalidRecurringPayeeException("Payment method is not active");
            }

            recurringPayee.setPaymentMethod(paymentMethod);
        }

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

        if(recurringPayee.getStatus() != RecurringPaymentStatus.ACTIVE){
            throw new InvalidRecurringPayeeException("Only active recurring payments can be updated");
        }

        // US 12-02-12: the display name is editable; a null/blank name means "keep the current
        // label". Renaming only affects future charges — historical transactions already snapshot
        // the name that was in effect at charge time, so they are left untouched.
        String requestedName = payeeRequestDTO.getPayeeName();
        boolean nameProvided = requestedName != null && !requestedName.isBlank();
        String updatedName = nameProvided ? requestedName.trim() : recurringPayee.getPayeeName();
        boolean nameChanged = !Objects.equals(updatedName, recurringPayee.getPayeeName());

        if (!nameChanged
                && recurringPayee.getDate().equals(payeeRequestDTO.getDate())
                && recurringPayee.getAmount().compareTo(payeeRequestDTO.getAmount()) == 0
                && Objects.equals(
                    recurringPayee.getEndDate(),
                    payeeRequestDTO.getEndDate()
                )) {
            throw new InvalidRecurringPayeeException("No changes were detected");
        }

        BigDecimal amount = payeeRequestDTO.getAmount();
        LocalDate today = LocalDate.now();

        if(amount != null)
        {
            if (amount.compareTo(BigDecimal.ONE) < 0) {
                throw new InvalidRecurringPayeeException(
                    "Minimum amount is $1.00"
                );
            }

            if (amount.compareTo(new BigDecimal("10000.00")) > 0) {
                throw new InvalidRecurringPayeeException(
                    "Maximum amount is $10,000.00"
                );
            }
        }

        if (payeeRequestDTO.getDate().isBefore(today)) {
            throw new InvalidRecurringPayeeException(
                "Past payment dates are not allowed"
            );
        }

        
        if (payeeRequestDTO.getEndDate() != null
                && payeeRequestDTO.getEndDate().isBefore(today)) {
            throw new InvalidRecurringPayeeException(
                "Past end dates are not allowed"
            );
        }

        if (payeeRequestDTO.getEndDate() != null
                && !payeeRequestDTO.getEndDate().isAfter(payeeRequestDTO.getDate())) {
            throw new InvalidRecurringPayeeException(
                "End Date must be after Payment Date"
            );
        }

        if (payeeRequestDTO.getEndDate() != null
                && payeeRequestDTO.getEndDate().compareTo(payeeRequestDTO.getDate()) <= 0) {
            throw new InvalidRecurringPayeeException(
                "End Date must be after Payment Date"
            );
        }


        if (!nameChanged
            && Objects.equals(recurringPayee.getDate(), payeeRequestDTO.getDate())
            && Objects.equals(recurringPayee.getAmount(), payeeRequestDTO.getAmount())
            && Objects.equals(recurringPayee.getEndDate(), payeeRequestDTO.getEndDate())) {
            throw new InvalidRecurringPayeeException("No changes were detected");
        }

        recurringPayee.setPayeeName(updatedName);
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

        if(recurringPayee.getStatus() != RecurringPaymentStatus.ACTIVE){
            throw new InvalidRecurringPayeeException("Only active recurring payments can be cancelled");
        }

        recurringPayee.setStatus(RecurringPaymentStatus.CANCELLED);
        recurringPayeeRepository.save(recurringPayee);
    }

    @Override
    public void reactivateRecurringPayee(Long ownerId, Long payeeId) {
        RecurringPayee recurringPayee = recurringPayeeRepository.findByPayeeIdAndOwnerId(payeeId, ownerId)
        .orElseThrow(() -> new PayeeNotFoundException("Payee not found"));

        if(recurringPayee.isActive()){
            throw new InvalidRecurringPayeeException("Recurring Payee is already active");
        }
        recurringPayee.setActive(true);
        recurringPayeeRepository.save(recurringPayee);
    }

    @Override
        public RecurringPayeeResponseDTO getRecurringPayeeDetails(Long ownerId, Long recurringPayeeId) {

            RecurringPayee recurringPayee = recurringPayeeRepository.findByPayeeId(recurringPayeeId)
        .orElseThrow(() -> new PayeeNotFoundException("Payee not found"));

            if(!Objects.equals(recurringPayee.getOwner().getId(), ownerId)){
                throw new RecurringPayeeForbiddenAccessException("Recurring Payement does not belong to User.");
            }
            
            return toRecurringResponseDTO(recurringPayee);
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

        PaymentMethod paymentMethod = recurringPayee.getPaymentMethod();

        return RecurringPayeeResponseDTO.builder()
                .payeeId(recurringPayee.getPayeeId())
                .payeeName(recurringPayee.getPayeeName())
                .recipientId(recurringPayee.getRecipient().getId())
                .recipientIdentifier(recurringPayee.getAccountNumber())
                .firstName(recurringPayee.getRecipient().getFirstName())
                .lastName(recurringPayee.getRecipient().getLastName())
                .email(recurringPayee.getRecipient().getEmail())
                .phoneNumber(phoneNumber)
                .schedule(recurringPayee.getSchedule())
                .amount(recurringPayee.getAmount())
                .date(recurringPayee.getDate())
                .type(recurringPayee.getType())
                .status(recurringPayee.getStatus())
                .endDate(recurringPayee.getEndDate())
                .lastProcessedDate(recurringPayee.getLastProcessedDate())
                .startDate(recurringPayee.getCreatedAt() != null ? recurringPayee.getCreatedAt().toLocalDate() : null)
                .paymentMethodId(paymentMethod != null ? paymentMethod.getPaymentMethodId() : null)
                .paymentMethodBankDisplayName(paymentMethod != null ? paymentMethod.getBankDisplayName() : null)
                .paymentMethodAccountType(paymentMethod != null && paymentMethod.getAccount() != null
                        ? paymentMethod.getAccount().getAccountType().name() : null)
                .paymentMethodAccountNumberMasked(paymentMethod != null && paymentMethod.getAccount() != null
                        ? maskingUtil.maskAccountNumber(paymentMethod.getAccount().getAccountNumber()).getFirst() : null)
                .pausedDate(recurringPayee.getPausedDate())
                .pausedOverSixMonths(recurringPayee.getPausedDate() != null &&
                        Period.between(recurringPayee.getPausedDate(), LocalDate.now(ZoneOffset.UTC)).toTotalMonths() > 6)
                .build();
    }



    @Override
    @Transactional
    public void pauseRecurringPayee(Long ownerId, Long payeeId) {

        RecurringPayee recurringPayee = recurringPayeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(payeeId, ownerId)
                .orElseThrow(() -> new PayeeNotFoundException("Payee not found"));

        if(recurringPayee.getStatus() == RecurringPaymentStatus.PAUSED){
            throw new RecurringPayeeAlreadyPaused("Payee already paused");
        }
        if(!recurringPayee.isActive()){
            throw new InvalidRecurringPayeeException("Recurring Payee is already inactive");
        }
        recurringPayee.setStatus(RecurringPaymentStatus.PAUSED);
        recurringPayee.setPausedDate(LocalDate.now(ZoneOffset.UTC));
    }


    @Override
    @Transactional
    public void resumeRecurringPayee(Long ownerId, Long payeeId, ResumeRecurringPayeeRequestDTO resumeRequestDTO) {
        RecurringPayee recurringPayee = recurringPayeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(payeeId, ownerId)
                .orElseThrow(() -> new PayeeNotFoundException("Payee not found"));

        if(recurringPayee.getStatus() != RecurringPaymentStatus.PAUSED){
            throw new RecurringPayeeNotPaused("Payee not paused");
        }

        if(!recurringPayee.isActive()){
            throw new InvalidRecurringPayeeException("Recurring Payee is already inactive");
        }
        PaymentMethod paymentMethod = recurringPayee.getPaymentMethod();

        if (paymentMethod == null || !Boolean.TRUE.equals(paymentMethod.getActive())) {
            throw new InvalidPaymentMethodException("A valid payment method is required to resume this payment");
        }

        LocalDateTime today = LocalDateTime.now(ZoneOffset.UTC);
        boolean overSixMonths = recurringPayee.getPausedDate() != null
                && Period.between(recurringPayee.getPausedDate(), today.toLocalDate()).toTotalMonths() > 6;

        LocalDate nextPaymentDate = resumeRequestDTO != null ? resumeRequestDTO.getNextPaymentDate() : null;

        if (overSixMonths) {
            if (nextPaymentDate == null) {
                throw new ScheduleDateRequiredException("A new schedule date is required to resume this payment");
            }
            if (!nextPaymentDate.isAfter(today.toLocalDate())) {
                throw new InvalidScheduleDateException("Schedule date must be in the future");
            }
            recurringPayee.setDate(nextPaymentDate);
        } else {
            recurringPayee.setDate(RecurringBillingScheduleUtil.resolveResumeCycleDate(recurringPayee, today));
        }

        recurringPayee.setStatus(RecurringPaymentStatus.ACTIVE);
        recurringPayee.setPausedDate(null);
    }
}
