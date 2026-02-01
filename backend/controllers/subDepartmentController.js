/**
 * SUVIDHA 2026 - Sub-Department Controller
 * 
 * Handles CRUD operations for Sub-Departments.
 * Only ADMIN users can create, update, or delete sub-departments.
 * Each sub-department belongs to exactly one department.
 */

const SubDepartment = require('../models/SubDepartment.js');
const Department = require('../models/Department.js');
const { createAuditLog } = require('../utils/auditLogger.js');

/**
 * @route   POST /api/subdepartments
 * @desc    Create new sub-department
 * @access  Private (ADMIN only)
 */
const createSubDepartment = async (req, res) => {
  try {
    const { name, code, department, description } = req.body;

    // Validation
    if (!name || !code || !department) {
      return res.status(400).json({
        success: false,
        message: 'Sub-department name, code, and department are required'
      });
    }

    // Verify department exists
    const parentDepartment = await Department.findById(department);
    if (!parentDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Parent department not found'
      });
    }

    if (!parentDepartment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create sub-department under inactive department'
      });
    }

    // Check if sub-department with same code exists in this department
    const existingSubDept = await SubDepartment.findOne({
      department,
      code: code.toUpperCase()
    });

    if (existingSubDept) {
      return res.status(400).json({
        success: false,
        message: 'Sub-department with this code already exists in this department'
      });
    }

    // Create sub-department
    const subDepartment = new SubDepartment({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      department,
      description: description?.trim() || '',
      createdBy: req.user._id
    });

    await subDepartment.save();
    await subDepartment.populate('department', 'name code');

    // Log audit
    await createAuditLog({
      action: 'SUBDEPARTMENT_CREATE',
      user: req.user,
      entityType: 'SUBDEPARTMENT',
      entityId: subDepartment._id,
      details: {
        name: subDepartment.name,
        code: subDepartment.code,
        department: parentDepartment.name
      },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Sub-department created successfully',
      subDepartment
    });
  } catch (error) {
    console.error('Create sub-department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sub-department',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/subdepartments
 * @desc    Get all sub-departments
 * @access  Private (ADMIN, OFFICER)
 */
const getSubDepartments = async (req, res) => {
  try {
    const { department, isActive, search } = req.query;
    
    // Build query
    const query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const subDepartments = await SubDepartment.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'adminName adminEmail')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subDepartments.length,
      subDepartments
    });
  } catch (error) {
    console.error('Get sub-departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sub-departments',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/subdepartments/:id
 * @desc    Get single sub-department by ID
 * @access  Private (ADMIN, OFFICER)
 */
const getSubDepartmentById = async (req, res) => {
  try {
    const subDepartment = await SubDepartment.findById(req.params.id)
      .populate('department', 'name code')
      .populate('createdBy', 'adminName adminEmail')
      .populate('officersCount')
      .populate('complaintsCount');

    if (!subDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Sub-department not found'
      });
    }

    res.json({
      success: true,
      subDepartment
    });
  } catch (error) {
    console.error('Get sub-department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sub-department',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/subdepartments/:id
 * @desc    Update sub-department
 * @access  Private (ADMIN only)
 */
const updateSubDepartment = async (req, res) => {
  try {
    const { name, code, description, isActive, department } = req.body;

    const subDepartment = await SubDepartment.findById(req.params.id);

    if (!subDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Sub-department not found'
      });
    }

    // If department is being changed, verify new department exists
    if (department && department !== subDepartment.department.toString()) {
      const newDepartment = await Department.findById(department);
      if (!newDepartment) {
        return res.status(404).json({
          success: false,
          message: 'New department not found'
        });
      }
    }

    // Check if code conflicts with other sub-departments in same department
    if (code) {
      const targetDept = department || subDepartment.department;
      const existingSubDept = await SubDepartment.findOne({
        _id: { $ne: subDepartment._id },
        department: targetDept,
        code: code.toUpperCase()
      });

      if (existingSubDept) {
        return res.status(400).json({
          success: false,
          message: 'Sub-department with this code already exists in this department'
        });
      }
    }

    // Update fields
    if (name) subDepartment.name = name.trim();
    if (code) subDepartment.code = code.toUpperCase().trim();
    if (description !== undefined) subDepartment.description = description?.trim() || '';
    if (isActive !== undefined) subDepartment.isActive = isActive;
    if (department) subDepartment.department = department;

    await subDepartment.save();
    await subDepartment.populate('department', 'name code');

    // Log audit
    await createAuditLog({
      action: 'SUBDEPARTMENT_UPDATE',
      user: req.user,
      entityType: 'SUBDEPARTMENT',
      entityId: subDepartment._id,
      details: {
        updatedFields: Object.keys(req.body)
      },
      req
    });

    res.json({
      success: true,
      message: 'Sub-department updated successfully',
      subDepartment
    });
  } catch (error) {
    console.error('Update sub-department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sub-department',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/subdepartments/:id
 * @desc    Delete sub-department (soft delete)
 * @access  Private (ADMIN only)
 */
const deleteSubDepartment = async (req, res) => {
  try {
    const subDepartment = await SubDepartment.findById(req.params.id);

    if (!subDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Sub-department not found'
      });
    }

    // Soft delete - set isActive to false
    subDepartment.isActive = false;
    await subDepartment.save();

    // Log audit
    await createAuditLog({
      action: 'SUBDEPARTMENT_DELETE',
      user: req.user,
      entityType: 'SUBDEPARTMENT',
      entityId: subDepartment._id,
      details: {
        name: subDepartment.name,
        code: subDepartment.code
      },
      req
    });

    res.json({
      success: true,
      message: 'Sub-department deactivated successfully',
      subDepartment
    });
  } catch (error) {
    console.error('Delete sub-department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sub-department',
      error: error.message
    });
  }
};

module.exports = {
  createSubDepartment,
  getSubDepartments,
  getSubDepartmentById,
  updateSubDepartment,
  deleteSubDepartment
};
