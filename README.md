# SUVIDHA 2026 - Smart Urban Virtual Interactive Digital Helpdesk Assistant

A government-grade Smart City kiosk system built with MERN stack for C-DAC Hackathon.

## 🎯 Quick Demo Setup

**Want to see the system in action? Follow these steps:**

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd suvidha
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

3. **Seed Demo Data**
   ```bash
   npm run seed
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

5. **Login with Demo Credentials** (displayed after seeding)
   - **Super Admin**: admin@suvidha.gov.in / DemoAdmin@2026
   - **Officers**: Various officer IDs with department assignments
   - **Citizens**: Mobile-based OTP login

## 🏛️ Government System Features

### Super Admin Authority
- **Bootstrap System**: Auto-creates Super Admin on first server start
- **Department Management**: Create and manage government departments
- **Officer Lifecycle**: Create, transfer, and retire officers
- **Data Integrity**: Enforces strict business rules and constraints
- **Audit Compliance**: Complete audit trail for all operations

### Officer Management
- **Auto-Generated Credentials**: Unique Officer IDs and temporary passwords
- **Department Assignment**: Officers assigned to specific sub-departments
- **Transfer System**: Seamless officer transfers between departments
- **Access Control**: Officers can only access their assigned department complaints
- **Retirement Process**: Proper officer retirement with data preservation

## 🏗️ Project Structure

```
suvidha/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication (Citizen, Officer, Admin)
│   │   ├── departmentController.js
│   │   ├── subDepartmentController.js
│   │   ├── officerController.js
│   │   └── complaintController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & authorization
│   │   ├── officerAccess.js     # Officer access control
│   │   └── upload.js            # File upload (Multer)
│   ├── models/
│   │   ├── User.js              # User schema (Citizen, Officer, Admin)
│   │   ├── Department.js
│   │   ├── SubDepartment.js
│   │   ├── Complaint.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── subDepartmentRoutes.js
│   │   ├── officerRoutes.js
│   │   └── complaintRoutes.js
│   ├── utils/
│   │   ├── jwt.js               # JWT token generation
│   │   ├── cloudinary.js        # Cloudinary file upload
│   │   ├── auditLogger.js       # Audit logging
│   │   └── generateComplaintNumber.js
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
├── package.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   cd suvidha
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/suvidha2026
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Super Admin Bootstrap (REQUIRED)
   ADMIN_EMAIL=admin@suvidha.gov.in
   ADMIN_PASSWORD=SuperAdmin@2026
   ```

4. **Start MongoDB**
   - Local: Ensure MongoDB is running on `localhost:27017`
   - Atlas: Use your MongoDB Atlas connection string

5. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify server is running**
   ```bash
   curl http://localhost:5000/health
   ```

## 🎭 Demo Data & Credentials

### Seeding Demo Data

The system includes a comprehensive demo data seeding system for evaluation and demonstration:

```bash
# Seed all demo data (idempotent - safe to run multiple times)
npm run seed

# Alternative command
npm run demo-setup
```

### Demo Credentials (After Seeding)

#### 👑 Super Admin
```
Email: admin@suvidha.gov.in
Password: DemoAdmin@2026
Endpoint: POST /api/auth/admin/login
```

**Super Admin Capabilities:**
- Create and manage departments
- Create and manage sub-departments  
- Create officers with auto-generated credentials
- Transfer officers between departments
- Retire officers from the system
- Access all system data and audit logs

#### 👮 Officers (Sample)
```
Officer ID: ELEC_BILL_2026_0001
Password: Officer@2601
Department: Electricity Department / Billing Section
Endpoint: POST /api/auth/officer/login

