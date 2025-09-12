-- Create extra_payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS extra_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extra_student_id UUID NOT NULL,
    extra_course_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (extra_student_id) REFERENCES extra_students(id) ON DELETE CASCADE,
    FOREIGN KEY (extra_course_id) REFERENCES extra_courses(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_extra_payments_student_id ON extra_payments(extra_student_id);
CREATE INDEX IF NOT EXISTS idx_extra_payments_course_id ON extra_payments(extra_course_id);
CREATE INDEX IF NOT EXISTS idx_extra_payments_status ON extra_payments(status);
CREATE INDEX IF NOT EXISTS idx_extra_payments_due_date ON extra_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_extra_payments_created_at ON extra_payments(created_at);

-- Add comments for documentation
COMMENT ON TABLE extra_payments IS 'Stores payment records for extra course students';
COMMENT ON COLUMN extra_payments.status IS 'Payment status: UNPAID, PARTIAL, PAID, OVERDUE';
COMMENT ON COLUMN extra_payments.amount IS 'Payment amount in decimal format';
COMMENT ON COLUMN extra_payments.due_date IS 'Due date for the payment';
COMMENT ON COLUMN extra_payments.paid_date IS 'Date when payment was made';
