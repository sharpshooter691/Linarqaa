package com.linarqa.service;

import com.linarqa.dto.StaffDto;
import com.linarqa.dto.StaffRequest;
import com.linarqa.entity.Staff;
import com.linarqa.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class StaffService {

    @Autowired
    private StaffRepository staffRepository;

    /**
     * Get all staff with pagination and sorting
     */
    public Page<StaffDto> getAllStaff(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Staff> staffPage = staffRepository.findAll(pageable);
        
        return staffPage.map(StaffDto::new);
    }

    /**
     * Get all staff without pagination
     */
    public List<StaffDto> getAllStaff() {
        List<Staff> staffList = staffRepository.findAll();
        return staffList.stream()
                .map(StaffDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Get staff by ID
     */
    public StaffDto getStaffById(UUID id) {
        Staff staff = staffRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));
        
        return new StaffDto(staff);
    }

    /**
     * Create a new staff member
     */
    public StaffDto createStaff(StaffRequest request) {
        // Check if identity number already exists
        if (staffRepository.findByIdentityNumber(request.getIdentityNumber()).isPresent()) {
            throw new RuntimeException("Staff with identity number " + request.getIdentityNumber() + " already exists");
        }

        Staff staff = Staff.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .firstNameArabic(request.getFirstNameArabic())
                .lastNameArabic(request.getLastNameArabic())
                .identityNumber(request.getIdentityNumber())
                .phoneNumber(request.getPhoneNumber())
                .salary(request.getSalary())
                .type(request.getType())
                .active(request.isActive())
                .build();

        Staff savedStaff = staffRepository.save(staff);
        return new StaffDto(savedStaff);
    }

    /**
     * Update staff member
     */
    public StaffDto updateStaff(UUID id, StaffRequest request) {
        Staff staff = staffRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));

        // Check if identity number already exists for another staff member
        staffRepository.findByIdentityNumber(request.getIdentityNumber())
            .ifPresent(existingStaff -> {
                if (!existingStaff.getId().equals(id)) {
                    throw new RuntimeException("Staff with identity number " + request.getIdentityNumber() + " already exists");
                }
            });

        staff.setFirstName(request.getFirstName());
        staff.setLastName(request.getLastName());
        staff.setFirstNameArabic(request.getFirstNameArabic());
        staff.setLastNameArabic(request.getLastNameArabic());
        staff.setIdentityNumber(request.getIdentityNumber());
        staff.setPhoneNumber(request.getPhoneNumber());
        staff.setSalary(request.getSalary());
        staff.setType(request.getType());
        staff.setActive(request.isActive());

        Staff updatedStaff = staffRepository.save(staff);
        return new StaffDto(updatedStaff);
    }

    /**
     * Delete staff member
     */
    public void deleteStaff(UUID id) {
        Staff staff = staffRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));
        
        staffRepository.delete(staff);
    }

    /**
     * Get staff by type
     */
    public List<StaffDto> getStaffByType(Staff.StaffType type) {
        List<Staff> staffList = staffRepository.findByType(type);
        return staffList.stream()
                .map(StaffDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Get active staff
     */
    public List<StaffDto> getActiveStaff() {
        List<Staff> staffList = staffRepository.findByActive(true);
        return staffList.stream()
                .map(StaffDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Get inactive staff
     */
    public List<StaffDto> getInactiveStaff() {
        List<Staff> staffList = staffRepository.findByActive(false);
        return staffList.stream()
                .map(StaffDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Search staff by name
     */
    public List<StaffDto> searchStaffByName(String name) {
        List<Staff> staffList = staffRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name, name);
        return staffList.stream()
                .map(StaffDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Search staff by Arabic name
     */
    public List<StaffDto> searchStaffByArabicName(String name) {
        List<Staff> staffList = staffRepository.findByFirstNameArabicContainingIgnoreCaseOrLastNameArabicContainingIgnoreCase(name, name);
        return staffList.stream()
                .map(StaffDto::new)
                .collect(Collectors.toList());
    }
}
