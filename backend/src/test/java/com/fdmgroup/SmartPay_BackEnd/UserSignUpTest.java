package com.fdmgroup.SmartPay_BackEnd;
import com.fdmgroup.SmartPay_BackEnd.config.EncoderConfig;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import com.fdmgroup.SmartPay_BackEnd.services.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class UserSignUpTest {

    @Mock
    UserRepository mockUserRepo;

    EncoderConfig encoderConfig;

    UserService userService;

    @BeforeEach
    void setup() {
        encoderConfig = new EncoderConfig();
        userService = new UserServiceImpl(mockUserRepo, encoderConfig);
    }

    @Test
    void test_userService_signUpUser_CallsUserRepo_And_SavesUser() {
        //User newUser = new User("john@gmail.com", "12345");
        User newUser = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@gmail.com")
                .password("AweS1234!")
                .build();

        Mockito.when(mockUserRepo.save(newUser)).thenReturn(newUser);
        User expectedUser = userService.signUpUser(newUser);

        verify(mockUserRepo, times(1)).save(newUser);
        assertEquals(expectedUser, newUser);
    }
    
}
