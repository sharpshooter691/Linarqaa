package com.linarqa.repository;

import com.linarqa.entity.StudentBelonging;
import com.linarqa.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StudentBelongingRepository extends JpaRepository<StudentBelonging, UUID> {
    
    @Query("SELECT sb FROM StudentBelonging sb WHERE sb.student.id = :studentId")
    List<StudentBelonging> findByStudentId(@Param("studentId") UUID studentId);
    
    @Query("SELECT sb FROM StudentBelonging sb WHERE sb.student.studentType = :studentType")
    List<StudentBelonging> findByStudentType(@Param("studentType") Student.StudentType studentType);
    
    @Query("SELECT sb FROM StudentBelonging sb WHERE sb.status = :status")
    List<StudentBelonging> findByStatus(@Param("status") StudentBelonging.BelongingStatus status);
    
    @Query("SELECT sb FROM StudentBelonging sb WHERE sb.student.id = :studentId AND sb.status = :status")
    List<StudentBelonging> findByStudentIdAndStatus(@Param("studentId") UUID studentId, @Param("status") StudentBelonging.BelongingStatus status);
    
    @Query("SELECT sb FROM StudentBelonging sb WHERE sb.checkInDate BETWEEN :startDate AND :endDate")
    List<StudentBelonging> findByCheckInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
} 