package com.linarqa.controller;

import com.linarqa.service.MonthlyBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/monthly-balance")
@CrossOrigin(origins = "*")
public class MonthlyBalanceController {

    @Autowired
    private MonthlyBalanceService monthlyBalanceService;

    /**
     * Get monthly balance for a specific month and year
     */
    @GetMapping("/{year}/{month}")
    public ResponseEntity<Map<String, Object>> getMonthlyBalance(
            @PathVariable int year,
            @PathVariable int month) {
        try {
            Map<String, Object> balance = monthlyBalanceService.getMonthlyBalance(year, month);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get yearly balance for a specific year
     */
    @GetMapping("/year/{year}")
    public ResponseEntity<Map<String, Object>> getYearlyBalance(@PathVariable int year) {
        try {
            Map<String, Object> balance = monthlyBalanceService.getYearlyBalance(year);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get current month summary
     */
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentMonthSummary() {
        try {
            Map<String, Object> summary = monthlyBalanceService.getCurrentMonthSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get pending payments
     */
    @GetMapping("/pending")
    public ResponseEntity<Map<String, Object>> getPendingPayments() {
        try {
            Map<String, Object> pending = monthlyBalanceService.getPendingPayments();
            return ResponseEntity.ok(pending);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get monthly balance with query parameters
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMonthlyBalanceWithParams(
            @RequestParam(defaultValue = "2024") int year,
            @RequestParam(defaultValue = "1") int month) {
        try {
            Map<String, Object> balance = monthlyBalanceService.getMonthlyBalance(year, month);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
