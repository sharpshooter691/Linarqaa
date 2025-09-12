package com.linarqa.dto;

import java.time.LocalDate;
import java.util.UUID;

public class ExtraStudentEnrollmentRequest {
    
    private UUID extraStudentId;
    private UUID courseId;
    private String notes;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Default constructor
    public ExtraStudentEnrollmentRequest() {}
    
    // Constructor with required fields
    public ExtraStudentEnrollmentRequest(UUID extraStudentId, UUID courseId, String notes) {
        this.extraStudentId = extraStudentId;
        this.courseId = courseId;
        this.notes = notes;
    }
    
    // Constructor with all fields
    public ExtraStudentEnrollmentRequest(UUID extraStudentId, UUID courseId, String notes, LocalDate startDate, LocalDate endDate) {
        this.extraStudentId = extraStudentId;
        this.courseId = courseId;
        this.notes = notes;
        this.startDate = startDate;
        this.endDate = endDate;
    }
    
    // Validation method
    public boolean isValid() {
        return extraStudentId != null && courseId != null;
    }
    
    // Getters and Setters
    public UUID getExtraStudentId() {
        return extraStudentId;
    }
    
    public void setExtraStudentId(UUID extraStudentId) {
        this.extraStudentId = extraStudentId;
    }
    
    public UUID getCourseId() {
        return courseId;
    }
    
    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
}

