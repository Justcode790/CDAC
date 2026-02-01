# SUVIDHA 2026 - Backend Architecture Documentation

## 🏛️ System Architecture

### Overview
SUVIDHA 2026 backend is built following **MVC (Model-View-Controller)** architecture with clear separation of concerns:

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────┐
│         Express Server              │
│  ┌───────────────────────────────┐  │
│  │   Middleware Layer            │  │
│  │  - Authentication (JWT)       │  │
│  │  - Authorization (Roles)      │  │
│  │  - File Upload (Multer)       │  │
│  │  - Rate Limiting             │  │
│  └──────────────┬────────────────┘  │
│                 ▼                    │
│  ┌───────────────────────────────┐  │
│  │      Routes Layer             │  │
│  │  - /api/auth                  │  │
│  │  - /api/departments           │  │
│  │  - /api/subdepartments        │  │
│  │  - /api/officers              │  │
│  │  - /api/complaints            │  │
│  └──────────────┬────────────────┘  │
│                 ▼                    │
│  ┌───────────────────────────────┐  │
│  │    Controllers Layer          │  │
│  │  - Business Logic             │  │
│  │  - Validation                 │  │
│  │  - Error Handling             │  │
│  └──────────────┬────────────────┘  │
│                 ▼                    │
│  ┌───────────────────────────────┐  │
│  │      Models Layer             │  │
│  │  - Mongoose Schemas           │  │
│  │  - Data Validation            │  │
│  └──────────────┬────────────────┘  │
└─────────────────┼────────────────────┘
                  ▼
         ┌─────────────────┐
         │    MongoDB      │
         │   Database      │
         └─────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   Cloudinary    │
         │  File Storage   │
         └─────────────────┘
```

## 📦 Component Details

### 1. Models (Data Layer)

#### User Model
**Purpose**: Single schema for all user types (Citizen, Officer, Admin)

**Key Features**:
- Role-based fields (sparse indexes for optional fields)
- Password hashing for Officer/Admin (bcrypt)
- OTP generation/verification for Citizens
- Virtual properties for role checking

**Indexes**:
- `mobileNumber` + `role` (for citizen lookup)
- `officerId` + `role` (for officer lookup)
- `assignedSubDepartment` (for officer filtering)

#### Department Model
**Purpose**: Government departments

**Key Features**:
- Unique code and name
- Soft delete (isActive flag)
- Virtual counts for sub-departments and officers

#### SubDepartment Model
**Purpose**: Sub-departments within departments

**Key Features**:
- Belongs to exactly one department
- Compound unique index (code + department)
- Virtual counts for officers and complaints

#### Complaint Model
**Purpose**: Citizen complaints and service requests

**Key Features**:
- Auto-generated complaint numbers (SUV{YYYY}{6-digit})
- Status workflow: PENDING → IN_PROGRESS → RESOLVED/REJECTED
- Document storage (Cloudinary URLs)
- Remarks tracking
- Location support (address, lat/lng)

**Indexes**:
- `citizen` + `createdAt` (for citizen's complaints)
- `subDepartment` + `status` (for officer filtering)
- `complaintNumber` (unique)

#### AuditLog Model
**Purpose**: System activity audit trail

**Key Features**:
- Tracks all critical actions
- Includes user, IP, user agent
- Flexible details field (Mixed type)
- Time-based queries optimized

### 2. Controllers (Business Logic Layer)

Each controller follows this pattern:
1. **Input Validation**: Check required fields
2. **Authorization Check**: Verify user permissions
3. **Business Logic**: Process the request
4. **Database Operations**: CRUD operations
5. **Audit Logging**: Log critical actions
6. **Response**: Return formatted response

**Error Handling**:
- Consistent error response format
- Proper HTTP status codes
- User-friendly error messages
- Detailed logging for debugging

### 3. Middleware (Security & Processing Layer)

#### Authentication Middleware (`auth.js`)
- Verifies JWT tokens
- Attaches user to request object
- Role-based authorization helpers

#### Officer Access Control (`officerAccess.js`)
- **Critical Security**: Ensures officers only access their sub-department data
- Applied to complaint routes
- Prevents data leakage between departments

#### Upload Middleware (`upload.js`)
- Multer configuration
- File type validation
- Size limits (10MB per file, 5 files max)
- Memory storage (files uploaded directly to Cloudinary)

### 4. Routes (API Endpoints Layer)

**RESTful Design**:
- Clear resource naming
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent response formats
- Proper status codes

**Route Protection**:
- Public routes: Citizen registration, OTP verification
- Protected routes: All other endpoints
- Role-specific routes: Admin-only, Officer-only, etc.

### 5. Utilities (Helper Functions)

#### JWT Utility (`jwt.js`)
- Token generation with user info
- Token verification
- Token decoding

#### Cloudinary Utility (`cloudinary.js`)
- File upload to Cloudinary
- File deletion
- Batch upload support
- Error handling

#### Audit Logger (`auditLogger.js`)
- Centralized audit log creation
- Helper functions for common actions
- Non-blocking (doesn't break main flow on error)

#### Complaint Number Generator (`generateComplaintNumber.js`)
- Generates unique complaint numbers
- Year-based sequence
- Fallback mechanism

## 🔒 Security Architecture

### Authentication Flow

```
Citizen:
Mobile → Register → OTP Generated → OTP Sent → Verify OTP → JWT Token

