package com.linarqa.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "classrooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "name_arabic")
    private String nameArabic;
    
    @Column(nullable = false)
    private String level; // PETITE, MOYENNE, GRANDE, CP1, CP2, etc.
    
    @Column(name = "student_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private Student.StudentType studentType; // KINDERGARTEN or EXTRA_COURSE
    
    @Column(name = "max_capacity")
    private Integer maxCapacity = 20;
    
    @Column(name = "current_enrollment")
    private Integer currentEnrollment = 0;
    
    @Column
    private String description;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
} 