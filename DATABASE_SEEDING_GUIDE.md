# Database Seeding Guide

## Quick Commands

### Seed Database (Clears existing data first)
```bash
npm run seed
```

### Alternative: Clear then Seed
```bash
npm run reseed
```

---

## What Gets Seeded

### 1. **Super Admin**
- Email: `admin@suvidha.gov.in`
- Password: `123456`
- Role: SUPER_ADMIN

### 2. **Departments (4)**
- Electricity Department (ELEC)
- Water Department (WATER)
- Gas Department (GAS)
- Municipal Department (MUN)

### 3. **Sub-Departments (13)**
- **Electricity**: Billing, Metering, Outage Management
- **Water**: Supply Management, Leakage Control, Quality Control
- **Gas**: Pipeline Maintenance, Safety Inspection
- **Municipal**: Sanitation Services, Waste Management, Public Works

### 4. **Officers (12+)**
- At least one officer per sub-department
- Officer ID format: `DEPT_SUBDEPT_YEAR_0001`
- Password: `123456` (for all officers)
- Example: `ELEC_BILL_2026_0001`

### 5. **Citizens (5)**
- Rajesh Kumar - 9876543210
- Priya Sharma - 9876543211
- Amit Singh - 9876543212
- Sunita Patel - 9876543213
- Vikram Gupta - 9876543214

### 6. **Complaints (30+)**
- 2-3 complaints per sub-department
- Mixed statuses: PENDING, IN_PROGRESS, RESOLVED, REJECTED
- Realistic titles and descriptions
- Assigned to appropriate officers

---

## Seeding Process

The script automatically:

1. ✅ **Clears ALL existing data** from:
   - Users (all roles)
   - Departments
   - Sub-Departments
   - Complaints
   - Transfers
   - Communications
   - Connections

2. ✅ **Creates fresh data** in order:
   - Super Admin
   - Departments
   - Sub-Departments
   - Officers (with credentials)
   - Citizens
   - Complaints (with mixed statuses)

3. ✅ **Displays credentials** for demo/testing

---

## After Seeding

### Login Credentials

#### Super Admin
```
Email: admin@suvidha.gov.in
Password: 123456
Endpoint: POST /api/auth/admin/login
```

#### Officers (Example)
```
Officer ID: ELEC_BILL_2026_0001
Password: 123456
Endpoint: POST /api/auth/officer/login
```

#### Citizens (OTP-based)
```
Mobile: 9876543210
Endpoint: POST /api/auth/citizen/register
Then verify OTP
```

---

## Testing After Seeding

### 1. Test Super Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@suvidha.gov.in","password":"123456"}'
```

### 2. Test Officer Login
```bash
curl -X POST http://localhost:5000/api/auth/officer/login \
  -H "Content-Type: application/json" \
  -d '{"officerId":"ELEC_BILL_2026_0001","password":"123456"}'
```

### 3. Test Citizen Registration
```bash
curl -X POST http://localhost:5000/api/auth/citizen/register \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210","name":"Rajesh Kumar"}'
```

---

## Troubleshooting

### Issue: "MongoDB connection failed"
**Solution**: Check your `.env` file has correct `MONGODB_URI`

### Issue: "Duplicate key error"
**Solution**: The script clears data first, but if it fails, manually clear:
```bash
# Connect to MongoDB and run:
use suvidha2026
db.dropDatabase()
```

### Issue: "Super Admin not found"
**Solution**: The script creates one automatically if missing

---

## Important Notes

⚠️ **WARNING**: Running `npm run seed` will **DELETE ALL EXISTING DATA**

✅ **Safe for**: Development, Testing, Demo environments

❌ **Never run on**: Production database

---

## Customizing Seed Data

To modify seed data, edit: `backend/scripts/seedDemoData.js`

### Add More Departments
```javascript
departments: [
  {
    name: "Your Department",
    code: "DEPT",
    description: "Description"
  }
]
```

### Add More Citizens
```javascript
citizens: [
  {
    name: "New Citizen",
    mobileNumber: "9876543215",
    email: "new@email.com",
    address: "Address"
  }
]
```

---

## Verification

After seeding, verify in MongoDB:

```javascript
// Check counts
db.users.countDocuments()
db.departments.countDocuments()
db.subdepartments.countDocuments()
db.complaints.countDocuments()

// Check Super Admin
db.users.findOne({ role: "SUPER_ADMIN" })

// Check Officers
db.users.find({ role: "OFFICER" }).count()

// Check Citizens
db.users.find({ role: "PUBLIC" }).count()
```

---

## Status: ✅ READY TO USE

Run `npm run seed` to clear and populate your database with fresh demo data!
