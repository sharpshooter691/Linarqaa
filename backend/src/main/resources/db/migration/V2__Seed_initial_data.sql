-- Seed initial data for Linarqa School Management System
-- Includes sample users, students, courses, and other entities

-- Insert sample users (password hash is BCrypt hash of 'admin123' and 'staff123')
INSERT INTO users (id, email, password_hash, full_name, full_name_arabic, phone, role, language_preference, active) VALUES
-- Owner account
('550e8400-e29b-41d4-a716-446655440001', 'admin@linarqa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Administrateur Principal', 'المدير الرئيسي', '+212-6-12345678', 'OWNER', 'FR', true),

-- Staff accounts
('550e8400-e29b-41d4-a716-446655440002', 'staff1@linarqa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Fatima Alami', 'فاطمة العلامي', '+212-6-23456789', 'STAFF', 'FR', true),
('550e8400-e29b-41d4-a716-446655440003', 'staff2@linarqa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Ahmed Benjelloun', 'أحمد بنجلون', '+212-6-34567890', 'STAFF', 'AR', true);

-- Insert sample students with Arabic names
INSERT INTO students (id, first_name, last_name, first_name_arabic, last_name_arabic, birth_date, level, classroom, guardian_name, guardian_name_arabic, guardian_phone, address, address_arabic, allergies, notes, status) VALUES
-- Petite Section (3-4 years)
('550e8400-e29b-41d4-a716-446655440101', 'Layla', 'Bennani', 'ليلى', 'بناني', '2020-03-15', 'PETITE', 'Petite A', 'Karim Bennani', 'كريم بناني', '+212-6-11111111', '123 Rue Hassan II, Casablanca', '123 شارع الحسن الثاني، الدار البيضاء', 'None', 'Enjoys drawing and music', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440102', 'Youssef', 'Alaoui', 'يوسف', 'العلوي', '2020-07-22', 'PETITE', 'Petite A', 'Amina Alaoui', 'أمينة العلوي', '+212-6-22222222', '456 Avenue Mohammed V, Rabat', '456 شارع محمد الخامس، الرباط', 'Peanuts', 'Very active child', 'ACTIVE'),

-- Moyenne Section (4-5 years)
('550e8400-e29b-41d4-a716-446655440103', 'Amina', 'Chraibi', 'أمينة', 'شرايبي', '2019-11-08', 'MOYENNE', 'Moyenne B', 'Hassan Chraibi', 'حسن شرايبي', '+212-6-33333333', '789 Boulevard Al Massira, Marrakech', '789 شارع المسيرة، مراكش', 'None', 'Excellent in mathematics', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440104', 'Omar', 'Tazi', 'عمر', 'التازي', '2019-05-14', 'MOYENNE', 'Moyenne B', 'Fatima Tazi', 'فاطمة التازي', '+212-6-44444444', '321 Rue Ibn Batouta, Tangier', '321 شارع ابن بطوطة، طنجة', 'Dairy', 'Loves reading stories', 'ACTIVE'),

-- Grande Section (5-6 years)
('550e8400-e29b-41d4-a716-446655440105', 'Zineb', 'El Fassi', 'زينب', 'الفقاسي', '2018-09-30', 'GRANDE', 'Grande C', 'Mohammed El Fassi', 'محمد الفقاسي', '+212-6-55555555', '654 Avenue Ibn Khaldoun, Fez', '654 شارع ابن خلدون، فاس', 'None', 'Ready for primary school', 'ACTIVE'),
('550e8400-e29b-41d4-a716-446655440106', 'Adam', 'Bouabid', 'آدم', 'بوعبيد', '2018-12-03', 'GRANDE', 'Grande C', 'Nadia Bouabid', 'نادية بوعبيد', '+212-6-66666666', '987 Rue Al Andalus, Agadir', '987 شارع الأندلس، أكادير', 'Shellfish', 'Natural leader in class', 'ACTIVE');

-- Insert extra courses
INSERT INTO extra_courses (id, title, title_arabic, description, description_arabic, monthly_price, schedule_json, capacity, active) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'Art Club', 'نادي الفن', 'Creative arts and crafts for children', 'الفنون الإبداعية والحرف اليدوية للأطفال', 300.00, '{"days": ["MONDAY", "WEDNESDAY"], "startTime": "16:00", "endTime": "17:30"}', 15, true),
('550e8400-e29b-41d4-a716-446655440202', 'Coding Kids', 'برمجة الأطفال', 'Introduction to basic programming concepts', 'مقدمة في مفاهيم البرمجة الأساسية', 400.00, '{"days": ["TUESDAY", "THURSDAY"], "startTime": "16:00", "endTime": "17:00"}', 12, true);

-- Insert extra course enrollments
INSERT INTO extra_enrollments (id, course_id, person_type, student_id, external_name, external_name_arabic, external_phone, start_month, active) VALUES
-- Student enrollments
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', 'STUDENT', '550e8400-e29b-41d4-a716-446655440101', NULL, NULL, NULL, '2024-01', true),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440201', 'STUDENT', '550e8400-e29b-41d4-a716-446655440103', NULL, NULL, NULL, '2024-01', true),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440202', 'STUDENT', '550e8400-e29b-41d4-a716-446655440105', NULL, NULL, NULL, '2024-01', true),
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440202', 'STUDENT', '550e8400-e29b-41d4-a716-446655440106', NULL, NULL, NULL, '2024-01', true),

