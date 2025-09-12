package com.linarqa.dto;

import com.linarqa.entity.ExtraStudent;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ExtraStudentDto {
    
    private UUID id;
    private String firstName;
    private String lastName;
    private String firstNameArabic;
    private String lastNameArabic;
    private LocalDate birthDate;
    private String photoUrl;
    private String responsibleName;
    private String responsibleNameArabic;
    private String responsiblePhone;
    private ExtraStudent.StudentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public ExtraStudentDto() {}
    
    // Constructor from entity
    public ExtraStudentDto(ExtraStudent extraStudent) {
        this.id = extraStudent.getId();
        this.firstName = extraStudent.getFirstName();
        this.lastName = extraStudent.getLastName();
        this.firstNameArabic = extraStudent.getFirstNameArabic();
        this.lastNameArabic = extraStudent.getLastNameArabic();
        this.birthDate = extraStudent.getBirthDate();
        this.photoUrl = extraStudent.getPhotoUrl();
        this.responsibleName = extraStudent.getResponsibleName();
        this.responsibleNameArabic = extraStudent.getResponsibleNameArabic();
        this.responsiblePhone = extraStudent.getResponsiblePhone();
        this.status = extraStudent.getStatus();
        this.createdAt = extraStudent.getCreatedAt();
        this.updatedAt = extraStudent.getUpdatedAt();
    }
    
    // Convert to entity
    public ExtraStudent toEntity() {
        ExtraStudent extraStudent = new ExtraStudent();
        extraStudent.setId(this.id);
        extraStudent.setFirstName(this.firstName);
        extraStudent.setLastName(this.lastName);
        extraStudent.setFirstNameArabic(this.firstNameArabic);
        extraStudent.setLastNameArabic(this.lastNameArabic);
        extraStudent.setBirthDate(this.birthDate);
        extraStudent.setPhotoUrl(this.photoUrl);
        extraStudent.setResponsibleName(this.responsibleName);
        extraStudent.setResponsibleNameArabic(this.responsibleNameArabic);
        extraStudent.setResponsiblePhone(this.responsiblePhone);
        extraStudent.setStatus(this.status);
        return extraStudent;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getFirstNameArabic() {
        return firstNameArabic;
    }
    
    public void setFirstNameArabic(String firstNameArabic) {
        this.firstNameArabic = firstNameArabic;
    }
    
    public String getLastNameArabic() {
        return lastNameArabic;
    }
    
    public void setLastNameArabic(String lastNameArabic) {
        this.lastNameArabic = lastNameArabic;
    }
    
    public LocalDate getBirthDate() {
        return birthDate;
    }
    
    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }
    
    public String getPhotoUrl() {
        return photoUrl;
    }
    
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
    
    public String getResponsibleName() {
        return responsibleName;
    }
    
    public void setResponsibleName(String responsibleName) {
        this.responsibleName = responsibleName;
    }
    
    public String getResponsibleNameArabic() {
        return responsibleNameArabic;
    }
    
    public void setResponsibleNameArabic(String responsibleNameArabic) {
        this.responsibleNameArabic = responsibleNameArabic;
    }
    
    public String getResponsiblePhone() {
        return responsiblePhone;
    }
    
    public void setResponsiblePhone(String responsiblePhone) {
        this.responsiblePhone = responsiblePhone;
    }
    
    public ExtraStudent.StudentStatus getStatus() {
        return status;
    }
    
    public void setStatus(ExtraStudent.StudentStatus status) {
        this.status = status;
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
