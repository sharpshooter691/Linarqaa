-- Create notifications table
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_arabic VARCHAR(255),
    message TEXT NOT NULL,
    message_arabic TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNREAD',
    created_by_user_id CHAR(36),
    target_user_id CHAR(36),
    related_entity_type VARCHAR(50),
    related_entity_id CHAR(36),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notifications_created_by 
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_notifications_target_user 
        FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_notification_type 
        CHECK (type IN ('STUDENT_REGISTERED', 'EXTRA_STUDENT_REGISTERED', 'PAYMENT_CREATED', 'EXTRA_PAYMENT_CREATED', 'PAYMENT_MARKED_PAID', 'EXTRA_PAYMENT_MARKED_PAID', 'SYSTEM_ALERT', 'GENERAL')),
    CONSTRAINT chk_notification_status 
        CHECK (status IN ('UNREAD', 'READ', 'ARCHIVED'))
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_target_user ON notifications(target_user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);
