package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.integrationTests.integrationHelpers.IntegrationTestHelper;
import com.fdmgroup.SmartPay_BackEnd.integrationTests.integrationHelpers.RegistrationHelper;
import com.fdmgroup.SmartPay_BackEnd.repositories.auth.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.fdmgroup.SmartPay_BackEnd.SmartPayBackEndApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class RegistrationIntegrationTest {

    private final String firstName = "Quality";
    private final String lastName = "Assurance";
    private final String validPassword = "@StrongPass123!";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private IntegrationTestHelper helper;

    @BeforeEach
    void setUp() {
        helper.clearDB();
    }

    // -------------------------------------------------------
    // 1️⃣ Successful Registration
    // -------------------------------------------------------
    @Test
    void shouldRegisterSuccessfully() throws Exception {

        String email = "integration@test.com";
        var request = createValidRequest(email,"+1 416-555-1123");

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
        mvc.perform(createValidRequest(email, "+1 416-555-1234"))
                .andExpect(status().isCreated());

        // Mark email as verified to simulate real duplicate scenario
        User user = userRepository.findByEmail(email).get();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Second registration attempt
        mvc.perform(createValidRequest(email,"+1 416-555-0123"))
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
        requestBody.setEmail("invalid@test.com");
        requestBody.setPassword("weak");
        requestBody.setConfirmPassword("weak");
        requestBody.setCustomer(createValidCustomer("+1 416-555-0001"));

        var request = buildRegisterRequest(requestBody);

        mvc.perform(request)
                .andExpect(status().is4xxClientError());
    }


    @Test
    void shouldGenerateCardAfterRegistration() throws Exception {
        String email = "email_1@test.com";

        // First registration
        mvc.perform(createValidRequest(email, "+1 780-111-1111"))
                .andExpect(status().isCreated());


        User user = userRepository.findByEmail(email).get();
        assertThat(user).isNotNull();

        // Verify
        RegistrationHelper helper = new RegistrationHelper();
        helper.registerOTP(passwordEncoder, email, otpRepository, mvc);

        Wallet wallet = walletRepository.findByUserId(user.getId()).get();
        assertThat(wallet).isNotNull();

        Card card = cardRepository.findByWalletWalletId(wallet.getWalletId());
        assertThat(card).isNotNull();
        assertThat(card.getCardNumber()).isNotNull();
        assertThat(card.getStatus()).isEqualTo(CardStatus.ACTIVE);
        assertThat(card.getCvv()).isNotNull();
    }

    // -------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------

    private MockHttpServletRequestBuilder createValidRequest(String email, String phoneNumber)
            throws JsonProcessingException {

        SignUpDTO requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setEmail(email);
        requestBody.setPassword(validPassword);
        requestBody.setConfirmPassword(validPassword);
        requestBody.setCustomer(createValidCustomer(phoneNumber));

        return buildRegisterRequest(requestBody);
    }

    private CustomerDTO createValidCustomer(String phoneNumber) {
        return CustomerDTO.builder()
                .addressLine1("123 King Street West")
                .addressLine2("Unit 10")
                .city("Toronto")
                .province("ON")
                .country("Canada")
                .postalCode("M5V 3L9")
                .phoneNumber(phoneNumber)
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