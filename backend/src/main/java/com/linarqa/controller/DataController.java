package com.linarqa.controller;

import com.linarqa.entity.Enrollment;
import com.linarqa.entity.ExtraCourse;
import com.linarqa.entity.KindergartenCourse;
import com.linarqa.entity.KindergartenEnrollment;
import com.linarqa.entity.Student;
import com.linarqa.entity.User;
import com.linarqa.entity.Classroom;
import com.linarqa.entity.Payment;
import com.linarqa.repository.EnrollmentRepository;
import com.linarqa.repository.ExtraCourseRepository;
import com.linarqa.repository.KindergartenCourseRepository;
import com.linarqa.repository.KindergartenEnrollmentRepository;
import com.linarqa.repository.StudentRepository;
import com.linarqa.repository.UserRepository;
import com.linarqa.repository.ClassroomRepository;
import com.linarqa.repository.AttendanceRecordRepository;
import com.linarqa.repository.BelongingRequirementRepository;
import com.linarqa.repository.StudentBelongingRepository;
import com.linarqa.repository.PaymentRepository;
import com.linarqa.repository.StaffRepository;
import com.linarqa.service.FileUploadService;
import com.linarqa.service.PaymentService;
import com.linarqa.service.NotificationService;
import com.linarqa.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import com.linarqa.entity.AttendanceRecord;
import java.time.LocalDateTime;
import com.linarqa.entity.BelongingRequirement;
import com.linarqa.entity.StudentBelonging;
import com.linarqa.dto.NotificationDto;

@RestController
@RequestMapping("/api")
public class DataController {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ExtraCourseRepository extraCourseRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private KindergartenCourseRepository kindergartenCourseRepository;
    @Autowired private KindergartenEnrollmentRepository kindergartenEnrollmentRepository;
    @Autowired private FileUploadService fileUploadService;
    @Autowired
    private ClassroomRepository classroomRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private SecurityUtils securityUtils;
    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;
    @Autowired
    private BelongingRequirementRepository belongingRequirementRepository;
    @Autowired
    private StudentBelongingRepository studentBelongingRepository;
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private StaffRepository staffRepository;

