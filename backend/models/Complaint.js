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

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
