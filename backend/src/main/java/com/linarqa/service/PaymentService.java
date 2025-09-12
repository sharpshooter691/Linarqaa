package com.linarqa.service;

import com.linarqa.entity.Payment;
import com.linarqa.entity.Student;
import com.linarqa.repository.PaymentRepository;
import com.linarqa.repository.StudentRepository;
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
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StudentRepository studentRepository;

    private static final BigDecimal MONTHLY_TUITION_AMOUNT = new BigDecimal("300.00");

    /**
     * Generate monthly bills for all active students
     * This method is scheduled to run on the first day of each month at 1:00 AM
     */
    @Scheduled(cron = "0 0 1 1 * ?") // First day of each month at 1:00 AM
    @Transactional
    public void generateMonthlyBills() {
        LocalDate currentDate = LocalDate.now();
        LocalDate dueDate = LocalDate.of(currentDate.getYear(), currentDate.getMonthValue(), 1); // Due date is 1st of the month
        
        List<Student> activeStudents = studentRepository.findByStatus(Student.StudentStatus.ACTIVE);
        
        for (Student student : activeStudents) {
            // Check if a bill for this month already exists
            if (!hasBillForMonth(student.getId(), currentDate.getYear(), currentDate.getMonthValue())) {
                Payment monthlyBill = Payment.builder()
                    .student(student)
                    .type(Payment.PaymentType.TUITION)
                    .amount(MONTHLY_TUITION_AMOUNT)
                    .status(Payment.PaymentStatus.UNPAID)
                    .dueDate(dueDate)
                    .notes("Monthly tuition fee for " + currentDate.getMonth() + " " + currentDate.getYear())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
                
                paymentRepository.save(monthlyBill);
            }
        }
    }

    /**
     * Manually generate monthly bills for a specific month
     */
    @Transactional
    public void generateMonthlyBillsForMonth(int year, int month) {
        LocalDate billDate = LocalDate.of(year, month, 1);
        LocalDate dueDate = LocalDate.of(year, month, 1); // Due date is 1st of the month
        
        List<Student> activeStudents = studentRepository.findByStatus(Student.StudentStatus.ACTIVE);
        
        for (Student student : activeStudents) {
            // Check if a bill for this month already exists
            if (!hasBillForMonth(student.getId(), year, month)) {
                Payment monthlyBill = Payment.builder()
                    .student(student)
                    .type(Payment.PaymentType.TUITION)
                    .amount(MONTHLY_TUITION_AMOUNT)
                    .status(Payment.PaymentStatus.UNPAID)
                    .dueDate(dueDate)
                    .notes("Monthly tuition fee for " + billDate.getMonth() + " " + year)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
                
                paymentRepository.save(monthlyBill);
            }
        }
    }

    /**
     * Generate a single bill for a specific student
     */
    @Transactional
    public Payment generateBillForStudent(UUID studentId, LocalDate dueDate, String notes) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Payment bill = Payment.builder()
            .student(student)
            .type(Payment.PaymentType.TUITION)
            .amount(MONTHLY_TUITION_AMOUNT)
            .status(Payment.PaymentStatus.UNPAID)
            .dueDate(dueDate)
            .notes(notes != null ? notes : "Monthly tuition fee")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        return paymentRepository.save(bill);
    }

    /**
     * Mark a payment as paid
     */
    @Transactional
    public Payment markPaymentAsPaid(UUID paymentId, LocalDate paidDate, String notes) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidDate(paidDate != null ? paidDate : LocalDate.now());
        if (notes != null) {
            payment.setNotes(notes);
        }
        payment.setUpdatedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }

    /**
     * Mark a payment as partially paid
     */
    @Transactional
    public Payment markPaymentAsPartial(UUID paymentId, BigDecimal partialAmount, String notes) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        payment.setStatus(Payment.PaymentStatus.PARTIAL);
        payment.setAmount(partialAmount);
        if (notes != null) {
            payment.setNotes(notes);
        }
        payment.setUpdatedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }

    /**
     * Get all payments for a student
     */
    public List<Payment> getPaymentsByStudent(UUID studentId) {
        return paymentRepository.findByStudentId(studentId);
    }

    /**
     * Get all unpaid payments
     */
    public List<Payment> getUnpaidPayments() {
        return paymentRepository.findByStatus(Payment.PaymentStatus.UNPAID);
    }

    /**
     * Get overdue payments
     */
    public List<Payment> getOverduePayments() {
        List<Payment> unpaidPayments = paymentRepository.findByStatus(Payment.PaymentStatus.UNPAID);
        return unpaidPayments.stream()
            .filter(payment -> payment.getDueDate() != null && payment.getDueDate().isBefore(LocalDate.now()))
            .toList();
    }

    /**
     * Update overdue payment statuses
     */
    @Scheduled(cron = "0 0 6 * * ?") // Daily at 6:00 AM
    @Transactional
    public void updateOverduePayments() {
        List<Payment> overduePayments = getOverduePayments();
        
        for (Payment payment : overduePayments) {
            payment.setStatus(Payment.PaymentStatus.OVERDUE);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }
    }

    /**
     * Check if a student already has a bill for a specific month
     */
    private boolean hasBillForMonth(UUID studentId, int year, int month) {
        List<Payment> studentPayments = paymentRepository.findByStudentId(studentId);
        
        return studentPayments.stream()
            .anyMatch(payment -> {
                LocalDate paymentDate = payment.getCreatedAt().toLocalDate();
                return paymentDate.getYear() == year && 
                       paymentDate.getMonthValue() == month && 
                       payment.getType() == Payment.PaymentType.TUITION;
            });
    }

    /**
     * Get payment statistics with optional filters
     */
    public PaymentStatistics getPaymentStatistics(String month, String year) {
        List<Payment> allPayments = paymentRepository.findAll();
        
        // Apply month/year filter if provided
        if (month != null && year != null) {
            int monthInt = Integer.parseInt(month);
            int yearInt = Integer.parseInt(year);
            allPayments = allPayments.stream()
                .filter(payment -> {
                    LocalDate paymentDate = payment.getCreatedAt().toLocalDate();
                    return paymentDate.getMonthValue() == monthInt && paymentDate.getYear() == yearInt;
                })
                .toList();
        }
        
        long totalPayments = allPayments.size();
        long paidPayments = allPayments.stream()
            .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID)
            .count();
        long unpaidPayments = allPayments.stream()
            .filter(p -> p.getStatus() == Payment.PaymentStatus.UNPAID)
            .count();
        long overduePayments = allPayments.stream()
            .filter(p -> p.getStatus() == Payment.PaymentStatus.OVERDUE)
            .count();
        
        BigDecimal totalAmount = allPayments.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal paidAmount = allPayments.stream()
            .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID)
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate expected amount (all payments)
        BigDecimal expectedAmount = totalAmount;
        
        return new PaymentStatistics(
            totalPayments,
            paidPayments,
            unpaidPayments,
            overduePayments,
            totalAmount,
            paidAmount,
            expectedAmount
        );
    }

    /**
     * Get payment statistics (overloaded for backward compatibility)
     */
    public PaymentStatistics getPaymentStatistics() {
        return getPaymentStatistics(null, null);
    }

    public static class PaymentStatistics {
        private final long totalPayments;
        private final long paidPayments;
        private final long unpaidPayments;
        private final long overduePayments;
        private final BigDecimal totalAmount;
        private final BigDecimal paidAmount;
        private final BigDecimal expectedAmount;

        public PaymentStatistics(long totalPayments, long paidPayments, long unpaidPayments, 
                               long overduePayments, BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal expectedAmount) {
            this.totalPayments = totalPayments;
            this.paidPayments = paidPayments;
            this.unpaidPayments = unpaidPayments;
            this.overduePayments = overduePayments;
            this.totalAmount = totalAmount;
            this.paidAmount = paidAmount;
            this.expectedAmount = expectedAmount;
        }

        // Getters
        public long getTotalPayments() { return totalPayments; }
        public long getPaidPayments() { return paidPayments; }
        public long getUnpaidPayments() { return unpaidPayments; }
        public long getOverduePayments() { return overduePayments; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public BigDecimal getPaidAmount() { return paidAmount; }
        public BigDecimal getExpectedAmount() { return expectedAmount; }
        public BigDecimal getUnpaidAmount() { return expectedAmount.subtract(paidAmount); }
    }
}
