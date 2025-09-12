package com.linarqa.controller;

import com.linarqa.dto.ExtraStudentDto;
import com.linarqa.dto.ExtraStudentRequest;
import com.linarqa.entity.ExtraStudent;
import com.linarqa.service.ExtraStudentService;
import com.linarqa.service.NotificationService;
import com.linarqa.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/extra-students")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExtraStudentController {

    @Autowired
    private ExtraStudentService extraStudentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get all extra students with pagination and sorting
     */
    @GetMapping
    public ResponseEntity<Page<ExtraStudentDto>> getAllExtraStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Page<ExtraStudentDto> students = extraStudentService.getAllExtraStudents(page, size, sortBy, sortDir);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get extra student by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExtraStudentDto> getExtraStudentById(@PathVariable UUID id) {
        try {
            ExtraStudentDto student = extraStudentService.getExtraStudentById(id);
            return ResponseEntity.ok(student);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new extra student
     */
    @PostMapping
    public ResponseEntity<?> createExtraStudent(@RequestBody ExtraStudentRequest request) {
        try {
            ExtraStudentDto createdStudent = extraStudentService.createExtraStudent(request);
            
            // Notify admin users about new extra student registration
            try {
                securityUtils.getCurrentUserId().ifPresent(userId -> {
                    String studentName = createdStudent.getFirstName() + " " + createdStudent.getLastName();
                    String studentNameArabic = (createdStudent.getFirstNameArabic() != null ? createdStudent.getFirstNameArabic() : createdStudent.getFirstName()) + 
                                             " " + (createdStudent.getLastNameArabic() != null ? createdStudent.getLastNameArabic() : createdStudent.getLastName());
                    notificationService.notifyExtraStudentRegistered(studentName, studentNameArabic, createdStudent.getId(), userId);
                });
            } catch (Exception e) {
                // Log error but don't fail the request
                System.err.println("Failed to send notification: " + e.getMessage());
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Update an existing extra student
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExtraStudent(@PathVariable UUID id, @RequestBody ExtraStudentRequest request) {
        try {
            ExtraStudentDto updatedStudent = extraStudentService.updateExtraStudent(id, request);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Delete an extra student
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExtraStudent(@PathVariable UUID id) {
        try {
            extraStudentService.deleteExtraStudent(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Get extra students by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ExtraStudentDto>> getExtraStudentsByStatus(@PathVariable ExtraStudent.StudentStatus status) {
        try {
            List<ExtraStudentDto> students = extraStudentService.getExtraStudentsByStatus(status);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search extra students by term
     */
    @GetMapping("/search")
    public ResponseEntity<List<ExtraStudentDto>> searchExtraStudents(@RequestParam String q) {
        try {
            List<ExtraStudentDto> students = extraStudentService.searchExtraStudents(q);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get extra students by status and search term
     */
    @GetMapping("/filter")
    public ResponseEntity<List<ExtraStudentDto>> getExtraStudentsByStatusAndSearch(
            @RequestParam(required = false) ExtraStudent.StudentStatus status,
            @RequestParam(required = false) String search) {
        try {
            List<ExtraStudentDto> students = extraStudentService.getExtraStudentsByStatusAndSearch(status, search);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update student photo URL
     */
    @PatchMapping("/{id}/photo")
    public ResponseEntity<?> updateStudentPhoto(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        try {
            String photoUrl = request.get("photoUrl");
            if (photoUrl == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Photo URL is required"));
            }
            
            ExtraStudentDto updatedStudent = extraStudentService.updateStudentPhoto(id, photoUrl);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Upload student photo file
     */
    @PostMapping(value = "/{id}/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadStudentPhoto(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }
            
            ExtraStudentDto updatedStudent = extraStudentService.uploadStudentPhoto(id, file);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "File upload failed"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Upload student photo from camera (base64)
     */
    @PostMapping("/{id}/upload-camera-photo")
    public ResponseEntity<?> uploadStudentPhotoFromCamera(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        try {
            String base64Data = request.get("base64Data");
            if (base64Data == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Base64 data is required"));
            }
            
            ExtraStudentDto updatedStudent = extraStudentService.uploadStudentPhotoFromCamera(id, base64Data);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Photo upload failed"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Bulk update student status
     */
    @PatchMapping("/bulk-status")
    public ResponseEntity<?> bulkUpdateStatus(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> studentIds = (List<String>) request.get("studentIds");
            String statusStr = (String) request.get("status");
            
            if (studentIds == null || statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student IDs and status are required"));
            }
            
            ExtraStudent.StudentStatus status = ExtraStudent.StudentStatus.valueOf(statusStr.toUpperCase());
            List<UUID> ids = studentIds.stream().map(UUID::fromString).toList();
            
            extraStudentService.bulkUpdateStatus(ids, status);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Bulk delete students
     */
    @DeleteMapping("/bulk-delete")
    public ResponseEntity<?> bulkDeleteStudents(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> studentIds = (List<String>) request.get("studentIds");
            
            if (studentIds == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student IDs are required"));
            }
            
            List<UUID> ids = studentIds.stream().map(UUID::fromString).toList();
            extraStudentService.bulkDeleteStudents(ids);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Get students by date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<ExtraStudentDto>> getStudentsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            List<ExtraStudentDto> students = extraStudentService.getStudentsByDateRange(start, end);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get student statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ExtraStudentService.StudentStatistics> getStudentStatistics() {
        try {
            ExtraStudentService.StudentStatistics stats = extraStudentService.getStudentStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export students (placeholder for future implementation)
     */
    @GetMapping("/export")
    public ResponseEntity<?> exportStudents(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) ExtraStudent.StudentStatus status,
            @RequestParam(required = false) String search) {
        try {
            // This is a placeholder for export functionality
            // In a real implementation, you would generate and return the appropriate file
            return ResponseEntity.ok(Map.of("message", "Export functionality not yet implemented"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "ExtraStudentService"));
    }
}
