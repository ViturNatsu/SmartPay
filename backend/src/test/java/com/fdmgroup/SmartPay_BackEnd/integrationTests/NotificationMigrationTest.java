package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import static org.junit.jupiter.api.Assertions.assertEquals;

import javax.sql.DataSource;

import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationTier;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.test.context.ActiveProfiles;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class NotificationMigrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserRepository userRepository;

    @Test
    void notificationBackfill_migratesLegacyNotifications() {

        // Arrange: create a real user first so the notification FK is valid
        User user = User.builder()
                .firstName("Legacy")
                .lastName("User")
                .email("legacy-notification@test.com")
                .build();

        user = userRepository.save(user);

        Long userId = user.getId();

        // Simulate the legacy schema
        jdbcTemplate.execute("""
                ALTER TABLE notifications
                ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0 NOT NULL
                """);

        // Legacy SECURITY notification
        jdbcTemplate.update("""
                INSERT INTO notifications
                (
                    created_at,
                    detail,
                    is_dismissed,
                    title,
                    type,
                    user_id,
                    is_read,
                    tier,
                    priority
                )
                VALUES (
                    CURRENT_TIMESTAMP,
                    NULL,
                    FALSE,
                    'New sign-in detected',
                    'SECURITY',
                    ?,
                    NULL,
                    NULL,
                    0
                )
                """, userId);

        // Legacy low balance notification
        jdbcTemplate.update("""
                INSERT INTO notifications
                (
                    created_at,
                    detail,
                    is_dismissed,
                    title,
                    type,
                    user_id,
                    is_read,
                    tier,
                    priority
                )
                VALUES (
                    CURRENT_TIMESTAMP,
                    'Below $250',
                    FALSE,
                    'Low wallet balance',
                    'WARNING',
                    ?,
                    NULL,
                    NULL,
                    1
                )
                """, userId);

        // Legacy payment success notification
        jdbcTemplate.update("""
                INSERT INTO notifications
                (
                    created_at,
                    detail,
                    is_dismissed,
                    title,
                    type,
                    user_id,
                    is_read,
                    tier,
                    priority
                )
                VALUES (
                    CURRENT_TIMESTAMP,
                    '$10.00 sent',
                    FALSE,
                    'Payment successful',
                    'SUCCESS',
                    ?,
                    NULL,
                    NULL,
                    2
                )
                """, userId);

        // Act: run the actual migration script used by the application
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator(new ClassPathResource("db/backfill/notification-backfill.sql"));
        // Run twice to verify the migration is safe on repeated startup
        populator.execute(dataSource);
        populator.execute(dataSource);

        // Assert: SECURITY -> T2 + unread
        Boolean securityRead = jdbcTemplate.queryForObject("""
                SELECT is_read
                FROM notifications
                WHERE title = 'New sign-in detected' AND user_id = ?
                """, Boolean.class, userId);

        Integer securityTier = jdbcTemplate.queryForObject("""
                SELECT tier
                FROM notifications
                WHERE title = 'New sign-in detected' AND user_id = ?
                """, Integer.class, userId);
        assertEquals(Boolean.FALSE, securityRead);
        assertEquals(NotificationTier.T2.getValue(), securityTier);

        // Assert: low balance -> T2
        Integer lowBalanceTier = jdbcTemplate.queryForObject("""
                SELECT tier
                FROM notifications
                WHERE title = 'Low wallet balance' AND user_id = ?
                """, Integer.class, userId);
        assertEquals(NotificationTier.T2.getValue(), lowBalanceTier);

        // Assert: payment success -> T3
        Integer paymentTier = jdbcTemplate.queryForObject("""
                SELECT tier
                FROM notifications
                WHERE title = 'Payment successful' AND user_id = ?
                """, Integer.class, userId);
        assertEquals(NotificationTier.T3.getValue(), paymentTier);

        // Assert: legacy priority column was removed
        Integer priorityColumnCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'NOTIFICATIONS'AND COLUMN_NAME = 'PRIORITY'
                """, Integer.class);
        assertEquals(0, priorityColumnCount);
    }
}
