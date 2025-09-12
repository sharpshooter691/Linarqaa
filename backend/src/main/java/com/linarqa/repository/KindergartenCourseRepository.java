package com.linarqa.repository;

import com.linarqa.entity.KindergartenCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KindergartenCourseRepository extends JpaRepository<KindergartenCourse, UUID> {
    
    List<KindergartenCourse> findByActiveTrue();
    
    List<KindergartenCourse> findByLevel(com.linarqa.entity.Student.StudentLevel level);
    
    List<KindergartenCourse> findByActiveTrueAndLevel(com.linarqa.entity.Student.StudentLevel level);
} 