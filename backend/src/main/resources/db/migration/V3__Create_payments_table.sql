-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Add comments for documentation
COMMENT ON TABLE payments IS 'Stores payment records for students';
COMMENT ON COLUMN payments.type IS 'Type of payment: TUITION, EXTRA_COURSE, MATERIALS, OTHER';
COMMENT ON COLUMN payments.status IS 'Payment status: UNPAID, PARTIAL, PAID, OVERDUE';
COMMENT ON COLUMN payments.amount IS 'Payment amount in decimal format';
COMMENT ON COLUMN payments.due_date IS 'Due date for the payment';
COMMENT ON COLUMN payments.paid_date IS 'Date when payment was made';
