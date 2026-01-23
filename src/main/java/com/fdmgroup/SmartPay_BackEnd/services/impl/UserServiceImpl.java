package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    // TODO

    @Autowired
    private UserRepository userRepository;

    @Override
    public User signUpUser(User user) {

        return userRepository.save(user);
    }

	@Override
	public User findUserByEmail(String email) throws UserNotFoundException {
		Optional<User> user = userRepository.findUserByEmail(email);
		if (!user.isPresent())
			throw new UserNotFoundException("No user exists with matching email address!");
		return user.get();
	}
    @Override
    public void save(User user){
        userRepository.save(user);
    }
}
