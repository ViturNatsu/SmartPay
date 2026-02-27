package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.fdmgroup.SmartPay_BackEnd.SmartPayBackEndApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class RegistrationIntegrationTest {

    private final String firstName = "Quality";
    private final String lastName = "Assurance";
    private final String institution = "Chase";
    private final String validPassword = "@StrongPass123!";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository userRepository;

    // -------------------------------------------------------
    // 1️⃣ Successful Registration
    // -------------------------------------------------------
    @Test
    void shouldRegisterSuccessfully() throws Exception {

        String email = "integration@test.com";
        var request = createValidRequest(email);

        mvc.perform(request)
                .andExpect(status().isCreated());

        User savedUser = userRepository.findByEmail(email).orElse(null);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getEmail()).isEqualTo(email);
    }

    // -------------------------------------------------------
    // 2️⃣ Duplicate Email
    // -------------------------------------------------------
    @Test
    void shouldReturnConflictWhenEmailAlreadyExists() throws Exception {

        String email = "duplicate@test.com";

        // First registration
        mvc.perform(createValidRequest(email))
                .andExpect(status().isCreated());

        // Mark email as verified to simulate real duplicate scenario
        User user = userRepository.findByEmail(email).get();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Second registration attempt
        mvc.perform(createValidRequest(email))
                .andExpect(status().isConflict());
    }

    // -------------------------------------------------------
    // 3️⃣ Validation Failure
    // -------------------------------------------------------
    @Test
    void shouldReturnBadRequestForInvalidPassword() throws Exception {

        SignUpDTO requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setInstitution(institution);
        requestBody.setEmail("invalid@test.com");
        requestBody.setPassword("weak");
        requestBody.setConfirmPassword("weak");
        requestBody.setCustomer(createValidCustomer());

        var request = buildRegisterRequest(requestBody);

        mvc.perform(request)
                .andExpect(status().is4xxClientError());
    }

    // -------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------

    private MockHttpServletRequestBuilder createValidRequest(String email)
            throws JsonProcessingException {

        SignUpDTO requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setInstitution(institution);
        requestBody.setEmail(email);
        requestBody.setPassword(validPassword);
        requestBody.setConfirmPassword(validPassword);
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

    private MockHttpServletRequestBuilder buildRegisterRequest(SignUpDTO requestBody)
            throws JsonProcessingException {

        String requestString = objectMapper.writeValueAsString(requestBody);

        return MockMvcRequestBuilders.post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestString);
    }
}