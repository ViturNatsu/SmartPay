package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.GovernmentIdType;
import com.fdmgroup.SmartPay_BackEnd.exception.CustomerInfoNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.services.impl.CustomerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
        import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest  {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setAddressLine1("123 Street");
        customer.setCity("Toronto");
        customer.setProvince("ON");
        customer.setCountry("Canada");
        customer.setPostalCode("A1A1A1");
        customer.setPhoneNumber("1234567890");
        customer.setSocialInsuranceNumber("123456789");
        customer.setGovernmentIdType(GovernmentIdType.PASSPORT);
        customer.setGovernmentIdNumber("P1234567");
        customer.setOccupation("Engineer");
    }


    // getCustomerInfo Tests

    @Test
    void getCustomerInfo_shouldReturnCustomerDTO_whenCustomerExists() {
        when(customerRepository.findByUserId(1L))
                .thenReturn(Optional.of(customer));

        CustomerDTO result = customerService.getCustomerInfo(1L);

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());

        verify(customerRepository).findByUserId(1L);
    }

    @Test
    void getCustomerInfo_shouldThrowException_whenCustomerNotFound() {
        when(customerRepository.findByUserId(99L))
                .thenReturn(Optional.empty());

        assertThrows(CustomerInfoNotFoundException.class,
                () -> customerService.getCustomerInfo(99L));

        verify(customerRepository).findByUserId(99L);
    }


    // updateCustomerInfo Tests


    @Test
    void updateCustomerInfo_shouldUpdateAndReturnDTO() {

        CustomerDTO inputDto = CustomerDTO.builder()
                .firstName("Jane")
                .lastName("Smith")
                .addressLine1("456 Avenue")
                .city("Ottawa")
                .province("ON")
                .country("Canada")
                .postalCode("B2B2B2")
                .phoneNumber("9876543210")
                .socialInsuranceNumber("987654321")
                .governmentIdType("PASSPORT")
                .governmentIdNumber("X9876543")
                .occupation("Doctor")
                .build();

        when(customerRepository.findByUserId(1L))
                .thenReturn(Optional.of(customer));

        when(customerRepository.save(any(Customer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerDTO result = customerService.updateCustomerInfo(1L, inputDto);

        assertNotNull(result);
        assertEquals("Jane", result.getFirstName());
        assertEquals("Smith", result.getLastName());

        verify(customerRepository).findByUserId(1L);
        verify(customerRepository).save(customer);
    }

    @Test
    void updateCustomerInfo_shouldThrowException_whenCustomerNotFound() {
        when(customerRepository.findByUserId(2L))
                .thenReturn(Optional.empty());

        CustomerDTO inputDto = CustomerDTO.builder()
                .governmentIdType("PASSPORT")
                .build();

        assertThrows(CustomerInfoNotFoundException.class,
                () -> customerService.updateCustomerInfo(2L, inputDto));

        verify(customerRepository).findByUserId(2L);
        verify(customerRepository, never()).save(any());
    }


    // parseUserId Tests


    @Test
    void parseUserId_shouldReturnLong_whenValid() {
        Long result = customerService.parseUserId("123");

        assertEquals(123L, result);
    }

    @Test
    void parseUserId_shouldThrowException_whenInvalid() {
        assertThrows(IllegalArgumentException.class,
                () -> customerService.parseUserId("abc"));
    }
}

