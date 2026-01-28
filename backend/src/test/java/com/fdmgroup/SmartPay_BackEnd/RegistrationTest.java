package com.fdmgroup.SmartPay_BackEnd;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import com.fdmgroup.SmartPay_BackEnd.services.impl.RegistrationServiceImpl;

@ExtendWith(MockitoExtension.class)
public class RegistrationTest {
    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RegistrationServiceImpl registrationService;
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
