/**
 * SUVIDHA 2026 - Complaint Communication Model
 * 
 * Manages inter-department communication and internal notes for complaints
 * Supports message threading, tagging, and read status tracking
 */

const mongoose = require('mongoose');

const complaintCommunicationSchema = new mongoose.Schema({
  // Complaint Reference
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    index: true
  },
  
  // Message Details
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  messageType: {
    type: String,
    required: true,
    enum: ['INTERNAL', 'INTER_DEPARTMENT', 'ESCALATION'],
    default: 'INTER_DEPARTMENT'
  },
  
  // Sender Information
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  sentByDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true
  },
  
  sentBySubDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubDepartment',
    required: true
  },
  
  // Recipients
  taggedDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  
  taggedOfficers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Visibility Control
  isInternal: {
    type: Boolean,
    default: false // If true, hidden from citizens
  },
  
  visibleToRoles: [{
    type: String,
    enum: ['OFFICER', 'ADMIN', 'SUPER_ADMIN', 'PUBLIC']
  }],
  
  // Attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Read Status Tracking
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reply Threading
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComplaintCommunication'
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound Indexes for Performance
complaintCommunicationSchema.index({ complaint: 1, createdAt: -1 });
complaintCommunicationSchema.index({ sentByDepartment: 1, createdAt: -1 });
complaintCommunicationSchema.index({ taggedDepartments: 1, createdAt: -1 });
complaintCommunicationSchema.index({ sentBy: 1, createdAt: -1 });

// Virtual for read count
complaintCommunicationSchema.virtual('readCount').get(function() {
  return this.readBy ? this.readBy.length : 0;
});

// Virtual for unread by specific user
complaintCommunicationSchema.virtual('isReadByUser').get(function() {
  // This will be set dynamically when querying
  return false;
});

// Pre-save middleware
complaintCommunicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set default visibility based on message type
  if (!this.visibleToRoles || this.visibleToRoles.length === 0) {
    if (this.isInternal) {
      this.visibleToRoles = ['OFFICER', 'ADMIN', 'SUPER_ADMIN'];
    } else {
      this.visibleToRoles = ['OFFICER', 'ADMIN', 'SUPER_ADMIN', 'PUBLIC'];
    }
  }
  
  next();
});

// Static method to get communications for a complaint
complaintCommunicationSchema.statics.getComplaintCommunications = function(complaintId, userRole) {
  const query = {
    complaint: complaintId,
    isActive: true
  };
  
  // Filter by visibility if user is PUBLIC
  if (userRole === 'PUBLIC') {
    query.isInternal = false;
    query.visibleToRoles = 'PUBLIC';
  }
  
  return this.find(query)
    .populate('sentBy', 'name officerName officerId')
    .populate('sentByDepartment', 'name code')
    .populate('sentBySubDepartment', 'name code')
    .populate('taggedDepartments', 'name code')
    .populate('taggedOfficers', 'name officerName')
    .populate('replyTo', 'message sentBy')
    .sort({ createdAt: 1 }); // Chronological order
};

// Static method to get unread count for a user
complaintCommunicationSchema.statics.getUnreadCount = function(userId, departmentId) {
  return this.countDocuments({
    $or: [
      { taggedOfficers: userId },
      { taggedDepartments: departmentId }
    ],
    'readBy.user': { $ne: userId },
    isActive: true
  });
};

// Instance method to mark as read by user
complaintCommunicationSchema.methods.markAsRead = function(userId) {
  // Check if already read by this user
  const alreadyRead = this.readBy.some(read => read.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to check if read by user
complaintCommunicationSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Static method to get communication statistics
complaintCommunicationSchema.statics.getCommunicationStats = async function(departmentId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        sentByDepartment: mongoose.Types.ObjectId(departmentId),
        createdAt: {
          $gte: startDate,
          $lte: endDate
        },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$messageType',
        count: { $sum: 1 },
        avgReadCount: { $avg: { $size: '$readBy' } }
      }
    }
  ]);
  
  return stats;
};

// Static method to get recent communications for dashboard
complaintCommunicationSchema.statics.getRecentCommunications = function(departmentId, limit = 10) {
  return this.find({
    $or: [
      { sentByDepartment: departmentId },
      { taggedDepartments: departmentId }
    ],
    isActive: true
  })
  .populate('complaint', 'complaintNumber title')
  .populate('sentBy', 'name officerName')
  .populate('sentByDepartment', 'name')
  .sort({ createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('ComplaintCommunication', complaintCommunicationSchema);
