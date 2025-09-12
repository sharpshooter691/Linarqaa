package com.linarqa.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_belongings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentBelonging {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requirement_id")
    private BelongingRequirement requirement;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "name_arabic")
    private String nameArabic;
    
    @Column(nullable = false)
    private String category;
    
    @Column(name = "quantity")
    private Integer quantity = 1;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BelongingStatus status;
    
    @Column(name = "check_in_date")
    private LocalDateTime checkInDate;
    
    @Column(name = "check_out_date")
    private LocalDateTime checkOutDate;
    
    @Column(name = "checked_in_by")
    private String checkedInBy;
    
    @Column(name = "checked_out_by")
    private String checkedOutBy;
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum BelongingStatus {
        IN_STAFF("En possession du personnel"),
        RETURNED("Rendu à l'étudiant"),
        LOST("Perdu"),
        DAMAGED("Endommagé"),
        EXPIRED("Expiré");
        
        private final String displayName;
        
        BelongingStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
} 