    // Test endpoint - completely open
    @GetMapping("/test-notifications")
    public ResponseEntity<Map<String, Object>> testNotifications() {
        try {
            System.out.println("🧪 DataController.testNotifications() called");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test endpoint working!");
            response.put("timestamp", java.time.LocalDateTime.now());
            response.put("totalNotifications", notificationService.getTotalNotificationCount());
            response.put("unreadNotifications", notificationService.getTotalUnreadNotificationCount());
            
            System.out.println("✅ Test endpoint successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error in testNotifications: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Notifications endpoints (using different paths to avoid conflicts)
    @GetMapping("/notifications-simple/all")
    public ResponseEntity<List<NotificationDto>> getAllNotifications() {
        try {
            System.out.println("🔔 DataController.getAllNotifications() called");
            
            // Get all notifications from the database and convert to DTOs
            List<com.linarqa.entity.Notification> notifications = notificationService.getAllNotifications();
            List<NotificationDto> notificationDtos = notifications.stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
            
            System.out.println("📋 Found " + notificationDtos.size() + " total notifications");
            
            return ResponseEntity.ok(notificationDtos);
        } catch (Exception e) {
            System.err.println("❌ Error in getAllNotifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/notifications-simple/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications() {
        try {
            System.out.println("🔔 DataController.getUnreadNotifications() called");
            
            // Get all unread notifications from the database and convert to DTOs
            List<com.linarqa.entity.Notification> notifications = notificationService.getAllUnreadNotifications();
            List<NotificationDto> notificationDtos = notifications.stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
            
            System.out.println("📋 Found " + notificationDtos.size() + " unread notifications");
            
            return ResponseEntity.ok(notificationDtos);
        } catch (Exception e) {
            System.err.println("❌ Error in getUnreadNotifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/notifications-simple/count")
    public ResponseEntity<Map<String, Long>> getNotificationCount() {
        try {
            System.out.println("🔔 DataController.getNotificationCount() called");
            
            long totalCount = notificationService.getTotalNotificationCount();
            long unreadCount = notificationService.getTotalUnreadNotificationCount();
            
            Map<String, Long> response = new HashMap<>();
            response.put("total", totalCount);
            response.put("unread", unreadCount);
            
            System.out.println("📊 Total notifications: " + totalCount + ", Unread: " + unreadCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error in getNotificationCount: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Students endpoints
    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status) {
        
        List<Student> students;
        
        // Filter by type first
        if (type != null) {
            if ("extra_course".equals(type)) {
                students = studentRepository.findByStudentType(Student.StudentType.EXTRA_COURSE);
            } else if ("kindergarten".equals(type)) {
                students = studentRepository.findByStudentType(Student.StudentType.KINDERGARTEN);
            } else {
                students = studentRepository.findAll();
            }
        } else {
            students = studentRepository.findAll();
        }
        
        // Apply search filter
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            students = students.stream()
                .filter(student -> 
                    student.getFirstName().toLowerCase().contains(searchLower) ||
                    student.getLastName().toLowerCase().contains(searchLower) ||
                    student.getFirstNameArabic() != null && student.getFirstNameArabic().toLowerCase().contains(searchLower) ||
                    student.getLastNameArabic() != null && student.getLastNameArabic().toLowerCase().contains(searchLower) ||
                    student.getGuardianName().toLowerCase().contains(searchLower) ||
                    student.getGuardianNameArabic() != null && student.getGuardianNameArabic().toLowerCase().contains(searchLower)
                )
                .collect(Collectors.toList());
        }
        
        // Apply level filter
        if (level != null && !level.trim().isEmpty()) {
            try {
                Student.StudentLevel studentLevel = Student.StudentLevel.valueOf(level);
                students = students.stream()
                    .filter(student -> student.getLevel() == studentLevel)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid level, return empty list
                return ResponseEntity.ok(new ArrayList<>());
            }
        }
        
        // Apply status filter
        if (status != null && !status.trim().isEmpty()) {
            try {
                Student.StudentStatus studentStatus = Student.StudentStatus.valueOf(status);
                students = students.stream()
                    .filter(student -> student.getStatus() == studentStatus)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid status, return empty list
                return ResponseEntity.ok(new ArrayList<>());
            }
        }
        
        return ResponseEntity.ok(students);
    }

    @PostMapping("/students")
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student savedStudent = studentRepository.save(student);
        
        // Notify admin users about new student registration
        try {
            securityUtils.getCurrentUserId().ifPresent(userId -> {
                String studentName = savedStudent.getFirstName() + " " + savedStudent.getLastName();
                String studentNameArabic = (savedStudent.getFirstNameArabic() != null ? savedStudent.getFirstNameArabic() : savedStudent.getFirstName()) + 
                                         " " + (savedStudent.getLastNameArabic() != null ? savedStudent.getLastNameArabic() : savedStudent.getLastName());
                notificationService.notifyStudentRegistered(studentName, studentNameArabic, savedStudent.getId(), userId);
            });
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Failed to send notification: " + e.getMessage());
        }
        
        return ResponseEntity.ok(savedStudent);
    }

    @PostMapping("/students/extra-course")
    public ResponseEntity<Student> createExtraCourseStudent(@RequestBody Map<String, Object> studentData) {
        Student newStudent = Student.builder()
            .firstName((String) studentData.get("firstName"))
            .lastName((String) studentData.get("lastName"))
            .firstNameArabic((String) studentData.get("firstNameArabic"))
            .lastNameArabic((String) studentData.get("lastNameArabic"))
            .birthDate(LocalDate.parse(studentData.get("birthDate").toString()))
            .studentType(Student.StudentType.EXTRA_COURSE)
            .guardianName((String) studentData.get("guardianName"))
            .guardianNameArabic((String) studentData.get("guardianNameArabic"))
            .guardianPhone((String) studentData.get("guardianPhone"))
            .address((String) studentData.get("address"))
            .addressArabic((String) studentData.get("addressArabic"))
            .allergies((String) studentData.get("allergies"))
            .notes((String) studentData.get("notes"))
            .status(Student.StudentStatus.ACTIVE)
            .build();
        
        Student savedStudent = studentRepository.save(newStudent);
        
        // Notify admin users about new extra course student registration
        try {
            securityUtils.getCurrentUserId().ifPresent(userId -> {
                String studentName = savedStudent.getFirstName() + " " + savedStudent.getLastName();
                String studentNameArabic = (savedStudent.getFirstNameArabic() != null ? savedStudent.getFirstNameArabic() : savedStudent.getFirstName()) + 
                                         " " + (savedStudent.getLastNameArabic() != null ? savedStudent.getLastNameArabic() : savedStudent.getLastName());
                notificationService.notifyStudentRegistered(studentName, studentNameArabic, savedStudent.getId(), userId);
            });
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Failed to send notification: " + e.getMessage());
        }
        
        return ResponseEntity.ok(savedStudent);
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable String id, @RequestBody Student student) {
        if (!studentRepository.existsById(UUID.fromString(id))) return ResponseEntity.notFound().build();
            student.setId(UUID.fromString(id));
        return ResponseEntity.ok(studentRepository.save(student));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        if (!studentRepository.existsById(UUID.fromString(id))) return ResponseEntity.notFound().build();
            studentRepository.deleteById(UUID.fromString(id));
            return ResponseEntity.ok().build();
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        return studentRepository.findById(UUID.fromString(id))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/students/{id}/photo")
    public ResponseEntity<Student> updateStudentPhoto(@PathVariable String id, @RequestBody Map<String, String> request) {
        String photoUrl = request.get("photoUrl");
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        return studentRepository.findById(UUID.fromString(id))
            .map(student -> {
                student.setPhotoUrl(photoUrl);
                return ResponseEntity.ok(studentRepository.save(student));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // File upload endpoints
    @PostMapping("/students/{id}/upload-photo")
    public ResponseEntity<Map<String, String>> uploadStudentPhoto(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
            }
            
            // Upload file
            String photoUrl = fileUploadService.uploadFile(file);
            
            // Update student photo URL
            studentRepository.findById(UUID.fromString(id))
                .ifPresent(student -> {
                    // Delete old photo if exists
                    if (student.getPhotoUrl() != null && (student.getPhotoUrl().startsWith("/api/uploads/") || student.getPhotoUrl().startsWith("http://localhost:8080/api/uploads/"))) {
                        fileUploadService.deleteFile(student.getPhotoUrl());
                    }
                    student.setPhotoUrl(photoUrl);
                    studentRepository.save(student);
                });
            
            return ResponseEntity.ok(Map.of("photoUrl", photoUrl));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/students/{id}/upload-camera-photo")
    public ResponseEntity<Map<String, String>> uploadCameraPhoto(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        
        try {
            String base64Data = request.get("base64Data");
            if (base64Data == null || base64Data.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Base64 data is required"));
            }
            
            // Remove data:image/jpeg;base64, prefix if present
            if (base64Data.contains(",")) {
                base64Data = base64Data.split(",")[1];
            }
            
            // Save base64 image
            String photoUrl = fileUploadService.saveBase64Image(base64Data, ".jpg");
            
            // Update student photo URL
            studentRepository.findById(UUID.fromString(id))
                .ifPresent(student -> {
                    // Delete old photo if exists
                    if (student.getPhotoUrl() != null && (student.getPhotoUrl().startsWith("/api/uploads/") || student.getPhotoUrl().startsWith("http://localhost:8080/api/uploads/"))) {
                        fileUploadService.deleteFile(student.getPhotoUrl());
                    }
                    student.setPhotoUrl(photoUrl);
                    studentRepository.save(student);
                });
            
            return ResponseEntity.ok(Map.of("photoUrl", photoUrl));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // File upload endpoints for new enrollments (no student ID required)
    @PostMapping("/enrollments/upload-photo")
    public ResponseEntity<Map<String, String>> uploadEnrollmentPhoto(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
            }
            
            // Upload file
            String photoUrl = fileUploadService.uploadFile(file);
            
            return ResponseEntity.ok(Map.of("photoUrl", photoUrl));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/enrollments/upload-camera-photo")
    public ResponseEntity<Map<String, String>> uploadEnrollmentCameraPhoto(@RequestBody Map<String, String> request) {
        try {
            String base64Data = request.get("base64Data");
            if (base64Data == null || base64Data.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Base64 data is required"));
            }
            
            // Remove data:image/jpeg;base64, prefix if present
            if (base64Data.contains(",")) {
                base64Data = base64Data.split(",")[1];
            }
            
            // Save base64 image
            String photoUrl = fileUploadService.saveBase64Image(base64Data, ".jpg");
            
            return ResponseEntity.ok(Map.of("photoUrl", photoUrl));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // Classroom endpoints
    @GetMapping("/classrooms")
    public ResponseEntity<List<Classroom>> getAllClassrooms(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String level) {
        
        List<Classroom> classrooms;
        if (type != null) {
            Student.StudentType studentType = Student.StudentType.valueOf(type.toUpperCase());
            if (level != null) {
                classrooms = classroomRepository.findByLevelAndStudentType(level, studentType);
            } else {
                classrooms = classroomRepository.findByStudentType(studentType);
            }
        } else {
            classrooms = classroomRepository.findByIsActiveTrue();
        }
        
        return ResponseEntity.ok(classrooms);
    }
    
    @PostMapping("/classrooms")
    public ResponseEntity<Classroom> createClassroom(@RequestBody Classroom classroom) {
        classroom.setCurrentEnrollment(0);
        classroom.setIsActive(true);
        return ResponseEntity.ok(classroomRepository.save(classroom));
    }
    
    @PutMapping("/classrooms/{id}")
    public ResponseEntity<Classroom> updateClassroom(@PathVariable String id, @RequestBody Classroom classroom) {
        return classroomRepository.findById(UUID.fromString(id))
            .map(existingClassroom -> {
                existingClassroom.setName(classroom.getName());
                existingClassroom.setNameArabic(classroom.getNameArabic());
                existingClassroom.setLevel(classroom.getLevel());
                existingClassroom.setMaxCapacity(classroom.getMaxCapacity());
                existingClassroom.setDescription(classroom.getDescription());
                existingClassroom.setIsActive(classroom.getIsActive());
                return ResponseEntity.ok(classroomRepository.save(existingClassroom));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/classrooms/{id}")
    public ResponseEntity<Void> deleteClassroom(@PathVariable String id) {
        return classroomRepository.findById(UUID.fromString(id))
            .map(classroom -> {
                classroomRepository.delete(classroom);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Attendance endpoints
    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceRecords(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        List<AttendanceRecord> records;
        
        // For debugging, let's log what we're getting
        System.out.println("Attendance request - date: " + date + ", type: " + type + ", startDate: " + startDate + ", endDate: " + endDate);
        
        if (startDate != null && endDate != null) {
            // Get records for date range
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            if (type != null) {
                Student.StudentType studentType = Student.StudentType.valueOf(type.toUpperCase());
                records = attendanceRecordRepository.findByDateAndStudentType(start, studentType);
                // Filter by date range manually since we don't have a specific query
                records = records.stream()
                    .filter(record -> !record.getAttendanceDate().isBefore(start) && !record.getAttendanceDate().isAfter(end))
                    .collect(Collectors.toList());
            } else {
                records = attendanceRecordRepository.findByDate(start);
                // Filter by date range manually
                records = records.stream()
                    .filter(record -> !record.getAttendanceDate().isBefore(start) && !record.getAttendanceDate().isAfter(end))
                    .collect(Collectors.toList());
            }
        } else if (date != null) {
            LocalDate attendanceDate = LocalDate.parse(date);
            if (type != null) {
                Student.StudentType studentType = Student.StudentType.valueOf(type.toUpperCase());
                records = attendanceRecordRepository.findByDateAndStudentType(attendanceDate, studentType);
            } else {
                records = attendanceRecordRepository.findByDate(attendanceDate);
            }
        } else {
            // If no filters, return all records
            records = attendanceRecordRepository.findAll();
            System.out.println("Total records found: " + records.size());
            if (type != null) {
                Student.StudentType studentType = Student.StudentType.valueOf(type.toUpperCase());
                records = records.stream()
                    .filter(record -> record.getStudent().getStudentType() == studentType)
                    .collect(Collectors.toList());
                System.out.println("Records after type filter: " + records.size());
            }
        }
        
        // Convert to DTO to avoid serialization issues
        List<Map<String, Object>> dtoRecords = records.stream().map(record -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", record.getId().toString());
            dto.put("attendanceDate", record.getAttendanceDate().toString());
            dto.put("status", record.getStatus().toString());
            dto.put("checkInTime", record.getCheckInTime());
            dto.put("checkOutTime", record.getCheckOutTime());
            dto.put("notes", record.getNotes());
            dto.put("recordedBy", record.getRecordedBy());
            dto.put("createdAt", record.getCreatedAt());
            dto.put("updatedAt", record.getUpdatedAt());
            
            // Student data
            Student student = record.getStudent();
            Map<String, Object> studentDto = new HashMap<>();
            studentDto.put("id", student.getId().toString());
            studentDto.put("firstName", student.getFirstName());
            studentDto.put("lastName", student.getLastName());
            studentDto.put("firstNameArabic", student.getFirstNameArabic());
            studentDto.put("lastNameArabic", student.getLastNameArabic());
            studentDto.put("level", student.getLevel());
            studentDto.put("classroom", student.getClassroom());
            studentDto.put("photoUrl", student.getPhotoUrl());
            studentDto.put("studentType", student.getStudentType().toString());
            
            dto.put("student", studentDto);
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtoRecords);
    }
    
    @PostMapping("/attendance")
    public ResponseEntity<AttendanceRecord> createAttendanceRecord(@RequestBody AttendanceRecord record) {
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(attendanceRecordRepository.save(record));
    }
    
    @PutMapping("/attendance/{id}")
    public ResponseEntity<AttendanceRecord> updateAttendanceRecord(@PathVariable String id, @RequestBody AttendanceRecord record) {
        return attendanceRecordRepository.findById(UUID.fromString(id))
            .map(existingRecord -> {
                existingRecord.setStatus(record.getStatus());
                existingRecord.setCheckInTime(record.getCheckInTime());
                existingRecord.setCheckOutTime(record.getCheckOutTime());
                existingRecord.setNotes(record.getNotes());
                existingRecord.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(attendanceRecordRepository.save(existingRecord));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/attendance/bulk")
    public ResponseEntity<Map<String, Object>> createBulkAttendanceRecords(@RequestBody List<Map<String, Object>> recordsData) {
        LocalDateTime now = LocalDateTime.now();
        List<AttendanceRecord> records = new ArrayList<>();
        
        for (Map<String, Object> recordData : recordsData) {
            String studentId = (String) recordData.get("studentId");
            String status = (String) recordData.get("status");
            String date = (String) recordData.get("attendanceDate");
            String recordedBy = (String) recordData.get("recordedBy");
            String checkInTime = (String) recordData.get("checkInTime");
            String notes = (String) recordData.get("notes");
            
            // Find the student
            Student student = studentRepository.findById(UUID.fromString(studentId))
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
            
            // Create attendance record
            AttendanceRecord record = new AttendanceRecord();
            record.setStudent(student);
            record.setAttendanceDate(LocalDate.parse(date));
            record.setStatus(AttendanceRecord.AttendanceStatus.valueOf(status));
            record.setRecordedBy(recordedBy);
            record.setNotes(notes);
            record.setCreatedAt(now);
            record.setUpdatedAt(now);
            
            if (checkInTime != null) {
                try {
                    // Remove timezone suffix and parse as LocalDateTime
                    String cleanTime = checkInTime.replace("Z", "");
                    record.setCheckInTime(LocalDateTime.parse(cleanTime));
                } catch (Exception e) {
                    // If parsing fails, set to current time
                    record.setCheckInTime(LocalDateTime.now());
                }
            }
            
            records.add(record);
        }
        
        List<AttendanceRecord> savedRecords = attendanceRecordRepository.saveAll(records);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Attendance records saved successfully");
        response.put("count", savedRecords.size());
        response.put("date", recordsData.isEmpty() ? LocalDate.now().toString() : recordsData.get(0).get("attendanceDate"));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/attendance/student/{studentId}")
    public ResponseEntity<List<AttendanceRecord>> getStudentAttendanceRecords(
            @PathVariable String studentId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            return ResponseEntity.ok(attendanceRecordRepository.findByStudentIdAndDateRange(UUID.fromString(studentId), start, end));
        } else {
            // Return last 30 days by default
            LocalDate end = LocalDate.now();
            LocalDate start = end.minusDays(30);
            return ResponseEntity.ok(attendanceRecordRepository.findByStudentIdAndDateRange(UUID.fromString(studentId), start, end));
        }
    }

    // Belongings endpoints
    @GetMapping("/belongings/requirements")
    public ResponseEntity<List<BelongingRequirement>> getBelongingRequirements(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String level) {
        
        List<BelongingRequirement> requirements;
        if (type != null) {
            Student.StudentType studentType = Student.StudentType.valueOf(type.toUpperCase());
            if (level != null) {
                requirements = belongingRequirementRepository.findByStudentTypeAndLevel(studentType, level);
            } else {
                requirements = belongingRequirementRepository.findByStudentTypeAndIsActiveTrue(studentType);
            }
        } else {
            requirements = belongingRequirementRepository.findByIsActiveTrue();
        }
        
        return ResponseEntity.ok(requirements);
    }
    
    @PostMapping("/belongings/requirements")
    public ResponseEntity<BelongingRequirement> createBelongingRequirement(@RequestBody BelongingRequirement requirement) {
        requirement.setCreatedAt(java.time.LocalDateTime.now());
        requirement.setIsActive(true);
        // Set studentType to KINDERGARTEN by default since only kindergarten students have belongings
        requirement.setStudentType(Student.StudentType.KINDERGARTEN);
        return ResponseEntity.ok(belongingRequirementRepository.save(requirement));
    }
    
    @PutMapping("/belongings/requirements/{id}")
    public ResponseEntity<BelongingRequirement> updateBelongingRequirement(@PathVariable String id, @RequestBody BelongingRequirement requirement) {
        return belongingRequirementRepository.findById(UUID.fromString(id))
            .map(existingRequirement -> {
                existingRequirement.setName(requirement.getName());
                existingRequirement.setNameArabic(requirement.getNameArabic());
                existingRequirement.setCategory(requirement.getCategory());
                existingRequirement.setIsRequired(requirement.getIsRequired());
                existingRequirement.setQuantityNeeded(requirement.getQuantityNeeded());
                existingRequirement.setDescription(requirement.getDescription());
                existingRequirement.setNotes(requirement.getNotes());
                existingRequirement.setLevel(requirement.getLevel());
                existingRequirement.setIsActive(requirement.getIsActive());
                return ResponseEntity.ok(belongingRequirementRepository.save(existingRequirement));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/belongings/requirements/{id}")
    public ResponseEntity<Void> deleteBelongingRequirement(@PathVariable String id) {
        return belongingRequirementRepository.findById(UUID.fromString(id))
            .map(requirement -> {
                requirement.setIsActive(false);
                belongingRequirementRepository.save(requirement);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Student Belongings endpoints
    @GetMapping("/belongings/student/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> getStudentBelongings(@PathVariable String studentId) {
        List<StudentBelonging> belongings = studentBelongingRepository.findByStudentId(UUID.fromString(studentId));
        
        List<Map<String, Object>> dtoBelongings = belongings.stream().map(belonging -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", belonging.getId().toString());
            dto.put("name", belonging.getName());
            dto.put("nameArabic", belonging.getNameArabic());
            dto.put("category", belonging.getCategory());
            dto.put("quantity", belonging.getQuantity());
            dto.put("status", belonging.getStatus().toString());
            dto.put("checkInDate", belonging.getCheckInDate());
            dto.put("checkOutDate", belonging.getCheckOutDate());
            dto.put("checkedInBy", belonging.getCheckedInBy());
            dto.put("checkedOutBy", belonging.getCheckedOutBy());
            dto.put("notes", belonging.getNotes());
            dto.put("createdAt", belonging.getCreatedAt());
            dto.put("updatedAt", belonging.getUpdatedAt());
            
            // Student data
            Student student = belonging.getStudent();
            Map<String, Object> studentDto = new HashMap<>();
            studentDto.put("id", student.getId().toString());
            studentDto.put("firstName", student.getFirstName());
            studentDto.put("lastName", student.getLastName());
            studentDto.put("level", student.getLevel());
            studentDto.put("photoUrl", student.getPhotoUrl());
            
            dto.put("student", studentDto);
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtoBelongings);
    }
    
    @PostMapping("/belongings/student/{studentId}")
    public ResponseEntity<StudentBelonging> addStudentBelonging(
            @PathVariable String studentId,
            @RequestBody StudentBelonging belonging) {
        
        Student student = studentRepository.findById(UUID.fromString(studentId))
            .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        
        belonging.setStudent(student);
        belonging.setCheckInDate(LocalDateTime.now());
        belonging.setCreatedAt(LocalDateTime.now());
        belonging.setUpdatedAt(LocalDateTime.now());
        
        return ResponseEntity.ok(studentBelongingRepository.save(belonging));
    }
    
    @PatchMapping("/belongings/{belongingId}/check-out")
    public ResponseEntity<StudentBelonging> checkOutBelonging(@PathVariable String belongingId) {
        return studentBelongingRepository.findById(UUID.fromString(belongingId))
            .map(belonging -> {
                belonging.setStatus(StudentBelonging.BelongingStatus.RETURNED);
                belonging.setCheckOutDate(LocalDateTime.now());
                belonging.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(studentBelongingRepository.save(belonging));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/belongings/{belongingId}/status")
    public ResponseEntity<StudentBelonging> updateBelongingStatus(
            @PathVariable String belongingId,
            @RequestBody Map<String, String> statusUpdate) {
        
        return studentBelongingRepository.findById(UUID.fromString(belongingId))
            .map(belonging -> {
                String newStatus = statusUpdate.get("status");
                String notes = statusUpdate.get("notes");
                
                belonging.setStatus(StudentBelonging.BelongingStatus.valueOf(newStatus));
                if (notes != null) {
                    belonging.setNotes(notes);
                }
                belonging.setUpdatedAt(LocalDateTime.now());
                
                return ResponseEntity.ok(studentBelongingRepository.save(belonging));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/belongings/print-requirements")
    public ResponseEntity<Map<String, Object>> getPrintableRequirements(
            @RequestParam String type,
            @RequestParam(required = false) String level) {
        
        Student.StudentType studentType = Student.StudentType.valueOf(type.toUpperCase());
        List<BelongingRequirement> requirements;
        
        if (level != null) {
            requirements = belongingRequirementRepository.findByStudentTypeAndLevel(studentType, level);
        } else {
            requirements = belongingRequirementRepository.findByStudentTypeAndIsActiveTrue(studentType);
        }
        
        // Group by category
        Map<String, List<BelongingRequirement>> groupedRequirements = requirements.stream()
            .collect(Collectors.groupingBy(BelongingRequirement::getCategory));
        
        Map<String, Object> response = new HashMap<>();
        response.put("studentType", studentType.toString());
        response.put("level", level);
        response.put("requirements", groupedRequirements);
        response.put("totalRequired", requirements.stream().filter(BelongingRequirement::getIsRequired).count());
        response.put("totalOptional", requirements.stream().filter(req -> !req.getIsRequired()).count());
        response.put("generatedAt", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }

    // Payments endpoints
    @GetMapping("/payments")
    public ResponseEntity<List<Map<String, Object>>> getPayments(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String year) {
        
        List<Payment> payments;
        
        if (studentId != null) {
            payments = paymentService.getPaymentsByStudent(UUID.fromString(studentId));
        } else if (status != null) {
            Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
            payments = paymentRepository.findByStatus(paymentStatus);
        } else {
            payments = paymentRepository.findAll();
        }
        
        // Filter by month and year if provided
        if (month != null && year != null) {
            int monthInt = Integer.parseInt(month);
            int yearInt = Integer.parseInt(year);
            payments = payments.stream()
                .filter(payment -> {
                    LocalDate paymentDate = payment.getCreatedAt().toLocalDate();
                    return paymentDate.getMonthValue() == monthInt && paymentDate.getYear() == yearInt;
                })
                .collect(Collectors.toList());
        }
        
        List<Map<String, Object>> paymentData = payments.stream().map(payment -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", payment.getId().toString());
            data.put("studentId", payment.getStudent().getId().toString());
            data.put("studentName", payment.getStudent().getFirstName() + " " + payment.getStudent().getLastName());
            data.put("studentNameArabic", payment.getStudent().getFirstNameArabic() + " " + payment.getStudent().getLastNameArabic());
            data.put("studentPhotoUrl", payment.getStudent().getPhotoUrl());
            data.put("type", payment.getType().toString());
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
    }

    @PostMapping("/payments/generate-monthly")
    public ResponseEntity<Map<String, Object>> generateMonthlyBills(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        
        try {
            if (year != null && month != null) {
                paymentService.generateMonthlyBillsForMonth(year, month);
            } else {
                paymentService.generateMonthlyBills();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Monthly bills generated successfully");
            response.put("year", year != null ? year : LocalDate.now().getYear());
            response.put("month", month != null ? month : LocalDate.now().getMonthValue());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/payments/generate-single")
    public ResponseEntity<Map<String, Object>> generateSingleBill(@RequestBody Map<String, Object> request) {
        try {
            UUID studentId = UUID.fromString(request.get("studentId").toString());
            LocalDate dueDate = LocalDate.parse(request.get("dueDate").toString());
            String notes = (String) request.get("notes");
            
            Payment payment = paymentService.generateBillForStudent(studentId, dueDate, notes);
            
            // Notify admin users about new payment creation
            try {
                securityUtils.getCurrentUserId().ifPresent(userId -> {
                    String studentName = payment.getStudent().getFirstName() + " " + payment.getStudent().getLastName();
                    String studentNameArabic = (payment.getStudent().getFirstNameArabic() != null ? payment.getStudent().getFirstNameArabic() : payment.getStudent().getFirstName()) + 
                                             " " + (payment.getStudent().getLastNameArabic() != null ? payment.getStudent().getLastNameArabic() : payment.getStudent().getLastName());
                    String amount = payment.getAmount().toString();
                    notificationService.notifyPaymentCreated(studentName, studentNameArabic, amount, payment.getId(), userId);
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

    @PatchMapping("/payments/{id}/mark-paid")
    public ResponseEntity<Map<String, Object>> markPaymentPaid(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> request) {
        
        try {
            LocalDate paidDate = null;
            String notes = null;
            
            if (request != null) {
                if (request.containsKey("paidDate")) {
                    paidDate = LocalDate.parse(request.get("paidDate").toString());
                }
                if (request.containsKey("notes")) {
                    notes = (String) request.get("notes");
                }
            }
            
            Payment payment = paymentService.markPaymentAsPaid(UUID.fromString(id), paidDate, notes);
            
            // Notify admin users about payment marked as paid
            try {
                securityUtils.getCurrentUserId().ifPresent(userId -> {
                    String studentName = payment.getStudent().getFirstName() + " " + payment.getStudent().getLastName();
                    String studentNameArabic = (payment.getStudent().getFirstNameArabic() != null ? payment.getStudent().getFirstNameArabic() : payment.getStudent().getFirstName()) + 
                                             " " + (payment.getStudent().getLastNameArabic() != null ? payment.getStudent().getLastNameArabic() : payment.getStudent().getLastName());
                    String amount = payment.getAmount().toString();
                    notificationService.notifyPaymentMarkedPaid(studentName, studentNameArabic, amount, payment.getId(), userId);
                });
            } catch (Exception e) {
                // Log error but don't fail the request
                System.err.println("Failed to send payment paid notification: " + e.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment marked as paid successfully");
            response.put("paymentId", payment.getId().toString());
            response.put("status", payment.getStatus().toString());
            response.put("paidDate", payment.getPaidDate());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PatchMapping("/payments/{id}/mark-partial")
    public ResponseEntity<Map<String, Object>> markPaymentPartial(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        
        try {
            BigDecimal partialAmount = new BigDecimal(request.get("partialAmount").toString());
            String notes = (String) request.get("notes");
            
            Payment payment = paymentService.markPaymentAsPartial(UUID.fromString(id), partialAmount, notes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment marked as partially paid");
            response.put("paymentId", payment.getId().toString());
            response.put("status", payment.getStatus().toString());
            response.put("amount", payment.getAmount());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/payments/statistics")
    public ResponseEntity<PaymentService.PaymentStatistics> getPaymentStatistics(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String year) {
        return ResponseEntity.ok(paymentService.getPaymentStatistics(month, year));
    }

    @GetMapping("/payments/overdue")
    public ResponseEntity<List<Map<String, Object>>> getOverduePayments() {
        List<Payment> overduePayments = paymentService.getOverduePayments();
        
        List<Map<String, Object>> overdueData = overduePayments.stream().map(payment -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", payment.getId().toString());
            data.put("studentId", payment.getStudent().getId().toString());
            data.put("studentName", payment.getStudent().getFirstName() + " " + payment.getStudent().getLastName());
            data.put("amount", payment.getAmount());
            data.put("dueDate", payment.getDueDate());
            data.put("daysOverdue", LocalDate.now().getDayOfYear() - payment.getDueDate().getDayOfYear());
            data.put("notes", payment.getNotes());
            return data;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(overdueData);
    }

    @GetMapping("/payments/student/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> getStudentPaymentHistory(@PathVariable String studentId) {
        try {
            UUID studentUuid = UUID.fromString(studentId);
            List<Payment> payments = paymentRepository.findByStudentIdOrderByDueDateDesc(studentUuid);
            
            List<Map<String, Object>> paymentHistory = payments.stream().map(payment -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", payment.getId().toString());
                data.put("amount", payment.getAmount());
                data.put("dueDate", payment.getDueDate());
                data.put("paidDate", payment.getPaidDate());
                data.put("status", payment.getStatus().toString());
                data.put("paymentType", payment.getType().toString());
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

    // Extra courses endpoints
    @GetMapping("/extras/courses")
    public ResponseEntity<List<ExtraCourse>> getExtraCourses() {
        List<ExtraCourse> courses = extraCourseRepository.findByActiveTrue();
        
        // If no courses exist, create some default ones
        if (courses.isEmpty()) {
            ExtraCourse artClub = ExtraCourse.builder()
                .title("Art Club")
                .description("Activités artistiques et créatives pour adolescents")
                .monthlyPrice(new BigDecimal("120.00"))
                .capacity(15)
                .active(true)
                .schedule("Lundi et Mercredi 16h-17h30")
                .instructor("Mme. Sarah")
                .build();
            extraCourseRepository.save(artClub);
            
            ExtraCourse codingTeens = ExtraCourse.builder()
                .title("Coding Teens")
                .description("Initiation à la programmation et développement web")
                .monthlyPrice(new BigDecimal("180.00"))
                .capacity(12)
                .active(true)
                .schedule("Mardi et Jeudi 17h-18h30")
                .instructor("M. Ahmed")
                .build();
            extraCourseRepository.save(codingTeens);
            
            ExtraCourse englishConversation = ExtraCourse.builder()
                .title("English Conversation")
                .description("Pratique de l'anglais conversationnel pour adolescents")
                .monthlyPrice(new BigDecimal("150.00"))
                .capacity(10)
                .active(true)
                .schedule("Samedi 14h-15h30")
                .instructor("Mme. Jennifer")
                .build();
            extraCourseRepository.save(englishConversation);
            
            // Fetch the newly created courses
            courses = extraCourseRepository.findByActiveTrue();
        }
        
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/extras/courses/{id}")
    public ResponseEntity<ExtraCourse> getExtraCourse(@PathVariable String id) {
        Optional<ExtraCourse> course = extraCourseRepository.findById(UUID.fromString(id));
        return course.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/extras/courses")
    public ResponseEntity<ExtraCourse> createExtraCourse(@RequestBody Map<String, Object> courseData) {
        ExtraCourse newCourse = ExtraCourse.builder()
            .title((String) courseData.get("title"))
            .description((String) courseData.get("description"))
            .monthlyPrice(new BigDecimal(courseData.get("monthlyPrice").toString()))
            .capacity(Integer.parseInt(courseData.get("capacity").toString()))
            .active(true)
            .schedule((String) courseData.get("schedule"))
            .instructor((String) courseData.get("instructor"))
            .build();
        
        ExtraCourse savedCourse = extraCourseRepository.save(newCourse);
        return ResponseEntity.ok(savedCourse);
    }

    @PutMapping("/extras/courses/{id}")
    public ResponseEntity<ExtraCourse> updateExtraCourse(@PathVariable String id, @RequestBody Map<String, Object> courseData) {
        Optional<ExtraCourse> courseOpt = extraCourseRepository.findById(UUID.fromString(id));
        if (courseOpt.isPresent()) {
            ExtraCourse course = courseOpt.get();
            course.setTitle((String) courseData.get("title"));
            course.setDescription((String) courseData.get("description"));
            course.setMonthlyPrice(new BigDecimal(courseData.get("monthlyPrice").toString()));
            course.setCapacity(Integer.parseInt(courseData.get("capacity").toString()));
            course.setSchedule((String) courseData.get("schedule"));
            course.setInstructor((String) courseData.get("instructor"));
            
            ExtraCourse updatedCourse = extraCourseRepository.save(course);
            return ResponseEntity.ok(updatedCourse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/extras/courses/{id}")
    public ResponseEntity<Map<String, Object>> deleteExtraCourse(@PathVariable String id) {
        Optional<ExtraCourse> courseOpt = extraCourseRepository.findById(UUID.fromString(id));
        if (courseOpt.isPresent()) {
            ExtraCourse course = courseOpt.get();
            course.setActive(false);
            extraCourseRepository.save(course);
            
        Map<String, Object> response = new HashMap<>();
            response.put("message", "Cours supprimé avec succès");
        return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Kindergarten courses endpoints
    @GetMapping("/kindergarten/courses")
    public ResponseEntity<List<KindergartenCourse>> getKindergartenCourses() {
        List<KindergartenCourse> courses = kindergartenCourseRepository.findByActiveTrue();
        
        // If no courses exist, create some default ones
        if (courses.isEmpty()) {
            KindergartenCourse artAndCraft = KindergartenCourse.builder()
                .title("Art et Créativité")
                .description("Activités artistiques et manuelles pour développer la créativité")
                .monthlyPrice(new BigDecimal("80.00"))
                .capacity(12)
                .active(true)
                .schedule("Lundi et Mercredi 9h-10h30")
                .instructor("Mme. Fatima")
                .level(Student.StudentLevel.PETITE)
                .ageGroup("3-4 ans")
                .activities("Peinture, dessin, collage, modelage")
                .build();
            kindergartenCourseRepository.save(artAndCraft);
            
            KindergartenCourse musicAndMovement = KindergartenCourse.builder()
                .title("Musique et Mouvement")
                .description("Éveil musical et activités physiques pour les tout-petits")
                .monthlyPrice(new BigDecimal("90.00"))
                .capacity(15)
                .active(true)
                .schedule("Mardi et Jeudi 10h-11h30")
                .instructor("Mme. Amina")
                .level(Student.StudentLevel.MOYENNE)
                .ageGroup("4-5 ans")
                .activities("Chants, danse, instruments, jeux rythmiques")
                .build();
            kindergartenCourseRepository.save(musicAndMovement);
            
            KindergartenCourse earlyLearning = KindergartenCourse.builder()
                .title("Éveil et Apprentissage")
                .description("Activités d'éveil et préparation à la lecture et écriture")
                .monthlyPrice(new BigDecimal("100.00"))
                .capacity(10)
                .active(true)
                .schedule("Vendredi 9h-10h30")
                .instructor("Mme. Khadija")
                .level(Student.StudentLevel.GRANDE)
                .ageGroup("5-6 ans")
                .activities("Alphabet, chiffres, histoires, jeux éducatifs")
                .build();
            kindergartenCourseRepository.save(earlyLearning);
            
            // Fetch the newly created courses
            courses = kindergartenCourseRepository.findByActiveTrue();
        }
        
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/kindergarten/courses/{id}")
    public ResponseEntity<KindergartenCourse> getKindergartenCourse(@PathVariable String id) {
        Optional<KindergartenCourse> course = kindergartenCourseRepository.findById(UUID.fromString(id));
        return course.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/kindergarten/courses")
    public ResponseEntity<KindergartenCourse> createKindergartenCourse(@RequestBody Map<String, Object> courseData) {
        KindergartenCourse newCourse = KindergartenCourse.builder()
            .title((String) courseData.get("title"))
            .description((String) courseData.get("description"))
            .monthlyPrice(new BigDecimal(courseData.get("monthlyPrice").toString()))
            .capacity(Integer.parseInt(courseData.get("capacity").toString()))
            .active(true)
            .schedule((String) courseData.get("schedule"))
            .instructor((String) courseData.get("instructor"))
            .level(Student.StudentLevel.valueOf(courseData.get("level").toString()))
            .ageGroup((String) courseData.get("ageGroup"))
            .activities((String) courseData.get("activities"))
            .build();
        
        KindergartenCourse savedCourse = kindergartenCourseRepository.save(newCourse);
        return ResponseEntity.ok(savedCourse);
    }

    @PutMapping("/kindergarten/courses/{id}")
    public ResponseEntity<KindergartenCourse> updateKindergartenCourse(@PathVariable String id, @RequestBody Map<String, Object> courseData) {
        Optional<KindergartenCourse> courseOpt = kindergartenCourseRepository.findById(UUID.fromString(id));
        if (courseOpt.isPresent()) {
            KindergartenCourse course = courseOpt.get();
            course.setTitle((String) courseData.get("title"));
            course.setDescription((String) courseData.get("description"));
            course.setMonthlyPrice(new BigDecimal(courseData.get("monthlyPrice").toString()));
            course.setCapacity(Integer.parseInt(courseData.get("capacity").toString()));
            course.setSchedule((String) courseData.get("schedule"));
            course.setInstructor((String) courseData.get("instructor"));
            course.setLevel(Student.StudentLevel.valueOf(courseData.get("level").toString()));
            course.setAgeGroup((String) courseData.get("ageGroup"));
            course.setActivities((String) courseData.get("activities"));
            
            KindergartenCourse updatedCourse = kindergartenCourseRepository.save(course);
            return ResponseEntity.ok(updatedCourse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/kindergarten/courses/{id}")
    public ResponseEntity<Map<String, Object>> deleteKindergartenCourse(@PathVariable String id) {
        Optional<KindergartenCourse> courseOpt = kindergartenCourseRepository.findById(UUID.fromString(id));
        if (courseOpt.isPresent()) {
            KindergartenCourse course = courseOpt.get();
            course.setActive(false);
            kindergartenCourseRepository.save(course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cours maternelle supprimé avec succès");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Kindergarten enrollment endpoints
    @GetMapping("/kindergarten/enrollments")
    public ResponseEntity<List<Map<String, Object>>> getKindergartenEnrollments(@RequestParam(required = false) String courseId) {
        List<KindergartenEnrollment> enrollments;
        if (courseId != null) {
            enrollments = kindergartenEnrollmentRepository.findByCourseId(UUID.fromString(courseId));
        } else {
            enrollments = kindergartenEnrollmentRepository.findAll();
        }
        
        List<Map<String, Object>> enrollmentData = new ArrayList<>();
        for (KindergartenEnrollment enrollment : enrollments) {
            Map<String, Object> data = new HashMap<>();
            data.put("id", enrollment.getId());
            data.put("studentId", enrollment.getStudent().getId());
            data.put("studentName", enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName());
            data.put("courseId", enrollment.getCourse().getId());
            data.put("courseTitle", enrollment.getCourse().getTitle());
            data.put("status", enrollment.getStatus());
            data.put("enrollmentDate", enrollment.getEnrollmentDate());
            data.put("startDate", enrollment.getStartDate());
            data.put("endDate", enrollment.getEndDate());
            data.put("notes", enrollment.getNotes());
            enrollmentData.add(data);
        }
        
        return ResponseEntity.ok(enrollmentData);
    }

    @PostMapping("/kindergarten/enrollments")
    public ResponseEntity<Map<String, Object>> createKindergartenEnrollment(@RequestBody Map<String, Object> enrollmentData) {
        Optional<Student> studentOpt = studentRepository.findById(UUID.fromString(enrollmentData.get("studentId").toString()));
        Optional<KindergartenCourse> courseOpt = kindergartenCourseRepository.findById(UUID.fromString(enrollmentData.get("courseId").toString()));
        
        if (studentOpt.isEmpty() || courseOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student or course not found"));
        }
        
        Student student = studentOpt.get();
        KindergartenCourse course = courseOpt.get();
        
        // Check if student is already enrolled in this course
        List<KindergartenEnrollment> existingEnrollments = kindergartenEnrollmentRepository.findByStudentId(student.getId());
        for (KindergartenEnrollment existing : existingEnrollments) {
            if (existing.getCourse().getId().equals(course.getId()) && 
                existing.getStatus() == KindergartenEnrollment.EnrollmentStatus.ACTIVE) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student is already enrolled in this course"));
            }
        }
        
        // Check course capacity
        List<KindergartenEnrollment> activeEnrollments = kindergartenEnrollmentRepository.findByCourseId(course.getId());
        long activeCount = activeEnrollments.stream()
            .filter(e -> e.getStatus() == KindergartenEnrollment.EnrollmentStatus.ACTIVE)
            .count();
        
        if (activeCount >= course.getCapacity()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Course is at full capacity"));
        }
        
        KindergartenEnrollment enrollment = KindergartenEnrollment.builder()
            .student(student)
            .course(course)
            .status(KindergartenEnrollment.EnrollmentStatus.ACTIVE)
            .enrollmentDate(LocalDate.now())
            .startDate(LocalDate.now())
            .notes((String) enrollmentData.get("notes"))
            .build();
        
        KindergartenEnrollment savedEnrollment = kindergartenEnrollmentRepository.save(enrollment);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedEnrollment.getId());
        response.put("message", "Student enrolled successfully");
        response.put("enrollment", Map.of(
            "studentName", student.getFirstName() + " " + student.getLastName(),
            "courseTitle", course.getTitle(),
            "status", savedEnrollment.getStatus()
        ));
        
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/kindergarten/enrollments/{id}")
    public ResponseEntity<Map<String, Object>> updateKindergartenEnrollment(@PathVariable String id, @RequestBody Map<String, Object> updateData) {
        Optional<KindergartenEnrollment> enrollmentOpt = kindergartenEnrollmentRepository.findById(UUID.fromString(id));
        if (enrollmentOpt.isPresent()) {
            KindergartenEnrollment enrollment = enrollmentOpt.get();
            
            if (updateData.containsKey("status")) {
                enrollment.setStatus(KindergartenEnrollment.EnrollmentStatus.valueOf(updateData.get("status").toString()));
            }
            if (updateData.containsKey("notes")) {
                enrollment.setNotes((String) updateData.get("notes"));
            }
            if (updateData.containsKey("endDate")) {
                enrollment.setEndDate(LocalDate.parse(updateData.get("endDate").toString()));
            }
            
            kindergartenEnrollmentRepository.save(enrollment);
        
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Enrollment updated successfully");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Enrollment endpoints
    @GetMapping("/extras/enrollments")
    public ResponseEntity<List<Map<String, Object>>> getEnrollments(@RequestParam(required = false) String courseId) {
        List<Enrollment> enrollments;
        if (courseId != null) {
            enrollments = enrollmentRepository.findByCourseId(UUID.fromString(courseId));
        } else {
            enrollments = enrollmentRepository.findAll();
        }
        
        List<Map<String, Object>> enrollmentData = new ArrayList<>();
        for (Enrollment enrollment : enrollments) {
            Map<String, Object> data = new HashMap<>();
            data.put("id", enrollment.getId());
            data.put("studentId", enrollment.getStudent().getId());
            data.put("studentName", enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName());
            data.put("courseId", enrollment.getCourse().getId());
            data.put("courseTitle", enrollment.getCourse().getTitle());
            data.put("status", enrollment.getStatus());
            data.put("enrollmentDate", enrollment.getEnrollmentDate());
            data.put("startDate", enrollment.getStartDate());
            data.put("endDate", enrollment.getEndDate());
            data.put("notes", enrollment.getNotes());
            enrollmentData.add(data);
        }
        
        return ResponseEntity.ok(enrollmentData);
    }

    @PostMapping("/extras/enrollments")
    public ResponseEntity<Map<String, Object>> createEnrollment(@RequestBody Map<String, Object> enrollmentData) {
        Optional<Student> studentOpt = studentRepository.findById(UUID.fromString(enrollmentData.get("studentId").toString()));
        Optional<ExtraCourse> courseOpt = extraCourseRepository.findById(UUID.fromString(enrollmentData.get("courseId").toString()));
        
        if (studentOpt.isEmpty() || courseOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student or course not found"));
        }
        
        Student student = studentOpt.get();
        ExtraCourse course = courseOpt.get();
        
        // Check if student is already enrolled in this course
        List<Enrollment> existingEnrollments = enrollmentRepository.findByStudentId(student.getId());
        for (Enrollment existing : existingEnrollments) {
            if (existing.getCourse().getId().equals(course.getId()) && 
                existing.getStatus() == Enrollment.EnrollmentStatus.ACTIVE) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student is already enrolled in this course"));
            }
        }
        
        // Check course capacity
        List<Enrollment> activeEnrollments = enrollmentRepository.findByCourseId(course.getId());
        long activeCount = activeEnrollments.stream()
            .filter(e -> e.getStatus() == Enrollment.EnrollmentStatus.ACTIVE)
            .count();
        
        if (activeCount >= course.getCapacity()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Course is at full capacity"));
        }
        
        Enrollment enrollment = Enrollment.builder()
            .student(student)
            .course(course)
            .status(Enrollment.EnrollmentStatus.ACTIVE)
            .enrollmentDate(LocalDate.now())
            .startDate(LocalDate.now())
            .notes((String) enrollmentData.get("notes"))
            .build();
        
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedEnrollment.getId());
        response.put("message", "Student enrolled successfully");
        response.put("enrollment", Map.of(
            "studentName", student.getFirstName() + " " + student.getLastName(),
            "courseTitle", course.getTitle(),
            "status", savedEnrollment.getStatus()
        ));
        
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/extras/enrollments/{id}")
    public ResponseEntity<Map<String, Object>> updateEnrollment(@PathVariable String id, @RequestBody Map<String, Object> updateData) {
        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findById(UUID.fromString(id));
        if (enrollmentOpt.isPresent()) {
            Enrollment enrollment = enrollmentOpt.get();
            
            if (updateData.containsKey("status")) {
                enrollment.setStatus(Enrollment.EnrollmentStatus.valueOf(updateData.get("status").toString()));
            }
            if (updateData.containsKey("notes")) {
                enrollment.setNotes((String) updateData.get("notes"));
            }
            if (updateData.containsKey("endDate")) {
                enrollment.setEndDate(LocalDate.parse(updateData.get("endDate").toString()));
            }
            
            enrollmentRepository.save(enrollment);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Enrollment updated successfully");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
        
    // Users endpoints (for admin)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

}
