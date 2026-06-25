package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.config.EncoderConfig;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentMethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.account.AccountService;
import com.fdmgroup.SmartPay_BackEnd.services.paymentMethods.PaymentMethodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class PaymentRecordsTest {

    @Autowired
    PaymentMethodService paymentMethodService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    AccountRepository accountRepository;

    @MockitoBean
    AccountService accountService;

    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    EncoderConfig encoderConfig;


    /*
    @Test
    void systemStoresPaymentRecordWhenItIsCreated() {

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

        // Adding an account and Mocking the accountService: Should be fine since we are testing PaymentMethod
        AccountFactory accountFactory = new AccountFactory(accountRepository);
        Account account = accountFactory.createAccount(AccountType.SAVINGS);
        account.setAccountNumber("voidlast4");
        account.setId((long) 12);

        Mockito.when(accountService.matchMaskedAccount(Mockito.any(), Mockito.any())).thenReturn(Optional.of(account));

        long initCount = paymentRepository.count();
        PaymentMethod pm = new PaymentMethod();
        pm.setBankDisplayName("TD");
        pm.setActive(true);
        pm.setAccountIdentifierMasked("****last4");
        pm.setBankId(12341234L);
        pm.setUser(userRepository.findById(TEST_USER_ID).get());
        PaymentMethod createdPm = paymentMethodService.addPaymentMethod(pm);

        assertEquals(initCount + 1, paymentRepository.count());

        paymentRepository.deleteById(createdPm.getPayment_method_id());
        userRepository.deleteById(TEST_USER_ID);
    }
    */
}
