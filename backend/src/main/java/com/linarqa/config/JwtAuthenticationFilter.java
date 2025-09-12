package com.linarqa.config;

import com.linarqa.entity.User;
import com.linarqa.repository.UserRepository;
import com.linarqa.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        
        System.out.println("🔍 JWT Filter - Processing request: " + request.getRequestURI());
        String authHeader = request.getHeader("Authorization");
        System.out.println("🔍 JWT Filter - Auth header: " + (authHeader != null ? "Present" : "Missing"));
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("🔍 JWT Filter - Token extracted, validating...");
            
            if (jwtService.isTokenValid(token)) {
                System.out.println("🔍 JWT Filter - Token is valid");
                String email = jwtService.extractEmail(token);
                System.out.println("🔍 JWT Filter - Extracted email: " + email);
                
                var userOpt = userRepository.findByEmail(email);
                
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    System.out.println("🔍 JWT Filter - Found user: " + user.getFullName() + " (Role: " + user.getRole() + ")");
                    
                    // Set authorities based on user role
                    List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
                    
                    // Create authentication with the actual User object as principal
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(user, null, authorities);
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    System.out.println("🔐 JWT Authentication successful for user: " + user.getEmail() + " with role: " + user.getRole());
                } else {
                    System.out.println("❌ JWT Filter - User not found in database for email: " + email);
                }
            } else {
                System.out.println("❌ JWT Filter - Token is invalid");
            }
        } else {
            System.out.println("❌ JWT Filter - No valid Authorization header");
        }
        
        filterChain.doFilter(request, response);
    }
} 