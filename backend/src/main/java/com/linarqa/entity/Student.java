package com.linarqa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "students")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "first_name_arabic")
    private String firstNameArabic;

    @Column(name = "last_name_arabic")
    private String lastNameArabic;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "photo_url")
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StudentType studentType = StudentType.KINDERGARTEN;

    @Enumerated(EnumType.STRING)
    @Column
    private StudentLevel level;

    @Column
    private String classroom;

    @Column(name = "guardian_name", nullable = false)
    private String guardianName;

    @Column(name = "guardian_name_arabic")
    private String guardianNameArabic;

    @Column(name = "guardian_phone", nullable = false)
    private String guardianPhone;

    @Column
    private String address;

    @Column(name = "address_arabic")
    private String addressArabic;

    @Column
    private String allergies;

    @Column
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StudentStatus status = StudentStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum StudentType {
        KINDERGARTEN, EXTRA_COURSE
    }

    public enum StudentLevel {
        // Kindergarten levels
        PETITE, MOYENNE, GRANDE,
        
        // Primary School (التعليم الابتدائي) - 6 years
        CP1,    // السنة الأولى ابتدائي - Age ~6
        CP2,    // السنة الثانية ابتدائي - Age ~7
        CP3,    // السنة الثالثة ابتدائي - Age ~8
        CP4,    // السنة الرابعة ابتدائي - Age ~9
        CP5,    // السنة الخامسة ابتدائي - Age ~10
        CP6,    // السنة السادسة ابتدائي - Age ~11
        
        // Lower Secondary (التعليم الثانوي الإعدادي) - 3 years
        AC1,    // السنة الأولى إعدادي - Age ~12
        AC2,    // السنة الثانية إعدادي - Age ~13
        AC3,    // السنة الثالثة إعدادي - Age ~14
        
        // Upper Secondary (التعليم الثانوي التأهيلي) - 3 years
        TRONC_COMMUN,    // الجذع المشترك - Age ~15
        BAC1,           // السنة الأولى بكالوريا - Age ~16
        BAC2            // السنة الثانية بكالوريا - Age ~17-18
    }

    public enum StudentStatus {
        ACTIVE, LEFT
    }
} 