# SUVIDHA 2026 - Backend Setup Guide

## ✅ Backend Architecture Complete

The production-ready backend has been successfully created with the following structure:

### 📁 Folder Structure

```
backend/
├── config/
│   └── database.js          ✅ MongoDB connection with retry logic
├── controllers/
│   ├── authController.js    ✅ Citizen, Officer, Admin authentication
│   ├── departmentController.js ✅ Department CRUD
│   ├── subDepartmentController.js ✅ Sub-department CRUD
│   ├── officerController.js ✅ Officer management & assignment
│   └── complaintController.js ✅ Complaint CRUD with file upload
├── middleware/
│   ├── auth.js              ✅ JWT auth & role-based authorization
│   ├── officerAccess.js     ✅ Officer sub-department access control
│   └── upload.js            ✅ Multer file upload handler
├── models/
│   ├── User.js              ✅ Multi-role user schema
│   ├── Department.js        ✅ Department schema
│   ├── SubDepartment.js     ✅ Sub-department schema
│   ├── Complaint.js         ✅ Complaint schema with auto-numbering
│   └── AuditLog.js          ✅ Audit trail schema
├── routes/
│   ├── authRoutes.js        ✅ Authentication endpoints
│   ├── departmentRoutes.js  ✅ Department endpoints
│   ├── subDepartmentRoutes.js ✅ Sub-department endpoints
│   ├── officerRoutes.js     ✅ Officer endpoints
│   └── complaintRoutes.js   ✅ Complaint endpoints
├── utils/
│   ├── jwt.js               ✅ JWT token generation
│   ├── cloudinary.js        ✅ Cloudinary file upload
│   ├── auditLogger.js       ✅ Audit logging utilities
│   └── generateComplaintNumber.js ✅ Complaint number generator
├── app.js                   ✅ Express app configuration
└── server.js                ✅ Server entry point
```

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/suvidha2026
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**
- Create account at https://www.mongodb.com/cloud/atlas
- Create cluster and get connection string
- Update `MONGODB_URI` in `.env`

### Step 4: Setup Cloudinary

1. Create account at https://cloudinary.com
2. Get your credentials from Dashboard
3. Update `.env` with Cloudinary credentials

### Step 5: Run Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

### Step 6: Verify

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SUVIDHA 2026 API is running",
  "timestamp": "2026-01-26T..."
}
```

## 📋 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /citizen/register` - Register citizen
- `POST /citizen/verify-otp` - Verify OTP & login
- `POST /citizen/resend-otp` - Resend OTP
- `POST /officer/login` - Officer login
- `POST /admin/login` - Admin login
- `GET /me` - Get current user (protected)
- `POST /logout` - Logout (protected)

### Departments (`/api/departments`) - ADMIN only
- `POST /` - Create department
- `GET /` - Get all departments
- `GET /:id` - Get department by ID
- `PUT /:id` - Update department
- `DELETE /:id` - Delete department (soft)

### Sub-Departments (`/api/subdepartments`) - ADMIN only
- `POST /` - Create sub-department
- `GET /` - Get all sub-departments
- `GET /:id` - Get sub-department by ID
- `PUT /:id` - Update sub-department
- `DELETE /:id` - Delete sub-department (soft)

### Officers (`/api/officers`) - ADMIN only
- `POST /` - Create officer
- `GET /` - Get all officers
- `GET /:id` - Get officer by ID
- `PUT /:id` - Update officer
- `PUT /:id/assign` - Assign officer to sub-department
- `PUT /:id/deactivate` - Deactivate officer

### Complaints (`/api/complaints`)
- `POST /` - Create complaint (Citizen only)
- `GET /` - Get complaints (role-based filtering)
- `GET /:id` - Get complaint by ID
- `PUT /:id` - Update complaint (Officer/Admin)
- `POST /:id/documents` - Add documents (Citizen)
- `GET /:id/receipt` - Download receipt (Citizen)

## 🔐 User Roles & Access

### PUBLIC (Citizen)
- ✅ Register/Login via mobile + OTP
- ✅ Create complaints with documents
- ✅ View own complaints
- ✅ Download receipts
- ❌ Cannot update complaints (only add remarks)

### OFFICER
- ✅ Login via Officer ID + Password
- ✅ View complaints from assigned sub-department ONLY
- ✅ Update complaint status
- ✅ Add remarks
- ✅ Assign complaints to themselves
- ❌ Cannot access other sub-departments

### ADMIN
- ✅ Login via Email + Password
- ✅ Full system access
- ✅ Create/Manage Departments
- ✅ Create/Manage Sub-Departments
- ✅ Create/Manage Officers
- ✅ Assign officers to sub-departments
- ✅ View all complaints
- ✅ Access audit logs

## 🧪 Testing the API

### 1. Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### 2. Register a Citizen
```bash
curl -X POST http://localhost:5000/api/auth/citizen/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210",
    "name": "John Doe"
  }'
```

### 3. Create an Admin User (via MongoDB)
```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  role: "ADMIN",
  adminEmail: "admin@example.com",
  adminName: "System Admin",
  password: "$2a$10$..." // Use bcrypt to hash password
})
```

Or use a script to create admin (recommended for development).

## 📝 Important Notes

1. **OTP in Development**: In development mode, OTP is returned in response. Remove this in production.

2. **Password Hashing**: Passwords are automatically hashed using bcrypt before saving.

3. **Complaint Numbers**: Auto-generated in format `SUV{YYYY}{6-digit}` (e.g., SUV2026000001)

4. **File Upload**: Files are uploaded to Cloudinary and secure URLs stored in MongoDB.

5. **Audit Logging**: All critical actions are logged automatically.

6. **Access Control**: Officers can ONLY access complaints from their assigned sub-department.

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### Cloudinary Upload Error
- Verify Cloudinary credentials in `.env`
- Check file size (max 10MB)
- Verify file format (jpg, png, pdf, doc, docx)

### JWT Token Error
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration
- Verify Authorization header format: `Bearer <token>`

## 🎯 Next Steps

1. ✅ Backend architecture - **COMPLETE**
2. ⏳ Create admin user script
3. ⏳ Frontend implementation (React)
4. ⏳ AI integration (final phase)
5. ⏳ Testing & deployment

## 📚 Documentation

- See `README.md` for full API documentation
- See `backend/README.md` for architecture details

---

**Backend is production-ready and follows industry best practices!** 🚀
