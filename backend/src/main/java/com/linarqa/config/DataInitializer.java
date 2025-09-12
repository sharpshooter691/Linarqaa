package com.linarqa.config;

import com.linarqa.entity.User;
import com.linarqa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// @Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create test users if they don't exist
        if (userRepository.count() == 0) {
            createTestUsers();
        }
    }

    private void createTestUsers() {
        // Create OWNER user
        User owner = User.builder()
                .email("admin@linarqa.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .fullName("Admin User")
                .fullNameArabic("مدير النظام")
                .phone("+1234567890")
                .role(User.UserRole.OWNER)
                .languagePreference(User.LanguagePreference.FR)
                .active(true)
                .build();
        userRepository.save(owner);

        // Create STAFF user
        User staff = User.builder()
                .email("staff@linarqa.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .fullName("Staff User")
                .fullNameArabic("موظف النظام")
                .phone("+1234567891")
                .role(User.UserRole.STAFF)
                .languagePreference(User.LanguagePreference.FR)
                .active(true)
                .build();
        userRepository.save(staff);

        System.out.println("✅ Test users created:");
        System.out.println("   OWNER: admin@linarqa.com / password123");
        System.out.println("   STAFF: staff@linarqa.com / password123");
    }
} 