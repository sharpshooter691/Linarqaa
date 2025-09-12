# Payment System Documentation

## Overview

The Linarqaa payment system automatically generates monthly tuition bills for all active students with a fixed amount of 300.00 per month. The system includes automatic scheduling, payment tracking, and comprehensive reporting features.

## Features

### Automatic Monthly Billing
- **Scheduled Generation**: Bills are automatically generated on the first day of each month at 1:00 AM
- **Fixed Amount**: Each student receives a monthly bill of 300.00
- **Due Date**: Bills are due 15 days after generation
- **Duplicate Prevention**: System prevents duplicate bills for the same month

### Payment Status Tracking
- **UNPAID**: Initial status for new bills
- **PAID**: Payment has been completed
- **PARTIAL**: Partial payment received
- **OVERDUE**: Payment is past due date

### Automatic Overdue Management
- **Daily Check**: System checks for overdue payments daily at 6:00 AM
- **Status Update**: Automatically marks payments as OVERDUE when past due date

## API Endpoints

### Get All Payments
```
GET /api/payments
```
**Query Parameters:**
- `studentId` (optional): Filter by specific student
- `status` (optional): Filter by payment status (UNPAID, PAID, PARTIAL, OVERDUE)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering

### Generate Monthly Bills
```
POST /api/payments/generate-monthly
```
**Query Parameters:**
- `year` (optional): Specific year for bill generation
- `month` (optional): Specific month for bill generation

### Generate Single Bill
```
POST /api/payments/generate-single
```
**Request Body:**
```json
{
  "studentId": "uuid",
  "dueDate": "2024-01-15",
  "notes": "Optional notes"
}
```

### Mark Payment as Paid
```
PATCH /api/payments/{id}/mark-paid
```
**Request Body (optional):**
```json
{
  "paidDate": "2024-01-10",
  "notes": "Payment received via cash"
}
```

### Mark Payment as Partial
```
PATCH /api/payments/{id}/mark-partial
```
**Request Body:**
```json
{
  "partialAmount": 150.00,
  "notes": "Partial payment received"
}
```

### Get Payment Statistics
```
GET /api/payments/statistics
```
Returns comprehensive payment statistics including:
- Total payments count
- Paid payments count
- Unpaid payments count
- Overdue payments count
- Total amount
- Paid amount
- Unpaid amount

### Get Overdue Payments
```
GET /api/payments/overdue
```
Returns all payments that are past their due date.

## Database Schema

### Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

## Configuration

### Scheduling Configuration
The system uses Spring's `@Scheduled` annotation with cron expressions:

- **Monthly Bill Generation**: `0 0 1 1 * ?` (First day of each month at 1:00 AM)
- **Overdue Check**: `0 0 6 * * ?` (Daily at 6:00 AM)

### Amount Configuration
The monthly tuition amount is configured in `PaymentService.java`:
```java
private static final BigDecimal MONTHLY_TUITION_AMOUNT = new BigDecimal("300.00");
```

## Usage Examples

### Generate Bills for Current Month
```bash
curl -X POST "http://localhost:8080/api/payments/generate-monthly"
```

### Generate Bills for Specific Month
```bash
curl -X POST "http://localhost:8080/api/payments/generate-monthly?year=2024&month=1"
```

### Get All Unpaid Payments
```bash
curl "http://localhost:8080/api/payments?status=UNPAID"
```

### Mark Payment as Paid
```bash
curl -X PATCH "http://localhost:8080/api/payments/{payment-id}/mark-paid" \
  -H "Content-Type: application/json" \
  -d '{"paidDate": "2024-01-10", "notes": "Cash payment"}'
```

### Get Payment Statistics
```bash
curl "http://localhost:8080/api/payments/statistics"
```

## Testing

The system includes comprehensive tests in `PaymentServiceTest.java` that verify:
- Monthly bill generation
- Payment status updates
- Statistics calculation
- Duplicate prevention

Run tests with:
```bash
./mvnw test -Dtest=PaymentServiceTest
```

## Monitoring and Maintenance

### Regular Tasks
1. **Monitor Overdue Payments**: Check `/api/payments/overdue` regularly
2. **Review Statistics**: Use `/api/payments/statistics` for financial overview
3. **Verify Automatic Generation**: Ensure monthly bills are generated correctly

### Troubleshooting
- **Missing Bills**: Check if students have ACTIVE status
- **Duplicate Bills**: System prevents duplicates automatically
- **Scheduling Issues**: Verify `@EnableScheduling` is enabled in main application

## Security Considerations

- All payment operations are transactional
- Payment amounts are validated
- Student existence is verified before bill generation
- Audit trails are maintained with created_at and updated_at timestamps
