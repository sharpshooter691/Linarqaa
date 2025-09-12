package com.linarqa.service;

import com.linarqa.dto.ExtraStudentDto;
import com.linarqa.dto.ExtraStudentRequest;
import com.linarqa.entity.ExtraStudent;
import com.linarqa.repository.ExtraStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExtraStudentService {

    @Autowired
    private ExtraStudentRepository extraStudentRepository;

    private static final String UPLOAD_DIR = "uploads/extra-students/";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

    /**
     * Get all extra students with pagination and sorting
     */
    public Page<ExtraStudentDto> getAllExtraStudents(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ExtraStudent> extraStudentPage = extraStudentRepository.findAll(pageable);
        
        return extraStudentPage.map(ExtraStudentDto::new);
    }

    /**
     * Get extra student by ID
     */
    public ExtraStudentDto getExtraStudentById(UUID id) {
        ExtraStudent extraStudent = extraStudentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Extra student not found with id: " + id));
        
        return new ExtraStudentDto(extraStudent);
    }

    /**
     * Create a new extra student
     */
    public ExtraStudentDto createExtraStudent(ExtraStudentRequest request) {
        // Validate request
        if (!request.isValid()) {
            throw new RuntimeException("Invalid request: " + request.getValidationErrors());
        }

        // Validate age (must be between 3 and 25 years old)
        validateAge(request.getBirthDate());

        // Validate phone number format
        validatePhoneNumber(request.getResponsiblePhone());

        // Create entity
        ExtraStudent extraStudent = request.toEntity();
        
        // Set default status if not provided
        if (extraStudent.getStatus() == null) {
            extraStudent.setStatus(ExtraStudent.StudentStatus.ACTIVE);
        }

        // Save and return
        ExtraStudent savedStudent = extraStudentRepository.save(extraStudent);
        return new ExtraStudentDto(savedStudent);
    }

    /**
     * Update an existing extra student
     */
    public ExtraStudentDto updateExtraStudent(UUID id, ExtraStudentRequest request) {
        ExtraStudent extraStudent = extraStudentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Extra student not found with id: " + id));

        // Validate age if birth date is being updated
        if (request.getBirthDate() != null) {
            validateAge(request.getBirthDate());
        }

        // Validate phone number if being updated
        if (request.getResponsiblePhone() != null) {
            validatePhoneNumber(request.getResponsiblePhone());
        }

        // Update entity
        request.updateEntity(extraStudent);
        extraStudent.setUpdatedAt(LocalDateTime.now());

        // Save and return
        ExtraStudent savedStudent = extraStudentRepository.save(extraStudent);
        return new ExtraStudentDto(savedStudent);
    }

    /**
     * Delete an extra student
     */
    public void deleteExtraStudent(UUID id) {
        if (!extraStudentRepository.existsById(id)) {
            throw new RuntimeException("Extra student not found with id: " + id);
        }
        
        // Delete associated photo if exists
        ExtraStudent extraStudent = extraStudentRepository.findById(id).orElse(null);
        if (extraStudent != null && extraStudent.getPhotoUrl() != null) {
            deletePhotoFile(extraStudent.getPhotoUrl());
        }
        
        extraStudentRepository.deleteById(id);
    }

    /**
     * Get extra students by status
     */
    public List<ExtraStudentDto> getExtraStudentsByStatus(ExtraStudent.StudentStatus status) {
        List<ExtraStudent> students = extraStudentRepository.findByStatus(status);
        return students.stream()
            .map(ExtraStudentDto::new)
            .collect(Collectors.toList());
    }

    /**
     * Search extra students by term
     */
    public List<ExtraStudentDto> searchExtraStudents(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllExtraStudents();
        }
        
        List<ExtraStudent> students = extraStudentRepository.findBySearchTerm(searchTerm.trim());
        return students.stream()
            .map(ExtraStudentDto::new)
            .collect(Collectors.toList());
    }

    /**
     * Get extra students by status and search term
     */
    public List<ExtraStudentDto> getExtraStudentsByStatusAndSearch(ExtraStudent.StudentStatus status, String searchTerm) {
        List<ExtraStudent> students = extraStudentRepository.findByStatusAndSearchTerm(status, searchTerm);
        return students.stream()
            .map(ExtraStudentDto::new)
            .collect(Collectors.toList());
    }

    /**
     * Update student photo URL
     */
    public ExtraStudentDto updateStudentPhoto(UUID id, String photoUrl) {
        ExtraStudent extraStudent = extraStudentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Extra student not found with id: " + id));

        // Delete old photo if exists
        if (extraStudent.getPhotoUrl() != null) {
            deletePhotoFile(extraStudent.getPhotoUrl());
        }

        extraStudent.setPhotoUrl(photoUrl);
        extraStudent.setUpdatedAt(LocalDateTime.now());

        ExtraStudent savedStudent = extraStudentRepository.save(extraStudent);
        return new ExtraStudentDto(savedStudent);
    }

    /**
     * Upload student photo file
     */
    public ExtraStudentDto uploadStudentPhoto(UUID id, MultipartFile file) throws IOException {
        ExtraStudent extraStudent = extraStudentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Extra student not found with id: " + id));

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = id.toString() + "_" + LocalDateTime.now().format(DATE_FORMATTER) + fileExtension;
        Path filePath = uploadPath.resolve(filename);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Delete old photo if exists
        if (extraStudent.getPhotoUrl() != null) {
            deletePhotoFile(extraStudent.getPhotoUrl());
        }

        // Update student with new photo URL
        String photoUrl = "/uploads/extra-students/" + filename;
        extraStudent.setPhotoUrl(photoUrl);
        extraStudent.setUpdatedAt(LocalDateTime.now());

        ExtraStudent savedStudent = extraStudentRepository.save(extraStudent);
        return new ExtraStudentDto(savedStudent);
    }

    /**
     * Upload student photo from camera (base64)
     */
    public ExtraStudentDto uploadStudentPhotoFromCamera(UUID id, String base64Data) throws IOException {
        ExtraStudent extraStudent = extraStudentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Extra student not found with id: " + id));

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String filename = id.toString() + "_" + LocalDateTime.now().format(DATE_FORMATTER) + ".jpg";
        Path filePath = uploadPath.resolve(filename);

        // Convert base64 to file and save
        byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data.split(",")[1]);
        Files.write(filePath, imageBytes);

        // Delete old photo if exists
        if (extraStudent.getPhotoUrl() != null) {
            deletePhotoFile(extraStudent.getPhotoUrl());
        }

        // Update student with new photo URL
        String photoUrl = "/uploads/extra-students/" + filename;
        extraStudent.setPhotoUrl(photoUrl);
        extraStudent.setUpdatedAt(LocalDateTime.now());

        ExtraStudent savedStudent = extraStudentRepository.save(extraStudent);
        return new ExtraStudentDto(savedStudent);
    }

    /**
     * Bulk update student status
     */
    public void bulkUpdateStatus(List<UUID> studentIds, ExtraStudent.StudentStatus status) {
        List<ExtraStudent> students = extraStudentRepository.findAllById(studentIds);
        
        for (ExtraStudent student : students) {
            student.setStatus(status);
            student.setUpdatedAt(LocalDateTime.now());
        }
        
        extraStudentRepository.saveAll(students);
    }

    /**
     * Bulk delete students
     */
    public void bulkDeleteStudents(List<UUID> studentIds) {
        List<ExtraStudent> students = extraStudentRepository.findAllById(studentIds);
        
        // Delete associated photos
        for (ExtraStudent student : students) {
            if (student.getPhotoUrl() != null) {
                deletePhotoFile(student.getPhotoUrl());
            }
        }
        
        extraStudentRepository.deleteAllById(studentIds);
    }

    /**
     * Get students registered in a date range
     */
    public List<ExtraStudentDto> getStudentsByDateRange(LocalDate startDate, LocalDate endDate) {
        List<ExtraStudent> students = extraStudentRepository.findAll().stream()
            .filter(student -> {
                LocalDate createdAt = student.getCreatedAt().toLocalDate();
                return !createdAt.isBefore(startDate) && !createdAt.isAfter(endDate);
            })
            .collect(Collectors.toList());
        
        return students.stream()
            .map(ExtraStudentDto::new)
            .collect(Collectors.toList());
    }

    /**
     * Get student statistics
     */
    public StudentStatistics getStudentStatistics() {
        List<ExtraStudent> allStudents = extraStudentRepository.findAll();
        
        long totalStudents = allStudents.size();
        long activeStudents = allStudents.stream()
            .filter(s -> s.getStatus() == ExtraStudent.StudentStatus.ACTIVE)
            .count();
        long inactiveStudents = totalStudents - activeStudents;
        
        // Count recent registrations (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        long recentRegistrations = allStudents.stream()
            .filter(s -> s.getCreatedAt().toLocalDate().isAfter(thirtyDaysAgo))
            .count();
        
        return new StudentStatistics(totalStudents, activeStudents, inactiveStudents, recentRegistrations);
    }

    /**
     * Get all extra students (without pagination)
     */
    public List<ExtraStudentDto> getAllExtraStudents() {
        List<ExtraStudent> students = extraStudentRepository.findAll();
        return students.stream()
            .map(ExtraStudentDto::new)
            .collect(Collectors.toList());
    }

    // Private helper methods

    private void validateAge(LocalDate birthDate) {
        LocalDate today = LocalDate.now();
        int age = today.getYear() - birthDate.getYear();
        
        if (birthDate.plusYears(age).isAfter(today)) {
            age--;
        }
        
        if (age < 3 || age > 25) {
            throw new RuntimeException("Student age must be between 3 and 25 years old. Current age: " + age);
        }
    }

    private void validatePhoneNumber(String phoneNumber) {
        // Basic validation for Moroccan phone numbers
        String cleaned = phoneNumber.replaceAll("[^0-9+]", "");
        
        if (!cleaned.matches("^(\\+212|0)?[5-7][0-9]{8}$")) {
            throw new RuntimeException("Invalid phone number format. Expected Moroccan format.");
        }
    }

    private void deletePhotoFile(String photoUrl) {
        try {
            if (photoUrl != null && photoUrl.startsWith("/uploads/")) {
                String filename = photoUrl.substring("/uploads/".length());
                Path filePath = Paths.get("uploads", filename);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            }
        } catch (IOException e) {
            // Log error but don't throw exception
            System.err.println("Error deleting photo file: " + e.getMessage());
        }
    }

    // Inner class for statistics
    public static class StudentStatistics {
        private final long totalStudents;
        private final long activeStudents;
        private final long inactiveStudents;
        private final long recentRegistrations;

        public StudentStatistics(long totalStudents, long activeStudents, long inactiveStudents, long recentRegistrations) {
            this.totalStudents = totalStudents;
            this.activeStudents = activeStudents;
            this.inactiveStudents = inactiveStudents;
            this.recentRegistrations = recentRegistrations;
        }

        // Getters
        public long getTotalStudents() { return totalStudents; }
        public long getActiveStudents() { return activeStudents; }
        public long getInactiveStudents() { return inactiveStudents; }
        public long getRecentRegistrations() { return recentRegistrations; }
    }
}