-- External enrollments
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440201', 'EXTERNAL', NULL, 'Sara Benjelloun', 'سارة بنجلون', '+212-6-77777777', '2024-01', true),
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440202', 'EXTERNAL', NULL, 'Khalid Alami', 'خالد العلامي', '+212-6-88888888', '2024-01', true);

-- Insert sample payments
INSERT INTO payments (id, payer_type, student_id, external_name, external_name_arabic, external_phone, item_type, extra_course_id, month, amount, due_date, status, paid_at, method, reference) VALUES
-- Tuition payments
('550e8400-e29b-41d4-a716-446655440401', 'STUDENT', '550e8400-e29b-41d4-a716-446655440101', NULL, NULL, NULL, 'TUITION', NULL, '2024-01', 800.00, '2024-01-05', 'PAID', '2024-01-03', 'BANK_TRANSFER', 'REF001'),
('550e8400-e29b-41d4-a716-446655440402', 'STUDENT', '550e8400-e29b-41d4-a716-446655440102', NULL, NULL, NULL, 'TUITION', NULL, '2024-01', 800.00, '2024-01-05', 'PAID', '2024-01-04', 'CASH', 'REF002'),
('550e8400-e29b-41d4-a716-446655440403', 'STUDENT', '550e8400-e29b-41d4-a716-446655440103', NULL, NULL, NULL, 'TUITION', NULL, '2024-01', 800.00, '2024-01-05', 'PARTIAL', '2024-01-05', 'CASH', 'REF003'),
('550e8400-e29b-41d4-a716-446655440404', 'STUDENT', '550e8400-e29b-41d4-a716-446655440104', NULL, NULL, NULL, 'TUITION', NULL, '2024-01', 800.00, '2024-01-05', 'UNPAID', NULL, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440405', 'STUDENT', '550e8400-e29b-41d4-a716-446655440105', NULL, NULL, NULL, 'TUITION', NULL, '2024-01', 800.00, '2024-01-05', 'PAID', '2024-01-02', 'CHECK', 'REF005'),
('550e8400-e29b-41d4-a716-446655440406', 'STUDENT', '550e8400-e29b-41d4-a716-446655440106', NULL, NULL, NULL, 'TUITION', NULL, '2024-01', 800.00, '2024-01-05', 'PAID', '2024-01-06', 'CARD', 'REF006'),

-- Extra course payments
('550e8400-e29b-41d4-a716-446655440407', 'STUDENT', '550e8400-e29b-41d4-a716-446655440101', NULL, NULL, NULL, 'EXTRA_COURSE', '550e8400-e29b-41d4-a716-446655440201', '2024-01', 300.00, '2024-01-10', 'PAID', '2024-01-08', 'CASH', 'REF007'),
('550e8400-e29b-41d4-a716-446655440408', 'STUDENT', '550e8400-e29b-41d4-a716-446655440103', NULL, NULL, NULL, 'EXTRA_COURSE', '550e8400-e29b-41d4-a716-446655440201', '2024-01', 300.00, '2024-01-10', 'PAID', '2024-01-09', 'BANK_TRANSFER', 'REF008'),
('550e8400-e29b-41d4-a716-446655440409', 'STUDENT', '550e8400-e29b-41d4-a716-446655440105', NULL, NULL, NULL, 'EXTRA_COURSE', '550e8400-e29b-41d4-a716-446655440202', '2024-01', 400.00, '2024-01-10', 'PAID', '2024-01-07', 'CASH', 'REF009'),
('550e8400-e29b-41d4-a716-446655440410', 'STUDENT', '550e8400-e29b-41d4-a716-446655440106', NULL, NULL, NULL, 'EXTRA_COURSE', '550e8400-e29b-41d4-a716-446655440202', '2024-01', 400.00, '2024-01-10', 'UNPAID', NULL, NULL, NULL),

-- External payments
('550e8400-e29b-41d4-a716-446655440411', 'EXTERNAL', NULL, 'Sara Benjelloun', 'سارة بنجلون', '+212-6-77777777', 'EXTRA_COURSE', '550e8400-e29b-41d4-a716-446655440201', '2024-01', 300.00, '2024-01-10', 'PAID', '2024-01-05', 'CASH', 'REF011'),
('550e8400-e29b-41d4-a716-446655440412', 'EXTERNAL', NULL, 'Khalid Alami', 'خالد العلامي', '+212-6-88888888', 'EXTRA_COURSE', '550e8400-e29b-41d4-a716-446655440202', '2024-01', 400.00, '2024-01-10', 'PAID', '2024-01-06', 'BANK_TRANSFER', 'REF012');

-- Insert sample attendance records for the current week
INSERT INTO attendance_records (id, student_id, date, status, remarks, recorded_by_user_id) VALUES
-- Monday (2024-01-15)
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440101', '2024-01-15', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440102', '2024-01-15', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440103', '2024-01-15', 'LATE', 'Arrived at 9:15', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440104', '2024-01-15', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440105', '2024-01-15', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440506', '550e8400-e29b-41d4-a716-446655440106', '2024-01-15', 'ABSENT', 'Sick', '550e8400-e29b-41d4-a716-446655440002'),

