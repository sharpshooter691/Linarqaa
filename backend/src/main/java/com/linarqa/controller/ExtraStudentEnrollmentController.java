package com.linarqa.controller;

import com.linarqa.dto.ExtraStudentEnrollmentDto;
import com.linarqa.dto.ExtraStudentEnrollmentRequest;
import com.linarqa.entity.ExtraStudentEnrollment;
import com.linarqa.service.ExtraStudentEnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/extra-students/enrollments")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExtraStudentEnrollmentController {

    @Autowired
    private ExtraStudentEnrollmentService enrollmentService;

    /**
     * Get all enrollments
     */
    @GetMapping
    public ResponseEntity<List<ExtraStudentEnrollmentDto>> getAllEnrollments() {
        try {
            List<ExtraStudentEnrollmentDto> enrollments = enrollmentService.getAllEnrollments();
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get enrollments by course ID
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ExtraStudentEnrollmentDto>> getEnrollmentsByCourseId(@PathVariable UUID courseId) {
        try {
            List<ExtraStudentEnrollmentDto> enrollments = enrollmentService.getEnrollmentsByCourseId(courseId);
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get enrollments by extra student ID
     */
    @GetMapping("/student/{extraStudentId}")
    public ResponseEntity<List<ExtraStudentEnrollmentDto>> getEnrollmentsByExtraStudentId(@PathVariable UUID extraStudentId) {
        try {
            List<ExtraStudentEnrollmentDto> enrollments = enrollmentService.getEnrollmentsByExtraStudentId(extraStudentId);
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get enrollments by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ExtraStudentEnrollmentDto>> getEnrollmentsByStatus(@PathVariable ExtraStudentEnrollment.EnrollmentStatus status) {
        try {
            List<ExtraStudentEnrollmentDto> enrollments = enrollmentService.getEnrollmentsByStatus(status);
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get enrollment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExtraStudentEnrollmentDto> getEnrollmentById(@PathVariable UUID id) {
        try {
            ExtraStudentEnrollmentDto enrollment = enrollmentService.getEnrollmentById(id);
            return ResponseEntity.ok(enrollment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new enrollment
     */
    @PostMapping
    public ResponseEntity<?> createEnrollment(@RequestBody ExtraStudentEnrollmentRequest request) {
        try {
            ExtraStudentEnrollmentDto createdEnrollment = enrollmentService.createEnrollment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEnrollment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Update enrollment status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateEnrollmentStatus(
            @PathVariable UUID id, 
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String statusStr = statusUpdate.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            ExtraStudentEnrollment.EnrollmentStatus status = ExtraStudentEnrollment.EnrollmentStatus.valueOf(statusStr);
            ExtraStudentEnrollmentDto updatedEnrollment = enrollmentService.updateEnrollmentStatus(id, status);
            return ResponseEntity.ok(updatedEnrollment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Update enrollment notes
     */
    @PatchMapping("/{id}/notes")
    public ResponseEntity<?> updateEnrollmentNotes(
            @PathVariable UUID id, 
            @RequestBody Map<String, String> notesUpdate) {
        try {
            String notes = notesUpdate.get("notes");
            if (notes == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Notes are required"));
            }
            
            ExtraStudentEnrollmentDto updatedEnrollment = enrollmentService.updateEnrollmentNotes(id, notes);
            return ResponseEntity.ok(updatedEnrollment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Delete enrollment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnrollment(@PathVariable UUID id) {
        try {
            enrollmentService.deleteEnrollment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Get active enrollments count for a course
     */
    @GetMapping("/course/{courseId}/active-count")
    public ResponseEntity<Map<String, Long>> getActiveEnrollmentsCountForCourse(@PathVariable UUID courseId) {
        try {
            long count = enrollmentService.getActiveEnrollmentsCountForCourse(courseId);
            return ResponseEntity.ok(Map.of("activeEnrollmentsCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get active enrollments count for an extra student
     */
    @GetMapping("/student/{extraStudentId}/active-count")
    public ResponseEntity<Map<String, Long>> getActiveEnrollmentsCountForExtraStudent(@PathVariable UUID extraStudentId) {
        try {
            long count = enrollmentService.getActiveEnrollmentsCountForExtraStudent(extraStudentId);
            return ResponseEntity.ok(Map.of("activeEnrollmentsCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "ExtraStudentEnrollmentService"));
    }
}

