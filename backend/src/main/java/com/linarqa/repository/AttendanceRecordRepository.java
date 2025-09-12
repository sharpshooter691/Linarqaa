package com.linarqa.repository;

import com.linarqa.entity.AttendanceRecord;
import com.linarqa.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    
    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.student.id = :studentId AND ar.attendanceDate = :date")
    AttendanceRecord findByStudentIdAndDate(@Param("studentId") UUID studentId, @Param("date") LocalDate date);
    
    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.attendanceDate = :date AND ar.student.studentType = :studentType")
    List<AttendanceRecord> findByDateAndStudentType(@Param("date") LocalDate date, @Param("studentType") Student.StudentType studentType);
    
    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.student.id = :studentId AND ar.attendanceDate BETWEEN :startDate AND :endDate")
    List<AttendanceRecord> findByStudentIdAndDateRange(@Param("studentId") UUID studentId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.attendanceDate = :date")
    List<AttendanceRecord> findByDate(@Param("date") LocalDate date);
    
    boolean existsByStudentIdAndAttendanceDate(UUID studentId, LocalDate date);
} 