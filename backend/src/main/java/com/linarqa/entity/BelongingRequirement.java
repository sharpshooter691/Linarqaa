package com.linarqa.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "belonging_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BelongingRequirement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "name_arabic")
    private String nameArabic;
    
    @Column(nullable = false)
    private String category; // Art Supplies, Books, Stationery, etc.
    
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;
    
    @Column(name = "quantity_needed")
    private Integer quantityNeeded = 1;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "student_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private Student.StudentType studentType;
    
    @Column(name = "level")
    private String level; // Specific level or null for all levels
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
} 