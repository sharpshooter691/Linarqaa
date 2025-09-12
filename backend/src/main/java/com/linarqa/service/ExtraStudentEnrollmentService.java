package com.linarqa.service;

import com.linarqa.dto.ExtraStudentEnrollmentDto;
import com.linarqa.dto.ExtraStudentEnrollmentRequest;
import com.linarqa.entity.ExtraCourse;
import com.linarqa.entity.ExtraStudent;
import com.linarqa.entity.ExtraStudentEnrollment;
import com.linarqa.repository.ExtraCourseRepository;
import com.linarqa.repository.ExtraStudentEnrollmentRepository;
import com.linarqa.repository.ExtraStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExtraStudentEnrollmentService {

    @Autowired
    private ExtraStudentEnrollmentRepository enrollmentRepository;
    
    @Autowired
    private ExtraStudentRepository extraStudentRepository;
    
    @Autowired
    private ExtraCourseRepository extraCourseRepository;

    /**
     * Get all enrollments
     */
    public List<ExtraStudentEnrollmentDto> getAllEnrollments() {
        List<ExtraStudentEnrollment> enrollments = enrollmentRepository.findAll();
        return enrollments.stream()
                .map(ExtraStudentEnrollmentDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Get enrollments by course ID
     */
    public List<ExtraStudentEnrollmentDto> getEnrollmentsByCourseId(UUID courseId) {
        List<ExtraStudentEnrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        return enrollments.stream()
                .map(ExtraStudentEnrollmentDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Get enrollments by extra student ID
     */
    public List<ExtraStudentEnrollmentDto> getEnrollmentsByExtraStudentId(UUID extraStudentId) {
        List<ExtraStudentEnrollment> enrollments = enrollmentRepository.findByExtraStudentId(extraStudentId);
        return enrollments.stream()
                .map(ExtraStudentEnrollmentDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Get enrollments by status
     */
    public List<ExtraStudentEnrollmentDto> getEnrollmentsByStatus(ExtraStudentEnrollment.EnrollmentStatus status) {
        List<ExtraStudentEnrollment> enrollments = enrollmentRepository.findByStatus(status);
        return enrollments.stream()
                .map(ExtraStudentEnrollmentDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Get enrollment by ID
     */
    public ExtraStudentEnrollmentDto getEnrollmentById(UUID id) {
        ExtraStudentEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + id));
        return new ExtraStudentEnrollmentDto(enrollment);
    }

    /**
     * Create a new enrollment
     */
    public ExtraStudentEnrollmentDto createEnrollment(ExtraStudentEnrollmentRequest request) {
        // Validate request
        if (!request.isValid()) {
            throw new RuntimeException("Invalid enrollment request");
        }

        // Check if extra student exists
        ExtraStudent extraStudent = extraStudentRepository.findById(request.getExtraStudentId())
                .orElseThrow(() -> new RuntimeException("Extra student not found with id: " + request.getExtraStudentId()));

        // Check if course exists
        ExtraCourse course = extraCourseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Extra course not found with id: " + request.getCourseId()));

        // Check if student is already enrolled in this course
        if (enrollmentRepository.existsByExtraStudentIdAndCourseIdAndStatus(
                request.getExtraStudentId(), request.getCourseId(), ExtraStudentEnrollment.EnrollmentStatus.ACTIVE)) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        // Check course capacity
        List<ExtraStudentEnrollment> activeEnrollments = enrollmentRepository.findByCourseIdAndStatus(
                request.getCourseId(), ExtraStudentEnrollment.EnrollmentStatus.ACTIVE);
        
        if (activeEnrollments.size() >= course.getCapacity()) {
            throw new RuntimeException("Course is at full capacity");
        }

        // Create enrollment
        ExtraStudentEnrollment enrollment = ExtraStudentEnrollment.builder()
                .extraStudent(extraStudent)
                .course(course)
                .status(ExtraStudentEnrollment.EnrollmentStatus.ACTIVE)
                .enrollmentDate(LocalDate.now())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .endDate(request.getEndDate())
                .notes(request.getNotes())
                .build();

        ExtraStudentEnrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return new ExtraStudentEnrollmentDto(savedEnrollment);
    }

    /**
     * Update enrollment status
     */
    public ExtraStudentEnrollmentDto updateEnrollmentStatus(UUID id, ExtraStudentEnrollment.EnrollmentStatus status) {
        ExtraStudentEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + id));
        
        enrollment.setStatus(status);
        ExtraStudentEnrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return new ExtraStudentEnrollmentDto(savedEnrollment);
    }

    /**
     * Update enrollment notes
     */
    public ExtraStudentEnrollmentDto updateEnrollmentNotes(UUID id, String notes) {
        ExtraStudentEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + id));
        
        enrollment.setNotes(notes);
        ExtraStudentEnrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return new ExtraStudentEnrollmentDto(savedEnrollment);
    }

    /**
     * Delete enrollment
     */
    public void deleteEnrollment(UUID id) {
        if (!enrollmentRepository.existsById(id)) {
            throw new RuntimeException("Enrollment not found with id: " + id);
        }
        enrollmentRepository.deleteById(id);
    }

    /**
     * Get active enrollments count for a course
     */
    public long getActiveEnrollmentsCountForCourse(UUID courseId) {
        return enrollmentRepository.findByCourseIdAndStatus(courseId, ExtraStudentEnrollment.EnrollmentStatus.ACTIVE).size();
    }

    /**
     * Get active enrollments count for an extra student
     */
    public long getActiveEnrollmentsCountForExtraStudent(UUID extraStudentId) {
        return enrollmentRepository.findByExtraStudentIdAndStatus(extraStudentId, ExtraStudentEnrollment.EnrollmentStatus.ACTIVE).size();
    }
}

