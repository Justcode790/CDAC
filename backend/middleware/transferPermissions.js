/**
 * SUVIDHA 2026 - Transfer Permission Middleware
 * 
 * Middleware functions to check permissions for complaint transfer operations
 */

const Complaint = require('../models/Complaint');
const ComplaintTransfer = require('../models/ComplaintTransfer');

/**
 * Check if user can transfer a complaint
 * 
 * Rules:
 * - SUPER_ADMIN: Can transfer any complaint
 * - ADMIN: Can transfer any complaint
 * - OFFICER: Can transfer any complaint
 */
const canTransferComplaint = async (req, res, next) => {
  try {
    const { id: complaintId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get complaint
    const complaint = await Complaint.findById(complaintId)
      .populate('department')
      .populate('subDepartment');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Allow SUPER_ADMIN, ADMIN, and OFFICER to transfer any complaint
    if (['SUPER_ADMIN', 'ADMIN', 'OFFICER'].includes(user.role)) {
      req.complaint = complaint;
      return next();
    }
    }
    
    // Default deny
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to transfer this complaint'
    });
    
  } catch (error) {
    console.error('Transfer permission check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking transfer permissions'
    });
  }
};

/**
 * Check if user can accept a transfer
 * 
 * Rules:
 * - SUPER_ADMIN: Can accept any transfer
 * - ADMIN: Can accept transfers to their department
 * - OFFICER: Can accept transfers to their department
 * - Transfer must be in PENDING status
 */
const canAcceptTransfer = async (req, res, next) => {
  try {
    const { id: complaintId, transferId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get transfer
    const transfer = await ComplaintTransfer.findById(transferId)
      .populate('complaint')
      .populate('fromDepartment')
      .populate('toDepartment')
      .populate('fromSubDepartment')
      .populate('toSubDepartment');
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }
    
    // Verify transfer belongs to complaint
    if (transfer.complaint._id.toString() !== complaintId) {
      return res.status(400).json({
        success: false,
        message: 'Transfer does not belong to this complaint'
      });
    }
    
    // Check if transfer is pending
    if (transfer.transferStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Transfer is already ${transfer.transferStatus.toLowerCase()}`
      });
    }
    
    // Super admin can accept any transfer
    if (user.role === 'SUPER_ADMIN') {
      req.transfer = transfer;
      return next();
    }
    
    // Admin and Officer can accept transfers to their department
    if (user.role === 'ADMIN' || user.role === 'OFFICER') {
      if (transfer.toDepartment._id.toString() === user.department.toString()) {
        req.transfer = transfer;
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'You can only accept transfers to your department'
        });
      }
    }
    
    // Default deny
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to accept this transfer'
    });
    
  } catch (error) {
    console.error('Accept transfer permission check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking accept transfer permissions'
    });
  }
};

/**
 * Check if user can reject a transfer
 * 
 * Rules:
 * - SUPER_ADMIN: Can reject any transfer
 * - ADMIN: Can reject transfers to their department
 * - OFFICER: Can reject transfers to their department
 * - Transfer must be in PENDING status
 */
const canRejectTransfer = async (req, res, next) => {
  try {
    const { id: complaintId, transferId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get transfer
    const transfer = await ComplaintTransfer.findById(transferId)
      .populate('complaint')
      .populate('fromDepartment')
      .populate('toDepartment')
      .populate('fromSubDepartment')
      .populate('toSubDepartment');
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }
    
    // Verify transfer belongs to complaint
    if (transfer.complaint._id.toString() !== complaintId) {
      return res.status(400).json({
        success: false,
        message: 'Transfer does not belong to this complaint'
      });
    }
    
    // Check if transfer is pending
    if (transfer.transferStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Transfer is already ${transfer.transferStatus.toLowerCase()}`
      });
    }
    
    // Super admin can reject any transfer
    if (user.role === 'SUPER_ADMIN') {
      req.transfer = transfer;
      return next();
    }
    
    // Admin and Officer can reject transfers to their department
    if (user.role === 'ADMIN' || user.role === 'OFFICER') {
      if (transfer.toDepartment._id.toString() === user.department.toString()) {
        req.transfer = transfer;
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'You can only reject transfers to your department'
        });
      }
    }
    
    // Default deny
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to reject this transfer'
    });
    
  } catch (error) {
    console.error('Reject transfer permission check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking reject transfer permissions'
    });
  }
};

