package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.CardRequest;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.integrationTests.integrationHelpers.IntegrationTestHelper;
import com.fdmgroup.SmartPay_BackEnd.integrationTests.integrationHelpers.RegistrationHelper;
import com.fdmgroup.SmartPay_BackEnd.repositories.auth.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.cardRequest.CardRequestRepository;
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

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = com.fdmgroup.SmartPay_BackEnd.SmartPayBackEndApplication.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class CardRequestIntegrationTest {

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
    private CardRequestRepository cardRequestRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IntegrationTestHelper helper;

    @BeforeEach
    void setUp() {
        helper.clearDB();
    }

    /**
     * Verifies that approving a pending request updates the request status
     * and regenerates the associated card details in the database.
     */
    @Test
    void approveRequest_shouldApproveRequestAndRegenerateCardDetails() throws Exception {
        TestData testData = createUserWithCardAndPendingRequest("approve@test.com", "+1 416-555-1001");

        String oldCardNumber = testData.card.getCardNumber();
        String oldCvv = testData.card.getCvv();

        mvc.perform(put("/api/v1/card-request/admin/" + testData.cardRequest.getId() + "/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestStatus").value("APPROVED"));

        CardRequest updatedRequest = cardRequestRepository.findById(testData.cardRequest.getId()).orElseThrow();
        Card updatedCard = cardRepository.findById(testData.card.getCardId()).orElseThrow();

        assertThat(updatedRequest.getRequestStatus()).isEqualTo(RequestStatus.APPROVED);
        assertThat(updatedRequest.getRequestResolvedAt()).isNotNull();

        assertThat(updatedCard.getCardNumber()).isNotNull();
        assertThat(updatedCard.getCvv()).isNotNull();
        assertThat(updatedCard.getCardNumber()).isNotEqualTo(oldCardNumber);
        assertThat(updatedCard.getCvv()).isNotEqualTo(oldCvv);
    }

    /**
     * Verifies that denying a pending request updates only the request status
     * and does not regenerate the associated card details.
     */
    @Test
    void denyRequest_shouldDenyRequestWithoutRegeneratingCardDetails() throws Exception {
        TestData testData = createUserWithCardAndPendingRequest("deny@test.com", "+1 416-555-1002");

        String oldCardNumber = testData.card.getCardNumber();
        String oldCvv = testData.card.getCvv();

        mvc.perform(put("/api/v1/card-request/admin/" + testData.cardRequest().getId() + "/deny")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                  "denyReason": "Insufficient information"
                }
                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestStatus").value("DENIED"))
                .andExpect(jsonPath("$.denyReason").value("Insufficient information"));

        CardRequest updatedRequest = cardRequestRepository.findById(testData.cardRequest.getId()).orElseThrow();
        Card updatedCard = cardRepository.findById(testData.card.getCardId()).orElseThrow();

        assertThat(updatedRequest.getRequestStatus()).isEqualTo(RequestStatus.DENIED);
        assertThat(updatedRequest.getRequestResolvedAt()).isNotNull();
        assertThat(updatedRequest.getDenyReason()).isEqualTo("Insufficient information");

        assertThat(updatedCard.getCardNumber()).isEqualTo(oldCardNumber);
        assertThat(updatedCard.getCvv()).isEqualTo(oldCvv);
    }


    // -------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------

    /**
     * Creates a verified user through the registration flow, retrieves the
     * automatically generated wallet and card, then creates a pending card
     * request for that card.
     */
    private TestData createUserWithCardAndPendingRequest(String email, String phoneNumber) throws Exception {
        mvc.perform(createValidRequest(email, phoneNumber))
                .andExpect(status().isCreated());

        RegistrationHelper registrationHelper = new RegistrationHelper();
        registrationHelper.registerOTP(passwordEncoder, email, otpRepository, mvc);

        User user = userRepository.findByEmail(email).orElseThrow();
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElseThrow();
        Card card = cardRepository.findByWalletWalletId(wallet.getWalletId());

        CardRequest cardRequest = new CardRequest();
        cardRequest.setUser(user);
        cardRequest.setCard(card);
        cardRequest.setRequestStatus(RequestStatus.PENDING);
        cardRequest.setRequestCreatedAt(LocalDateTime.now());
        cardRequest.setRequestResolvedAt(null);

        cardRequest = cardRequestRepository.save(cardRequest);

        return new TestData(user, card, cardRequest);
    }

    private MockHttpServletRequestBuilder createValidRequest(String email, String phoneNumber)
            throws JsonProcessingException {

        SignUpDTO requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setEmail(email);
        requestBody.setPassword(validPassword);
        requestBody.setConfirmPassword(validPassword);
        requestBody.setCustomer(createValidCustomer(phoneNumber));

        String requestString = objectMapper.writeValueAsString(requestBody);

        return MockMvcRequestBuilders.post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestString);
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

    /**
     * Test-only container for the entities created during integration test setup.
     */
    private record TestData(User user, Card card, CardRequest cardRequest) {
    }
}