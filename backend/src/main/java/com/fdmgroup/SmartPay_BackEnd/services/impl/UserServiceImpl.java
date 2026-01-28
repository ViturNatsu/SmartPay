package com.fdmgroup.SmartPay_BackEnd.services.impl;

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
        if (email == null || password == null ||
            email.isBlank() || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        // Normalize email for consistent lookup
        String normalizedEmail = email.trim().toLowerCase();

        // Attempt to find user by email
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials."));

        // Compare raw password to encoded password from DB
        boolean passwordMatches = encoderConfig
                .passwordEncoder()
                .matches(password, user.getPassword());

        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid credentials.");
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
