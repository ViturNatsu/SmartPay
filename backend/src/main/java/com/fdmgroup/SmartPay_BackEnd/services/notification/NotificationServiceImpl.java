package com.fdmgroup.SmartPay_BackEnd.services.notification;

import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationListResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.notification.Notification;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.IllgealNotificationException;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.NotificationNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.notification.NotificationRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final Map<NotificationType, Integer> PRIORITY_BY_TYPE = new EnumMap<>(NotificationType.class);
    static {
        PRIORITY_BY_TYPE.put(NotificationType.SECURITY, 0);
        PRIORITY_BY_TYPE.put(NotificationType.WARNING, 1);
        PRIORITY_BY_TYPE.put(NotificationType.SUCCESS, 2);
        PRIORITY_BY_TYPE.put(NotificationType.INFO, 3);
    }

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public NotificationListResponseDTO getNotificationsForUser(Long userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.unsorted());
        List<Notification> notifications = notificationRepository
                .findByUser_IdAndDismissedFalseOrderByPriorityAscCreatedAtDesc(userId, pageable);

        List<NotificationResponseDTO> dtos = notifications.stream()
                .map(this::toResponseDTO)
                .toList();

        long totalCount = notificationRepository.countByUser_IdAndDismissedFalse(userId);
        long unreadCount = notificationRepository.countByUser_IdAndReadFalse(userId);

        return new NotificationListResponseDTO(dtos, totalCount, unreadCount);
    }

    @Override
    public void createNotification(Long userId, NotificationType type, String title, String detail) {
        Notification notification = new Notification();
        notification.setUser(userRepository.getReferenceById(userId));
        notification.setType(type);
        notification.setTitle(title);
        notification.setDetail(detail);
        notification.setPriority(PRIORITY_BY_TYPE.get(type));
        notificationRepository.save(notification);
    }

    @Override
    public boolean hasActiveOfType(Long userId, NotificationType type) {
        return notificationRepository.existsByUser_IdAndTypeAndDismissedFalse(userId, type);
    }

    @Override
    public void dismissNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new NotificationNotFoundException("Notification not found");
        }

        notification.setDismissed(true);
        if(!notification.isRead()){
            notification.setRead(true);
            notification.setReadAt(Instant.now());
        }
        notificationRepository.save(notification);
    }

    @Override
    public void markNotificationAsRead(Long userId, Long notificationId){
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new NotificationNotFoundException("Notification not found");
        }

        if(notification.isRead()){
            throw new IllgealNotificationException("Notification already marked as read");
        }
        notification.setRead(true);
        notification.setReadAt(Instant.now());
        notificationRepository.save(notification);
    }

    private NotificationResponseDTO toResponseDTO(Notification notification) {
        return new NotificationResponseDTO(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getDetail(),
                notification.getCreatedAt(),
                notification.isRead(),
                notification.getReadAt()
        );
    }
}