Officer:
Officer ID + Password → Verify → JWT Token

Admin:
Email + Password → Verify → JWT Token
```

### Authorization Flow

```
Request → JWT Verification → Role Check → Access Control → Controller
                                    │
                                    ▼
                          Officer? → Sub-Department Check
```

### Access Control Matrix

| Action | PUBLIC | OFFICER | ADMIN |
|--------|--------|---------|-------|
| Create Complaint | ✅ Own | ❌ | ✅ All |
| View Complaints | ✅ Own | ✅ Sub-Dept | ✅ All |
| Update Complaint | ❌ | ✅ Sub-Dept | ✅ All |
| Create Department | ❌ | ❌ | ✅ |
| Create Officer | ❌ | ❌ | ✅ |
| Assign Officer | ❌ | ❌ | ✅ |

## 📊 Data Flow Examples

### Complaint Creation Flow

```
1. Citizen sends POST /api/complaints with files
2. Authentication middleware verifies JWT
3. Authorization middleware checks role (PUBLIC)
4. Upload middleware processes files
5. Controller validates input
6. Files uploaded to Cloudinary
7. Complaint created in MongoDB with Cloudinary URLs
8. Audit log created
9. Response sent to client
```

### Officer Complaint Access Flow

```
1. Officer requests GET /api/complaints/:id
2. Authentication middleware verifies JWT
3. Authorization middleware checks role (OFFICER)
4. Officer access middleware checks sub-department match
5. Controller fetches complaint
6. Response sent (only if sub-department matches)
```

## 🗄️ Database Design

### Relationships

```
Department (1) ──< (Many) SubDepartment
SubDepartment (1) ──< (Many) User (Officer)
SubDepartment (1) ──< (Many) Complaint
User (Citizen) (1) ──< (Many) Complaint
Complaint (1) ──< (Many) AuditLog
```

### Indexing Strategy

**Performance Indexes**:
- User lookups: `mobileNumber`, `officerId`
- Complaint filtering: `citizen + createdAt`, `subDepartment + status`
- Text search: `title`, `description`, `name`

**Unique Constraints**:
- User: `mobileNumber + role`, `officerId + role`
- Department: `code`, `name`
- SubDepartment: `code + department`
- Complaint: `complaintNumber`

## 🚀 Scalability Considerations

### Current Architecture Supports:
- ✅ Horizontal scaling (stateless JWT)
- ✅ Database indexing for performance
- ✅ Cloudinary for file storage (CDN)
- ✅ Rate limiting for abuse prevention
- ✅ Connection pooling (Mongoose)

### Future Enhancements:
- Redis for session management
- Message queue for async tasks
- Caching layer for frequently accessed data
- Database sharding for large datasets
- Load balancing configuration

## 🔍 Monitoring & Logging

### Current Implementation:
- Morgan for HTTP request logging
- Console logging for errors
- Audit logs for critical actions

### Recommended Additions:
- Winston for structured logging
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Database query logging
- API analytics

## 📝 Code Quality

### Standards Followed:
- ✅ ES6+ JavaScript (ES Modules)
- ✅ Consistent naming conventions
- ✅ Comprehensive comments
- ✅ Error handling
- ✅ Input validation
- ✅ Security best practices

### Best Practices:
- Separation of concerns
- DRY (Don't Repeat Yourself)
- Single Responsibility Principle
- Fail-safe error handling
- Non-blocking audit logging

---

**This architecture is production-ready and follows industry best practices for government-grade applications.**
