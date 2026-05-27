package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;

import jakarta.persistence.EntityManager;

@SpringBootTest(classes = com.fdmgroup.SmartPay_BackEnd.SmartPayBackEndApplication.class)
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class AuthSessionIntegrationTest {
	@Autowired
	MockMvc mockMvc;

	@Autowired
	private JwtSessionService jwtSessionService;

	@Autowired
	private SessionService sessionService;

	@Autowired
	private UserRepository userRepo;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private PlatformTransactionManager transactionManager;

	@Autowired
	private EntityManager entityManager;

	private User testUser;

	@BeforeEach
	void setup() {
		TransactionTemplate tx = new TransactionTemplate(transactionManager);
		tx.execute(status -> {
			entityManager.createNativeQuery("DELETE FROM sessions").executeUpdate();
			entityManager.createNativeQuery("DELETE FROM audit_log").executeUpdate();
			entityManager.createNativeQuery("DELETE FROM customer_information").executeUpdate();
			entityManager.createNativeQuery("DELETE FROM otp").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM chequing_accounts").executeUpdate();
			entityManager.createNativeQuery("DELETE FROM user_account_table").executeUpdate();
			entityManager.createNativeQuery("DELETE FROM payment_methods").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM accounts").executeUpdate();
			entityManager.createNativeQuery("DELETE FROM users").executeUpdate();
			return null;
		});

		testUser = User.builder()
				.firstName("Test")
				.lastName("User")
				.email("test@test.com")
				.password(passwordEncoder.encode("password123"))
				.emailVerified(true)
				.role(Role.USER)
				.failedLoginAttempts(0)
				.build();
		testUser = userRepo.save(testUser);
	}

	@Test
	void loginAuthShouldSucceed_andReturnBodyWith_otpSentTrue_whenVerfiedUserLogsIn() throws Exception {
		mockMvc.perform(post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
							"email" : "test@test.com",
							"password" : "password123"
						}
						"""))
				.andExpect(status().isAccepted())
				.andExpect(jsonPath("$.otpSent").value(true));
	}

	@Test
	void loginAuthShouldFail_onIncorrectCredentials() throws Exception {
		mockMvc.perform(post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
							"email" : "wrong@email.net",
							"password" : "wrong_password"
						}
						"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void loginAuthShouldFail_whenUsingUnverifiedEmailAddress() throws Exception {
		User unverifiedUser = User.builder()
				.firstName("Unverified")
				.lastName("User")
				.email("unverified@test.com")
				.password(passwordEncoder.encode("password456"))
				.emailVerified(false)
				.role(Role.USER)
				.failedLoginAttempts(0)
				.build();
		userRepo.save(unverifiedUser);

		mockMvc.perform(post("/api/v1/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
							"email" : "unverified@test.com",
							"password" : "password456"
						}
						"""))
				.andExpect(status().isForbidden());
	}

	@Test
	void refreshShouldSucceed_whenValidSessionIsRefreshed() throws Exception {
		String accessToken = jwtSessionService.createAccessToken(testUser);
		String refreshToken = jwtSessionService.createRefreshToken(testUser);
		sessionService.generateNewSession(testUser, refreshToken);

		mockMvc.perform(post("/api/v1/auth/refresh")
				.header("Authorization", "Bearer " + refreshToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.refreshToken").exists())
				.andExpect(jsonPath("$.accessToken").exists());
		sessionService.deleteAllUserSessions(testUser);
	}

	@Test
	void refreshAuthShouldFail_whenNoAuthHeaderProvided() throws Exception {
		mockMvc.perform(post("/api/v1/auth/refresh"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void refreshAuthShouldFail_whenEmptyBearerTokenProvided() throws Exception {
		mockMvc.perform(post("/api/v1/auth/refresh")
				.header("Authorization", "Bearer "))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void refreshAuthShouldFail_whenInvalidBearerTokenProvided() throws Exception {
		mockMvc.perform(post("/api/v1/auth/refresh")
				.header("Authorization", "Bearer 1234567890"))
				.andExpect(status().isUnauthorized());
	}
}
