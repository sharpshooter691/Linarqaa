package com.linarqa.service;

import com.linarqa.dto.LoginResponse;
import com.linarqa.entity.User;
import com.linarqa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    public LoginResponse login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        User user = userOpt.get();
        if (!user.isActive()) {
            throw new RuntimeException("Account is disabled");
        }
        
        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, user);
    }
    
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
} 