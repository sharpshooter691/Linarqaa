package com.linarqa.repository;

import com.linarqa.entity.ExtraStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExtraStudentRepository extends JpaRepository<ExtraStudent, UUID> {
    
    List<ExtraStudent> findByStatus(ExtraStudent.StudentStatus status);
    
    @Query("SELECT e FROM ExtraStudent e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.responsibleName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "e.responsiblePhone LIKE CONCAT('%', :searchTerm, '%')")
    List<ExtraStudent> findBySearchTerm(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT e FROM ExtraStudent e WHERE " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.responsibleName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "e.responsiblePhone LIKE CONCAT('%', :searchTerm, '%'))")
    List<ExtraStudent> findByStatusAndSearchTerm(@Param("status") ExtraStudent.StudentStatus status, 
                                                @Param("searchTerm") String searchTerm);
}
