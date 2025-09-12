# ExtraStudent Enrollment Service Documentation

## Overview

The ExtraStudent Enrollment service is a comprehensive backend service for managing enrollments of extra students in extra courses. It provides full CRUD operations, status management, and enrollment tracking capabilities.

## Architecture

The service follows a layered architecture pattern:

```
Controller Layer (ExtraStudentEnrollmentController)
    ↓
Service Layer (ExtraStudentEnrollmentService)
    ↓
Repository Layer (ExtraStudentEnrollmentRepository)
    ↓
Entity Layer (ExtraStudentEnrollment)
```

## Components

### 1. Entity (ExtraStudentEnrollment.java)
- **Location**: `src/main/java/com/linarqa/entity/ExtraStudentEnrollment.java`
- **Purpose**: JPA entity representing extra student enrollments in the database
- **Key Features**:
  - UUID-based primary key
  - Many-to-one relationships with ExtraStudent and ExtraCourse
  - Status tracking (ACTIVE, INACTIVE, COMPLETED, CANCELLED)
  - Date tracking (enrollment, start, end)
  - Notes field for additional information
  - Audit fields (createdAt, updatedAt)

### 2. DTOs
- **ExtraStudentEnrollmentDto.java**: Data transfer object for API responses
- **ExtraStudentEnrollmentRequest.java**: Request object for create operations

### 3. Repository (ExtraStudentEnrollmentRepository.java)
- **Location**: `src/main/java/com/linarqa/repository/ExtraStudentEnrollmentRepository.java`
- **Purpose**: Data access layer with custom query methods
- **Features**:
  - Status-based filtering
  - Student and course-based queries
  - Duplicate prevention queries

### 4. Service (ExtraStudentEnrollmentService.java)
- **Location**: `src/main/java/com/linarqa/service/ExtraStudentEnrollmentService.java`
- **Purpose**: Business logic layer with validation and enrollment management
- **Features**:
  - CRUD operations
  - Duplicate enrollment prevention
  - Course capacity validation
  - Status management
  - Enrollment counting

### 5. Controller (ExtraStudentEnrollmentController.java)
- **Location**: `src/main/java/com/linarqa/controller/ExtraStudentEnrollmentController.java`
- **Purpose**: REST API endpoints for client communication
- **Features**:
  - RESTful design
  - Comprehensive error handling
  - Status and notes updates
  - Enrollment counting endpoints

## API Endpoints

### Base URL
```
/api/extra-students/enrollments
```

### Core CRUD Operations

#### 1. Get All Enrollments
```http
GET /api/extra-students/enrollments
```

