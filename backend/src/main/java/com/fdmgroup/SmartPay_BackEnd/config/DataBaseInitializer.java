package com.fdmgroup.SmartPay_BackEnd.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.CheckingAccount;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.GovernmentIdType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentmethods.PaymentRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DataBaseInitializer {
    private final EncoderConfig encoderConfig;

    DataBaseInitializer(EncoderConfig encoderConfig) {
        this.encoderConfig = encoderConfig;
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, CustomerRepository customerRepository, AccountRepository accountRepository, PaymentRepository paymentRepository) {
        return args -> {
            if (userRepository.findByEmail("admin1@example.com").isEmpty()) {
                User admin1 = User.builder()
                        .firstName("Admin1FirstName")
                        .lastName("Admin1LastName")
                        .email("admin1@example.com")
                        .role(Role.ADMIN)
                        .emailVerified(true)
                        .emailVerifiedAt(LocalDateTime.now())
                        .password(encoderConfig.passwordEncoder().encode("Admin1@1234"))
                        .build();
                userRepository.save(admin1);
                log.info("Database initialized with admin1 user: {}", admin1.getEmail());

            }

            if (userRepository.findByEmail("admin2@example.com").isEmpty()) {
                User admin2 = User.builder()
                        .firstName("Admin2FirstName")
                        .lastName("Admin2LastName")
                        .email("admin2@example.com")
                        .role(Role.ADMIN)
                        .emailVerified(true)
                        .emailVerifiedAt(LocalDateTime.now())
                        .password(encoderConfig.passwordEncoder().encode("Admin2@1234"))
                        .build();
                userRepository.save(admin2);
                log.info("Database initialized with admin2 user: {}", admin2.getEmail());

            }

            if (userRepository.findByEmail("test@example.com").isEmpty()) {
                User testUser = User.builder()
                        .firstName("TestFirstName")
                        .lastName("TestLastName")
                        .email("test@example.com")
                        .role(Role.USER)
                        .emailVerified(true)
                        .emailVerifiedAt(LocalDateTime.now())
                        .password(encoderConfig.passwordEncoder().encode("Test@1234"))
                        .build();
                userRepository.save(testUser);
                log.info("Database initialized with test user: {}", testUser.getEmail());

                Customer testCustomer = Customer.builder()
                        .user(testUser)
                        .addressLine1("130 Adelaide St W")
                        .city("Toronto")
                        .country("Canada")
                        .createdAt(LocalDateTime.now())
                        .dob("20000101")
                        .firstName("TestFirstName")
                        .lastName("TestLastName")
                        .occupation("Software Engineer")
                        .phoneNumber("4161234567")
                        .postalCode("M5H 2N2")
                        .province("ON")
                        .socialInsuranceNumber("123-456-789")
                        .governmentIdNumber("A1234567")
                        .governmentIdType(GovernmentIdType.PASSPORT)
                        .updatedAt(LocalDateTime.now())
                        .build();
                customerRepository.save(testCustomer);
                log.info("Database initialized with test customer for user: {}", testCustomer.getUser().getEmail());
            }

            if (userRepository.findByEmail("test2@example.com").isEmpty()) {
                User testUser2 = User.builder()
                        .firstName("TestFirstName2")
                        .lastName("TestLastName2")
                        .email("test2@example.com")
                        .role(Role.USER)
                        .emailVerified(true)
                        .emailVerifiedAt(LocalDateTime.now())
                        .password(encoderConfig.passwordEncoder().encode("Test@1234"))
                        .build();
                userRepository.save(testUser2);
                log.info("Database initialized with test user: {}", testUser2.getEmail());


                Customer testCustomer2 = Customer.builder()
                        .user(testUser2)
                        .addressLine1("130 Adelaide St W")
                        .city("Toronto")
                        .country("Canada")
                        .createdAt(LocalDateTime.now())
                        .dob("20000101")
                        .firstName("TestFirstName")
                        .lastName("TestLastName")
                        .occupation("Software Engineer")
                        .phoneNumber("4167654321")
                        .postalCode("M5H 2N2")
                        .province("ON")
                        .socialInsuranceNumber("123-456-789")
                        .governmentIdNumber("A1234567")
                        .governmentIdType(GovernmentIdType.PASSPORT)
                        .updatedAt(LocalDateTime.now())
                        .build();
                customerRepository.save(testCustomer2);
                log.info("Database initialized with test customer for user: {}", testCustomer2.getUser().getEmail());


            }
            User testUser2 = userRepository.findByEmail("test2@example.com").orElse(null);
            User testUser1 = userRepository.findByEmail("test@example.com").orElse(null);
            if(testUser2 != null && testUser1 != null){

                if(accountRepository.findByAccountNumber("00000401").isEmpty()){
                    Account testAccTd1 = new CheckingAccount();
                    testAccTd1.setAccountName("TD Test Checking 1");
                    testAccTd1.setInstitutionNumber("004");
                    testAccTd1.setTransitNumber("000123");
                    testAccTd1.setAccountNumber("00000401");
                    testAccTd1.setBalance(1000.00);
                    testAccTd1.setActive(true);
                    testAccTd1.getUsers().add(testUser2);
                    testAccTd1.getUsers().add(testUser1);
                    accountRepository.save(testAccTd1);
                }
                 if(accountRepository.findByAccountNumber("00000402").isEmpty()){
                    Account testAccTd2 = new CheckingAccount();
                    testAccTd2.setAccountName("TD Test Checking 2");
                    testAccTd2.setInstitutionNumber("004");
                    testAccTd2.setTransitNumber("000123");
                    testAccTd2.setAccountNumber("00000402");
                    testAccTd2.setBalance(1000.00);
                    testAccTd2.setActive(true);
                    testAccTd2.getUsers().add(testUser2);
                    testAccTd2.getUsers().add(testUser1);
                    accountRepository.save(testAccTd2);
                }
                if(accountRepository.findByAccountNumber("00000403").isEmpty()){
                    Account testAccTd3 = new CheckingAccount();
                    testAccTd3.setAccountName("TD Test Checking 3");
                    testAccTd3.setInstitutionNumber("004");
                    testAccTd3.setTransitNumber("000123");
                    testAccTd3.setAccountNumber("00000403");
                    testAccTd3.setBalance(1000.00);
                    testAccTd3.setActive(true);
                    accountRepository.save(testAccTd3);
                }

                if(accountRepository.findByAccountNumber("77777301").isEmpty()){
                    Account testAccRbc1 = new CheckingAccount();
                    testAccRbc1.setAccountName("RBC Test Checking 1");
                    testAccRbc1.setInstitutionNumber("003");
                    testAccRbc1.setTransitNumber("000124");
                    testAccRbc1.setAccountNumber("77777301");
                    testAccRbc1.setBalance(1000.00);
                    testAccRbc1.setActive(true);
                    testAccRbc1.getUsers().add(testUser2);
                    accountRepository.save(testAccRbc1);
                }
                if(accountRepository.findByAccountNumber("00000301").isEmpty()){
                    Account testAccRbc2 = new CheckingAccount();
                    testAccRbc2.setAccountName("RBC Test Checking 2");
                    testAccRbc2.setInstitutionNumber("003");
                    testAccRbc2.setTransitNumber("000124");
                    testAccRbc2.setAccountNumber("00000301");
                    testAccRbc2.setBalance(1000.00);
                    testAccRbc2.setActive(true);
                    testAccRbc2.getUsers().add(testUser2);
                    accountRepository.save(testAccRbc2);
                }

                Account testTD1 = accountRepository.findByAccountNumber("00000401").get();
                if(paymentRepository.findByUserIdAndAccountId(3, 1).isEmpty()){
                    PaymentMethod testPM1 = new PaymentMethod();
                    testPM1.setAccount(testTD1);
                    testPM1.setUser(testUser1);
                    testPM1.setBankDisplayName("TD");
                    testPM1.setBankId(4l);
                    testPM1.setActive(true);
                    paymentRepository.save(testPM1);
                }
                if(paymentRepository.findByUserIdAndAccountId(4, 1).isEmpty()) {
                    PaymentMethod testPM2 = new PaymentMethod();
                    testPM2.setAccount(testTD1);
                    testPM2.setUser(testUser2);
                    testPM2.setBankDisplayName("TD");
                    testPM2.setBankId(4l);
                    testPM2.setActive(true);
                    paymentRepository.save(testPM2);
                }

            }
        };
    }
}