Officer ID: WATER_SUPPLY_2026_0001  
Password: Officer@2602
Department: Water Department / Supply Management
Endpoint: POST /api/auth/officer/login
```

**Officer Capabilities:**
- View complaints from assigned sub-department only
- Update complaint status and add remarks
- Access restricted to current department assignment
- Immediate access update after transfers

#### 👥 Citizens (Sample)
```
Mobile: 9876543210 (Rajesh Kumar)
Mobile: 9876543211 (Priya Sharma)
Mobile: 9876543212 (Amit Singh)
Endpoint: POST /api/auth/citizen/register → POST /api/auth/citizen/verify-otp
```

**Citizen Capabilities:**
- Register and login via mobile + OTP
- Create complaints with file uploads
- Track complaint status
- Download complaint receipts

### Demo Data Includes

- **4 Government Departments**: Electricity, Water, Gas, Municipal
- **12 Sub-Departments**: Billing, Metering, Supply, Leakage, etc.
- **12+ Officers**: At least one officer per sub-department
- **5 Citizens**: With unique mobile numbers and addresses
- **30+ Complaints**: Mixed statuses (Pending, In Progress, Resolved)
- **Complete Audit Trail**: All operations logged for compliance

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Citizen (PUBLIC) Authentication

**Register Citizen**
```
POST /api/auth/citizen/register
Body: {
  "mobileNumber": "9876543210",
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

**Verify OTP**
```
POST /api/auth/citizen/verify-otp
Body: {
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

**Resend OTP**
```
POST /api/auth/citizen/resend-otp
Body: {
  "mobileNumber": "9876543210"
}
```

#### Officer Authentication

**Login Officer**
```
POST /api/auth/officer/login
Body: {
  "officerId": "OFF001",
  "password": "password123"
}
```

#### Admin Authentication

**Login Admin**
```
POST /api/auth/admin/login
Body: {
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Get Current User**
```
GET /api/auth/me
Headers: {
  "Authorization": "Bearer <token>"
}
```

### Department Management (ADMIN only)

**Create Department**
```
POST /api/departments
Headers: {
  "Authorization": "Bearer <admin_token>"
}
Body: {
  "name": "Public Works Department",
  "code": "PWD",
  "description": "Handles public infrastructure"
}
```

**Get All Departments**
```
GET /api/departments
Headers: {
  "Authorization": "Bearer <token>"
}
Query params: ?isActive=true&search=works
```

**Get Department by ID**
```
GET /api/departments/:id
```

**Update Department**
```
PUT /api/departments/:id
Body: {
  "name": "Updated Name",
  "isActive": false
}
```

**Delete Department (Soft Delete)**
```
DELETE /api/departments/:id
```

### Sub-Department Management (ADMIN only)

**Create Sub-Department**
```
POST /api/subdepartments
Body: {
  "name": "Road Maintenance",
  "code": "RM",
  "department": "<department_id>",
  "description": "Handles road repairs"
}
```

**Get All Sub-Departments**
```
GET /api/subdepartments?department=<dept_id>&isActive=true
```

### Officer Management (ADMIN only)

**Create Officer**
```
POST /api/officers
Body: {
  "officerId": "OFF001",
  "password": "password123",
  "officerName": "Jane Smith",
  "assignedSubDepartment": "<subdept_id>"
}
```

**Get All Officers**
```
GET /api/officers?department=<dept_id>&subDepartment=<subdept_id>
```

**Assign Officer to Sub-Department**
```
PUT /api/officers/:id/assign
Body: {
  "assignedSubDepartment": "<subdept_id>"
}
```

### Complaint Management

**Create Complaint (Citizen only)**
```
POST /api/complaints
Headers: {
  "Authorization": "Bearer <citizen_token>"
}
Body (multipart/form-data): {
  "title": "Pothole on Main Street",
  "description": "Large pothole causing accidents",
  "category": "ROAD_MAINTENANCE",
  "priority": "HIGH",
  "department": "<dept_id>",
  "subDepartment": "<subdept_id>",
  "location": {
    "address": "Main Street, City",
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "documents": [files...]
}
```

**Get All Complaints**
```
GET /api/complaints?status=PENDING&category=ROAD_MAINTENANCE&page=1&limit=10
```

**Get Complaint by ID**
```
GET /api/complaints/:id
```

**Update Complaint (Officer/Admin)**
```
PUT /api/complaints/:id
Body: {
  "status": "IN_PROGRESS",
  "remarks": "Work started",
  "assignedOfficer": "<officer_id>"
}
```

**Add Documents to Complaint (Citizen)**
```
POST /api/complaints/:id/documents
Body (multipart/form-data): {
  "documents": [files...]
}
```

**Download Receipt (Citizen)**
```
GET /api/complaints/:id/receipt
```

## 🔐 User Roles & Permissions

### PUBLIC (Citizen)
- Register/Login via mobile + OTP
- Create complaints
- Upload documents
- View own complaints
- Download receipts
- Track complaint status

### OFFICER
- Login via Officer ID + Password
- View complaints from assigned sub-department only
- Update complaint status
- Add remarks
- Assign complaints to themselves

### ADMIN
- Login via Email + Password
- Full system access
- Create/Manage Departments
- Create/Manage Sub-Departments
- Create/Manage Officers
- Assign officers to sub-departments
- View all complaints
- Access audit logs

## 🗄️ Database Schemas

### User
- `role`: PUBLIC | OFFICER | ADMIN
- `mobileNumber`: (Citizen only)
- `officerId`: (Officer only)
- `adminEmail`: (Admin only)
- `assignedDepartment`: (Officer only)
- `assignedSubDepartment`: (Officer only)

### Complaint
- `complaintNumber`: Auto-generated (SUV{YYYY}{6-digit})
- `citizen`: Reference to User
- `department`: Reference to Department
- `subDepartment`: Reference to SubDepartment
- `status`: PENDING | IN_PROGRESS | RESOLVED | REJECTED
- `documents`: Array of Cloudinary URLs
- `remarks`: Array of status updates

### AuditLog
- Tracks all critical system activities
- Includes user, action, entity, timestamp, IP address

## 🔒 Security Features

- JWT-based authentication
- Role-based authorization middleware
- Password hashing (bcrypt)
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation
- Officer access control (sub-department level)

## 📁 File Upload

- Files uploaded to Cloudinary
- Supported formats: JPG, PNG, PDF, DOC, DOCX
- Max file size: 10MB per file
- Max files per complaint: 5
- Secure URLs stored in MongoDB

## 🌐 Language Support

- English (default)
- Hindi (to be implemented in frontend)
- JSON-based language switching

## 🧠 AI Integration (Future)

- Complaint classification
- AI helpdesk chat
- Admin smart insights
- Currently: Mock responses

## 📝 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/suvidha2026

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🧪 Testing

Health check endpoint:
```bash
curl http://localhost:5000/health
```

## 📦 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB Atlas or production MongoDB
4. Set up Cloudinary production account
5. Configure CORS for production frontend URL
6. Enable HTTPS
7. Set up monitoring and logging

## 👥 Development Team

Built for C-DAC Hackathon 2026

## 📄 License

ISC

---

**Note**: This is a production-ready backend system. Frontend implementation will follow in the next phase.
