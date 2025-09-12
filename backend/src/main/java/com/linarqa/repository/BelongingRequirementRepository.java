package com.linarqa.repository;

import com.linarqa.entity.BelongingRequirement;
import com.linarqa.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BelongingRequirementRepository extends JpaRepository<BelongingRequirement, UUID> {
    List<BelongingRequirement> findByStudentType(Student.StudentType studentType);
    List<BelongingRequirement> findByStudentTypeAndLevel(Student.StudentType studentType, String level);
    List<BelongingRequirement> findByIsActiveTrue();
    List<BelongingRequirement> findByStudentTypeAndIsActiveTrue(Student.StudentType studentType);
} 