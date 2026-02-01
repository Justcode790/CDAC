/**
 * SUVIDHA 2026 - Enhanced User Model for Government System
 * 
 * This schema handles four types of users:
 * 1. PUBLIC (Citizen) - Login via mobile number + OTP
 * 2. OFFICER - Login via Officer ID + Password, assigned to one department/sub-department
 * 3. ADMIN - System access for general administration
 * 4. SUPER_ADMIN - Root authority with exclusive rights to manage departments and officers
 * 
 * Role-based access control is enforced through the 'role' field.
 * Government-grade data integrity rules ensure single department assignments.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Common fields for all user types
  role: {
    type: String,
    enum: ['PUBLIC', 'OFFICER', 'ADMIN', 'SUPER_ADMIN'],
    required: true,
    index: true
  },
  
  // Fields for PUBLIC (Citizen) users
  mobileNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows null values for non-citizen users
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
  },
  address: {
    type: String,
    trim: true
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false // Don't return OTP in queries by default
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  
  // Fields for OFFICER users
  officerId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
    index: true,
    validate: {
      validator: function(v) {
        return this.role !== 'OFFICER' || (v != null && v.length > 0);
      },
      message: 'Officer ID is required for OFFICER role'
    }
  },
  password: {
    type: String,
    select: false, // Don't return password in queries by default
    minlength: [6, 'Password must be at least 6 characters']
  },
  officerName: {
    type: String,
    trim: true
  },
  assignedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    index: true,
    validate: {
      validator: function(v) {
        return this.role !== 'OFFICER' || v != null;
      },
      message: 'Department assignment is required for OFFICER role'
    }
  },
  assignedSubDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubDepartment',
    index: true,
    validate: {
      validator: function(v) {
        return this.role !== 'OFFICER' || v != null;
      },
      message: 'Sub-department assignment is required for OFFICER role'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Officer transfer history for audit trail
  transferHistory: [{
    fromDepartment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Department' 
    },
    fromSubDepartment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'SubDepartment' 
    },
    toDepartment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Department' 
    },
    toSubDepartment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'SubDepartment' 
    },
    transferredBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    transferDate: { 
      type: Date, 
      default: Date.now 
    },
    reason: {
      type: String,
      trim: true
    }
  }],
  
  // Officer status fields
  isTemporaryPassword: {
    type: Boolean,
    default: true
  },
  passwordChangeRequired: {
    type: Boolean,
    default: true
  },
  retiredAt: {
    type: Date
  },
  retiredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Fields for ADMIN users
  adminEmail: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  adminName: {
    type: String,
    trim: true
  },
  
  // Common metadata
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes for performance and constraints
userSchema.index({ mobileNumber: 1, role: 1 });
userSchema.index({ officerId: 1, role: 1 });
userSchema.index({ assignedSubDepartment: 1 });
userSchema.index({ assignedDepartment: 1, assignedSubDepartment: 1 });
userSchema.index({ adminEmail: 1, role: 1 });

// Hash password before saving (for OFFICER, ADMIN, and SUPER_ADMIN)
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and user is OFFICER, ADMIN, or SUPER_ADMIN
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  if (this.role === 'OFFICER' || this.role === 'ADMIN' || this.role === 'SUPER_ADMIN') {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Pre-save middleware to enforce single department assignment rule
userSchema.pre('save', async function(next) {
  if (this.role === 'OFFICER' && this.isModified('assignedDepartment')) {
    // Validate that officer is not assigned to multiple departments
    // This is enforced by the schema validation above, but adding extra check
    if (this.assignedDepartment && this.assignedSubDepartment) {
      // Verify sub-department belongs to the assigned department
      const SubDepartment = mongoose.model('SubDepartment');
      const subDept = await SubDepartment.findById(this.assignedSubDepartment);
      
      if (subDept && subDept.department.toString() !== this.assignedDepartment.toString()) {
        const error = new Error('Sub-department must belong to the assigned department');
        error.name = 'ValidationError';
        return next(error);
      }
    }
  }
  next();
});

// Method to compare password (for OFFICER and ADMIN)
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate OTP (for PUBLIC users)
userSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  return otp;
};

// Method to verify OTP (for PUBLIC users)
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }
  if (new Date() > this.otpExpiry) {
    return false; // OTP expired
  }
  return this.otp === enteredOTP;
};

// Virtual to check if user is citizen
userSchema.virtual('isCitizen').get(function() {
  return this.role === 'PUBLIC';
});

// Virtual to check if user is officer
userSchema.virtual('isOfficer').get(function() {
  return this.role === 'OFFICER';
});

// Virtual to check if user is admin
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'ADMIN';
});

// Virtual to check if user is super admin
userSchema.virtual('isSuperAdmin').get(function() {
  return this.role === 'SUPER_ADMIN';
});

// Method to add transfer history entry
userSchema.methods.addTransferHistory = function(fromDept, fromSubDept, toDept, toSubDept, transferredBy, reason) {
  this.transferHistory.push({
    fromDepartment: fromDept,
    fromSubDepartment: fromSubDept,
    toDepartment: toDept,
    toSubDepartment: toSubDept,
    transferredBy: transferredBy,
    reason: reason,
    transferDate: new Date()
  });
};

// Method to check if officer can access specific department/sub-department
userSchema.methods.canAccessDepartment = function(departmentId, subDepartmentId) {
  if (this.role !== 'OFFICER') {
    return false;
  }
  
  const deptMatch = this.assignedDepartment && this.assignedDepartment.toString() === departmentId.toString();
  const subDeptMatch = this.assignedSubDepartment && this.assignedSubDepartment.toString() === subDepartmentId.toString();
  
  return deptMatch && subDeptMatch;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
