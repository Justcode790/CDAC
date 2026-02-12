/**
 * SUVIDHA 2026 - Complaint Model
 * 
 * This schema represents citizen complaints and service requests.
 * Citizens can submit complaints with documents.
 * Officers can view and update complaints assigned to their sub-department.
 * 
 * Status flow:
 * PENDING -> IN_PROGRESS -> RESOLVED / REJECTED
 */

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    unique: true,
    required: true,
    index: true,
    uppercase: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Citizen is required'],
    index: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
    index: true
  },
  subDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubDepartment',
    required: [true, 'Sub-department is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'INFRASTRUCTURE',
      'SANITATION',
      'WATER_SUPPLY',
      'ELECTRICITY',
      'ROAD_MAINTENANCE',
      'PUBLIC_SAFETY',
      'HEALTH',
      'EDUCATION',
      'OTHER'
    ],
    index: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  location: {
    address: {
      type: String,
      trim: true
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    secure_url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Transfer History (embedded for quick access)
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
    transferredAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING'
    }
  }],
  
  // Current Assignment
  currentlyAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // null if unclaimed
  },
  
  claimedAt: {
    type: Date
  },
  
  // Transfer Statistics
  transferCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastTransferredAt: {
    type: Date
  },
  
  // Escalation
  isEscalated: {
    type: Boolean,
    default: false,
    index: true
  },
  
  escalatedAt: {
    type: Date
  },
  
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  escalationReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Communication Count
  communicationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastCommunicationAt: {
    type: Date
  },
  remarks: [{
    text: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['PUBLIC', 'OFFICER', 'ADMIN'],
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolutionDetails: {
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNotes: {
      type: String,
      trim: true
    }
  },
  rejectionDetails: {
    rejectedAt: {
      type: Date
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'complaints'
});

// Indexes for performance
complaintSchema.index({ citizen: 1, createdAt: -1 });
complaintSchema.index({ subDepartment: 1, status: 1 });
complaintSchema.index({ assignedOfficer: 1, status: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ complaintNumber: 1 });
complaintSchema.index({ title: 'text', description: 'text' }); // Text search

// Method to generate complaint number
complaintSchema.statics.generateComplaintNumber = async function() {
  const year = new Date().getFullYear();
  const prefix = `SUV${year}`;
  
  // Find the last complaint number for this year
  const lastComplaint = await this.findOne({
    complaintNumber: new RegExp(`^${prefix}`)
  }).sort({ complaintNumber: -1 });
  
  let sequence = 1;
  if (lastComplaint) {
    const lastSeq = parseInt(lastComplaint.complaintNumber.slice(-6));
    sequence = lastSeq + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

// Pre-save hook to generate complaint number if not provided
complaintSchema.pre('save', async function(next) {
  if (!this.complaintNumber) {
    this.complaintNumber = await this.constructor.generateComplaintNumber();
  }
  next();
});

// Instance method to add transfer to history
complaintSchema.methods.addTransferToHistory = function(transferData) {
  this.transferHistory.push({
    fromDepartment: transferData.fromDepartment,
    fromSubDepartment: transferData.fromSubDepartment,
    toDepartment: transferData.toDepartment,
    toSubDepartment: transferData.toSubDepartment,
    transferredBy: transferData.transferredBy,
    transferredAt: new Date(),
    reason: transferData.reason,
    status: 'PENDING'
  });
  
  this.transferCount += 1;
  this.lastTransferredAt = new Date();
  
  return this.save();
};

// Instance method to update transfer status in history
complaintSchema.methods.updateTransferStatus = function(transferId, status) {
  const transfer = this.transferHistory.id(transferId);
  if (transfer) {
    transfer.status = status;
    return this.save();
  }
  return Promise.reject(new Error('Transfer not found in history'));
};

// Instance method to escalate complaint
complaintSchema.methods.escalate = function(escalatedBy, reason) {
  this.isEscalated = true;
  this.escalatedAt = new Date();
  this.escalatedBy = escalatedBy;
  this.escalationReason = reason;
  
  // Automatically set priority to HIGH if not already URGENT
  if (this.priority !== 'URGENT') {
    this.priority = 'HIGH';
  }
  
  return this.save();
};

// Instance method to increment communication count
complaintSchema.methods.incrementCommunicationCount = function() {
  this.communicationCount += 1;
  this.lastCommunicationAt = new Date();
  return this.save();
};

// Instance method to claim complaint
complaintSchema.methods.claimComplaint = function(officerId) {
  this.currentlyAssignedTo = officerId;
  this.claimedAt = new Date();
  this.assignedOfficer = officerId; // Also update legacy field
  return this.save();
};

// Instance method to unclaim complaint
complaintSchema.methods.unclaimComplaint = function() {
  this.currentlyAssignedTo = null;
  this.claimedAt = null;
  return this.save();
};

// Static method to get unclaimed complaints for a department
complaintSchema.statics.getUnclaimedComplaints = function(departmentId, subDepartmentId = null) {
  const query = {
    department: departmentId,
    currentlyAssignedTo: null,
    status: { $in: ['PENDING', 'IN_PROGRESS'] }
  };
  
  if (subDepartmentId) {
    query.subDepartment = subDepartmentId;
  }
  
  return this.find(query)
    .populate('citizen', 'name mobileNumber')
    .populate('department', 'name code')
    .populate('subDepartment', 'name code')
    .sort({ createdAt: -1 });
};

// Static method to get escalated complaints
complaintSchema.statics.getEscalatedComplaints = function(departmentId = null) {
  const query = { isEscalated: true };
  
  if (departmentId) {
    query.department = departmentId;
  }
  
  return this.find(query)
    .populate('citizen', 'name mobileNumber')
    .populate('department', 'name code')
    .populate('subDepartment', 'name code')
    .populate('escalatedBy', 'name officerName')
    .sort({ escalatedAt: -1 });
};

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
