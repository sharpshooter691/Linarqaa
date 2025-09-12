package com.linarqa.util;

import com.linarqa.entity.User;
import com.linarqa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityUtils {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get the current authenticated user from the security context
     */
    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        System.out.println("🔍 SecurityUtils.getCurrentUser() - Authentication: " + 
            (authentication != null ? authentication.getName() : "null"));
        
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getPrincipal())) {
            
            // Check if the principal is already a User object
            if (authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                System.out.println("✅ Found user from principal: " + user.getFullName() + " (Role: " + user.getRole() + ")");
                return Optional.of(user);
            }
            
            // Fallback to email lookup for backward compatibility
            String email = authentication.getName();
            System.out.println("👤 Looking up user with email: " + email);
            
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isPresent()) {
                System.out.println("✅ Found user: " + user.get().getFullName() + " (Role: " + user.get().getRole() + ")");
            } else {
                System.out.println("❌ User not found with email: " + email);
            }
            
            return user;
        }
        
        System.out.println("⚠️ No authenticated user found");
        return Optional.empty();
    }

    /**
     * Get the current authenticated user ID
     */
    public Optional<java.util.UUID> getCurrentUserId() {
        return getCurrentUser().map(User::getId);
    }

    /**
     * Check if the current user has a specific role
     */
    public boolean hasRole(User.UserRole role) {
        return getCurrentUser()
            .map(user -> user.getRole() == role)
            .orElse(false);
    }

    /**
     * Check if the current user is an admin (OWNER role)
     */
    public boolean isAdmin() {
        return hasRole(User.UserRole.OWNER);
    }

    /**
     * Check if the current user is staff
     */
    public boolean isStaff() {
        return hasRole(User.UserRole.STAFF);
    }
}
