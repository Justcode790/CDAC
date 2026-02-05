/**
 * SUVIDHA 2026 - Administrative Controller
 * 
 * This controller handles Super Admin-only operations for government system management:
 * - Department and sub-department creation
 * - Officer lifecycle management (create, transfer, retire)
 * - System administrative functions
 * 
 * All operations require Super Admin authorization and are fully audited.
 */

const Department = require('../models/Department.js');
const SubDepartment = require('../models/SubDepartment.js');
const User = require('../models/User.js');
const { createAuditLog } = require('../utils/auditLogger.js');
const { 
  createOfficer, 
  transferOfficer, 
  retireOfficer 
} = require('../services/officerLifecycleService.js');
const { DataIntegrityError } = require('../services/dataIntegrityService.js');

/**
 * @route   POST /api/admin/departments
 * @desc    Create a new government department
 * @access  Super Admin only
 */
const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    
    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required',
        fields: ['name', 'code']
      });
    }
    
    // Check for duplicate department
    const existingDepartment = await Department.findOne({
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() }
      ]
    });
    
    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: 'Department with this name or code already exists',
        conflict: {
          field: existingDepartment.name === name.trim() ? 'name' : 'code',
          value: existingDepartment.name === name.trim() ? name : code
        }
      });
    }
    
    // Create department
    const department = new Department({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim() || '',
      createdBy: req.user._id,
      isActive: true
    });
    
    await department.save();
    
    // Create audit log
    await createAuditLog({
      action: 'DEPARTMENT_CREATE',
      user: req.user,
      entityType: 'DEPARTMENT',
      entityId: department._id,
      details: {
        departmentName: department.name,
        departmentCode: department.code,
        description: department.description,
        createdBy: req.user.adminName
      },
      req
    });
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: {
        _id: department._id,
        name: department.name,
        code: department.code,
        description: department.description,
        isActive: department.isActive,
        createdAt: department.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creating department:', error);
    
    if (error.code === 11000) {
      // MongoDB duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Department ${field} must be unique`,
        field: field
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/admin/subdepartments
 * @desc    Create a new sub-department within a department
 * @access  Super Admin only
 */
const createSubDepartment = async (req, res) => {
  try {
    const { name, code, department, description } = req.body;
    
    // Validate required fields
    if (!name || !code || !department) {
      return res.status(400).json({
        success: false,
        message: 'Sub-department name, code, and parent department are required',
        fields: ['name', 'code', 'department']
      });
    }
    
    // Validate parent department exists
    const parentDepartment = await Department.findById(department);
    if (!parentDepartment || !parentDepartment.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Parent department not found or inactive',
        departmentId: department
      });
    }
    
    // Check for duplicate sub-department within the same department
    const existingSubDepartment = await SubDepartment.findOne({
      department: department,
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() }
      ]
    });
    
    if (existingSubDepartment) {
      return res.status(409).json({
        success: false,
        message: 'Sub-department with this name or code already exists in this department',
        conflict: {
          field: existingSubDepartment.name === name.trim() ? 'name' : 'code',
          value: existingSubDepartment.name === name.trim() ? name : code,
          department: parentDepartment.name
        }
      });
    }
    
    // Create sub-department
    const subDepartment = new SubDepartment({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      department: department,
      description: description?.trim() || '',
      createdBy: req.user._id,
      isActive: true
    });
    
    await subDepartment.save();
    
    // Populate department info for response
    await subDepartment.populate('department', 'name code');
    
    // Create audit log
    await createAuditLog({
      action: 'SUBDEPARTMENT_CREATE',
      user: req.user,
      entityType: 'SUBDEPARTMENT',
      entityId: subDepartment._id,
      details: {
        subDepartmentName: subDepartment.name,
        subDepartmentCode: subDepartment.code,
        parentDepartment: parentDepartment.name,
        description: subDepartment.description,
        createdBy: req.user.adminName
      },
      req
    });
    
    res.status(201).json({
      success: true,
      message: 'Sub-department created successfully',
      subDepartment: {
        _id: subDepartment._id,
        name: subDepartment.name,
        code: subDepartment.code,
        description: subDepartment.description,
        department: {
          _id: subDepartment.department._id,
          name: subDepartment.department.name,
          code: subDepartment.department.code
        },
        isActive: subDepartment.isActive,
        createdAt: subDepartment.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creating sub-department:', error);
    
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(409).json({
        success: false,
        message: 'Sub-department code must be unique within the department'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating sub-department',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/admin/officers
 * @desc    Create a new officer with auto-generated credentials
 * @access  Super Admin only
 */
const createOfficerAccount = async (req, res) => {
  try {
    const { officerName, assignedDepartment, assignedSubDepartment, email, mobileNumber } = req.body;
    
    // Validate required fields
    if (!officerName || !assignedDepartment || !assignedSubDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Officer name, department, and sub-department are required',
        fields: ['officerName', 'assignedDepartment', 'assignedSubDepartment']
      });
    }
    
    // Use officer lifecycle service
    const result = await createOfficer(req.user, {
      officerName,
      assignedDepartment,
      assignedSubDepartment,
      email,
      mobileNumber
    });
    
    res.status(201).json({
      success: true,
      message: 'Officer created successfully',
      officer: result.officer,
      credentials: result.credentials,
      instructions: {
        login: 'Officer can login using Officer ID and temporary password',
        passwordChange: 'Officer must change password on first login',
        endpoint: 'POST /api/auth/officer/login'
      }
    });
    
  } catch (error) {
    console.error('Error creating officer:', error);
    
    if (error instanceof DataIntegrityError) {
      return res.status(409).json({
        success: false,
        message: error.message,
        constraint: error.constraint,
        entity: error.entity,
        details: error.details
      });
    }
    
    if (error.code === 11000) {
      // MongoDB duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Officer ${field} must be unique`,
        field: field
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating officer',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/admin/officers/:id/transfer
 * @desc    Transfer officer to new department/sub-department
 * @access  Super Admin only
 */
const transferOfficerToDepartment = async (req, res) => {
  try {
    const officerId = req.params.id;
    const { toDepartment, toSubDepartment, reason } = req.body;
    
    // Validate required fields
    if (!toDepartment || !toSubDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Destination department and sub-department are required',
        fields: ['toDepartment', 'toSubDepartment']
      });
    }
    
    // Use officer lifecycle service
    const result = await transferOfficer(req.user, officerId, {
      toDepartment,
      toSubDepartment,
      reason: reason || 'Administrative transfer'
    });
    
    res.json({
      success: true,
      message: 'Officer transferred successfully',
      officer: result.officer,
      transfer: result.transfer,
      note: 'Officer access permissions updated immediately'
    });
    
  } catch (error) {
    console.error('Error transferring officer:', error);
    
    if (error instanceof DataIntegrityError) {
      return res.status(409).json({
        success: false,
        message: error.message,
        constraint: error.constraint,
        entity: error.entity,
        details: error.details
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error transferring officer',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/admin/officers/:id
 * @desc    Retire officer from the system (hard delete)
 * @access  Super Admin only
 */
const retireOfficerFromSystem = async (req, res) => {
  try {
    const officerId = req.params.id;
    
    // Use officer lifecycle service
    const result = await retireOfficer(req.user, officerId);
    
    res.json({
      success: true,
      message: 'Officer retired successfully',
      retiredOfficer: result.retiredOfficer,
      retirement: result.retirement,
      note: 'Officer login credentials revoked immediately. Historical complaint records preserved.'
    });
    
  } catch (error) {
    console.error('Error retiring officer:', error);
    
    if (error instanceof DataIntegrityError) {
      return res.status(409).json({
        success: false,
        message: error.message,
        constraint: error.constraint,
        entity: error.entity,
        details: error.details
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error retiring officer',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/departments
 * @desc    Get all departments with statistics
 * @access  Super Admin only
 */
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('subDepartmentsCount')
      .populate('officersCount')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: departments.length,
      departments: departments.map(dept => ({
        _id: dept._id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        isActive: dept.isActive,
        subDepartmentsCount: dept.subDepartmentsCount || 0,
        officersCount: dept.officersCount || 0,
        createdAt: dept.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/admin/departments/:id
 * @desc    Update department details
 * @access  Super Admin only
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Update fields
    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description.trim();
    
    await department.save();
    
    // Create audit log
    await createAuditLog({
      action: 'DEPARTMENT_UPDATE',
      user: req.user,
      entityType: 'DEPARTMENT',
      entityId: department._id,
      details: {
        departmentName: department.name,
        departmentCode: department.code,
        updatedBy: req.user.adminName
      },
      req
    });
    
    res.json({
      success: true,
      message: 'Department updated successfully',
      department: {
        _id: department._id,
        name: department.name,
        code: department.code,
        description: department.description,
        isActive: department.isActive
      }
    });
    
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/admin/departments/:id
 * @desc    Deactivate department
 * @access  Super Admin only
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Deactivate instead of hard delete
    department.isActive = false;
    await department.save();
    
    // Create audit log
    await createAuditLog({
      action: 'DEPARTMENT_DELETE',
      user: req.user,
      entityType: 'DEPARTMENT',
      entityId: department._id,
      details: {
        departmentName: department.name,
        departmentCode: department.code,
        deactivatedBy: req.user.adminName
      },
      req
    });
    
    res.json({
      success: true,
      message: 'Department deactivated successfully'
    });
    
  } catch (error) {
    console.error('Error deactivating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating department',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/subdepartments
 * @desc    Get all sub-departments with department info
 * @access  Super Admin only
 */
const getAllSubDepartments = async (req, res) => {
  try {
    const { department } = req.query;
    
    const filter = { isActive: true };
    if (department) {
      filter.department = department;
    }
    
    const subDepartments = await SubDepartment.find(filter)
      .populate('department', 'name code')
      .populate('officersCount')
      .sort({ 'department.name': 1, name: 1 });
    
    res.json({
      success: true,
      count: subDepartments.length,
      subDepartments: subDepartments.map(subDept => ({
        _id: subDept._id,
        name: subDept.name,
        code: subDept.code,
        description: subDept.description,
        department: {
          _id: subDept.department._id,
          name: subDept.department.name,
          code: subDept.department.code
        },
        officersCount: subDept.officersCount || 0,
        isActive: subDept.isActive,
        createdAt: subDept.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching sub-departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sub-departments',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/admin/subdepartments/:id
 * @desc    Update sub-department details
 * @access  Super Admin only
 */
const updateSubDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const subDepartment = await SubDepartment.findById(id).populate('department', 'name code');
    if (!subDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Sub-department not found'
      });
    }
    
    // Update fields
    if (name) subDepartment.name = name.trim();
    if (description !== undefined) subDepartment.description = description.trim();
    
    await subDepartment.save();
    
    // Create audit log
    await createAuditLog({
      action: 'SUBDEPARTMENT_UPDATE',
      user: req.user,
      entityType: 'SUBDEPARTMENT',
      entityId: subDepartment._id,
      details: {
        subDepartmentName: subDepartment.name,
        subDepartmentCode: subDepartment.code,
        parentDepartment: subDepartment.department.name,
        updatedBy: req.user.adminName
      },
      req
    });
    
    res.json({
      success: true,
      message: 'Sub-department updated successfully',
      subDepartment: {
        _id: subDepartment._id,
        name: subDepartment.name,
        code: subDepartment.code,
        description: subDepartment.description,
        department: {
          _id: subDepartment.department._id,
          name: subDepartment.department.name,
          code: subDepartment.department.code
        },
        isActive: subDepartment.isActive
      }
    });
    
  } catch (error) {
    console.error('Error updating sub-department:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sub-department',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/admin/subdepartments/:id
 * @desc    Deactivate sub-department
 * @access  Super Admin only
 */
const deleteSubDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subDepartment = await SubDepartment.findById(id).populate('department', 'name');
    if (!subDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Sub-department not found'
      });
    }
    
    // Deactivate instead of hard delete
    subDepartment.isActive = false;
    await subDepartment.save();
    
    // Create audit log
    await createAuditLog({
      action: 'SUBDEPARTMENT_DELETE',
      user: req.user,
      entityType: 'SUBDEPARTMENT',
      entityId: subDepartment._id,
      details: {
        subDepartmentName: subDepartment.name,
        subDepartmentCode: subDepartment.code,
        parentDepartment: subDepartment.department.name,
        deactivatedBy: req.user.adminName
      },
      req
    });
    
    res.json({
      success: true,
      message: 'Sub-department deactivated successfully'
    });
    
  } catch (error) {
    console.error('Error deactivating sub-department:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating sub-department',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/officers
 * @desc    Get all officers with department assignments
 * @access  Super Admin only
 */
const getAllOfficers = async (req, res) => {
  try {
    const { department, subDepartment, isActive } = req.query;
    
    const filter = { role: 'OFFICER' };
    if (department) filter.assignedDepartment = department;
    if (subDepartment) filter.assignedSubDepartment = subDepartment;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const officers = await User.find(filter)
      .populate('assignedDepartment', 'name code')
      .populate('assignedSubDepartment', 'name code')
      .select('-password -otp -otpExpiry')
      .sort({ officerName: 1 });
    
    res.json({
      success: true,
      count: officers.length,
      officers: officers.map(officer => ({
        _id: officer._id,
        officerId: officer.officerId,
        officerName: officer.officerName,
        email: officer.email,
        mobileNumber: officer.mobileNumber,
        assignedDepartment: officer.assignedDepartment ? {
          _id: officer.assignedDepartment._id,
          name: officer.assignedDepartment.name,
          code: officer.assignedDepartment.code
        } : null,
        assignedSubDepartment: officer.assignedSubDepartment ? {
          _id: officer.assignedSubDepartment._id,
          name: officer.assignedSubDepartment.name,
          code: officer.assignedSubDepartment.code
        } : null,
        isActive: officer.isActive,
        isTemporaryPassword: officer.isTemporaryPassword,
        lastLogin: officer.lastLogin,
        createdAt: officer.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching officers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching officers',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/admin/officers/:id
 * @desc    Update officer details
 * @access  Super Admin only
 */
const updateOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerName, password, email, mobileNumber, assignedSubDepartment } = req.body;
    
    const officer = await User.findOne({ _id: id, role: 'OFFICER' });
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }
    
    // Update fields
    if (officerName) officer.officerName = officerName.trim();
    if (email) officer.email = email.toLowerCase().trim();
    if (mobileNumber) officer.mobileNumber = mobileNumber.trim();
    if (password) {
      officer.password = password; // Will be hashed by pre-save middleware
      officer.isTemporaryPassword = true;
      officer.passwordChangeRequired = true;
    }
    if (assignedSubDepartment) {
      // Get the sub-department to find its parent department
      const subDept = await SubDepartment.findById(assignedSubDepartment);
      if (subDept) {
        officer.assignedSubDepartment = assignedSubDepartment;
        officer.assignedDepartment = subDept.department;
      }
    }
    
    await officer.save();
    
    // Populate for response
    await officer.populate('assignedDepartment assignedSubDepartment');
    
    // Create audit log
    await createAuditLog({
      action: 'OFFICER_UPDATE',
      user: req.user,
      entityType: 'USER',
      entityId: officer._id,
      details: {
        officerId: officer.officerId,
        officerName: officer.officerName,
        updatedBy: req.user.adminName
      },
      req
    });
    
    res.json({
      success: true,
      message: 'Officer updated successfully',
      officer: {
        _id: officer._id,
        officerId: officer.officerId,
        officerName: officer.officerName,
        email: officer.email,
        mobileNumber: officer.mobileNumber,
        assignedDepartment: officer.assignedDepartment ? {
          _id: officer.assignedDepartment._id,
          name: officer.assignedDepartment.name,
          code: officer.assignedDepartment.code
        } : null,
        assignedSubDepartment: officer.assignedSubDepartment ? {
          _id: officer.assignedSubDepartment._id,
          name: officer.assignedSubDepartment.name,
          code: officer.assignedSubDepartment.code
        } : null,
        isActive: officer.isActive
      }
    });
    
  } catch (error) {
    console.error('Error updating officer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating officer',
      error: error.message
    });
  }
};

module.exports = {
  createDepartment,
  createSubDepartment,
  createOfficerAccount,
  transferOfficerToDepartment,
  retireOfficerFromSystem,
  getAllDepartments,
  getAllSubDepartments,
  getAllOfficers,
  updateDepartment,
  deleteDepartment,
  updateSubDepartment,
  deleteSubDepartment,
  updateOfficer
};