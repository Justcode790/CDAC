/**
 * SUVIDHA 2026 - Complaint Transfer Model
 * 
 * Tracks complaint transfers between departments and sub-departments
 * Maintains transfer history and status for audit and accountability
 */

const mongoose = require('mongoose');

const complaintTransferSchema = new mongoose.Schema({
  // Complaint Reference
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    index: true
  },
  
  // Source Information
  fromDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true
  },
  
  fromSubDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubDepartment',
    required: true
  },
  
  // Target Information
  toDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true
  },
  
  toSubDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubDepartment',
    required: false // Optional for department-level transfers
  },
  
  // Transfer Details
  transferType: {
    type: String,
    required: true,
    enum: ['DEPARTMENT', 'SUB_DEPARTMENT', 'ESCALATION'],
    default: 'DEPARTMENT'
  },
  
  transferReason: {
    type: String,
    required: true,
    enum: [
      'CLARIFICATION',
      'RE_VERIFICATION',
      'FURTHER_INVESTIGATION',
      'SPECIALIZED_HANDLING',
      'WRONG_DEPARTMENT',
      'ESCALATION',
      'OTHER'
    ]
  },
  
  transferNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Officer Information
  transferredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  transferredByRole: {
    type: String,
    required: true,
    enum: ['OFFICER', 'ADMIN', 'SUPER_ADMIN']
  },
  
  // Status Tracking
  transferStatus: {
    type: String,
    required: true,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  acceptedAt: {
    type: Date
  },
  
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  rejectedAt: {
    type: Date
  },
  
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Timestamps
  transferredAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound Indexes for Performance
complaintTransferSchema.index({ complaint: 1, transferredAt: -1 });
complaintTransferSchema.index({ fromDepartment: 1, toDepartment: 1 });
complaintTransferSchema.index({ transferStatus: 1, toDepartment: 1 });
complaintTransferSchema.index({ transferredBy: 1, transferredAt: -1 });

// Virtual for transfer duration (if accepted/rejected)
complaintTransferSchema.virtual('processingDuration').get(function() {
  if (this.acceptedAt) {
    return Math.floor((this.acceptedAt - this.transferredAt) / (1000 * 60 * 60)); // Hours
  }
  if (this.rejectedAt) {
    return Math.floor((this.rejectedAt - this.transferredAt) / (1000 * 60 * 60)); // Hours
  }
  return null;
});

// Virtual for pending duration
complaintTransferSchema.virtual('pendingDuration').get(function() {
  if (this.transferStatus === 'PENDING') {
    return Math.floor((Date.now() - this.transferredAt) / (1000 * 60 * 60)); // Hours
  }
  return null;
});

// Pre-save middleware
complaintTransferSchema.pre('save', function(next) {
  // Validate that transfer is not to the same department
  if (this.fromDepartment.toString() === this.toDepartment.toString() && 
      this.transferType === 'DEPARTMENT') {
    return next(new Error('Cannot transfer to the same department'));
  }
  
  // Require rejection reason if status is REJECTED
  if (this.transferStatus === 'REJECTED' && !this.rejectionReason) {
    return next(new Error('Rejection reason is required'));
  }
  
  next();
});

// Static method to get pending transfers for a department
complaintTransferSchema.statics.getPendingTransfers = function(departmentId) {
  return this.find({
    toDepartment: departmentId,
    transferStatus: 'PENDING',
    isActive: true
  })
  .populate('complaint', 'complaintNumber title description category priority')
  .populate('fromDepartment', 'name code')
  .populate('fromSubDepartment', 'name code')
  .populate('transferredBy', 'officerName officerId')
  .sort({ transferredAt: -1 });
};

// Static method to get transfer history for a complaint
complaintTransferSchema.statics.getTransferHistory = function(complaintId) {
  return this.find({
    complaint: complaintId,
    isActive: true
  })
  .populate('fromDepartment', 'name code')
  .populate('fromSubDepartment', 'name code')
  .populate('toDepartment', 'name code')
  .populate('toSubDepartment', 'name code')
  .populate('transferredBy', 'officerName officerId')
  .populate('acceptedBy', 'officerName officerId')
  .populate('rejectedBy', 'officerName officerId')
  .sort({ transferredAt: -1 });
};

// Instance method to accept transfer
complaintTransferSchema.methods.acceptTransfer = function(acceptedByUser) {
  this.transferStatus = 'ACCEPTED';
  this.acceptedBy = acceptedByUser._id;
  this.acceptedAt = new Date();
  return this.save();
};

// Instance method to reject transfer
complaintTransferSchema.methods.rejectTransfer = function(rejectedByUser, reason) {
  this.transferStatus = 'REJECTED';
  this.rejectedBy = rejectedByUser._id;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Static method to get transfer statistics
complaintTransferSchema.statics.getTransferStats = async function(departmentId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { fromDepartment: mongoose.Types.ObjectId(departmentId) },
          { toDepartment: mongoose.Types.ObjectId(departmentId) }
        ],
        transferredAt: {
          $gte: startDate,
          $lte: endDate
        },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$transferStatus',
        count: { $sum: 1 },
        avgProcessingTime: { $avg: '$processingDuration' }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('ComplaintTransfer', complaintTransferSchema);
