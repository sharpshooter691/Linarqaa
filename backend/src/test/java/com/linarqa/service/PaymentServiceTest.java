package com.linarqa.service;

import com.linarqa.LinarqaApplication;
import com.linarqa.entity.Payment;
import com.linarqa.entity.Student;
import com.linarqa.repository.PaymentRepository;
import com.linarqa.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = LinarqaApplication.class)
@ActiveProfiles("test")
public class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Test
    @Transactional
    public void testGenerateMonthlyBills() {
        // Create a test student
        Student student = Student.builder()
            .firstName("Test")
            .lastName("Student")
            .firstNameArabic("طالب")
            .lastNameArabic("اختبار")
            .birthDate(LocalDate.of(2010, 1, 1))
            .studentType(Student.StudentType.EXTRA_COURSE)
            .guardianName("Test Guardian")
            .guardianNameArabic("ولي اختبار")
            .guardianPhone("123456789")
            .address("Test Address")
            .addressArabic("عنوان اختبار")
            .status(Student.StudentStatus.ACTIVE)
            .build();
        
        Student savedStudent = studentRepository.save(student);
        
        // Generate monthly bills for current month
        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();
        
        paymentService.generateMonthlyBillsForMonth(currentYear, currentMonth);
        
        // Verify that a payment was created
        List<Payment> payments = paymentService.getPaymentsByStudent(savedStudent.getId());
        assertFalse(payments.isEmpty());
        
        Payment payment = payments.get(0);
        assertEquals(Payment.PaymentType.TUITION, payment.getType());
        assertEquals(new BigDecimal("300.00"), payment.getAmount());
        assertEquals(Payment.PaymentStatus.UNPAID, payment.getStatus());
        assertNotNull(payment.getDueDate());
        
        // Test marking payment as paid
        Payment paidPayment = paymentService.markPaymentAsPaid(payment.getId(), LocalDate.now(), "Test payment");
        assertEquals(Payment.PaymentStatus.PAID, paidPayment.getStatus());
        assertNotNull(paidPayment.getPaidDate());
    }

    @Test
    @Transactional
    public void testPaymentStatistics() {
        // Create test payments
        Student student = Student.builder()
            .firstName("Stats")
            .lastName("Test")
            .birthDate(LocalDate.of(2010, 1, 1))  // Added missing birthDate
            .studentType(Student.StudentType.EXTRA_COURSE)
            .guardianName("Test Guardian")
            .guardianPhone("123456789")
            .status(Student.StudentStatus.ACTIVE)
            .build();
        
        Student savedStudent = studentRepository.save(student);
        
        // Create some test payments
        Payment unpaidPayment = Payment.builder()
            .student(savedStudent)
            .type(Payment.PaymentType.TUITION)
            .amount(new BigDecimal("300.00"))
            .status(Payment.PaymentStatus.UNPAID)
            .dueDate(LocalDate.now().plusDays(15))
            .build();
        paymentRepository.save(unpaidPayment);
        
        Payment paidPayment = Payment.builder()
            .student(savedStudent)
            .type(Payment.PaymentType.TUITION)
            .amount(new BigDecimal("300.00"))
            .status(Payment.PaymentStatus.PAID)
            .paidDate(LocalDate.now())
            .build();
        paymentRepository.save(paidPayment);
        
        // Get statistics
        PaymentService.PaymentStatistics stats = paymentService.getPaymentStatistics();
        
        assertEquals(2, stats.getTotalPayments());
        assertEquals(1, stats.getPaidPayments());
        assertEquals(1, stats.getUnpaidPayments());
        assertEquals(new BigDecimal("600.00"), stats.getTotalAmount());
        assertEquals(new BigDecimal("300.00"), stats.getPaidAmount());
        assertEquals(new BigDecimal("300.00"), stats.getUnpaidAmount());
    }
}
