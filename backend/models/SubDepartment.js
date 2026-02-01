/**
 * SUVIDHA 2026 - Sub-Department Model
 * 
 * This schema represents sub-departments within a department.
 * Each sub-department belongs to exactly one department.
 * Officers are assigned to one sub-department.
 * Only ADMIN users can create/modify sub-departments.
 * 
 * Example: Under "Public Works Department":
 *   - "Road Maintenance"
 *   - "Water Supply"
 *   - "Street Lighting"
 */

const mongoose = require('mongoose');

const subDepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sub-department name is required'],
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: [true, 'Sub-department code is required'],
    trim: true,
    uppercase: true,
    index: true,
    match: [/^[A-Z0-9]{2,10}$/, 'Sub-department code must be 2-10 uppercase alphanumeric characters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  collection: 'subdepartments'
});

// Compound unique index: code must be unique within a department
subDepartmentSchema.index({ code: 1, department: 1 }, { unique: true });

// Indexes for performance
subDepartmentSchema.index({ department: 1, isActive: 1 });
subDepartmentSchema.index({ name: 'text' }); // Text search index

// Virtual to get assigned officers count
subDepartmentSchema.virtual('officersCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'assignedSubDepartment',
  count: true
});

// Virtual to get complaints count
subDepartmentSchema.virtual('complaintsCount', {
  ref: 'Complaint',
  localField: '_id',
  foreignField: 'subDepartment',
  count: true
});

const SubDepartment = mongoose.model('SubDepartment', subDepartmentSchema);

module.exports = SubDepartment;
