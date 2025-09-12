
package com.linarqa.repository;

import com.linarqa.entity.Classroom;
import com.linarqa.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, UUID> {
    List<Classroom> findByStudentType(Student.StudentType studentType);
    List<Classroom> findByLevelAndStudentType(String level, Student.StudentType studentType);
    List<Classroom> findByIsActiveTrue();
} 