package com.fdmgroup.SmartPay_BackEnd.repositories.notification;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.notification.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("""
           select notif
           from Notification notif
           where notif.user.id = :userId
               and notif.dismissed = false
           order by notif.createdAt desc
           """)
    List<Notification> findActiveNotificationsByUserId(@Param("userId")Long userId, Pageable pageable);

    long countByUser_IdAndDismissedFalse(Long userId);

    boolean existsByUser_IdAndTypeAndDismissedFalse(Long userId, NotificationType type);

    long countByUser_IdAndReadFalse(Long userId);

    /**
     * Duplicate-prevention key (US-NOTIF-BE-06, Scenario 12): a notification is a duplicate when the
     * same user already has one linked to the same entity occurrence. Related entity ids are chosen
     * per event so they are unique per occurrence (e.g. the wallet transaction or billing charge),
     * which makes this check correct across every event type.
     */
    boolean existsByUser_IdAndRelatedEntityTypeAndRelatedEntityId(
            Long userId, String relatedEntityType, String relatedEntityId);

    /**
     * Per-cycle dedup for reminders (Scenarios 10–11): reminders link to the recurring payee, whose
     * "next payment date" advances each cycle, so uniqueness is scoped to the current cycle window
     * via {@code createdAt}.
     */
    boolean existsByUser_IdAndRelatedEntityTypeAndRelatedEntityIdAndCreatedAtAfter(
            Long userId, String relatedEntityType, String relatedEntityId, Instant createdAtAfter);
}
