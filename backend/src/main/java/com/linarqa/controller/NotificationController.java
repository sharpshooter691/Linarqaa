package com.linarqa.controller;

import com.linarqa.entity.Notification;
import com.linarqa.entity.User;
import com.linarqa.service.NotificationService;
import com.linarqa.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get notifications for the current user
     */
    @GetMapping
    public ResponseEntity<Page<Notification>> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            return securityUtils.getCurrentUserId()
                .map(userId -> {
                    Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                        Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
                    Pageable pageable = PageRequest.of(page, size, sort);
                    
                    Page<Notification> notifications = notificationService.getUserNotifications(userId, pageable);
                    return ResponseEntity.ok(notifications);
                })
                .orElse(ResponseEntity.status(401).build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get unread notifications for the current user
     */
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        
        try {
            System.out.println("🔔 NotificationController.getUnreadNotifications() called");
            return securityUtils.getCurrentUserId()
                .map(userId -> {
                    System.out.println("👤 Getting notifications for user ID: " + userId);
                    List<Notification> notifications = notificationService.getUnreadNotifications(userId);
                    System.out.println("📋 Found " + notifications.size() + " unread notifications for user");
                    return ResponseEntity.ok(notifications);
                })
                .orElse(ResponseEntity.status(401).build());
        } catch (Exception e) {
            System.err.println("❌ Error in getUnreadNotifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get unread notification count for the current user
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationCount() {
        
        try {
            return securityUtils.getCurrentUserId()
                .map(userId -> {
                    long count = notificationService.getUnreadNotificationCount(userId);
                    Map<String, Long> response = new HashMap<>();
                    response.put("count", count);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(401).build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Mark a notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID notificationId) {
        
        try {
            return securityUtils.getCurrentUserId()
                .map(userId -> {
                    notificationService.markAsRead(notificationId, userId);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.status(401).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Mark all notifications as read for the current user
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        try {
            return securityUtils.getCurrentUserId()
                .map(userId -> {
                    notificationService.markAllAsRead(userId);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.status(401).build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get admin notifications (for admin users only)
     */
    @GetMapping("/admin")
    public ResponseEntity<Page<Notification>> getAdminNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            // Check if current user is admin
            return securityUtils.getCurrentUser()
                .filter(user -> user.getRole() == User.UserRole.OWNER)
                .map(adminUser -> {
                    Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                        Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
                    Pageable pageable = PageRequest.of(page, size, sort);
                    
                    Page<Notification> notifications = notificationService.getAdminNotifications(pageable);
                    return ResponseEntity.ok(notifications);
                })
                .orElse(ResponseEntity.status(403).build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get unread admin notifications
     */
    @GetMapping("/admin/unread")
    public ResponseEntity<List<Notification>> getUnreadAdminNotifications() {
        try {
            System.out.println("🔔 NotificationController.getUnreadAdminNotifications() called");
            
            // Check if current user is admin
            return securityUtils.getCurrentUser()
                .filter(user -> user.getRole() == User.UserRole.OWNER)
                .map(adminUser -> {
                    System.out.println("✅ Admin user authenticated: " + adminUser.getEmail());
                    List<Notification> notifications = notificationService.getUnreadAdminNotifications();
                    System.out.println("📋 Found " + notifications.size() + " unread admin notifications");
                    return ResponseEntity.ok(notifications);
                })
                .orElseGet(() -> {
                    System.out.println("❌ Access denied - user is not admin or not authenticated");
                    return ResponseEntity.status(403).build();
                });
        } catch (Exception e) {
            System.err.println("❌ Error in getUnreadAdminNotifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get unread admin notification count
     */
    @GetMapping("/admin/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadAdminNotificationCount() {
        try {
            // Check if current user is admin
            return securityUtils.getCurrentUser()
                .filter(user -> user.getRole() == User.UserRole.OWNER)
                .map(adminUser -> {
                    long count = notificationService.getUnreadAdminNotificationCount();
                    Map<String, Long> response = new HashMap<>();
                    response.put("count", count);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(403).build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Delete a notification (admin only)
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID notificationId) {
        try {
            // Check if current user is admin
            return securityUtils.getCurrentUser()
                .filter(user -> user.getRole() == User.UserRole.OWNER)
                .map(adminUser -> {
                    notificationService.deleteNotification(notificationId);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.status(403).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Delete multiple notifications (admin only)
     */
    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteMultipleNotifications(@RequestBody List<UUID> notificationIds) {
        try {
            // Check if current user is admin
            return securityUtils.getCurrentUser()
                .filter(user -> user.getRole() == User.UserRole.OWNER)
                .map(adminUser -> {
                    notificationService.deleteMultipleNotifications(notificationIds);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.status(403).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
