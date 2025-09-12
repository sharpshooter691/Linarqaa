package com.linarqa.service;

import com.linarqa.entity.*;
import com.linarqa.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ExtraPaymentService {

    @Autowired
    private ExtraPaymentRepository extraPaymentRepository;

    @Autowired
    private ExtraStudentEnrollmentRepository enrollmentRepository;

    @Autowired
    private ExtraStudentRepository extraStudentRepository;

    @Autowired
    private ExtraCourseRepository extraCourseRepository;

    /**
     * Generate monthly bills for all active extra course enrollments
     * This method is scheduled to run on the first day of each month at 1:00 AM
     */
    @Scheduled(cron = "0 0 1 1 * ?") // First day of each month at 1:00 AM
    @Transactional
    public void generateMonthlyBills() {
        LocalDate currentDate = LocalDate.now();
        generateMonthlyBillsForMonth(currentDate.getYear(), currentDate.getMonthValue());
    }

    /**
     * Manually generate monthly bills for a specific month
     */
    @Transactional
    public void generateMonthlyBillsForMonth(int year, int month) {
        LocalDate billDate = LocalDate.of(year, month, 1);
        LocalDate dueDate = LocalDate.of(year, month, 1); // Due date is 1st of the month
        
        // Get all active enrollments
        List<ExtraStudentEnrollment> activeEnrollments = enrollmentRepository.findByStatus(ExtraStudentEnrollment.EnrollmentStatus.ACTIVE);
        
        for (ExtraStudentEnrollment enrollment : activeEnrollments) {
            // Check if a bill for this month already exists
            if (!hasBillForMonth(enrollment.getExtraStudent().getId(), enrollment.getCourse().getId(), year, month)) {
                ExtraPayment monthlyBill = ExtraPayment.builder()
                    .extraStudent(enrollment.getExtraStudent())
                    .extraCourse(enrollment.getCourse())
                    .amount(enrollment.getCourse().getMonthlyPrice())
                    .status(ExtraPayment.PaymentStatus.UNPAID)
                    .dueDate(dueDate)
                    .notes("Monthly fee for " + enrollment.getCourse().getTitle() + " - " + billDate.getMonth() + " " + year)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
                
                extraPaymentRepository.save(monthlyBill);
            }
        }
    }

    /**
     * Check if a bill already exists for a student and course for a specific month
     */
    private boolean hasBillForMonth(UUID studentId, UUID courseId, int year, int month) {
        List<ExtraPayment> existingBills = extraPaymentRepository.findByStudentAndCourseAndMonth(studentId, courseId, year, month);
        return !existingBills.isEmpty();
    }

    /**
     * Generate a single bill for a specific student and course
     */
    @Transactional
    public ExtraPayment generateBillForStudentAndCourse(UUID studentId, UUID courseId, LocalDate dueDate, String notes) {
        ExtraStudent student = extraStudentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Extra student not found"));
        
        ExtraCourse course = extraCourseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Extra course not found"));
        
        ExtraPayment bill = ExtraPayment.builder()
            .extraStudent(student)
            .extraCourse(course)
            .amount(course.getMonthlyPrice())
            .status(ExtraPayment.PaymentStatus.UNPAID)
            .dueDate(dueDate)
            .notes(notes != null ? notes : "Monthly fee for " + course.getTitle())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        return extraPaymentRepository.save(bill);
    }

    /**
     * Mark a payment as paid
     */
    @Transactional
    public ExtraPayment markPaymentAsPaid(UUID paymentId) {
        ExtraPayment payment = extraPaymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        payment.setStatus(ExtraPayment.PaymentStatus.PAID);
        payment.setPaidDate(LocalDate.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        return extraPaymentRepository.save(payment);
    }

    /**
     * Get all payments with optional filters
     */
    public List<ExtraPayment> getPayments(String status, String studentId, String courseId, Integer month, Integer year) {
        if (status != null && !status.isEmpty()) {
            return extraPaymentRepository.findByStatus(ExtraPayment.PaymentStatus.valueOf(status));
        }
        
        if (month != null && year != null) {
            return extraPaymentRepository.findByMonth(year, month);
        }
        
        return extraPaymentRepository.findAll();
    }

    /**
     * Get payments by student ID
     */
    public List<ExtraPayment> getPaymentsByStudentId(UUID studentId) {
        return extraPaymentRepository.findByExtraStudentIdOrderByDueDateDesc(studentId);
    }

    /**
     * Get payment statistics
     */
    public PaymentStatistics getPaymentStatistics(Integer month, Integer year) {
        List<ExtraPayment> payments;
        
        if (month != null && year != null) {
            payments = extraPaymentRepository.findByMonth(year, month);
        } else {
            payments = extraPaymentRepository.findAll();
        }
        
        int totalPayments = payments.size();
        int paidPayments = (int) payments.stream().filter(p -> p.getStatus() == ExtraPayment.PaymentStatus.PAID).count();
        int unpaidPayments = (int) payments.stream().filter(p -> p.getStatus() == ExtraPayment.PaymentStatus.UNPAID).count();
        int overduePayments = (int) payments.stream().filter(p -> p.getStatus() == ExtraPayment.PaymentStatus.OVERDUE).count();
        
        BigDecimal totalAmount = payments.stream()
            .map(ExtraPayment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal paidAmount = payments.stream()
            .filter(p -> p.getStatus() == ExtraPayment.PaymentStatus.PAID)
            .map(ExtraPayment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new PaymentStatistics(
            totalPayments,
            paidPayments,
            unpaidPayments,
            overduePayments,
            totalAmount,
            paidAmount,
            totalAmount
        );
    }

    /**
     * Update overdue payments status
     */
    @Scheduled(cron = "0 0 0 * * ?") // Run daily at midnight
    @Transactional
    public void updateOverduePayments() {
        LocalDate currentDate = LocalDate.now();
        List<ExtraPayment> overduePayments = extraPaymentRepository.findOverduePayments(currentDate);
        
        for (ExtraPayment payment : overduePayments) {
            if (payment.getStatus() == ExtraPayment.PaymentStatus.UNPAID || 
                payment.getStatus() == ExtraPayment.PaymentStatus.PARTIAL) {
                payment.setStatus(ExtraPayment.PaymentStatus.OVERDUE);
                payment.setUpdatedAt(LocalDateTime.now());
                extraPaymentRepository.save(payment);
            }
        }
    }

    public static class PaymentStatistics {
        private final int totalPayments;
        private final int paidPayments;
        private final int unpaidPayments;
        private final int overduePayments;
        private final BigDecimal totalAmount;
        private final BigDecimal paidAmount;
        private final BigDecimal expectedAmount;

        public PaymentStatistics(int totalPayments, int paidPayments, int unpaidPayments, int overduePayments,
                               BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal expectedAmount) {
            this.totalPayments = totalPayments;
            this.paidPayments = paidPayments;
            this.unpaidPayments = unpaidPayments;
            this.overduePayments = overduePayments;
            this.totalAmount = totalAmount;
            this.paidAmount = paidAmount;
            this.expectedAmount = expectedAmount;
        }

        // Getters
        public int getTotalPayments() { return totalPayments; }
        public int getPaidPayments() { return paidPayments; }
        public int getUnpaidPayments() { return unpaidPayments; }
        public int getOverduePayments() { return overduePayments; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public BigDecimal getPaidAmount() { return paidAmount; }
        public BigDecimal getExpectedAmount() { return expectedAmount; }
    }
}
