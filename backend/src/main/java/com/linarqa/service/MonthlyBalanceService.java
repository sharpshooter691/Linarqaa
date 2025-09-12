package com.linarqa.service;

import com.linarqa.entity.Payment;
import com.linarqa.entity.ExtraPayment;
import com.linarqa.entity.Staff;
import com.linarqa.repository.PaymentRepository;
import com.linarqa.repository.ExtraPaymentRepository;
import com.linarqa.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MonthlyBalanceService {

    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ExtraPaymentRepository extraPaymentRepository;
    
    @Autowired
    private StaffRepository staffRepository;

    /**
     * Get monthly balance for a specific month and year
     */
    public Map<String, Object> getMonthlyBalance(int year, int month) {
        Map<String, Object> balance = new HashMap<>();
        
        // Calculate income from kindergarten payments
        BigDecimal kindergartenIncome = calculateKindergartenIncome(year, month);
        
        // Calculate income from extra course payments
        BigDecimal extraCourseIncome = calculateExtraCourseIncome(year, month);
        
        // Calculate total salaries (expenses)
        BigDecimal totalSalaries = calculateTotalSalaries(year, month);
        
        // Calculate net income
        BigDecimal totalIncome = kindergartenIncome.add(extraCourseIncome);
        BigDecimal netIncome = totalIncome.subtract(totalSalaries);
        
        balance.put("year", year);
        balance.put("month", month);
        balance.put("monthName", getMonthName(month));
        balance.put("kindergartenIncome", kindergartenIncome);
        balance.put("extraCourseIncome", extraCourseIncome);
        balance.put("totalIncome", totalIncome);
        balance.put("totalSalaries", totalSalaries);
        balance.put("netIncome", netIncome);
        
        // Add detailed breakdown
        balance.put("kindergartenBreakdown", getKindergartenPaymentBreakdown(year, month));
        balance.put("extraCourseBreakdown", getExtraCoursePaymentBreakdown(year, month));
        balance.put("salaryBreakdown", getSalaryBreakdown(year, month));
        
        // Add provisional income (unpaid bills for the same month)
        balance.put("provisionalIncome", getProvisionalIncome(year, month));
        
        return balance;
    }

    /**
     * Get balance for multiple months (yearly view)
     */
    public Map<String, Object> getYearlyBalance(int year) {
        Map<String, Object> yearlyBalance = new HashMap<>();
        Map<String, Object> monthlyBalances = new HashMap<>();
        
        BigDecimal totalYearlyIncome = BigDecimal.ZERO;
        BigDecimal totalYearlySalaries = BigDecimal.ZERO;
        
        for (int month = 1; month <= 12; month++) {
            Map<String, Object> monthlyBalance = getMonthlyBalance(year, month);
            monthlyBalances.put(String.valueOf(month), monthlyBalance);
            
            totalYearlyIncome = totalYearlyIncome.add((BigDecimal) monthlyBalance.get("totalIncome"));
            totalYearlySalaries = totalYearlySalaries.add((BigDecimal) monthlyBalance.get("totalSalaries"));
        }
        
        yearlyBalance.put("year", year);
        yearlyBalance.put("monthlyBalances", monthlyBalances);
        yearlyBalance.put("totalYearlyIncome", totalYearlyIncome);
        yearlyBalance.put("totalYearlySalaries", totalYearlySalaries);
        yearlyBalance.put("totalYearlyNetIncome", totalYearlyIncome.subtract(totalYearlySalaries));
        
        return yearlyBalance;
    }

    /**
     * Calculate income from kindergarten payments for a specific month
     */
    private BigDecimal calculateKindergartenIncome(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Payment> payments = paymentRepository.findByPaidDateBetweenAndStatus(
            startDate, endDate, Payment.PaymentStatus.PAID);
        
        return payments.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate income from extra course payments for a specific month
     */
    private BigDecimal calculateExtraCourseIncome(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<ExtraPayment> payments = extraPaymentRepository.findByPaidDateBetweenAndStatus(
            startDate, endDate, ExtraPayment.PaymentStatus.PAID);
        
        return payments.stream()
            .map(ExtraPayment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate total salaries for a specific month
     */
    private BigDecimal calculateTotalSalaries(int year, int month) {
        List<Staff> activeStaff = staffRepository.findByActive(true);
        
        return activeStaff.stream()
            .map(Staff::getSalary)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Get detailed breakdown of kindergarten payments
     */
    private Map<String, Object> getKindergartenPaymentBreakdown(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Payment> payments = paymentRepository.findByPaidDateBetweenAndStatus(
            startDate, endDate, Payment.PaymentStatus.PAID);
        
        Map<String, Object> breakdown = new HashMap<>();
        Map<String, BigDecimal> byType = new HashMap<>();
        int totalPayments = payments.size();
        
        for (Payment payment : payments) {
            String type = payment.getType().toString();
            byType.merge(type, payment.getAmount(), BigDecimal::add);
        }
        
        breakdown.put("totalPayments", totalPayments);
        breakdown.put("byType", byType);
        breakdown.put("totalAmount", payments.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        return breakdown;
    }

    /**
     * Get detailed breakdown of extra course payments
     */
    private Map<String, Object> getExtraCoursePaymentBreakdown(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<ExtraPayment> payments = extraPaymentRepository.findByPaidDateBetweenAndStatus(
            startDate, endDate, ExtraPayment.PaymentStatus.PAID);
        
        Map<String, Object> breakdown = new HashMap<>();
        Map<String, BigDecimal> byCourse = new HashMap<>();
        int totalPayments = payments.size();
        
        for (ExtraPayment payment : payments) {
            String courseName = payment.getExtraCourse().getTitle();
            byCourse.merge(courseName, payment.getAmount(), BigDecimal::add);
        }
        
        breakdown.put("totalPayments", totalPayments);
        breakdown.put("byCourse", byCourse);
        breakdown.put("totalAmount", payments.stream()
            .map(ExtraPayment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        return breakdown;
    }

    /**
     * Get detailed breakdown of salaries
     */
    private Map<String, Object> getSalaryBreakdown(int year, int month) {
        List<Staff> activeStaff = staffRepository.findByActive(true);
        
        Map<String, Object> breakdown = new HashMap<>();
        Map<String, BigDecimal> byType = new HashMap<>();
        Map<String, Integer> staffCount = new HashMap<>();
        
        for (Staff staff : activeStaff) {
            String type = staff.getType().toString();
            byType.merge(type, staff.getSalary(), BigDecimal::add);
            staffCount.merge(type, 1, Integer::sum);
        }
        
        breakdown.put("totalStaff", activeStaff.size());
        breakdown.put("byType", byType);
        breakdown.put("staffCount", staffCount);
        breakdown.put("totalAmount", activeStaff.stream()
            .map(Staff::getSalary)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        return breakdown;
    }

    /**
     * Get provisional income (unpaid bills for the same month)
     */
    private Map<String, Object> getProvisionalIncome(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // Get unpaid kindergarten payments for the month
        List<Payment> kindergartenUnpaid = paymentRepository.findByDueDateBetweenAndStatusIn(
            startDate, endDate, List.of(Payment.PaymentStatus.UNPAID, Payment.PaymentStatus.PARTIAL, Payment.PaymentStatus.OVERDUE));
        
        // Get unpaid extra course payments for the month
        List<ExtraPayment> extraCourseUnpaid = extraPaymentRepository.findByDueDateBetweenAndStatusIn(
            startDate, endDate, List.of(ExtraPayment.PaymentStatus.UNPAID, ExtraPayment.PaymentStatus.PARTIAL, ExtraPayment.PaymentStatus.OVERDUE));
        
        BigDecimal kindergartenUnpaidAmount = kindergartenUnpaid.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal extraCourseUnpaidAmount = extraCourseUnpaid.stream()
            .map(ExtraPayment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, Object> provisional = new HashMap<>();
        provisional.put("kindergartenUnpaid", kindergartenUnpaidAmount);
        provisional.put("extraCourseUnpaid", extraCourseUnpaidAmount);
        provisional.put("totalUnpaid", kindergartenUnpaidAmount.add(extraCourseUnpaidAmount));
        provisional.put("kindergartenUnpaidCount", kindergartenUnpaid.size());
        provisional.put("extraCourseUnpaidCount", extraCourseUnpaid.size());
        
        return provisional;
    }

    /**
     * Get month name from month number
     */
    private String getMonthName(int month) {
        String[] monthNames = {
            "", "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        };
        return monthNames[month];
    }

    /**
     * Get income summary for dashboard
     */
    public Map<String, Object> getCurrentMonthSummary() {
        LocalDate now = LocalDate.now();
        return getMonthlyBalance(now.getYear(), now.getMonthValue());
    }

    /**
     * Get pending payments (unpaid/partial)
     */
    public Map<String, Object> getPendingPayments() {
        Map<String, Object> pending = new HashMap<>();
        
        // Kindergarten pending payments
        List<Payment> kindergartenPending = paymentRepository.findByStatusIn(
            List.of(Payment.PaymentStatus.UNPAID, Payment.PaymentStatus.PARTIAL, Payment.PaymentStatus.OVERDUE));
        
        // Extra course pending payments
        List<ExtraPayment> extraCoursePending = extraPaymentRepository.findByStatusIn(
            List.of(ExtraPayment.PaymentStatus.UNPAID, ExtraPayment.PaymentStatus.PARTIAL, ExtraPayment.PaymentStatus.OVERDUE));
        
        BigDecimal kindergartenPendingAmount = kindergartenPending.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal extraCoursePendingAmount = extraCoursePending.stream()
            .map(ExtraPayment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        pending.put("kindergartenPending", kindergartenPendingAmount);
        pending.put("extraCoursePending", extraCoursePendingAmount);
        pending.put("totalPending", kindergartenPendingAmount.add(extraCoursePendingAmount));
        pending.put("kindergartenCount", kindergartenPending.size());
        pending.put("extraCourseCount", extraCoursePending.size());
        
        return pending;
    }
}
