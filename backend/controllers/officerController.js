/**
 * SUVIDHA 2026 - Officer Controller
 * 
 * Handles CRUD operations for Officers.
 * Only ADMIN users can create, update, or assign officers.
 * Officers are assigned to exactly ONE sub-department.
 */

const User = require('../models/User.js');
const SubDepartment = require('../models/SubDepartment.js');
const Department = require('../models/Department.js');
const { createAuditLog } = require('../utils/auditLogger.js');

/**
 * @route   POST /api/officers
 * @desc    Create new officer
 * @access  Private (ADMIN only)
 */
const createOfficer = async (req, res) => {
  try {
    const { officerId, password, officerName, assignedDepartment, assignedSubDepartment } = req.body;

    // Validation
    if (!officerId || !password || !officerName || !assignedSubDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Officer ID, password, name, and assigned sub-department are required'
      });
    }

    // Verify sub-department exists
    const subDepartment = await SubDepartment.findById(assignedSubDepartment)
      .populate('department');

    if (!subDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Sub-department not found'
      });
    }

    if (!subDepartment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign officer to inactive sub-department'
      });
    }

    // Verify department matches (if provided)
    if (assignedDepartment) {
      if (subDepartment.department._id.toString() !== assignedDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Sub-department does not belong to the specified department'
        });
      }
    }

    // Check if officer ID already exists
    const existingOfficer = await User.findOne({
      officerId: officerId.toUpperCase(),
      role: 'OFFICER'
    });

    if (existingOfficer) {
      return res.status(400).json({
        success: false,
        message: 'Officer with this ID already exists'
      });
    }

    // Create officer
    const officer = new User({
      role: 'OFFICER',
      officerId: officerId.toUpperCase().trim(),
      password, // Will be hashed by pre-save hook
      officerName: officerName.trim(),
      assignedDepartment: subDepartment.department._id,
      assignedSubDepartment: assignedSubDepartment,
      isActive: true
    });

    await officer.save();
    await officer.populate('assignedDepartment assignedSubDepartment');

    // Log audit
    await createAuditLog({
      action: 'OFFICER_CREATE',
      user: req.user,
      entityType: 'USER',
      entityId: officer._id,
      details: {
        officerId: officer.officerId,
        officerName: officer.officerName,
        subDepartment: subDepartment.name
      },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Officer created successfully',
      officer: {
        id: officer._id,
        officerId: officer.officerId,
        officerName: officer.officerName,
        assignedDepartment: officer.assignedDepartment,
        assignedSubDepartment: officer.assignedSubDepartment,
        isActive: officer.isActive
      }
    });
  } catch (error) {
    console.error('Create officer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating officer',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/officers
 * @desc    Get all officers
 * @access  Private (ADMIN only)
 */
const getOfficers = async (req, res) => {
  try {
    const { department, subDepartment, isActive, search } = req.query;
    
    // Build query
    const query = { role: 'OFFICER' };
    
    if (department) {
      query.assignedDepartment = department;
    }
    
    if (subDepartment) {
      query.assignedSubDepartment = subDepartment;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { officerId: { $regex: search, $options: 'i' } },
        { officerName: { $regex: search, $options: 'i' } }
      ];
    }

    const officers = await User.find(query)
      .populate('assignedDepartment', 'name code')
      .populate('assignedSubDepartment', 'name code')
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: officers.length,
      officers
    });
  } catch (error) {
    console.error('Get officers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching officers',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/officers/:id
 * @desc    Get single officer by ID
 * @access  Private (ADMIN only)
 */
const getOfficerById = async (req, res) => {
  try {
    const officer = await User.findOne({
      _id: req.params.id,
      role: 'OFFICER'
    })
      .populate('assignedDepartment', 'name code')
      .populate('assignedSubDepartment', 'name code')
      .select('-password -otp -otpExpiry');

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    res.json({
      success: true,
      officer
    });
  } catch (error) {
    console.error('Get officer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching officer',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/officers/:id
 * @desc    Update officer
 * @access  Private (ADMIN only)
 */
const updateOfficer = async (req, res) => {
  try {
    const { officerName, password, assignedSubDepartment, isActive } = req.body;

    const officer = await User.findOne({
      _id: req.params.id,
      role: 'OFFICER'
    });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    // If sub-department is being changed, verify it exists
    if (assignedSubDepartment) {
      const subDepartment = await SubDepartment.findById(assignedSubDepartment)
        .populate('department');

      if (!subDepartment) {
        return res.status(404).json({
          success: false,
          message: 'Sub-department not found'
        });
      }

      if (!subDepartment.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign officer to inactive sub-department'
        });
      }

      officer.assignedDepartment = subDepartment.department._id;
      officer.assignedSubDepartment = assignedSubDepartment;
    }

    // Update other fields
    if (officerName) officer.officerName = officerName.trim();
    if (password) officer.password = password; // Will be hashed by pre-save hook
    if (isActive !== undefined) officer.isActive = isActive;

    await officer.save();
    await officer.populate('assignedDepartment assignedSubDepartment');

    // Log audit
    await createAuditLog({
      action: 'OFFICER_UPDATE',
      user: req.user,
      entityType: 'USER',
      entityId: officer._id,
      details: {
        updatedFields: Object.keys(req.body)
      },
      req
    });

    res.json({
      success: true,
      message: 'Officer updated successfully',
      officer: {
        id: officer._id,
        officerId: officer.officerId,
        officerName: officer.officerName,
        assignedDepartment: officer.assignedDepartment,
        assignedSubDepartment: officer.assignedSubDepartment,
        isActive: officer.isActive
      }
    });
  } catch (error) {
    console.error('Update officer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating officer',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/officers/:id/assign
 * @desc    Assign officer to sub-department
 * @access  Private (ADMIN only)
 */
const assignOfficer = async (req, res) => {
  try {
    const { assignedSubDepartment } = req.body;

    if (!assignedSubDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Sub-department is required'
      });
    }

    const officer = await User.findOne({
      _id: req.params.id,
      role: 'OFFICER'
    });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    // Verify sub-department exists
    const subDepartment = await SubDepartment.findById(assignedSubDepartment)
      .populate('department');

    if (!subDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Sub-department not found'
      });
    }

    if (!subDepartment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign officer to inactive sub-department'
      });
    }

    // Update assignment
    const oldSubDepartment = officer.assignedSubDepartment;
    officer.assignedDepartment = subDepartment.department._id;
    officer.assignedSubDepartment = assignedSubDepartment;

    await officer.save();
    await officer.populate('assignedDepartment assignedSubDepartment');

    // Log audit
    await createAuditLog({
      action: 'OFFICER_ASSIGN',
      user: req.user,
      entityType: 'USER',
      entityId: officer._id,
      details: {
        officerId: officer.officerId,
        oldSubDepartment: oldSubDepartment?.toString(),
        newSubDepartment: assignedSubDepartment,
        subDepartmentName: subDepartment.name
      },
      req
    });

    res.json({
      success: true,
      message: 'Officer assigned successfully',
      officer: {
        id: officer._id,
        officerId: officer.officerId,
        assignedDepartment: officer.assignedDepartment,
        assignedSubDepartment: officer.assignedSubDepartment
      }
    });
  } catch (error) {
    console.error('Assign officer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning officer',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/officers/:id/deactivate
 * @desc    Deactivate officer
 * @access  Private (ADMIN only)
 */
const deactivateOfficer = async (req, res) => {
  try {
    const officer = await User.findOne({
      _id: req.params.id,
      role: 'OFFICER'
    });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    officer.isActive = false;
    await officer.save();

    // Log audit
    await createAuditLog({
      action: 'OFFICER_DEACTIVATE',
      user: req.user,
      entityType: 'USER',
      entityId: officer._id,
      details: {
        officerId: officer.officerId,
        officerName: officer.officerName
      },
      req
    });

    res.json({
      success: true,
      message: 'Officer deactivated successfully',
      officer: {
        id: officer._id,
        officerId: officer.officerId,
        isActive: officer.isActive
      }
    });
  } catch (error) {
    console.error('Deactivate officer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating officer',
      error: error.message
    });
  }
};

module.exports = {
  createOfficer,
  getOfficers,
  getOfficerById,
  updateOfficer,
  assignOfficer,
  deactivateOfficer
};
