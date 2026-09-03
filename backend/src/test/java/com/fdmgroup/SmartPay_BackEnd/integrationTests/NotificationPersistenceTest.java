package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import static org.junit.jupiter.api.Assertions.*;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationTier;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.notification.Notification;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.notification.NotificationRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class NotificationPersistenceTest {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void notification_persistsDefaultsAndRelatedEntityFields() {
        User user = User.builder()
                .firstName("Test")
                .lastName("User")
                .email("notification-test@example.com")
                .role(Role.USER)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(NotificationType.SUCCESS);
        notification.setTitle("Payment successful");
        notification.setDetail("$75.00 sent");
        notification.setTier(NotificationTier.T3.getValue());
        notification.setRelatedEntityType("WALLET_TRANSACTION");
        notification.setRelatedEntityId("123");

        Notification saved = notificationRepository.saveAndFlush(notification);

        Long notificationId = saved.getId();
        entityManager.clear();
        Notification retrieved = notificationRepository.findById(notificationId)
                .orElseThrow();

        assertNotNull(retrieved.getCreatedAt()); //On create: set createdAt to current time
        assertEquals(Boolean.FALSE, retrieved.getRead());
        assertNull(retrieved.getReadAt()); //On create: set read to false
        assertEquals(Boolean.FALSE, retrieved.getDismissed());
        assertNull(retrieved.getDismissedAt());
        assertEquals(3, retrieved.getTier());
        assertEquals("WALLET_TRANSACTION", retrieved.getRelatedEntityType());
        assertEquals("123", retrieved.getRelatedEntityId());
    }
}
