/**
 * SUVIDHA 2026 - Department Connection Model
 * 
 * Manages connections between departments for complaint transfers
 * Prevents duplicate connections and tracks transfer statistics
 */

const mongoose = require('mongoose');

const departmentConnectionSchema = new mongoose.Schema({
  // Connection Details
  sourceDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true
  },
  
  targetDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true
  },
  
  // Connection Type
  connectionType: {
    type: String,
    required: true,
    enum: ['TRANSFER_ENABLED', 'COMMUNICATION_ENABLED', 'BOTH'],
    default: 'BOTH'
  },
  
  // Metadata
  establishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  establishedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Statistics
  transferCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastTransferAt: {
    type: Date
  },
  
  communicationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastCommunicationAt: {
    type: Date
  },
  
  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Unique compound index to prevent duplicate connections
departmentConnectionSchema.index(
  { sourceDepartment: 1, targetDepartment: 1 },
  { unique: true }
);

// Index for active connections
departmentConnectionSchema.index({ isActive: 1, sourceDepartment: 1 });
departmentConnectionSchema.index({ isActive: 1, targetDepartment: 1 });

// Virtual for connection age in days
departmentConnectionSchema.virtual('connectionAge').get(function() {
  return Math.floor((Date.now() - this.establishedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for average transfers per month
departmentConnectionSchema.virtual('avgTransfersPerMonth').get(function() {
  const ageInMonths = this.connectionAge / 30;
  return ageInMonths > 0 ? (this.transferCount / ageInMonths).toFixed(2) : 0;
});

// Pre-save middleware
departmentConnectionSchema.pre('save', function(next) {
  // Validate that source and target are different
  if (this.sourceDepartment.toString() === this.targetDepartment.toString()) {
    return next(new Error('Source and target departments must be different'));
  }
  
  next();
});

// Static method to check if connection exists
departmentConnectionSchema.statics.connectionExists = async function(sourceDeptId, targetDeptId) {
  const connection = await this.findOne({
    $or: [
      { sourceDepartment: sourceDeptId, targetDepartment: targetDeptId },
      { sourceDepartment: targetDeptId, targetDepartment: sourceDeptId }
    ],
    isActive: true
  });
  
  return !!connection;
};

// Static method to get or create connection
departmentConnectionSchema.statics.getOrCreateConnection = async function(sourceDeptId, targetDeptId, establishedBy) {
  // Check if connection already exists (bidirectional)
  let connection = await this.findOne({
    $or: [
      { sourceDepartment: sourceDeptId, targetDepartment: targetDeptId },
      { sourceDepartment: targetDeptId, targetDepartment: sourceDeptId }
    ]
  });
  
  if (connection) {
    // Reactivate if inactive
    if (!connection.isActive) {
      connection.isActive = true;
      await connection.save();
    }
    return { connection, created: false };
  }
  
  // Create new connection
  connection = await this.create({
    sourceDepartment: sourceDeptId,
    targetDepartment: targetDeptId,
    connectionType: 'BOTH',
    establishedBy: establishedBy
  });
  
  return { connection, created: true };
};

// Static method to get connections for a department
departmentConnectionSchema.statics.getDepartmentConnections = function(departmentId) {
  return this.find({
    $or: [
      { sourceDepartment: departmentId },
      { targetDepartment: departmentId }
    ],
    isActive: true
  })
  .populate('sourceDepartment', 'name code')
  .populate('targetDepartment', 'name code')
  .populate('establishedBy', 'name officerName')
  .sort({ establishedAt: -1 });
};

// Instance method to increment transfer count
departmentConnectionSchema.methods.incrementTransferCount = function() {
  this.transferCount += 1;
  this.lastTransferAt = new Date();
  return this.save();
};

// Instance method to increment communication count
departmentConnectionSchema.methods.incrementCommunicationCount = function() {
  this.communicationCount += 1;
  this.lastCommunicationAt = new Date();
  return this.save();
};

// Instance method to deactivate connection
departmentConnectionSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to reactivate connection
departmentConnectionSchema.methods.reactivate = function() {
  this.isActive = true;
  return this.save();
};

// Static method to get connection statistics
departmentConnectionSchema.statics.getConnectionStats = async function(departmentId) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { sourceDepartment: mongoose.Types.ObjectId(departmentId) },
          { targetDepartment: mongoose.Types.ObjectId(departmentId) }
        ],
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalConnections: { $sum: 1 },
        totalTransfers: { $sum: '$transferCount' },
        totalCommunications: { $sum: '$communicationCount' },
        avgTransfersPerConnection: { $avg: '$transferCount' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalConnections: 0,
    totalTransfers: 0,
    totalCommunications: 0,
    avgTransfersPerConnection: 0
  };
};

// Static method to get most active connections
departmentConnectionSchema.statics.getMostActiveConnections = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('sourceDepartment', 'name code')
    .populate('targetDepartment', 'name code')
    .sort({ transferCount: -1 })
    .limit(limit);
};

module.exports = mongoose.model('DepartmentConnection', departmentConnectionSchema);
