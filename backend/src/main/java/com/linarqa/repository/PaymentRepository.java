package com.linarqa.repository;

import com.linarqa.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByStudentId(UUID studentId);
    List<Payment> findByStudentIdOrderByDueDateDesc(UUID studentId);
    List<Payment> findByStudentIdAndStatus(UUID studentId, Payment.PaymentStatus status);
    List<Payment> findByStatus(Payment.PaymentStatus status);
    List<Payment> findByDueDateBefore(LocalDate date);
    List<Payment> findByDueDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId AND YEAR(p.createdAt) = :year AND MONTH(p.createdAt) = :month")
    List<Payment> findByStudentIdAndYearMonth(@Param("studentId") UUID studentId, @Param("year") int year, @Param("month") int month);
    
    @Query("SELECT p FROM Payment p WHERE p.dueDate < :date AND p.status = 'UNPAID'")
    List<Payment> findOverduePayments(@Param("date") LocalDate date);
    
    List<Payment> findByPaidDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, Payment.PaymentStatus status);
    List<Payment> findByStatusIn(List<Payment.PaymentStatus> statuses);
    List<Payment> findByDueDateBetweenAndStatusIn(LocalDate startDate, LocalDate endDate, List<Payment.PaymentStatus> statuses);
} 