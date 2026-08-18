package com.fdmgroup.SmartPay_BackEnd.unitTests;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidRecurringPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeAlreadyExistsException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.payee.PayeeServiceImpl;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.CheckingAccount;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentMethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentMethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.Utility.MaskingUtil;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.PaymentMethodNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;

@ExtendWith(MockitoExtension.class)
class PayeeServiceTest {

    @Mock
    private PayeeRepository payeeRepository;

    @Mock
    private RecurringPayeeRepository recurringPayeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private MaskingUtil maskingUtil;

    @InjectMocks
    private PayeeServiceImpl payeeService;

    private User owner;
    private User recipient;
    private Customer recipientCustomer;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .role(Role.USER)
                .build();

        recipient = User.builder()
                .id(2L)
                .firstName("Bob")
                .lastName("Jones")
                .email("bob@example.com")
                .role(Role.USER)
                .build();

        recipientCustomer = Customer.builder()
                .id(10L)
                .user(recipient)
                .phoneNumber("4165551234")
                .build();
    }

    // addPayee Tests

    @Test
    void addPayee_shouldAddPayee_whenUsingEmailIdentifier() {
        PayeeRequestDTO dto = new PayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("bob@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(recipient));
        when(payeeRepository.findByOwnerIdAndRecipientId(1L, 2L)).thenReturn(Optional.empty());
        when(payeeRepository.save(any(Payee.class))).thenAnswer(invocation -> {
            Payee p = invocation.getArgument(0);
            p.setPayeeId(100L);
            return p;
        });

        PayeeResponseDTO result = payeeService.addPayee(1L, dto);

        assertNotNull(result);
        assertEquals(100L, result.getPayeeId());
        assertEquals("My Buddy", result.getPayeeName());
        assertEquals(2L, result.getRecipientId());
        assertEquals("Bob", result.getFirstName());
        assertEquals("Jones", result.getLastName());
        assertEquals("bob@example.com", result.getEmail());

        verify(payeeRepository).save(any(Payee.class));
    }

    @Test
    void addPayee_shouldAddPayee_whenUsingPhoneIdentifier() {
        PayeeRequestDTO dto = new PayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("4165551234");

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(customerRepository.findByPhoneNumber("4165551234")).thenReturn(Optional.of(recipientCustomer));
        when(payeeRepository.findByOwnerIdAndRecipientId(1L, 2L)).thenReturn(Optional.empty());
        when(payeeRepository.save(any(Payee.class))).thenAnswer(invocation -> {
            Payee p = invocation.getArgument(0);
            p.setPayeeId(101L);
            return p;
        });

        PayeeResponseDTO result = payeeService.addPayee(1L, dto);

        assertNotNull(result);
        assertEquals(101L, result.getPayeeId());
        assertEquals("My Buddy", result.getPayeeName());

        verify(customerRepository).findByPhoneNumber("4165551234");
        verify(payeeRepository).save(any(Payee.class));
    }

    @Test
    void addPayee_shouldThrowUserNotFoundException_whenOwnerNotFound() {
        PayeeRequestDTO dto = new PayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("bob@example.com");

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> payeeService.addPayee(99L, dto));

        verify(payeeRepository, never()).save(any());
    }

    @Test
    void addPayee_shouldThrowUserNotFoundException_whenRecipientEmailNotFound() {
        PayeeRequestDTO dto = new PayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("missing@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> payeeService.addPayee(1L, dto));

        verify(payeeRepository, never()).save(any());
    }

    @Test
    void addPayee_shouldThrowUserNotFoundException_whenRecipientPhoneNotFound() {
        PayeeRequestDTO dto = new PayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("0000000000");

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(customerRepository.findByPhoneNumber("0000000000")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> payeeService.addPayee(1L, dto));

        verify(payeeRepository, never()).save(any());
    }

    @Test
    void addPayee_shouldThrowInvalidPayeeException_whenRecipientIsAdmin() {
        PayeeRequestDTO dto = new PayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("admin@example.com");

        User adminUser = User.builder()
                .id(3L)
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .role(Role.ADMIN)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));

        assertThrows(InvalidPayeeException.class,
                () -> payeeService.addPayee(1L, dto));

        verify(payeeRepository, never()).save(any());
    }

    @Test
    void addPayee_shouldThrowInvalidPayeeException_whenOwnerAddsThemself() {
        PayeeRequestDTO dto = new PayeeRequestDTO();
        dto.setPayeeName("Myself");
        dto.setRecipientIdentifier("alice@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(owner));

        assertThrows(InvalidPayeeException.class,
                () -> payeeService.addPayee(1L, dto));

        verify(payeeRepository, never()).save(any());
    }

    @Test
    void addPayee_shouldThrowPayeeAlreadyExistsException_whenDuplicatePayee() {
        PayeeRequestDTO dto = new PayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("bob@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(recipient));
        Payee existing = Payee.builder()
                .payeeId(50L)
                .owner(owner)
                .recipient(recipient)
                .payeeName("Old Name")
                .active(true)
                .build();
        when(payeeRepository.findByOwnerIdAndRecipientId(1L, 2L)).thenReturn(Optional.of(existing));

        assertThrows(PayeeAlreadyExistsException.class,
                () -> payeeService.addPayee(1L, dto));

        verify(payeeRepository, never()).save(any());
    }

    @Test
    void addPayee_shouldReactivatePayee_whenPayeeExistsButIsInactive() {
        PayeeRequestDTO dto = new PayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("bob@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(recipient));
        Payee inactivePayee = Payee.builder()
                .payeeId(100L)
                .owner(owner)
                .recipient(recipient)
                .payeeName("Old Name")
                .active(false)
                .build();
        when(payeeRepository.findByOwnerIdAndRecipientId(1L, 2L)).thenReturn(Optional.of(inactivePayee));
        when(payeeRepository.save(any(Payee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PayeeResponseDTO result = payeeService.addPayee(1L, dto);

        assertNotNull(result);
        assertEquals(100L, result.getPayeeId());
        assertEquals("My Buddy", result.getPayeeName());
        assertTrue(inactivePayee.isActive());
        verify(payeeRepository).save(inactivePayee);
    }

    // getPayeesForUser Tests

    @Test
    void getPayeesForUser_shouldReturnListOfPayees() {
        Payee payee1 = Payee.builder()
                .payeeId(1L)
                .owner(owner)
                .recipient(recipient)
                .payeeName("Buddy 1")
                .build();
        Payee payee2 = Payee.builder()
                .payeeId(2L)
                .owner(owner)
                .recipient(recipient)
                .payeeName("Buddy 2")
                .build();

        when(payeeRepository.findByOwnerIdAndActiveTrue(1L)).thenReturn(List.of(payee1, payee2));

        List<PayeeResponseDTO> result = payeeService.getPayeesForUser(1L);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Buddy 1", result.get(0).getPayeeName());
        assertEquals("Buddy 2", result.get(1).getPayeeName());

        verify(payeeRepository).findByOwnerIdAndActiveTrue(1L);
    }

    @Test
    void getPayeesForUser_shouldReturnEmptyList_whenNoPayeesExist() {
        when(payeeRepository.findByOwnerIdAndActiveTrue(1L)).thenReturn(Collections.emptyList());

        List<PayeeResponseDTO> result = payeeService.getPayeesForUser(1L);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(payeeRepository).findByOwnerIdAndActiveTrue(1L);
    }

    // deletePayee Tests

    @Test
    void deletePayee_shouldSetPayeeInactive_whenPayeeExistsAndBelongsToOwner() {
        Payee payee = Payee.builder()
                .payeeId(100L)
                .owner(owner)
                .recipient(recipient)
                .payeeName("My Buddy")
                .build();

        when(payeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(100L, 1L)).thenReturn(Optional.of(payee));
        when(payeeRepository.save(any(Payee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        payeeService.deletePayee(1L, 100L);

        assertFalse(payee.isActive());
        verify(payeeRepository).findByPayeeIdAndOwnerIdAndActiveTrue(100L, 1L);
        verify(payeeRepository).save(payee);
    }

    @Test
    void deletePayee_shouldThrowPayeeNotFoundException_whenPayeeDoesNotExist() {
        when(payeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(999L, 1L)).thenReturn(Optional.empty());

        assertThrows(PayeeNotFoundException.class,
                () -> payeeService.deletePayee(1L, 999L));

        verify(payeeRepository, never()).save(any());
    }

    @Test
    void deletePayee_shouldThrowPayeeNotFoundException_whenPayeeBelongsToAnotherOwner() {
        when(payeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(100L, 1L)).thenReturn(Optional.empty());

        assertThrows(PayeeNotFoundException.class,
                () -> payeeService.deletePayee(1L, 100L));

        verify(payeeRepository, never()).save(any());
    }

    //addRecurringPayee Tests
    @Test
    void addRecurringPayee_shouldAddRecurringPayee_whenUsingEmailIdentifier() {
        RecurringPayeeRequestDTO dto = new RecurringPayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("99990001");
        dto.setAmount(new BigDecimal("100.00"));
        dto.setSchedule(Schedule.MONTHLY);
        dto.setDate(LocalDate.now().plusDays(1));

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));

        Account recipientAccount = new CheckingAccount();
        recipientAccount.setActive(true);
        recipientAccount.getUsers().add(recipient);

        when(accountRepository.findByAccountNumber("99990001"))
                .thenReturn(Optional.of(recipientAccount));
                when(recurringPayeeRepository
        .existsByOwnerIdAndAccountNumberAndPayeeNameAndAmountAndScheduleAndDateAndActiveTrue(
                1L,
                "99990001",
                "My Buddy",
                new BigDecimal("100.00"),
                Schedule.MONTHLY,
                dto.getDate()))
        .thenReturn(false);
        when(recurringPayeeRepository.save(any(RecurringPayee.class))).thenAnswer(invocation -> {
            RecurringPayee p = invocation.getArgument(0);
            p.setPayeeId(100L);
            return p;
        });

        RecurringPayeeResponseDTO result = payeeService.addRecurringPayee(1L, dto);

        assertNotNull(result);
        assertEquals(100L, result.getPayeeId());
        assertEquals("My Buddy", result.getPayeeName());
        assertEquals(2L, result.getRecipientId());
        assertEquals("Bob", result.getFirstName());
        assertEquals("Jones", result.getLastName());
        assertEquals("bob@example.com", result.getEmail());
        assertEquals(new BigDecimal("100.00"), result.getAmount());
        assertEquals(Schedule.MONTHLY, result.getSchedule());
        assertEquals(LocalDate.now().plusDays(1), result.getDate());
        assertEquals(RecurringPaymentStatus.ACTIVE, result.getStatus());

        verify(recurringPayeeRepository).save(any(RecurringPayee.class));
    }
    @Test
    void addRecurringPayee_shouldAddRecurringPayee_whenUsingAccountNumber() {
        String accountNumber = "99990001";

        RecurringPayeeRequestDTO dto = new RecurringPayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier(accountNumber);
        dto.setAmount(new BigDecimal("100.00"));
        dto.setSchedule(Schedule.MONTHLY);
        dto.setDate(LocalDate.now().plusDays(1));

        Account recipientAccount = new CheckingAccount();
        recipientAccount.setActive(true);
        recipientAccount.getUsers().add(recipient);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(owner));

        when(accountRepository.findByAccountNumber(anyString()))
            .thenReturn(Optional.of(recipientAccount));

        when(recurringPayeeRepository
                .existsByOwnerIdAndAccountNumberAndPayeeNameAndAmountAndScheduleAndDateAndActiveTrue(
                        1L,
                        accountNumber,
                        "My Buddy",
                        new BigDecimal("100.00"),
                        Schedule.MONTHLY,
                        dto.getDate()))
                .thenReturn(false);

        when(recurringPayeeRepository.save(any(RecurringPayee.class)))
                .thenAnswer(invocation -> {
                    RecurringPayee payee = invocation.getArgument(0);
                    payee.setPayeeId(101L);
                    return payee;
                });

        RecurringPayeeResponseDTO result =
                payeeService.addRecurringPayee(1L, dto);

        assertNotNull(result);
        assertEquals(101L, result.getPayeeId());
        assertEquals("My Buddy", result.getPayeeName());

        verify(accountRepository).findByAccountNumber(accountNumber);
        verify(recurringPayeeRepository).save(any(RecurringPayee.class));
    }
    @Test
    void addRecurringPayee_shouldThrowInvalidRecurringPayeeException_whenAmountIsNegative() {
        RecurringPayeeRequestDTO dto = new RecurringPayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("4165551234");
        dto.setAmount(new BigDecimal("-100.00"));
        dto.setSchedule(Schedule.MONTHLY);
        dto.setDate(LocalDate.now().plusDays(1));

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));

        assertThrows(InvalidRecurringPayeeException.class, () -> payeeService.addRecurringPayee(1L, dto));
    }
    
    @Test
    void addRecurringPayee_shouldThrowUserNotFoundException_whenOwnerNotFound() {
        RecurringPayeeRequestDTO dto = new RecurringPayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("bob@example.com");
        dto.setAmount(new BigDecimal("100.00"));
        dto.setSchedule(Schedule.MONTHLY);
        dto.setDate(LocalDate.now().plusDays(1));

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> payeeService.addRecurringPayee(99L, dto));

        verify(recurringPayeeRepository, never()).save(any());
    }
    @Test
    void addRecurringPayee_shouldThrowInvalidRecurringPayeeException_whenRecipientIsAdmin() {
        RecurringPayeeRequestDTO dto = new RecurringPayeeRequestDTO();
        dto.setPayeeName("My Buddy");
        dto.setRecipientIdentifier("admin@example.com");

        User adminUser = User.builder()
                .id(3L)
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .role(Role.ADMIN)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));

        assertThrows(InvalidRecurringPayeeException.class,
                () -> payeeService.addRecurringPayee(1L, dto));

        verify(recurringPayeeRepository, never()).save(any());
    }

    @Test
    void addRecurringPayee_shouldUseServerAssignedMerchantAccount_whenTypeIsSubscription() {
        RecurringPayeeRequestDTO dto = new RecurringPayeeRequestDTO();
        dto.setPayeeName("Netflix");
        dto.setAmount(new BigDecimal("15.00"));
        dto.setSchedule(Schedule.MONTHLY);
        dto.setDate(LocalDate.now().plusDays(1));
        dto.setType(RecurringPaymentType.SUBSCRIPTION);
        dto.setPaymentMethodId(5L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));

        Account merchantAccount = new CheckingAccount();
        merchantAccount.setActive(true);
        merchantAccount.getUsers().add(recipient);
        when(accountRepository.findByAccountNumber("99990001"))
                .thenReturn(Optional.of(merchantAccount));

        when(recurringPayeeRepository
                .existsByOwnerIdAndAccountNumberAndPayeeNameAndAmountAndScheduleAndDateAndActiveTrue(
                        1L, "99990001", "Netflix", new BigDecimal("15.00"), Schedule.MONTHLY, dto.getDate()))
                .thenReturn(false);

        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setPaymentMethodId(5L);
        paymentMethod.setActive(true);
        paymentMethod.setBankDisplayName("TD");
        when(paymentRepository.findByPaymentMethodIdAndUser_Id(5L, 1L))
                .thenReturn(Optional.of(paymentMethod));

        when(recurringPayeeRepository.save(any(RecurringPayee.class)))
                .thenAnswer(invocation -> {
                    RecurringPayee payee = invocation.getArgument(0);
                    payee.setPayeeId(200L);
                    return payee;
                });

        RecurringPayeeResponseDTO result = payeeService.addRecurringPayee(1L, dto);

        assertNotNull(result);
        assertEquals("99990001", result.getRecipientIdentifier());
        assertEquals(5L, result.getPaymentMethodId());
        assertEquals("TD", result.getPaymentMethodBankDisplayName());
        assertEquals(RecurringPaymentType.SUBSCRIPTION, result.getType());

        verify(accountRepository).findByAccountNumber("99990001");
        verify(recurringPayeeRepository).save(any(RecurringPayee.class));
    }

    @Test
    void addRecurringPayee_shouldThrowPaymentMethodNotFoundException_whenPaymentMethodMissing() {
        RecurringPayeeRequestDTO dto = new RecurringPayeeRequestDTO();
        dto.setPayeeName("Netflix");
        dto.setAmount(new BigDecimal("15.00"));
        dto.setSchedule(Schedule.MONTHLY);
        dto.setDate(LocalDate.now().plusDays(1));
        dto.setType(RecurringPaymentType.SUBSCRIPTION);
        dto.setPaymentMethodId(999L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));

        Account merchantAccount = new CheckingAccount();
        merchantAccount.setActive(true);
        merchantAccount.getUsers().add(recipient);
        when(accountRepository.findByAccountNumber("99990001"))
                .thenReturn(Optional.of(merchantAccount));

        when(recurringPayeeRepository
                .existsByOwnerIdAndAccountNumberAndPayeeNameAndAmountAndScheduleAndDateAndActiveTrue(
                        1L, "99990001", "Netflix", new BigDecimal("15.00"), Schedule.MONTHLY, dto.getDate()))
                .thenReturn(false);

        when(paymentRepository.findByPaymentMethodIdAndUser_Id(999L, 1L))
                .thenReturn(Optional.empty());

        assertThrows(PaymentMethodNotFoundException.class,
                () -> payeeService.addRecurringPayee(1L, dto));

        verify(recurringPayeeRepository, never()).save(any());
    }

    @Test
    void addRecurringPayee_shouldThrowInvalidRecurringPayeeException_whenPaymentMethodInactive() {
        RecurringPayeeRequestDTO dto = new RecurringPayeeRequestDTO();
        dto.setPayeeName("Netflix");
        dto.setAmount(new BigDecimal("15.00"));
        dto.setSchedule(Schedule.MONTHLY);
        dto.setDate(LocalDate.now().plusDays(1));
        dto.setType(RecurringPaymentType.SUBSCRIPTION);
        dto.setPaymentMethodId(5L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));

        Account merchantAccount = new CheckingAccount();
        merchantAccount.setActive(true);
        merchantAccount.getUsers().add(recipient);
        when(accountRepository.findByAccountNumber("99990001"))
                .thenReturn(Optional.of(merchantAccount));

        when(recurringPayeeRepository
                .existsByOwnerIdAndAccountNumberAndPayeeNameAndAmountAndScheduleAndDateAndActiveTrue(
                        1L, "99990001", "Netflix", new BigDecimal("15.00"), Schedule.MONTHLY, dto.getDate()))
                .thenReturn(false);

        PaymentMethod inactivePaymentMethod = new PaymentMethod();
        inactivePaymentMethod.setPaymentMethodId(5L);
        inactivePaymentMethod.setActive(false);
        when(paymentRepository.findByPaymentMethodIdAndUser_Id(5L, 1L))
                .thenReturn(Optional.of(inactivePaymentMethod));

        assertThrows(InvalidRecurringPayeeException.class,
                () -> payeeService.addRecurringPayee(1L, dto));

        verify(recurringPayeeRepository, never()).save(any());
    }

    // getRecurringPayeesForUser Tests

    @Test
    void getRecurringPayeesForUser_shouldReturnListOfRecurringPayees() {
        RecurringPayee recurringPayee1 = new RecurringPayee();
        recurringPayee1.setPayeeId(1L);
        recurringPayee1.setOwner(owner);
        recurringPayee1.setRecipient(recipient);
        recurringPayee1.setPayeeName("Buddy 1");
        recurringPayee1.setAmount(new BigDecimal("50.00"));
        recurringPayee1.setSchedule(Schedule.MONTHLY);
        recurringPayee1.setDate(LocalDate.now().plusDays(1));

        RecurringPayee recurringPayee2 = new RecurringPayee();
        recurringPayee2.setPayeeId(2L);
        recurringPayee2.setOwner(owner);
        recurringPayee2.setRecipient(recipient);
        recurringPayee2.setPayeeName("Buddy 2");
        recurringPayee2.setAmount(new BigDecimal("75.00"));
        recurringPayee2.setSchedule(Schedule.YEARLY);
        recurringPayee2.setDate(LocalDate.now().plusDays(2));
        when(recurringPayeeRepository.findByOwnerIdAndActiveTrue(1L)).thenReturn(List.of(recurringPayee1, recurringPayee2));

        List<RecurringPayeeResponseDTO> result = payeeService.getRecurringPayeesForUser(1L);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Buddy 1", result.get(0).getPayeeName());
        assertEquals("Buddy 2", result.get(1).getPayeeName());

        verify(recurringPayeeRepository).findByOwnerIdAndActiveTrue(1L);
    }

    @Test
    void getRecurringPayeesForUser_shouldReturnEmptyList_whenNoPayeesExist() {
        when(recurringPayeeRepository.findByOwnerIdAndActiveTrue(1L)).thenReturn(Collections.emptyList());

        List<RecurringPayeeResponseDTO> result = payeeService.getRecurringPayeesForUser(1L);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(recurringPayeeRepository).findByOwnerIdAndActiveTrue(1L);
    }

    // deleteRecurringPayee Tests

    @Test
    void deleteRecurringPayee_shouldSetPayeeInactive_whenPayeeExistsAndBelongsToOwner() {
        RecurringPayee recurringPayee = new RecurringPayee();
        recurringPayee.setPayeeId(100L);
        recurringPayee.setOwner(owner);
        recurringPayee.setRecipient(recipient);
        recurringPayee.setPayeeName("My Buddy");
        recurringPayee.setActive(true);
        recurringPayee.setAmount(new BigDecimal("100.00"));
        recurringPayee.setSchedule(Schedule.MONTHLY);
        recurringPayee.setDate(LocalDate.now().plusDays(1));

        when(recurringPayeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(100L, 1L)).thenReturn(Optional.of(recurringPayee));
        when(recurringPayeeRepository.save(any(RecurringPayee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        payeeService.deleteRecurringPayee(1L, 100L);

        assertFalse(recurringPayee.isActive());
        verify(recurringPayeeRepository).findByPayeeIdAndOwnerIdAndActiveTrue(100L, 1L);
        verify(recurringPayeeRepository).save(recurringPayee);
    }

    @Test
    void deleteRecurringPayee_shouldThrowPayeeNotFoundException_whenPayeeDoesNotExist() {
        when(recurringPayeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(999L, 1L)).thenReturn(Optional.empty());

        assertThrows(PayeeNotFoundException.class,
                () -> payeeService.deleteRecurringPayee(1L, 999L));

        verify(recurringPayeeRepository, never()).save(any());
    }

    @Test
    void deleteRecurringPayee_shouldThrowPayeeNotFoundException_whenPayeeBelongsToAnotherOwner() {
        when(recurringPayeeRepository.findByPayeeIdAndOwnerIdAndActiveTrue(100L, 1L)).thenReturn(Optional.empty());

        assertThrows(PayeeNotFoundException.class,
                () -> payeeService.deleteRecurringPayee(1L, 100L));

        verify(recurringPayeeRepository, never()).save(any());
    }
}