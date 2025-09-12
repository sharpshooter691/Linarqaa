# ExtraStudent Service Documentation

## Overview

The ExtraStudent service is a comprehensive backend service for managing extra course students in the Linarqaa educational system. It provides full CRUD operations, photo management, bulk operations, and advanced filtering capabilities.

## Architecture

The service follows a layered architecture pattern:

```
Controller Layer (ExtraStudentController)
    ↓
Service Layer (ExtraStudentService)
    ↓
Repository Layer (ExtraStudentRepository)
    ↓
Entity Layer (ExtraStudent)
```

## Components

### 1. Entity (ExtraStudent.java)
- **Location**: `src/main/java/com/linarqa/entity/ExtraStudent.java`
- **Purpose**: JPA entity representing extra students in the database
- **Key Features**:
  - UUID-based primary key
  - Bilingual support (French/Arabic names)
  - Photo management
  - Status tracking (ACTIVE/INACTIVE)
  - Audit fields (createdAt, updatedAt)

### 2. DTOs
- **ExtraStudentDto.java**: Data transfer object for API responses
- **ExtraStudentRequest.java**: Request object for create/update operations

### 3. Repository (ExtraStudentRepository.java)
- **Location**: `src/main/java/com/linarqa/repository/ExtraStudentRepository.java`
- **Purpose**: Data access layer with custom query methods
- **Features**:
  - Status-based filtering
  - Search functionality
  - Combined status and search queries

### 4. Service (ExtraStudentService.java)
- **Location**: `src/main/java/com/linarqa/service/ExtraStudentService.java`
- **Purpose**: Business logic layer with validation and file management
- **Features**:
  - CRUD operations
  - Photo upload/management
  - Bulk operations
  - Statistics and analytics
  - Data validation

### 5. Controller (ExtraStudentController.java)
- **Location**: `src/main/java/com/linarqa/controller/ExtraStudentController.java`
- **Purpose**: REST API endpoints for client communication
- **Features**:
  - RESTful design
  - Comprehensive error handling
  - File upload support
  - Cross-origin support

## API Endpoints

### Base URL
```
/api/extra-students
```

### Core CRUD Operations

#### 1. Get All Students
```http
GET /api/extra-students
```

**Query Parameters:**
- `page` (default: 0): Page number for pagination
- `size` (default: 10): Number of items per page
- `sortBy` (default: "createdAt"): Field to sort by
- `sortDir` (default: "desc"): Sort direction (asc/desc)

**Response:**
```json
{
  "content": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "firstNameArabic": "جون",
      "lastNameArabic": "دو",
      "birthDate": "2010-05-15",
      "photoUrl": "/uploads/extra-students/photo.jpg",
      "responsibleName": "Jane Doe",
      "responsibleNameArabic": "جين دو",
      "responsiblePhone": "+212612345678",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ],
  "totalElements": 25,
  "totalPages": 3,
  "currentPage": 0,
  "size": 10
}
```

#### 2. Get Student by ID
```http
GET /api/extra-students/{id}
```

#### 3. Create Student
```http
POST /api/extra-students
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "firstNameArabic": "جون",
  "lastNameArabic": "دو",
  "birthDate": "2010-05-15",
  "responsibleName": "Jane Doe",
  "responsibleNameArabic": "جين دو",
  "responsiblePhone": "+212612345678",
  "status": "ACTIVE"
}
```

#### 4. Update Student
```http
PUT /api/extra-students/{id}
```

#### 5. Delete Student
```http
DELETE /api/extra-students/{id}
```

### Advanced Operations

#### 6. Get Students by Status
```http
GET /api/extra-students/status/{status}
```

**Status Values:** `ACTIVE`, `INACTIVE`

#### 7. Search Students
```http
GET /api/extra-students/search?q={searchTerm}
```

**Search Fields:** firstName, lastName, firstNameArabic, lastNameArabic, responsibleName, responsiblePhone

#### 8. Filter by Status and Search
```http
GET /api/extra-students/filter?status={status}&search={searchTerm}
```

### Photo Management

#### 9. Update Photo URL
```http
PATCH /api/extra-students/{id}/photo
```

**Request Body:**
```json
{
  "photoUrl": "https://example.com/photo.jpg"
}
```

#### 10. Upload Photo File
```http
POST /api/extra-students/{id}/upload-photo
```

**Content-Type:** `multipart/form-data`
**Form Data:** `file` (image file)

#### 11. Upload Photo from Camera
```http
POST /api/extra-students/{id}/upload-camera-photo
```

