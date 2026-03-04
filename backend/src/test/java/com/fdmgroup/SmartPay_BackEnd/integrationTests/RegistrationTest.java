package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.RegistrationService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.Utility.RateLimiterFilter;

import java.io.IOException;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(classes = com.fdmgroup.SmartPay_BackEnd.SmartPayBackEndApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class RegistrationTest {
    private final String firstName = "Quality";
    private final String lastName = "Assurance";
    private final String email = "qa@smartpay.test";
    private final String password = "@wTJGT&a1qn@e38X";
    private final String wrongPassword = "69&YpnXa*h^3";
    private final String shortPassword = "Abc@123";
    private final String passwordWithoutUppercase = "umvdjh54ngw5";
    private final String passwordWithoutSpecialCharacter = "GX5bphJCBjAp";

    @Autowired
    MockMvc mvc;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @MockitoBean
    private RegistrationService registrationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void register() throws Exception {

        User mockUser = User.builder()
            .id(1L)
            .firstName(firstName)
            .lastName(lastName)
            .email(email)
            .password(password)
            .build();

        when(registrationService.register(any(SignUpDTO.class)))
            .thenReturn(mockUser);

        var request = createValidRequest();
        mvc.perform(request).andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.email").value(email))
        .andExpect(jsonPath("$.otpSent").value(true));
    }

    @Test
    void registerWithoutFirstName() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName("");
        requestBody.setLastName(lastName);
        requestBody.setEmail(email);
        requestBody.setPassword(password);
        requestBody.setConfirmPassword(password);
        var request = buildRegisterRequest(requestBody);

        mvc.perform(request).andExpect(status().is4xxClientError());
    }

    @Test
    void registerWithoutLastName() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName("");
        requestBody.setEmail(email);
        requestBody.setPassword(password);
        requestBody.setConfirmPassword(password);
        var request = buildRegisterRequest(requestBody);

        mvc.perform(request).andExpect(status().is4xxClientError());
    }

    @Test
    void registerWithMismatchedPasswords() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setEmail(email);
        requestBody.setPassword(password);
        requestBody.setConfirmPassword(wrongPassword);
        var request = buildRegisterRequest(requestBody);

        mvc.perform(request).andExpect(status().is4xxClientError());
    }

    @Test
    void registerWithExistingEmail() throws Exception {
        var request1 = createValidRequest();
        mvc.perform(request1);

        User user = userRepository.findByEmail(email).get();
        user.setEmailVerified(true);
        userRepository.save(user);

        var request2 = createValidRequest();
        mvc.perform(request2).andExpect(status().isConflict());
    }

    @Test
    void registerWithShortPassword() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setEmail(email);
        requestBody.setPassword(shortPassword);
        requestBody.setConfirmPassword(shortPassword);
        var request = buildRegisterRequest(requestBody);

        mvc.perform(request).andExpect(status().is4xxClientError());
    }

    @Test
    void registerWithNoUppercaseLetterInPassword() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setEmail(email);
        requestBody.setPassword(passwordWithoutUppercase);
        requestBody.setConfirmPassword(passwordWithoutUppercase);
        var request = buildRegisterRequest(requestBody);

        mvc.perform(request).andExpect(status().is4xxClientError());
    }

    @Test
    void registerWithNoSpecialCharacterInPassword() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setEmail(email);
        requestBody.setPassword(passwordWithoutSpecialCharacter);
        requestBody.setConfirmPassword(passwordWithoutSpecialCharacter);
        var request = buildRegisterRequest(requestBody);

        mvc.perform(request).andExpect(status().is4xxClientError());
    }

    private MockHttpServletRequestBuilder createValidRequest() throws JsonProcessingException {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setEmail(email);
        requestBody.setPassword(password);
        requestBody.setConfirmPassword(password);
        requestBody.setCustomer(createValidCustomer());
        return buildRegisterRequest(requestBody);
    }

    private CustomerDTO createValidCustomer() {
        return CustomerDTO.builder()
                .addressLine1("123 King Street West")
                .addressLine2("Unit 10")
                .city("Toronto")
                .province("ON")
                .country("Canada")
                .postalCode("M5V 3L9")
                .phoneNumber("+1 416-555-0123")
                .socialInsuranceNumber("123-456-789")
                .governmentIdType("PASSPORT")
                .governmentIdNumber("AB1234567")
                .occupation("Analyst")
                .dob("1990-05-01")
                .build();
    }

    private MockHttpServletRequestBuilder buildRegisterRequest(SignUpDTO requestBody) throws JsonProcessingException {
        var requestString = objectMapper.writeValueAsString(requestBody);
        return MockMvcRequestBuilders.post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(requestString);
    }
}
