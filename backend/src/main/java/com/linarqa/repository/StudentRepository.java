package com.linarqa.repository;

import com.linarqa.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    
    List<Student> findByLevel(Student.StudentLevel level);
    
    List<Student> findByStatus(Student.StudentStatus status);
    
    List<Student> findByStudentType(Student.StudentType studentType);
    
    List<Student> findByClassroom(String classroom);
    
    List<Student> findByGuardianPhone(String guardianPhone);
} 