**Request Body:**
```json
{
  "base64Data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

### Bulk Operations

#### 12. Bulk Update Status
```http
PATCH /api/extra-students/bulk-status
```

**Request Body:**
```json
{
  "studentIds": ["uuid1", "uuid2", "uuid3"],
  "status": "INACTIVE"
}
```

#### 13. Bulk Delete
```http
DELETE /api/extra-students/bulk-delete
```

**Request Body:**
```json
{
  "studentIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Analytics and Reporting

#### 14. Get Students by Date Range
```http
GET /api/extra-students/date-range?startDate=2024-01-01&endDate=2024-01-31
```

#### 15. Get Statistics
```http
GET /api/extra-students/statistics
```

**Response:**
```json
{
  "totalStudents": 150,
  "activeStudents": 120,
  "inactiveStudents": 30,
  "recentRegistrations": 15
}
```

#### 16. Export Students
```http
GET /api/extra-students/export?format=csv&status=ACTIVE&search=john
```

**Formats:** `csv`, `excel` (placeholder implementation)

### Utility Endpoints

#### 17. Health Check
```http
GET /api/extra-students/health
```

## Data Validation

### Student Age Validation
- Minimum age: 3 years
- Maximum age: 25 years
- Calculated from birth date

### Phone Number Validation
- Supports Moroccan phone number formats:
  - `+212612345678`
  - `0612345678`
  - `612345678`

### Required Fields
- firstName
- lastName
- birthDate
- responsibleName
- responsiblePhone

## File Management

### Photo Storage
- **Directory**: `uploads/extra-students/`
- **Naming Convention**: `{studentId}_{timestamp}.{extension}`
- **Supported Formats**: JPEG, PNG, WebP
- **File Cleanup**: Old photos are automatically deleted when updated

### File Operations
- Automatic directory creation
- Unique filename generation
- Old file cleanup
- Error handling for file operations

## Error Handling

### HTTP Status Codes
- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `204 No Content`: Resource deleted successfully
- `400 Bad Request`: Validation error or invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

### Error Response Format
```json
{
  "error": "Error message description"
}
```

## Business Rules

### Student Status Management
- New students default to `ACTIVE` status
- Status can be changed to `INACTIVE` for departed students
- Bulk status updates supported

### Data Integrity
- Automatic timestamp updates on modifications
- Photo cleanup on student deletion
- Validation before database operations

### Search and Filtering
- Case-insensitive search
- Multi-field search support
- Combined filtering capabilities
- Pagination for large datasets

## Usage Examples

### Frontend Integration

#### Fetching Students with Pagination
```javascript
const response = await fetch('/api/extra-students?page=0&size=20&sortBy=firstName&sortDir=asc');
const data = await response.json();
```

#### Creating a New Student
```javascript
const studentData = {
  firstName: "Ahmed",
  lastName: "Benali",
  firstNameArabic: "أحمد",
  lastNameArabic: "بن علي",
  birthDate: "2012-03-15",
  responsibleName: "Fatima Benali",
  responsibleNameArabic: "فاطمة بن علي",
  responsiblePhone: "+212612345678"
};

const response = await fetch('/api/extra-students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(studentData)
});
```

#### Uploading a Photo
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(`/api/extra-students/${studentId}/upload-photo`, {
  method: 'POST',
  body: formData
});
```

### Backend Integration

#### Service Injection
```java
@Autowired
private ExtraStudentService extraStudentService;

// Create student
ExtraStudentRequest request = new ExtraStudentRequest();
// ... set properties
ExtraStudentDto student = extraStudentService.createExtraStudent(request);

// Get statistics
ExtraStudentService.StudentStatistics stats = extraStudentService.getStudentStatistics();
```

## Configuration

### Database
- **Table**: `extra_students`
- **Primary Key**: UUID
- **Indexes**: status, created_at, responsible_phone

### File Storage
- **Base Directory**: `uploads/extra-students/`
- **Max File Size**: Configured in Spring Boot properties
- **Allowed Types**: Configured in Spring Boot properties

## Security Considerations

### Input Validation
- All inputs are validated before processing
- SQL injection protection through JPA
- File type validation for uploads

### CORS Configuration
- Cross-origin requests enabled for development
- Configure appropriately for production

### Error Information
- Detailed error messages for debugging
- Sanitized error responses for production

## Performance Considerations

### Pagination
- Large datasets are paginated by default
- Configurable page sizes
- Efficient database queries

### Caching
- Consider implementing Redis caching for frequently accessed data
- Cache statistics and search results

### Database Optimization
- Use appropriate indexes
- Consider query optimization for large datasets

## Monitoring and Health

### Health Endpoint
- Service status monitoring
- Database connectivity check
- File system access verification

### Logging
- Comprehensive error logging
- Operation audit trails
- Performance metrics

## Future Enhancements

### Planned Features
- Advanced reporting and analytics
- Email notifications
- Integration with payment systems
- Student attendance tracking
- Course enrollment management

### Export Functionality
- CSV export implementation
- Excel export with formatting
- PDF report generation
- Scheduled report delivery

## Troubleshooting

### Common Issues

#### 1. Photo Upload Failures
- Check file permissions on upload directory
- Verify file size limits
- Ensure supported file formats

#### 2. Validation Errors
- Review required field values
- Check phone number format
- Verify age requirements

#### 3. Database Connection Issues
- Check database configuration
- Verify connection pool settings
- Review database logs

### Debug Mode
Enable debug logging in `application.yml`:
```yaml
logging:
  level:
    com.linarqa: DEBUG
```

## Support and Maintenance

### Code Quality
- Comprehensive unit tests
- Integration test coverage
- Code review process
- Documentation maintenance

### Updates and Patches
- Regular security updates
- Performance optimizations
- Feature enhancements
- Bug fixes

---

For additional support or questions, please refer to the main project documentation or contact the development team.
