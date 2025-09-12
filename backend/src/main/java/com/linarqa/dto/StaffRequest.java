package com.linarqa.dto;

import com.linarqa.entity.Staff;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffRequest {
    
    private String firstName;
    private String lastName;
    private String firstNameArabic;
    private String lastNameArabic;
    private String identityNumber;
    private String phoneNumber;
    private BigDecimal salary;
    private Staff.StaffType type;
    private boolean active;
}
