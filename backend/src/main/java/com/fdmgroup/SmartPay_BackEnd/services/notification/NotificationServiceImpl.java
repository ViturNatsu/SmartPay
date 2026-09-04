package com.fdmgroup.SmartPay_BackEnd.services.notification;

import java.time.Instant;
import java.util.EnumMap;
import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEntityLinkUtil;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationMessageResolver;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationValidationUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationListResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.notification.Notification;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.IllgealNotificationException;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.InvalidNotificationException;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.NotificationNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.notification.NotificationRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public NotificationListResponseDTO getNotificationsForUser(Long userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.unsorted());
        List<Notification> notifications = notificationRepository
                .findActiveNotificationsByUserId(userId, pageable);

        List<NotificationResponseDTO> dtos = notifications.stream()
                .map(this::toResponseDTO)
                .toList();

        long totalCount = notificationRepository.countByUser_IdAndDismissedFalse(userId);
        long unreadCount = notificationRepository.countByUser_IdAndReadFalse(userId);

        return new NotificationListResponseDTO(dtos, totalCount, unreadCount);
    }

    @Override
    public void createNotification(NotificationCreateRequestDTO request) {
        NotificationValidationUtil.validate(request);

        Notification notification = new Notification();
        notification.setUser(userRepository.getReferenceById(request.getUserId()));
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setDetail(request.getDetail());
        notification.setTier(request.getTier());
        notification.setRelatedEntityType(request.getRelatedEntityType());
        notification.setRelatedEntityId(request.getRelatedEntityId());

        notificationRepository.save(notification);
    }

    @Override
    public void createFromEvent(NotificationEventType eventType, Long userId, Object relatedEntityId,
                                NotificationEventContext context) {
        if (eventType == null) {
            throw new InvalidNotificationException("Notification event type is required");
        }

        String relatedEntityTypeName = eventType.getRelatedEntityType().name();
        String relatedEntityIdValue = relatedEntityId != null ? relatedEntityId.toString() : null;

        // Duplicate prevention (Scenario 12). Reminders are deduplicated per billing cycle by the
        // reminder scheduler (Scenarios 10–11), so they are exempt from the generic entity check
        // which would otherwise block every cycle after the first.
        if (relatedEntityIdValue != null
                && eventType != NotificationEventType.RECURRING_PAYMENT_REMINDER
                && notificationRepository.existsByUser_IdAndRelatedEntityTypeAndRelatedEntityId(
                        userId, relatedEntityTypeName, relatedEntityIdValue)) {
            return;
        }

        NotificationCreateRequestDTO request = new NotificationCreateRequestDTO();
        request.setUserId(userId);
        request.setType(eventType.getType());
        request.setTitle(eventType.getTitle());
        request.setDetail(NotificationMessageResolver.buildDetail(eventType, context));
        request.setTier(eventType.getTier().getValue());
        if (relatedEntityIdValue != null) {
            NotificationEntityLinkUtil.link(request, eventType.getRelatedEntityType(), relatedEntityIdValue);
        }

        createNotification(request);
    }

    @Override
    public void createFromEventSafely(NotificationEventType eventType, Long userId, Object relatedEntityId,
                                      NotificationEventContext context) {
        try {
            createFromEvent(eventType, userId, relatedEntityId, context);
        } catch (RuntimeException ex) {
            // Failure isolation (Scenario 14): a notification failure must never break the account
            // activity that triggered it, nor other notification requests.
            log.warn("Failed to create notification for event {} (user {}): {}",
                    eventType, userId, ex.getMessage());
        }
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
        notification.setDismissedAt(Instant.now());
        if(!notification.getRead()){
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

        if(notification.getRead()){
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
                notification.getTier(),
                notification.getRead(),
                notification.getReadAt(),
                notification.getDismissed(),
                notification.getDismissedAt(),
                notification.getRelatedEntityType(),
                notification.getRelatedEntityId(),
                notification.getCreatedAt()
        );
    }
}
