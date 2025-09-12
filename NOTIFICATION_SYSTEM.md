# Notification System Documentation

## Overview

The notification system has been implemented to automatically notify admin users when staff members perform certain actions in the system. This ensures that administrators are kept informed of important activities happening in the application.

## Features

### Automatic Notifications
The system automatically creates notifications for the following actions:

1. **New Student Registration** - When a staff member registers a new student
2. **New Extra Student Registration** - When a staff member registers a new extra course student
3. **New Payment Creation** - When a staff member creates a new payment/bill
4. **New Extra Payment Creation** - When a staff member creates a new extra course payment

### Notification Types
- `STUDENT_REGISTERED` - Regular student registration
- `EXTRA_STUDENT_REGISTERED` - Extra course student registration
- `PAYMENT_CREATED` - Regular payment creation
- `EXTRA_PAYMENT_CREATED` - Extra course payment creation
- `SYSTEM_ALERT` - System-wide alerts
- `GENERAL` - General notifications

### Bilingual Support
All notifications support both French and Arabic languages:
- `title` and `titleArabic` fields
- `message` and `messageArabic` fields
- Automatic language selection based on user preference

## Backend Implementation

### Database Schema

#### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    title_arabic VARCHAR(255),
    message TEXT NOT NULL,
    message_arabic TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    created_by_user_id UUID,
    target_user_id UUID,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Key Components

#### 1. Notification Entity (`Notification.java`)
- JPA entity representing notifications in the database
- Includes audit fields and relationships to users
- Supports multiple notification types and statuses

#### 2. Notification Repository (`NotificationRepository.java`)
- Data access layer with custom query methods
- Supports filtering by user, type, and read status
- Includes admin-specific queries

#### 3. Notification Service (`NotificationService.java`)
- Business logic for notification management
- Methods for creating different types of notifications
- User notification retrieval and management

#### 4. Notification Controller (`NotificationController.java`)
- REST API endpoints for notification operations
- Supports pagination and filtering
- Admin-specific endpoints

### API Endpoints

#### User Notifications
- `GET /api/notifications` - Get user notifications (paginated)
- `GET /api/notifications/unread` - Get unread notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

#### Admin Notifications
- `GET /api/notifications/admin` - Get admin notifications (paginated)
- `GET /api/notifications/admin/unread` - Get unread admin notifications
- `GET /api/notifications/admin/unread/count` - Get unread admin count

### Integration Points

The notification system is integrated into the following controllers:

#### DataController
- `POST /api/students` - Triggers student registration notification
- `POST /api/students/extra-course` - Triggers extra student notification
- `POST /api/payments/generate-single` - Triggers payment creation notification

#### ExtraStudentController
- `POST /api/extra-students` - Triggers extra student registration notification

#### ExtraPaymentController
- `POST /api/extra-payments/generate-single` - Triggers extra payment creation notification

### Security Implementation

The notification system uses JWT-based authentication and automatically extracts the current user from the security context:

#### SecurityUtils Component
- `getCurrentUser()` - Gets the current authenticated user
- `getCurrentUserId()` - Gets the current user's ID
- `hasRole()` - Checks if user has specific role
- `isAdmin()` - Checks if user is admin (OWNER role)
- `isStaff()` - Checks if user is staff

#### Authentication Flow
1. User logs in and receives JWT token
2. Frontend includes JWT token in Authorization header
3. Backend JWT filter validates token and sets security context
4. Controllers use SecurityUtils to get current user automatically
5. No need for frontend to send user ID in headers

## Frontend Implementation

### Notification Service (`notificationService.ts`)
- TypeScript service for API communication
- Handles all notification-related API calls
- Provides type-safe interfaces

### TopBar Component Updates
- Real-time notification display
- Unread notification count badge
- Mark as read functionality
- Bilingual notification display
- Loading states and error handling

### Features
- **Real-time Updates**: Notifications are fetched when the component mounts
- **Bilingual Display**: Shows notifications in user's preferred language
- **Interactive**: Click to mark as read, mark all as read
- **Visual Indicators**: Unread notifications have visual indicators
- **Responsive Design**: Works on all screen sizes

## Usage

### For Staff Members
1. Perform actions (register students, create payments)
2. Notifications are automatically sent to admin users
3. No additional action required

### For Admin Users
1. Check the notification bell icon in the top bar
2. View unread notification count
3. Click on notifications to mark as read
4. Use "Mark all as read" to clear all notifications

### For Developers
1. Add notification triggers to new controllers
2. Use `NotificationService` methods to create notifications
3. Ensure proper user context is passed via `X-User-Id` header

## Testing

### Manual Testing
1. Start both backend and frontend servers
2. Login as a staff member
3. Register a new student or create a payment
4. Login as an admin user
5. Check the notification bell icon
6. Verify notifications appear correctly

### Test Script
Use the provided `test-notification-system.bat` script to start both servers for testing.

## Configuration

### Database Migration
The notification system requires database migration `V10__Create_notifications_table.sql` to be applied.

### Environment Variables
No additional environment variables are required. The system uses existing database and authentication configurations.

## Security Considerations

1. **User Context**: All notification creation requires valid user context via `X-User-Id` header
2. **Authorization**: Only admin users receive notifications for staff actions
3. **Data Privacy**: Notifications contain minimal information and are scoped to appropriate users
4. **Audit Trail**: All notifications include creation timestamp and user information

## Future Enhancements

### Potential Improvements
1. **Real-time Updates**: WebSocket integration for instant notifications
2. **Email Notifications**: Send email alerts for critical notifications
3. **Push Notifications**: Browser push notification support
4. **Notification Preferences**: User-configurable notification settings
5. **Notification Categories**: Group notifications by type or importance
6. **Bulk Operations**: Bulk notification management
7. **Notification History**: Extended notification retention and search

### Scalability Considerations
1. **Pagination**: All notification endpoints support pagination
2. **Cleanup**: Automatic cleanup of old notifications (30+ days)
3. **Indexing**: Database indexes for optimal query performance
4. **Caching**: Consider Redis caching for frequently accessed notifications

## Troubleshooting

### Common Issues
1. **Notifications not appearing**: Check user role and authentication
2. **Database errors**: Ensure migration V10 has been applied
3. **API errors**: Verify `X-User-Id` header is being sent
4. **Frontend errors**: Check browser console for API call errors

### Debug Information
- Check backend logs for notification creation errors
- Verify database has notifications table and data
- Test API endpoints directly using tools like Postman
- Check frontend network tab for failed API calls

## Conclusion

The notification system provides a comprehensive solution for keeping admin users informed of important activities in the Linarqaa application. It's designed to be scalable, secure, and user-friendly while supporting the bilingual nature of the application.
