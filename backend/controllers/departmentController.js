/**
 * SUVIDHA 2026 - Department Controller
 * 
 * Handles CRUD operations for Departments.
 * Only ADMIN users can create, update, or delete departments.
 */

const Department = require('../models/Department.js');
const { createAuditLog } = require('../utils/auditLogger.js');

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (ADMIN only)
 */
const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required'
      });
    }

    // Check if department with same code exists
    const existingDept = await Department.findOne({
      $or: [
        { code: code.toUpperCase() },
        { name: { $regex: new RegExp(`^${name}$`, 'i') } }
      ]
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this code or name already exists'
      });
    }

    // Create department
    const department = new Department({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description?.trim() || '',
      createdBy: req.user._id
    });

    await department.save();

    // Log audit
    await createAuditLog({
      action: 'DEPARTMENT_CREATE',
      user: req.user,
      entityType: 'DEPARTMENT',
      entityId: department._id,
      details: {
        name: department.name,
        code: department.code
      },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Private (ADMIN, OFFICER)
 */
const getDepartments = async (req, res) => {
  try {
    const { isActive, search } = req.query;
    
    // Build query
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const departments = await Department.find(query)
      .populate('createdBy', 'adminName adminEmail')
      .populate('subDepartments')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/departments/:id
 * @desc    Get single department by ID
 * @access  Private (ADMIN, OFFICER)
 */
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('createdBy', 'adminName adminEmail')
      .populate('subDepartmentsCount')
      .populate('officersCount');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      department
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Private (ADMIN only)
 */
const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, isActive } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if code/name conflicts with other departments
    if (code || name) {
      const existingDept = await Department.findOne({
        _id: { $ne: department._id },
        $or: [
          code && { code: code.toUpperCase() },
          name && { name: { $regex: new RegExp(`^${name}$`, 'i') } }
        ].filter(Boolean)
      });

      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Department with this code or name already exists'
        });
      }
    }

    // Update fields
    if (name) department.name = name.trim();
    if (code) department.code = code.toUpperCase().trim();
    if (description !== undefined) department.description = description?.trim() || '';
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    // Log audit
    await createAuditLog({
      action: 'DEPARTMENT_UPDATE',
      user: req.user,
      entityType: 'DEPARTMENT',
      entityId: department._id,
      details: {
        updatedFields: Object.keys(req.body)
      },
      req
    });

    res.json({
      success: true,
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (soft delete by setting isActive=false)
 * @access  Private (ADMIN only)
 */
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Soft delete - set isActive to false
    department.isActive = false;
    await department.save();

    // Log audit
    await createAuditLog({
      action: 'DEPARTMENT_DELETE',
      user: req.user,
      entityType: 'DEPARTMENT',
      entityId: department._id,
      details: {
        name: department.name,
        code: department.code
      },
      req
    });

    res.json({
      success: true,
      message: 'Department deactivated successfully',
      department
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};
