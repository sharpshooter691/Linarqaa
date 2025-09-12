package com.linarqa.dto;

import com.linarqa.entity.ExtraStudent;
import java.time.LocalDate;

public class ExtraStudentRequest {
    
    private String firstName;
    private String lastName;
    private String firstNameArabic;
    private String lastNameArabic;
    private LocalDate birthDate;
    private String responsibleName;
    private String responsibleNameArabic;
    private String responsiblePhone;
    private ExtraStudent.StudentStatus status;
    private String photoUrl;
    
    // Default constructor
    public ExtraStudentRequest() {}
    
    // Constructor with all fields
    public ExtraStudentRequest(String firstName, String lastName, String firstNameArabic, 
                             String lastNameArabic, LocalDate birthDate, String responsibleName, 
                             String responsibleNameArabic, String responsiblePhone, 
                             ExtraStudent.StudentStatus status) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.firstNameArabic = firstNameArabic;
        this.lastNameArabic = lastNameArabic;
        this.birthDate = birthDate;
        this.responsibleName = responsibleName;
        this.responsibleNameArabic = responsibleNameArabic;
        this.responsiblePhone = responsiblePhone;
        this.status = status;
    }
    
    // Convert to entity (for create operations)
    public ExtraStudent toEntity() {
        ExtraStudent extraStudent = new ExtraStudent();
        extraStudent.setFirstName(this.firstName);
        extraStudent.setLastName(this.lastName);
        extraStudent.setFirstNameArabic(this.firstNameArabic);
        extraStudent.setLastNameArabic(this.lastNameArabic);
        extraStudent.setBirthDate(this.birthDate);
        extraStudent.setResponsibleName(this.responsibleName);
        extraStudent.setResponsibleNameArabic(this.responsibleNameArabic);
        extraStudent.setResponsiblePhone(this.responsiblePhone);
        if (this.status != null) {
            extraStudent.setStatus(this.status);
        }
        extraStudent.setPhotoUrl(this.photoUrl);
        return extraStudent;
    }
    
    // Update existing entity (for update operations)
    public void updateEntity(ExtraStudent extraStudent) {
        if (this.firstName != null) {
            extraStudent.setFirstName(this.firstName);
        }
        if (this.lastName != null) {
            extraStudent.setLastName(this.lastName);
        }
        if (this.firstNameArabic != null) {
            extraStudent.setFirstNameArabic(this.firstNameArabic);
        }
        if (this.lastNameArabic != null) {
            extraStudent.setLastNameArabic(this.lastNameArabic);
        }
        if (this.birthDate != null) {
            extraStudent.setBirthDate(this.birthDate);
        }
        if (this.responsibleName != null) {
            extraStudent.setResponsibleName(this.responsibleName);
        }
        if (this.responsibleNameArabic != null) {
            extraStudent.setResponsibleNameArabic(this.responsibleNameArabic);
        }
        if (this.responsiblePhone != null) {
            extraStudent.setResponsiblePhone(this.responsiblePhone);
        }
        if (this.status != null) {
            extraStudent.setStatus(this.status);
        }
        if (this.photoUrl != null) {
            extraStudent.setPhotoUrl(this.photoUrl);
        }
    }
    
    // Validation method
    public boolean isValid() {
        return firstName != null && !firstName.trim().isEmpty() &&
               lastName != null && !lastName.trim().isEmpty() &&
               birthDate != null &&
               responsibleName != null && !responsibleName.trim().isEmpty() &&
               responsiblePhone != null && !responsiblePhone.trim().isEmpty();
    }
    
    // Get validation errors
    public String getValidationErrors() {
        StringBuilder errors = new StringBuilder();
        
        if (firstName == null || firstName.trim().isEmpty()) {
            errors.append("First name is required. ");
        }
        
        if (lastName == null || lastName.trim().isEmpty()) {
            errors.append("Last name is required. ");
        }
        
        if (birthDate == null) {
            errors.append("Birth date is required. ");
        }
        
        if (responsibleName == null || responsibleName.trim().isEmpty()) {
            errors.append("Responsible name is required. ");
        }
        
        if (responsiblePhone == null || responsiblePhone.trim().isEmpty()) {
            errors.append("Responsible phone is required. ");
        }
        
        return errors.toString().trim();
    }
    
    // Getters and Setters
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

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}
