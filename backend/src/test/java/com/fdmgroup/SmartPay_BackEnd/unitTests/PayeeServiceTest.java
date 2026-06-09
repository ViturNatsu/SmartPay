package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeAlreadyExistsException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.payee.PayeeServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayeeServiceTest {

    @Mock
    private PayeeRepository payeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerRepository customerRepository;

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
}
