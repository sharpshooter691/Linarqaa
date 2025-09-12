package com.linarqa.repository;

import com.linarqa.entity.Notification;
import com.linarqa.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /**
     * Find all notifications for a specific user
     */
    Page<Notification> findByTargetUserOrderByCreatedAtDesc(User targetUser, Pageable pageable);

    /**
     * Find unread notifications for a specific user
     */
    List<Notification> findByTargetUserAndIsReadFalseOrderByCreatedAtDesc(User targetUser);

    /**
     * Count unread notifications for a specific user
     */
    long countByTargetUserAndIsReadFalse(User targetUser);

    /**
     * Find notifications by type
     */
    List<Notification> findByTypeOrderByCreatedAtDesc(Notification.NotificationType type);

    /**
     * Find notifications by related entity
     */
    List<Notification> findByRelatedEntityTypeAndRelatedEntityId(String entityType, UUID entityId);

    /**
     * Find notifications for admin users (users with OWNER role)
     */
    @Query("SELECT n FROM Notification n WHERE n.targetUser.role = 'OWNER' ORDER BY n.createdAt DESC")
    Page<Notification> findAdminNotifications(Pageable pageable);

    /**
     * Find unread notifications for admin users
     */
    @Query("SELECT n FROM Notification n WHERE n.targetUser.role = 'OWNER' AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadAdminNotifications();

    /**
     * Count unread notifications for admin users
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.targetUser.role = 'OWNER' AND n.isRead = false")
    long countUnreadAdminNotifications();

    /**
     * Find notifications created by a specific user
     */
    List<Notification> findByCreatedByOrderByCreatedAtDesc(User createdBy);

    /**
     * Delete old notifications (older than specified days)
     */
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}
