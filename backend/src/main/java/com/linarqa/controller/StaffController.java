package com.linarqa.controller;

import com.linarqa.dto.StaffDto;
import com.linarqa.dto.StaffRequest;
import com.linarqa.entity.Staff;
import com.linarqa.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private StaffService staffService;

    /**
     * Get all staff with pagination
     */
    @GetMapping
    public ResponseEntity<Page<StaffDto>> getAllStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Page<StaffDto> staffPage = staffService.getAllStaff(page, size, sortBy, sortDir);
        return ResponseEntity.ok(staffPage);
    }

    /**
     * Get all staff without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<StaffDto>> getAllStaffList() {
        List<StaffDto> staffList = staffService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }

    /**
     * Get staff by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<StaffDto> getStaffById(@PathVariable UUID id) {
        try {
            StaffDto staff = staffService.getStaffById(id);
            return ResponseEntity.ok(staff);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create new staff member
     */
    @PostMapping
    public ResponseEntity<StaffDto> createStaff(@RequestBody StaffRequest request) {
        try {
            StaffDto staff = staffService.createStaff(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(staff);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update staff member
     */
    @PutMapping("/{id}")
    public ResponseEntity<StaffDto> updateStaff(@PathVariable UUID id, @RequestBody StaffRequest request) {
        try {
            StaffDto staff = staffService.updateStaff(id, request);
            return ResponseEntity.ok(staff);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete staff member
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID id) {
        try {
            staffService.deleteStaff(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get staff by type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<StaffDto>> getStaffByType(@PathVariable Staff.StaffType type) {
        List<StaffDto> staffList = staffService.getStaffByType(type);
        return ResponseEntity.ok(staffList);
    }

    /**
     * Get active staff
     */
    @GetMapping("/active")
    public ResponseEntity<List<StaffDto>> getActiveStaff() {
        List<StaffDto> staffList = staffService.getActiveStaff();
        return ResponseEntity.ok(staffList);
    }

    /**
     * Get inactive staff
     */
    @GetMapping("/inactive")
    public ResponseEntity<List<StaffDto>> getInactiveStaff() {
        List<StaffDto> staffList = staffService.getInactiveStaff();
        return ResponseEntity.ok(staffList);
    }

    /**
     * Search staff by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<StaffDto>> searchStaffByName(@RequestParam String name) {
        List<StaffDto> staffList = staffService.searchStaffByName(name);
        return ResponseEntity.ok(staffList);
    }

    /**
     * Search staff by Arabic name
     */
    @GetMapping("/search-arabic")
    public ResponseEntity<List<StaffDto>> searchStaffByArabicName(@RequestParam String name) {
        List<StaffDto> staffList = staffService.searchStaffByArabicName(name);
        return ResponseEntity.ok(staffList);
    }

    /**
     * Get staff types
     */
    @GetMapping("/types")
    public ResponseEntity<Staff.StaffType[]> getStaffTypes() {
        return ResponseEntity.ok(Staff.StaffType.values());
    }
}
