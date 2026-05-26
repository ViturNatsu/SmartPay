package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.config.EncoderConfig;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.SavingsAccount;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.account.AccountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class MockSavingPersistenceTest {

    @Autowired
    AccountService accountService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    EncoderConfig encoderConfig;



    @Test
    void systemStoresAccountWhenMockIsCreated() {

        User testUser = User.builder()
                .firstName("unit test first")
                .lastName("unit last")
                .email("unittest@example.com")
                .role(Role.USER)
                .emailVerified(true)
                .emailVerifiedAt(LocalDateTime.now())
                .password(encoderConfig.passwordEncoder().encode("Test@1234"))
                .build();
        User saved = userRepository.save(testUser);
        long TEST_USER_ID = saved.getId();


        long initCount = accountRepository.count();
        Account account = new SavingsAccount();
        account.setAccountName("test mock savings");
        account.setAccountNumber("12341234");
        account.setBalance(0.0);
        account.getUsers().add(userRepository.findById(TEST_USER_ID).get());
        Account created = accountService.createAccountForUser(account, TEST_USER_ID);

        assertEquals(initCount + 1, accountRepository.count());

        accountRepository.deleteById(created.getId());
        userRepository.deleteById(TEST_USER_ID);
    }
}
