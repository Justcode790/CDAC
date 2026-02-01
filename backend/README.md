# SUVIDHA 2026 - Backend API

## Architecture Overview

This backend follows a clean, scalable architecture pattern:

```
Request → Routes → Middleware → Controllers → Models → Database
                                    ↓
                              Utils (JWT, Cloudinary, etc.)
```

## Key Components

### 1. Models (Mongoose Schemas)
- **User.js**: Handles all user types (Citizen, Officer, Admin)
- **Department.js**: Government departments
- **SubDepartment.js**: Sub-departments within departments
- **Complaint.js**: Citizen complaints and service requests
- **AuditLog.js**: System activity audit trail

### 2. Controllers
Each controller handles business logic for its domain:
- Input validation
- Database operations
- Error handling
- Audit logging

### 3. Middleware
- **auth.js**: JWT authentication and role-based authorization
- **officerAccess.js**: Ensures officers only access their sub-department data
- **upload.js**: File upload handling with Multer

### 4. Routes
RESTful API endpoints organized by resource:
- `/api/auth` - Authentication
- `/api/departments` - Department management
- `/api/subdepartments` - Sub-department management
- `/api/officers` - Officer management
- `/api/complaints` - Complaint management

### 5. Utils
- **jwt.js**: Token generation and verification
- **cloudinary.js**: File upload to Cloudinary
- **auditLogger.js**: Audit log creation
- **generateComplaintNumber.js**: Unique complaint number generation

## Security Features

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control (PUBLIC, OFFICER, ADMIN)
3. **Password Security**: bcrypt hashing
4. **Rate Limiting**: Prevents abuse
5. **Input Validation**: Request validation
6. **Access Control**: Officers restricted to their sub-department

## File Upload Flow

1. Frontend sends file(s) via multipart/form-data
2. Multer middleware processes files (memory storage)
3. Files uploaded to Cloudinary
4. Secure URLs stored in MongoDB
5. Public IDs stored for future deletion if needed

## Error Handling

- Consistent error response format
- Proper HTTP status codes
- Error logging for debugging
- User-friendly error messages

## Audit Logging

All critical actions are logged:
- User logins/logouts
- Complaint creation/updates
- Department/Sub-department changes
- Officer assignments
- File uploads

## Next Steps

1. Add input validation middleware (express-validator)
2. Add request logging middleware
3. Implement pagination helpers
4. Add API documentation (Swagger)
5. Add unit tests
6. Add integration tests
