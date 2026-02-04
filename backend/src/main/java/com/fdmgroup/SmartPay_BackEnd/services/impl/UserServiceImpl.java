package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.config.EncoderConfig;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import com.fdmgroup.SmartPay_BackEnd.exception.*;

@Service
//@AllArgsConstructor
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    private final EncoderConfig encoderConfig;
    
    public UserServiceImpl(UserRepository userRepository, EncoderConfig encoderConfig) {
        this.userRepository = userRepository;
        this.encoderConfig = encoderConfig;
    }

    @Override
    public User signUpUser(User user) {

        String encodedPassword = encoderConfig
                .passwordEncoder()
                .encode(user.getPassword());
        
        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

	@Override
	public User findByEmail(String email) throws UserNotFoundException {
		Optional<User> user = userRepository.findByEmail(email);
		if (!user.isPresent())
			throw new UserNotFoundException("No user exists with matching email address!");
		return user.get();
	}
    @Override
    public void save(User user){
        userRepository.save(user);
    }
    // US-F02-02-01 (Sign In)
    @Override
    public User validateCredentials(String email, String password) {

        // Basic null/blank validation
        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            throw new LoginInvalidCredentialsException();
        }

        // Normalize email for consistent lookup
        String normalizedEmail = email.trim().toLowerCase();
        
        final int MAX_FAILED_ATTEMPTS = 5;
        final int LOCK_DURATION_MINUTES = 30;

        // Find user by email (unregistered email -> generic invalid credentials)
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(LoginInvalidCredentialsException::new);
        
        // 1) Block if locked
        LocalDateTime lockedUntil = user.getLockedUntil();
        if (lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now())) {
            throw new AccountLockedException(
                    "Your account is locked due to multiple failed attempts. Please reset password or try later."
            );
        }

        // 2) Check password
        boolean passwordMatches = encoderConfig
                .passwordEncoder()
                .matches(password, user.getPassword());

        if (!passwordMatches) {
            int newCount = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(newCount);

            if (newCount >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            }

            userRepository.save(user);

            if (newCount >= MAX_FAILED_ATTEMPTS) {
                throw new AccountLockedException(
                        "Your account is locked due to multiple failed attempts. Please reset password or try later."
                );
            }

            throw new LoginInvalidCredentialsException();
        }

        // 3) Valid credentials but email not verified -> block login
        if (!user.isEmailVerified()) {
            throw new LoginUnverifiedEmailException();
        }
        
        // 4) Success: reset counters
        if (user.getFailedLoginAttempts() != 0 || user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }

        // Login successful
        return user;
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with id: " + userId));
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found with email: " + email));
    }
}
