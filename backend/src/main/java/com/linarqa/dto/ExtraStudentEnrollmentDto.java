package com.linarqa.dto;

import com.linarqa.entity.ExtraStudentEnrollment;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ExtraStudentEnrollmentDto {
    
    private UUID id;
    private UUID extraStudentId;
    private String extraStudentName;
    private String extraStudentNameArabic;
    private UUID courseId;
    private String courseTitle;
    private String courseDescription;
    private ExtraStudentEnrollment.EnrollmentStatus status;
    private LocalDate enrollmentDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public ExtraStudentEnrollmentDto() {}
    
    // Constructor from entity
    public ExtraStudentEnrollmentDto(ExtraStudentEnrollment enrollment) {
        this.id = enrollment.getId();
        this.extraStudentId = enrollment.getExtraStudent().getId();
        this.extraStudentName = enrollment.getExtraStudent().getFirstName() + " " + enrollment.getExtraStudent().getLastName();
        if (enrollment.getExtraStudent().getFirstNameArabic() != null && enrollment.getExtraStudent().getLastNameArabic() != null) {
            this.extraStudentNameArabic = enrollment.getExtraStudent().getFirstNameArabic() + " " + enrollment.getExtraStudent().getLastNameArabic();
        }
        this.courseId = enrollment.getCourse().getId();
        this.courseTitle = enrollment.getCourse().getTitle();
        this.courseDescription = enrollment.getCourse().getDescription();
        this.status = enrollment.getStatus();
        this.enrollmentDate = enrollment.getEnrollmentDate();
        this.startDate = enrollment.getStartDate();
        this.endDate = enrollment.getEndDate();
        this.notes = enrollment.getNotes();
        this.createdAt = enrollment.getCreatedAt();
        this.updatedAt = enrollment.getUpdatedAt();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getExtraStudentId() {
        return extraStudentId;
    }
    
    public void setExtraStudentId(UUID extraStudentId) {
        this.extraStudentId = extraStudentId;
    }
    
    public String getExtraStudentName() {
        return extraStudentName;
    }
    
    public void setExtraStudentName(String extraStudentName) {
        this.extraStudentName = extraStudentName;
    }
    
    public String getExtraStudentNameArabic() {
        return extraStudentNameArabic;
    }
    
    public void setExtraStudentNameArabic(String extraStudentNameArabic) {
        this.extraStudentNameArabic = extraStudentNameArabic;
    }
    
    public UUID getCourseId() {
        return courseId;
    }
    
    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }
    
    public String getCourseTitle() {
        return courseTitle;
    }
    
    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }
    
    public String getCourseDescription() {
        return courseDescription;
    }
    
    public void setCourseDescription(String courseDescription) {
        this.courseDescription = courseDescription;
    }
    
    public ExtraStudentEnrollment.EnrollmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(ExtraStudentEnrollment.EnrollmentStatus status) {
        this.status = status;
    }
    
    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }
    
    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

