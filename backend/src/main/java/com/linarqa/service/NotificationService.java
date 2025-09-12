package com.linarqa.service;

import com.linarqa.entity.Notification;
import com.linarqa.entity.User;
import com.linarqa.repository.NotificationRepository;
import com.linarqa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a notification for admin users when a new student is registered
     */
    public void notifyStudentRegistered(String studentName, String studentNameArabic, UUID studentId, UUID createdByUserId) {
        System.out.println("🔔 Creating student registration notification for: " + studentName);
        
        List<User> adminUsers = userRepository.findByRole(User.UserRole.OWNER);
        System.out.println("👥 Found " + adminUsers.size() + " admin users");
        
        if (adminUsers.isEmpty()) {
            System.out.println("⚠️ No admin users found! Cannot send notification.");
            return;
        }
        
        for (User admin : adminUsers) {
            System.out.println("📧 Sending notification to admin: " + admin.getEmail());
            
            User creator = userRepository.findById(createdByUserId).orElse(null);
            String creatorName = creator != null ? creator.getFullName() : "Personnel inconnu";
            String creatorNameArabic = creator != null ? creator.getFullNameArabic() : "موظف غير معروف";
            
            Notification notification = Notification.builder()
                .title("Nouvel élève inscrit")
                .titleArabic("تم تسجيل طالب جديد")
                .message("Un nouvel élève " + studentName +  ".")
                .messageArabic("تم تسجيل طالب جديد " + studentNameArabic +  ".")
                .type(Notification.NotificationType.STUDENT_REGISTERED)
                .targetUser(admin)
                .createdBy(creator)
                .relatedEntityType("STUDENT")
                .relatedEntityId(studentId)
                .build();
            
            try {
                Notification savedNotification = notificationRepository.save(notification);
                System.out.println("✅ Notification saved with ID: " + savedNotification.getId());
            } catch (Exception e) {
                System.err.println("❌ Failed to save notification: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    /**
     * Create a notification for admin users when a new extra student is registered
     */
    public void notifyExtraStudentRegistered(String studentName, String studentNameArabic, UUID studentId, UUID createdByUserId) {
        List<User> adminUsers = userRepository.findByRole(User.UserRole.OWNER);
        
        for (User admin : adminUsers) {
            User creator = userRepository.findById(createdByUserId).orElse(null);
            String creatorName = creator != null ? creator.getFullName() : "Personnel inconnu";
            String creatorNameArabic = creator != null ? creator.getFullNameArabic() : "موظف غير معروف";
            
            Notification notification = Notification.builder()
                .title("Nouvel élève supplémentaire inscrit")
                .titleArabic("تم تسجيل طالب إضافي جديد")
                .message("Un nouvel élève supplémentaire " + studentName +  ".")
                .messageArabic("تم تسجيل طالب إضافي جديد " + studentNameArabic + ".")
                .type(Notification.NotificationType.EXTRA_STUDENT_REGISTERED)
                .targetUser(admin)
                .createdBy(creator)
                .relatedEntityType("EXTRA_STUDENT")
                .relatedEntityId(studentId)
                .build();
            
            notificationRepository.save(notification);
        }
    }

    /**
     * Create a notification for admin users when a new payment is created
     */
    public void notifyPaymentCreated(String studentName, String studentNameArabic, String amount, UUID paymentId, UUID createdByUserId) {
        List<User> adminUsers = userRepository.findByRole(User.UserRole.OWNER);
        
        for (User admin : adminUsers) {
            User creator = userRepository.findById(createdByUserId).orElse(null);
            String creatorName = creator != null ? creator.getFullName() : "Personnel inconnu";
            String creatorNameArabic = creator != null ? creator.getFullNameArabic() : "موظف غير معروف";
            
            Notification notification = Notification.builder()
                .title("Nouveau paiement créé")
                .titleArabic("تم إنشاء دفعة جديدة")
                .message("Un nouveau paiement de " + amount + " a été créé pour l'élève " + studentName + ".")
                .messageArabic("تم إنشاء دفعة جديدة بقيمة " + amount + " للطالب " + studentNameArabic + ".")
                .type(Notification.NotificationType.PAYMENT_CREATED)
                .targetUser(admin)
                .createdBy(creator)
                .relatedEntityType("PAYMENT")
                .relatedEntityId(paymentId)
                .build();
            
            notificationRepository.save(notification);
        }
    }

    /**
     * Create a notification for admin users when a new extra payment is created
     */
    public void notifyExtraPaymentCreated(String studentName, String studentNameArabic, String amount, UUID paymentId, UUID createdByUserId) {
        List<User> adminUsers = userRepository.findByRole(User.UserRole.OWNER);
        
        for (User admin : adminUsers) {
            User creator = userRepository.findById(createdByUserId).orElse(null);
            String creatorName = creator != null ? creator.getFullName() : "Personnel inconnu";
            String creatorNameArabic = creator != null ? creator.getFullNameArabic() : "موظف غير معروف";
            
            Notification notification = Notification.builder()
                .title("Nouveau paiement supplémentaire créé")
                .titleArabic("تم إنشاء دفعة إضافية جديدة")
                .message("Un nouveau paiement supplémentaire de " + amount + " a été créé pour l'élève " + studentName + ".")
                .messageArabic("تم إنشاء دفعة إضافية جديدة بقيمة " + amount + " للطالب " + studentNameArabic +".")
                .type(Notification.NotificationType.EXTRA_PAYMENT_CREATED)
                .targetUser(admin)
                .createdBy(creator)
                .relatedEntityType("EXTRA_PAYMENT")
                .relatedEntityId(paymentId)
                .build();
            
            notificationRepository.save(notification);
        }
    }

    /**
     * Create a notification for admin users when a payment is marked as paid
     */
    public void notifyPaymentMarkedPaid(String studentName, String studentNameArabic, String amount, UUID paymentId, UUID markedByUserId) {
        System.out.println("🔔 Creating payment marked as paid notification for: " + studentName);
        
        List<User> adminUsers = userRepository.findByRole(User.UserRole.OWNER);
        System.out.println("👥 Found " + adminUsers.size() + " admin users");
        
        if (adminUsers.isEmpty()) {
            System.out.println("⚠️ No admin users found! Cannot send notification.");
            return;
        }
        
        for (User admin : adminUsers) {
            System.out.println("📧 Sending payment paid notification to admin: " + admin.getEmail());
            
            User creator = userRepository.findById(markedByUserId).orElse(null);
            String creatorName = creator != null ? creator.getFullName() : "Personnel inconnu";
            String creatorNameArabic = creator != null ? creator.getFullNameArabic() : "موظف غير معروف";
            
            Notification notification = Notification.builder()
                .title("Paiement marqué comme payé")
                .titleArabic("تم تحديد الدفعة كمقبوضة")
                .message("Le paiement de " + amount + " pour l'élève " + studentName + ".")
                .messageArabic("تم تحديد دفعة بقيمة " + amount + " للطالب " + studentNameArabic +  ".")
                .type(Notification.NotificationType.PAYMENT_MARKED_PAID)
                .targetUser(admin)
                .createdBy(creator)
                .relatedEntityType("PAYMENT")
                .relatedEntityId(paymentId)
                .build();
            
            try {
                Notification savedNotification = notificationRepository.save(notification);
                System.out.println("✅ Payment paid notification saved with ID: " + savedNotification.getId());
            } catch (Exception e) {
                System.err.println("❌ Failed to save payment paid notification: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    /**
     * Create a notification for admin users when an extra payment is marked as paid
     */
    public void notifyExtraPaymentMarkedPaid(String studentName, String studentNameArabic, String amount, UUID paymentId, UUID markedByUserId) {
        System.out.println("🔔 Creating extra payment marked as paid notification for: " + studentName);
        
        List<User> adminUsers = userRepository.findByRole(User.UserRole.OWNER);
        System.out.println("👥 Found " + adminUsers.size() + " admin users");
        
        if (adminUsers.isEmpty()) {
            System.out.println("⚠️ No admin users found! Cannot send notification.");
            return;
        }
        
        for (User admin : adminUsers) {
            System.out.println("📧 Sending extra payment paid notification to admin: " + admin.getEmail());
            
            User creator = userRepository.findById(markedByUserId).orElse(null);
            String creatorName = creator != null ? creator.getFullName() : "Personnel inconnu";
            String creatorNameArabic = creator != null ? creator.getFullNameArabic() : "موظف غير معروف";
            
            Notification notification = Notification.builder()
                .title("Paiement supplémentaire marqué comme payé")
                .titleArabic("تم تحديد الدفعة الإضافية كمقبوضة")
                .message("Le paiement supplémentaire de " + amount + " pour l'élève " + studentName +  ".")
                .messageArabic("تم تحديد دفعة إضافية بقيمة " + amount + " للطالب " + studentNameArabic + ".")
                .type(Notification.NotificationType.EXTRA_PAYMENT_MARKED_PAID)
                .targetUser(admin)
                .createdBy(creator)
                .relatedEntityType("EXTRA_PAYMENT")
                .relatedEntityId(paymentId)
                .build();
            
            try {
                Notification savedNotification = notificationRepository.save(notification);
                System.out.println("✅ Extra payment paid notification saved with ID: " + savedNotification.getId());
            } catch (Exception e) {
                System.err.println("❌ Failed to save extra payment paid notification: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    /**
     * Get all notifications for a specific user
     */
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByTargetUserOrderByCreatedAtDesc(user, pageable);
    }

    /**
     * Get unread notifications for a specific user
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByTargetUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    /**
     * Get unread notification count for a specific user
     */
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByTargetUserAndIsReadFalse(user);
    }

    /**
     * Mark a notification as read
     */
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Verify the notification belongs to the user
        if (!notification.getTargetUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }
        
        notification.markAsRead();
        notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(UUID userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.markAsRead();
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Get admin notifications
     */
    @Transactional(readOnly = true)
    public Page<Notification> getAdminNotifications(Pageable pageable) {
        return notificationRepository.findAdminNotifications(pageable);
    }

    /**
     * Get unread admin notifications
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadAdminNotifications() {
        return notificationRepository.findUnreadAdminNotifications();
    }

    /**
     * Get unread admin notification count
     */
    @Transactional(readOnly = true)
    public long getUnreadAdminNotificationCount() {
        return notificationRepository.countUnreadAdminNotifications();
    }

    /**
     * Delete old notifications (older than 30 days)
     */
    public void cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        notificationRepository.deleteOldNotifications(cutoffDate);
    }

    /**
     * Get all notifications (simple method for testing)
     */
    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    /**
     * Get all unread notifications (simple method for testing)
     */
    @Transactional(readOnly = true)
    public List<Notification> getAllUnreadNotifications() {
        return notificationRepository.findAll().stream()
            .filter(notification -> !notification.isRead())
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get total notification count
     */
    @Transactional(readOnly = true)
    public long getTotalNotificationCount() {
        return notificationRepository.count();
    }

    /**
     * Get total unread notification count
     */
    @Transactional(readOnly = true)
    public long getTotalUnreadNotificationCount() {
        return notificationRepository.findAll().stream()
            .filter(notification -> !notification.isRead())
            .count();
    }

    /**
     * Delete a notification by ID
     */
    public void deleteNotification(UUID notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found");
        }
        notificationRepository.deleteById(notificationId);
    }

    /**
     * Delete multiple notifications by IDs
     */
    public void deleteMultipleNotifications(List<UUID> notificationIds) {
        if (notificationIds == null || notificationIds.isEmpty()) {
            throw new RuntimeException("No notification IDs provided");
        }
        notificationRepository.deleteAllById(notificationIds);
    }
}