-- Tuesday (2024-01-16)
('550e8400-e29b-41d4-a716-446655440507', '550e8400-e29b-41d4-a716-446655440101', '2024-01-16', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440508', '550e8400-e29b-41d4-a716-446655440102', '2024-01-16', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440509', '550e8400-e29b-41d4-a716-446655440103', '2024-01-16', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440510', '550e8400-e29b-41d4-a716-446655440104', '2024-01-16', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440511', '550e8400-e29b-41d4-a716-446655440105', '2024-01-16', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440512', '550e8400-e29b-41d4-a716-446655440106', '2024-01-16', 'PRESENT', NULL, '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample belongings
INSERT INTO belonging_items (id, student_id, name, name_arabic, category, description, photo_url, check_in_at, check_out_at, status, handler_user_id) VALUES
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440101', 'Teddy Bear', 'دب دمية', 'Toy', 'Brown teddy bear', NULL, '2024-01-15 08:00:00+00', NULL, 'IN_STAFF', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440102', 'Water Bottle', 'زجاجة ماء', 'Personal Item', 'Blue water bottle', NULL, '2024-01-15 08:30:00+00', '2024-01-15 16:00:00+00', 'RETURNED', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440103', 'Art Supplies', 'مستلزمات فنية', 'School Supplies', 'Colored pencils and paper', NULL, '2024-01-15 09:00:00+00', NULL, 'IN_STAFF', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440104', 'Backpack', 'حقيبة مدرسية', 'Personal Item', 'Red backpack with books', NULL, '2024-01-15 08:15:00+00', '2024-01-15 15:30:00+00', 'RETURNED', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440105', 'Laptop', 'حاسوب محمول', 'Electronics', 'School laptop for coding class', NULL, '2024-01-15 08:00:00+00', NULL, 'IN_STAFF', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440106', 'Sports Equipment', 'معدات رياضية', 'Sports', 'Soccer ball and shin guards', NULL, '2024-01-15 08:45:00+00', '2024-01-15 16:15:00+00', 'RETURNED', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample audit logs
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440001', 'CREATE', 'STUDENT', '550e8400-e29b-41d4-a716-446655440101', NULL, '{"first_name": "Layla", "last_name": "Bennani"}', '192.168.1.100', 'Mozilla/5.0', '2024-01-01 10:00:00+00'),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440002', 'UPDATE', 'ATTENDANCE', '550e8400-e29b-41d4-a716-446655440501', '{"status": "ABSENT"}', '{"status": "PRESENT"}', '192.168.1.101', 'Mozilla/5.0', '2024-01-15 08:30:00+00'),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440003', 'CREATE', 'PAYMENT', '550e8400-e29b-41d4-a716-446655440401', NULL, '{"amount": 800.00, "status": "PAID"}', '192.168.1.102', 'Mozilla/5.0', '2024-01-03 14:00:00+00'); 