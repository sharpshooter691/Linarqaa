package com.linarqa.dto;

import com.linarqa.entity.Staff;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDto {
    
    private UUID id;
    private String firstName;
    private String lastName;
    private String firstNameArabic;
    private String lastNameArabic;
    private String identityNumber;
    private String phoneNumber;
    private BigDecimal salary;
    private Staff.StaffType type;
    private String typeDisplayName;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StaffDto(Staff staff) {
        this.id = staff.getId();
        this.firstName = staff.getFirstName();
        this.lastName = staff.getLastName();
        this.firstNameArabic = staff.getFirstNameArabic();
        this.lastNameArabic = staff.getLastNameArabic();
        this.identityNumber = staff.getIdentityNumber();
        this.phoneNumber = staff.getPhoneNumber();
        this.salary = staff.getSalary();
        this.type = staff.getType();
        this.typeDisplayName = staff.getType().getDisplayName();
        this.active = staff.isActive();
        this.createdAt = staff.getCreatedAt();
        this.updatedAt = staff.getUpdatedAt();
    }
}
