package com.linarqa.repository;

import com.linarqa.entity.ExtraStudentEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExtraStudentEnrollmentRepository extends JpaRepository<ExtraStudentEnrollment, UUID> {
    
    List<ExtraStudentEnrollment> findByExtraStudentId(UUID extraStudentId);
    
    List<ExtraStudentEnrollment> findByCourseId(UUID courseId);
    
    List<ExtraStudentEnrollment> findByStatus(ExtraStudentEnrollment.EnrollmentStatus status);
    
    List<ExtraStudentEnrollment> findByExtraStudentIdAndStatus(UUID extraStudentId, ExtraStudentEnrollment.EnrollmentStatus status);
    
    List<ExtraStudentEnrollment> findByCourseIdAndStatus(UUID courseId, ExtraStudentEnrollment.EnrollmentStatus status);
    
    boolean existsByExtraStudentIdAndCourseIdAndStatus(UUID extraStudentId, UUID courseId, ExtraStudentEnrollment.EnrollmentStatus status);
}
