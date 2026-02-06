package com.fdmgroup.SmartPay_BackEnd;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.RegistrationService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = SmartPayBackEndApplication.class)
@AutoConfigureMockMvc
@Transactional
class RegistrationTest {
    private final String firstName = "Quality";
    private final String lastName = "Assurance";
    private final String institution = "Chase";
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
    @Autowired
    private RegistrationService registrationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void register() throws Exception {
        var request = createValidRequest();
        mvc.perform(request).andExpect(status().isCreated());
    }

    @Test
    void registerWithoutFirstName() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName("");
        requestBody.setLastName(lastName);
        requestBody.setInstitution(institution);
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
        requestBody.setInstitution(institution);
        requestBody.setEmail(email);
        requestBody.setPassword(password);
        requestBody.setConfirmPassword(password);
        var request = buildRegisterRequest(requestBody);

        mvc.perform(request).andExpect(status().is4xxClientError());
    }

    @Test
    void registerWithoutInstitution() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setInstitution("");
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
        requestBody.setInstitution(institution);
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

        var request2 = createValidRequest();
        mvc.perform(request2).andExpect(status().isConflict());
    }

    @Test
    void registerWithShortPassword() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setInstitution(institution);
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
        requestBody.setInstitution(institution);
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
        requestBody.setInstitution(institution);
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
        requestBody.setInstitution(institution);
        requestBody.setEmail(email);
        requestBody.setPassword(password);
        requestBody.setConfirmPassword(password);
        return buildRegisterRequest(requestBody);
    }

    private MockHttpServletRequestBuilder buildRegisterRequest(SignUpDTO requestBody) throws JsonProcessingException {
        var requestString = objectMapper.writeValueAsString(requestBody);
        return MockMvcRequestBuilders.post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(requestString);
    }
}
