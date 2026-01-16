package com.fdmgroup.SmartPay_BackEnd;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;

@DataJpaTest
class UserRepositoryTest {
	@Autowired
	private UserRepository userRepo;
	
	@Autowired
	private TestEntityManager entityManager;
	
	@Test
	void saveUser() {
		User user = new User("test@email.com", "testPassword");

        
        User saved = userRepo.save(user);

        
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("test@email.com");

        
        User found = entityManager.find(User.class, saved.getId());
        assertThat(found).isEqualTo(saved);
	}
}
