/**
 * SUVIDHA 2026 - Department Model
 * 
 * This schema represents government departments.
 * Each department can have multiple sub-departments.
 * Only ADMIN users can create/modify departments.
 * 
 * Example: "Public Works Department", "Health Department", etc.
 */

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true,
    index: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    trim: true,
    uppercase: true,
    unique: true,
    index: true,
    match: [/^[A-Z0-9]{2,10}$/, 'Department code must be 2-10 uppercase alphanumeric characters']
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
  collection: 'departments',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
departmentSchema.index({ code: 1, isActive: 1 });
departmentSchema.index({ name: 'text' }); // Text search index

// Virtual to get sub-departments count
departmentSchema.virtual('subDepartmentsCount', {
  ref: 'SubDepartment',
  localField: '_id',
  foreignField: 'department',
  count: true
});

// Virtual to get sub-departments list
departmentSchema.virtual('subDepartments', {
  ref: 'SubDepartment',
  localField: '_id',
  foreignField: 'department'
});

// Virtual to get officers count
departmentSchema.virtual('officersCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'assignedDepartment',
  count: true
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
