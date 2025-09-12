package com.linarqa.controller;

import com.linarqa.entity.ExtraPayment;
import com.linarqa.service.ExtraPaymentService;
import com.linarqa.service.NotificationService;
import com.linarqa.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/extra-payments")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExtraPaymentController {

    @Autowired
    private ExtraPaymentService extraPaymentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get all extra payments with optional filters
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getExtraPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        try {
            List<ExtraPayment> payments = extraPaymentService.getPayments(status, studentId, courseId, month, year);
            
            List<Map<String, Object>> paymentData = payments.stream().map(payment -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", payment.getId().toString());
                data.put("extraStudentId", payment.getExtraStudent().getId().toString());
                data.put("studentName", payment.getExtraStudent().getFirstName() + " " + payment.getExtraStudent().getLastName());
                data.put("studentNameArabic", payment.getExtraStudent().getFirstNameArabic() + " " + payment.getExtraStudent().getLastNameArabic());
                data.put("studentPhotoUrl", payment.getExtraStudent().getPhotoUrl());
                data.put("courseName", payment.getExtraCourse().getTitle());
                data.put("courseId", payment.getExtraCourse().getId().toString());
                data.put("amount", payment.getAmount());
                data.put("status", payment.getStatus().toString());
                data.put("dueDate", payment.getDueDate());
                data.put("paidDate", payment.getPaidDate());
                data.put("notes", payment.getNotes());
                data.put("createdAt", payment.getCreatedAt());
                data.put("updatedAt", payment.getUpdatedAt());
                return data;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(paymentData);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get payment statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        try {
            ExtraPaymentService.PaymentStatistics statistics = extraPaymentService.getPaymentStatistics(month, year);
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalPayments", statistics.getTotalPayments());
            response.put("paidPayments", statistics.getPaidPayments());
            response.put("unpaidPayments", statistics.getUnpaidPayments());
            response.put("overduePayments", statistics.getOverduePayments());
            response.put("totalAmount", statistics.getTotalAmount());
            response.put("paidAmount", statistics.getPaidAmount());
            response.put("expectedAmount", statistics.getExpectedAmount());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Generate monthly bills for extra courses
     */
    @PostMapping("/generate-monthly")
    public ResponseEntity<Map<String, Object>> generateMonthlyBills() {
        try {
            extraPaymentService.generateMonthlyBills();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Monthly bills generated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Generate monthly bills for a specific month
     */
    @PostMapping("/generate-monthly/{year}/{month}")
    public ResponseEntity<Map<String, Object>> generateMonthlyBillsForMonth(
            @PathVariable int year, @PathVariable int month) {
        try {
            extraPaymentService.generateMonthlyBillsForMonth(year, month);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Monthly bills generated successfully for " + month + "/" + year);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Generate a single bill for a specific student and course
     */
    @PostMapping("/generate-single")
    public ResponseEntity<Map<String, Object>> generateSingleBill(@RequestBody Map<String, Object> request) {
        try {
            UUID studentId = UUID.fromString(request.get("studentId").toString());
            UUID courseId = UUID.fromString(request.get("courseId").toString());
            LocalDate dueDate = LocalDate.parse(request.get("dueDate").toString());
            String notes = (String) request.get("notes");
            
            ExtraPayment payment = extraPaymentService.generateBillForStudentAndCourse(studentId, courseId, dueDate, notes);
            
            // Notify admin users about new extra payment creation
            try {
                securityUtils.getCurrentUserId().ifPresent(userId -> {
                    String studentName = payment.getExtraStudent().getFirstName() + " " + payment.getExtraStudent().getLastName();
                    String studentNameArabic = (payment.getExtraStudent().getFirstNameArabic() != null ? payment.getExtraStudent().getFirstNameArabic() : payment.getExtraStudent().getFirstName()) + 
                                             " " + (payment.getExtraStudent().getLastNameArabic() != null ? payment.getExtraStudent().getLastNameArabic() : payment.getExtraStudent().getLastName());
                    String amount = payment.getAmount().toString();
                    notificationService.notifyExtraPaymentCreated(studentName, studentNameArabic, amount, payment.getId(), userId);
                });
            } catch (Exception e) {
                // Log error but don't fail the request
                System.err.println("Failed to send notification: " + e.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bill generated successfully");
            response.put("paymentId", payment.getId().toString());
            response.put("amount", payment.getAmount());
            response.put("dueDate", payment.getDueDate());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Mark a payment as paid
     */
    @PatchMapping("/{id}/mark-paid")
    public ResponseEntity<Map<String, Object>> markPaymentAsPaid(@PathVariable UUID id) {
        try {
            ExtraPayment payment = extraPaymentService.markPaymentAsPaid(id);
            
            // Notify admin users about extra payment marked as paid
            try {
                securityUtils.getCurrentUserId().ifPresent(userId -> {
                    String studentName = payment.getExtraStudent().getFirstName() + " " + payment.getExtraStudent().getLastName();
                    String studentNameArabic = (payment.getExtraStudent().getFirstNameArabic() != null ? payment.getExtraStudent().getFirstNameArabic() : payment.getExtraStudent().getFirstName()) + 
                                             " " + (payment.getExtraStudent().getLastNameArabic() != null ? payment.getExtraStudent().getLastNameArabic() : payment.getExtraStudent().getLastName());
                    String amount = payment.getAmount().toString();
                    notificationService.notifyExtraPaymentMarkedPaid(studentName, studentNameArabic, amount, payment.getId(), userId);
                });
            } catch (Exception e) {
                // Log error but don't fail the request
                System.err.println("Failed to send extra payment paid notification: " + e.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment marked as paid");
            response.put("paymentId", payment.getId().toString());
            response.put("paidDate", payment.getPaidDate());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get payment history for a specific student
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> getStudentPaymentHistory(@PathVariable String studentId) {
        try {
            UUID studentUuid = UUID.fromString(studentId);
            List<ExtraPayment> payments = extraPaymentService.getPaymentsByStudentId(studentUuid);
            
            List<Map<String, Object>> paymentHistory = payments.stream().map(payment -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", payment.getId().toString());
                data.put("amount", payment.getAmount());
                data.put("dueDate", payment.getDueDate());
                data.put("paidDate", payment.getPaidDate());
                data.put("status", payment.getStatus().toString());
                data.put("paymentType", payment.getExtraCourse().getTitle());
                data.put("description", payment.getNotes());
                data.put("month", payment.getDueDate().getMonthValue());
                data.put("year", payment.getDueDate().getYear());
                return data;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(paymentHistory);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error fetching payment history: " + e.getMessage());
            return ResponseEntity.badRequest().body(List.of(errorResponse));
        }
    }
}
