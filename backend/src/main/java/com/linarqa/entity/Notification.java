package com.linarqa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "title_arabic")
    private String titleArabic;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "message_arabic", columnDefinition = "TEXT")
    private String messageArabic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.UNREAD;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User targetUser;

    @Column(name = "related_entity_type")
    private String relatedEntityType; // STUDENT, EXTRA_STUDENT, PAYMENT, EXTRA_PAYMENT

    @Column(name = "related_entity_id")
    private UUID relatedEntityId;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum NotificationType {
        STUDENT_REGISTERED,
        EXTRA_STUDENT_REGISTERED,
        PAYMENT_CREATED,
        EXTRA_PAYMENT_CREATED,
        PAYMENT_MARKED_PAID,
        EXTRA_PAYMENT_MARKED_PAID,
        SYSTEM_ALERT,
        GENERAL
    }

    public enum NotificationStatus {
        UNREAD,
        READ,
        ARCHIVED
    }

    public void markAsRead() {
        this.isRead = true;
        this.status = NotificationStatus.READ;
        this.readAt = LocalDateTime.now();
    }
}
