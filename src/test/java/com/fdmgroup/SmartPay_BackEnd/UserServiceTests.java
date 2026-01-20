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

@ExtendWith(MockitoExtension.class)
public class UserServiceTests {

    @Mock
    UserRepository mockUserRepo;

    EncoderConfig encoderConfig;

    UserService userService;

    @BeforeEach
    void setup() {
        userService = new UserServiceImpl(mockUserRepo, encoderConfig);
    }

    @Test
    void test_userService_signUpUser_CallsUserRepo_And_SavesUser() {
        User newUser = new User("John", "john@gmail.com");

        Mockito.when(mockUserRepo.save(newUser)).thenReturn(newUser);
        User expectedUser = userService.signUpUser(newUser);

        assertEquals(expectedUser, newUser);

    }


}
