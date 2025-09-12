package com.linarqa.repository;

import com.linarqa.entity.KindergartenEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KindergartenEnrollmentRepository extends JpaRepository<KindergartenEnrollment, UUID> {
    
    List<KindergartenEnrollment> findByStudentId(UUID studentId);
    
    List<KindergartenEnrollment> findByCourseId(UUID courseId);
    
    List<KindergartenEnrollment> findByStatus(KindergartenEnrollment.EnrollmentStatus status);
} 