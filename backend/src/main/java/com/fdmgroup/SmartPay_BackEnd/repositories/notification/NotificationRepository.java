package com.fdmgroup.SmartPay_BackEnd.repositories.notification;

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
}
