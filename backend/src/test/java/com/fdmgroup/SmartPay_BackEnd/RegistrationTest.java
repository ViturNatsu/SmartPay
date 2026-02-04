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
    @Autowired
    MockMvc mvc;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RegistrationService registrationService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register() throws Exception {
        var requestBody = new SignUpDTO();
        requestBody.setFirstName(firstName);
        requestBody.setLastName(lastName);
        requestBody.setInstitution(institution);
        requestBody.setEmail(email);
        requestBody.setPassword(password);
        requestBody.setConfirmPassword(password);
        var request = buildRegisterRequest(requestBody);

        mvc.perform(request).andExpect(status().isOk());
    }

    private MockHttpServletRequestBuilder buildRegisterRequest(SignUpDTO requestBody) throws JsonProcessingException {
        var requestString = objectMapper.writeValueAsString(requestBody);
        return MockMvcRequestBuilders.post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(requestString);
    }

    /*
    @Test
    void register_returnsUser_whenEmailDoesNotExist() {
        SignUpDTO dto = new SignUpDTO();
        dto.setEmail("test@email.com");

        User user = User.builder().email("test@email.com").build();

        when(userRepository.findByEmail("test@email.com"))
                .thenReturn(Optional.empty());
        when(userService.signUpUser(any(User.class)))
                .thenReturn(user);

        User result = registrationService.register(dto);

        assertNotNull(result);
    }

    @Test
    void register_throwsException_whenEmailAlreadyExists() {
        SignUpDTO dto = new SignUpDTO();
        dto.setEmail("test@email.com");

        when(userRepository.findByEmail("test@email.com"))
                .thenReturn(Optional.of(User.builder().build()));

        assertThrows(DuplicateEmailException.class,
                () -> registrationService.register(dto));
    }

    @Test
    void consistentEmail_returnsLowercaseTrimmedEmail() {
        String result = registrationService.consistentEmail("  TEST@EMAIL.COM  ");

        assertEquals("test@email.com", result);
    }
    */
}
