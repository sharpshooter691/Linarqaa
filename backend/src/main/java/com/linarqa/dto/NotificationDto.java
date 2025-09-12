package com.linarqa.dto;

import com.linarqa.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private UUID id;
    private String title;
    private String titleArabic;
    private String message;
    private String messageArabic;
    private Notification.NotificationType type;
    private Notification.NotificationStatus status;
    private String createdByEmail;
    private String createdByName;
    private String createdByNameArabic;
    private String targetUserEmail;
    private String relatedEntityType;
    private UUID relatedEntityId;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NotificationDto fromEntity(Notification notification) {
        String createdByName = null;
        String createdByNameArabic = null;
        String createdByEmail = null;
        
        if (notification.getCreatedBy() != null) {
            createdByEmail = notification.getCreatedBy().getEmail();
            createdByName = notification.getCreatedBy().getFullName();
            createdByNameArabic = notification.getCreatedBy().getFullNameArabic();
        }
        
        // Use the original message (staff name is already included in the message from NotificationService)
        String enhancedMessage = notification.getMessage();
        String enhancedMessageArabic = notification.getMessageArabic();
        
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .titleArabic(notification.getTitleArabic())
                .message(enhancedMessage)
                .messageArabic(enhancedMessageArabic)
                .type(notification.getType())
                .status(notification.getStatus())
                .createdByEmail(createdByEmail)
                .createdByName(createdByName)
                .createdByNameArabic(createdByNameArabic)
                .targetUserEmail(notification.getTargetUser() != null ? notification.getTargetUser().getEmail() : null)
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .isRead(notification.isRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}