/**
 * Check if user can view transfer history
 * 
 * Rules:
 * - SUPER_ADMIN: Can view any transfer history
 * - ADMIN: Can view transfers involving their department
 * - OFFICER: Can view transfers involving their department
 * - PUBLIC: Can view transfers for their own complaints
 */
const canViewTransferHistory = async (req, res, next) => {
  try {
    const { id: complaintId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get complaint
    const complaint = await Complaint.findById(complaintId)
      .populate('department')
      .populate('citizen');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Super admin can view any transfer history
    if (user.role === 'SUPER_ADMIN') {
      req.complaint = complaint;
      return next();
    }
    
    // Admin and Officer can view transfers involving their department
    if (user.role === 'ADMIN' || user.role === 'OFFICER') {
      if (complaint.department._id.toString() === user.department.toString()) {
        req.complaint = complaint;
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'You can only view transfers for complaints in your department'
        });
      }
    }
    
    // Citizens can view transfers for their own complaints
    if (user.role === 'PUBLIC') {
      if (complaint.citizen._id.toString() === user._id.toString()) {
        req.complaint = complaint;
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'You can only view transfers for your own complaints'
        });
      }
    }
    
    // Default deny
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view this transfer history'
    });
    
  } catch (error) {
    console.error('View transfer history permission check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking view transfer history permissions'
    });
  }
};

/**
 * Check if user can view pending transfers for a department
 * 
 * Rules:
 * - SUPER_ADMIN: Can view pending transfers for any department
 * - ADMIN: Can view pending transfers for their department
 * - OFFICER: Can view pending transfers for their department
 */
const canViewPendingTransfers = async (req, res, next) => {
  try {
    const { id: departmentId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Super admin can view pending transfers for any department
    if (user.role === 'SUPER_ADMIN') {
      return next();
    }
    
    // Admin and Officer can view pending transfers for their department
    if (user.role === 'ADMIN' || user.role === 'OFFICER') {
      if (departmentId === user.department.toString()) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'You can only view pending transfers for your department'
        });
      }
    }
    
    // Default deny
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view pending transfers'
    });
    
  } catch (error) {
    console.error('View pending transfers permission check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking view pending transfers permissions'
    });
  }
};

/**
 * Validate transfer target department
 * Ensures the target department is different from source
 */
const validateTransferTarget = async (req, res, next) => {
  try {
    const { targetDepartment, targetSubDepartment } = req.body;
    const complaint = req.complaint; // Set by canTransferComplaint middleware
    
    if (!complaint) {
      return res.status(400).json({
        success: false,
        message: 'Complaint not found in request'
      });
    }
    
    // Check if transferring to same department
    if (targetDepartment === complaint.department._id.toString()) {
      // If same department, sub-department must be different
      if (!targetSubDepartment || targetSubDepartment === complaint.subDepartment._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer to the same department and sub-department'
        });
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Validate transfer target error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating transfer target'
    });
  }
};

/**
 * Check for duplicate pending transfers
 * Prevents multiple pending transfers to the same department
 */
const checkDuplicateTransfer = async (req, res, next) => {
  try {
    const { id: complaintId } = req.params;
    const { targetDepartment } = req.body;
    
    // Check for existing pending transfer to same department
    const existingTransfer = await ComplaintTransfer.findOne({
      complaint: complaintId,
      toDepartment: targetDepartment,
      transferStatus: 'PENDING'
    });
    
    if (existingTransfer) {
      return res.status(400).json({
        success: false,
        message: 'A pending transfer to this department already exists'
      });
    }
    
    next();
    
  } catch (error) {
    console.error('Check duplicate transfer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking for duplicate transfers'
    });
  }
};

module.exports = {
  canTransferComplaint,
  canAcceptTransfer,
  canRejectTransfer,
  canViewTransferHistory,
  canViewPendingTransfers,
  validateTransferTarget,
  checkDuplicateTransfer
};