**Response:**
```json
[
  {
    "id": "uuid",
    "extraStudentId": "uuid",
    "extraStudentName": "John Doe",
    "extraStudentNameArabic": "جون دو",
    "courseId": "uuid",
    "courseTitle": "Art Club",
    "courseDescription": "Artistic activities for teenagers",
    "status": "ACTIVE",
    "enrollmentDate": "2024-01-15",
    "startDate": "2024-01-15",
    "endDate": null,
    "notes": "Student interested in painting",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

#### 2. Get Enrollments by Course ID
```http
GET /api/extra-students/enrollments/course/{courseId}
```

#### 3. Get Enrollments by Extra Student ID
```http
GET /api/extra-students/enrollments/student/{extraStudentId}
```

#### 4. Get Enrollments by Status
```http
GET /api/extra-students/enrollments/status/{status}
```

**Status Values:** `ACTIVE`, `INACTIVE`, `COMPLETED`, `CANCELLED`

#### 5. Get Enrollment by ID
```http
GET /api/extra-students/enrollments/{id}
```

#### 6. Create Enrollment
```http
POST /api/extra-students/enrollments
```

**Request Body:**
```json
{
  "extraStudentId": "uuid",
  "courseId": "uuid",
  "notes": "Student interested in painting",
  "startDate": "2024-01-15",
  "endDate": null
}
```

#### 7. Update Enrollment Status
```http
PATCH /api/extra-students/enrollments/{id}/status
```

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

#### 8. Update Enrollment Notes
```http
PATCH /api/extra-students/enrollments/{id}/notes
```

**Request Body:**
```json
{
  "notes": "Updated notes about the student"
}
```

#### 9. Delete Enrollment
```http
DELETE /api/extra-students/enrollments/{id}
```

### Analytics and Reporting

#### 10. Get Active Enrollments Count for Course
```http
GET /api/extra-students/enrollments/course/{courseId}/active-count
```

**Response:**
```json
{
  "activeEnrollmentsCount": 15
}
```

#### 11. Get Active Enrollments Count for Extra Student
```http
GET /api/extra-students/enrollments/student/{extraStudentId}/active-count
```

**Response:**
```json
{
  "activeEnrollmentsCount": 3
}
```

### Utility Endpoints

#### 12. Health Check
```http
GET /api/extra-students/enrollments/health
```

**Response:**
```json
{
  "status": "OK",
  "service": "ExtraStudentEnrollmentService"
}
```

## Database Schema

### Table: extra_student_enrollments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| extra_student_id | UUID | NOT NULL, FK | Reference to extra_students table |
| course_id | UUID | NOT NULL, FK | Reference to extra_courses table |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Enrollment status |
| enrollment_date | DATE | NOT NULL | Date of enrollment |
| start_date | DATE | NULL | Course start date |
| end_date | DATE | NULL | Course end date |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

### Indexes
- `idx_extra_student_enrollments_student_id` on `extra_student_id`
- `idx_extra_student_enrollments_course_id` on `course_id`
- `idx_extra_student_enrollments_status` on `status`
- `idx_extra_student_enrollments_enrollment_date` on `enrollment_date`

### Constraints
- Foreign key to `extra_students(id)` with CASCADE DELETE
- Foreign key to `extra_courses(id)` with CASCADE DELETE
- Unique constraint on `(extra_student_id, course_id, status)` to prevent duplicate active enrollments

## Business Rules

### Enrollment Creation
1. **Validation**: Extra student and course must exist
2. **Duplicate Prevention**: Student cannot be enrolled in the same course with ACTIVE status
3. **Capacity Check**: Course must have available capacity
4. **Default Values**: Status defaults to ACTIVE, enrollment_date defaults to current date

### Status Management
- **ACTIVE**: Student is currently enrolled and participating
- **INACTIVE**: Enrollment is temporarily suspended
- **COMPLETED**: Course has been completed successfully
- **CANCELLED**: Enrollment was cancelled

### Capacity Management
- System automatically checks course capacity before enrollment
- Only ACTIVE enrollments count toward capacity
- Capacity is enforced at enrollment creation time

## Integration Points

### Frontend Integration
- **ExtraCoursesPage**: Uses enrollment endpoints for student affiliation
- **Student Selection**: Displays available extra students for enrollment
- **Course Management**: Shows enrollment counts and manages capacity

### Backend Integration
- **ExtraStudent Service**: Provides student information
- **ExtraCourse Service**: Provides course information and capacity
- **Database**: Uses Flyway migrations for schema management

## Error Handling

### Common Error Scenarios
1. **Student Not Found**: Returns 400 Bad Request with error message
2. **Course Not Found**: Returns 400 Bad Request with error message
3. **Duplicate Enrollment**: Returns 400 Bad Request with error message
4. **Capacity Exceeded**: Returns 400 Bad Request with error message
5. **Invalid Status**: Returns 400 Bad Request with error message

### Error Response Format
```json
{
  "error": "Detailed error message"
}
```

## Security Considerations

- **CORS**: Configured to allow cross-origin requests
- **Input Validation**: All inputs are validated before processing
- **SQL Injection**: Protected through JPA/Hibernate
- **UUID Usage**: Uses UUIDs for all identifiers to prevent enumeration attacks

## Performance Considerations

- **Indexes**: Strategic indexes on frequently queried columns
- **Lazy Loading**: Uses LAZY fetch for entity relationships
- **Batch Operations**: Repository methods support efficient querying
- **Connection Pooling**: Leverages Spring Boot's default connection pooling

## Future Enhancements

1. **Bulk Operations**: Support for enrolling multiple students at once
2. **Advanced Filtering**: Date range, status combinations, search terms
3. **Reporting**: Enrollment statistics and analytics
4. **Notifications**: Email/SMS notifications for enrollment events
5. **Audit Trail**: Detailed tracking of all enrollment changes










