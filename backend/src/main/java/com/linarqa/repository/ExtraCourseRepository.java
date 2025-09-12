package com.linarqa.repository;

import com.linarqa.entity.ExtraCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExtraCourseRepository extends JpaRepository<ExtraCourse, UUID> {
    List<ExtraCourse> findByActiveTrue();
} 