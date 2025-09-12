package com.linarqa.repository;

import com.linarqa.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID> {
    
    List<Staff> findByType(Staff.StaffType type);
    
    List<Staff> findByActive(boolean active);
    
    Optional<Staff> findByIdentityNumber(String identityNumber);
    
    List<Staff> findByPhoneNumber(String phoneNumber);
    
    List<Staff> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
    
    List<Staff> findByFirstNameArabicContainingIgnoreCaseOrLastNameArabicContainingIgnoreCase(String firstNameArabic, String lastNameArabic);
}
