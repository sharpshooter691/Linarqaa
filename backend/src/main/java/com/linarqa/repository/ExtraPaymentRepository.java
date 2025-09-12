package com.linarqa.repository;

import com.linarqa.entity.ExtraPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExtraPaymentRepository extends JpaRepository<ExtraPayment, UUID> {
    
    List<ExtraPayment> findByExtraStudentId(UUID extraStudentId);
    List<ExtraPayment> findByExtraStudentIdOrderByDueDateDesc(UUID extraStudentId);
    
    List<ExtraPayment> findByExtraCourseId(UUID extraCourseId);
    
    List<ExtraPayment> findByStatus(ExtraPayment.PaymentStatus status);
    
    @Query("SELECT ep FROM ExtraPayment ep WHERE ep.extraStudent.id = :studentId AND ep.extraCourse.id = :courseId AND YEAR(ep.dueDate) = :year AND MONTH(ep.dueDate) = :month")
    List<ExtraPayment> findByStudentAndCourseAndMonth(@Param("studentId") UUID studentId, @Param("courseId") UUID courseId, @Param("year") int year, @Param("month") int month);
    
    @Query("SELECT ep FROM ExtraPayment ep WHERE YEAR(ep.dueDate) = :year AND MONTH(ep.dueDate) = :month")
    List<ExtraPayment> findByMonth(@Param("year") int year, @Param("month") int month);
    
    @Query("SELECT ep FROM ExtraPayment ep WHERE ep.dueDate < :currentDate AND ep.status IN ('UNPAID', 'PARTIAL')")
    List<ExtraPayment> findOverduePayments(@Param("currentDate") LocalDate currentDate);
    
    List<ExtraPayment> findByPaidDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, ExtraPayment.PaymentStatus status);
    List<ExtraPayment> findByStatusIn(List<ExtraPayment.PaymentStatus> statuses);
    List<ExtraPayment> findByDueDateBetweenAndStatusIn(LocalDate startDate, LocalDate endDate, List<ExtraPayment.PaymentStatus> statuses);
}
