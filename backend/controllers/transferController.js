/**
 * SUVIDHA 2026 - Transfer Controller
 * 
 * API endpoints for complaint transfer operations
 */

const transferService = require('../services/transferService');
const notificationService = require('../services/notificationService');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');

/**
 * @route   POST /api/complaints/:id/transfer
 * @desc    Transfer complaint to another department
 * @access  Private (Officer+)
 */
const transferComplaint = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    const { targetDepartment, targetSubDepartment, transferType, transferReason, transferNotes } = req.body;
    
    // Validate required fields
    if (!targetDepartment || !transferReason) {
      return res.status(400).json({
        success: false,
        message: 'Target department and transfer reason are required'
      });
    }
    
    // Execute transfer
    const result = await transferService.executeTransfer(req.user, complaintId, {
      targetDepartment,
      targetSubDepartment,
      transferType,
      transferReason,
      transferNotes
    });
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
    
    // Send notifications
    const complaint = await Complaint.findById(complaintId);
    await notificationService.notifyTransferInitiated(result.transfer, complaint);
    
    // Notify citizen for major transfers
    if (transferType === 'DEPARTMENT') {
      const newDept = await Department.findById(targetDepartment);
      await notificationService.notifyCitizenTransfer(complaint, newDept);
    }
    
    res.status(201).json({
      success: true,
      message: 'Complaint transferred successfully',
      transfer: result.transfer,
      connectionCreated: result.connectionCreated
    });
    
  } catch (error) {
    console.error('Transfer complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error transferring complaint',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/complaints/:id/transfers
 * @desc    Get transfer history for a complaint
 * @access  Private (Officer+)
 */
const getTransferHistory = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    
    const result = await transferService.getTransferHistory(complaintId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      transfers: result.transfers
    });
    
  } catch (error) {
    console.error('Get transfer history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transfer history',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/complaints/:id/transfers/:transferId/accept
 * @desc    Accept a transfer
 * @access  Private (Officer+)
 */
const acceptTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    
    const result = await transferService.acceptTransfer(req.user, transferId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
    
    // Send notification
    await notificationService.notifyTransferAccepted(result.transfer, result.complaint);
    
    res.json({
      success: true,
      message: 'Transfer accepted successfully',
      transfer: result.transfer
    });
    
  } catch (error) {
    console.error('Accept transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting transfer',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/complaints/:id/transfers/:transferId/reject
 * @desc    Reject a transfer
 * @access  Private (Officer+)
 */
const rejectTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const result = await transferService.rejectTransfer(req.user, transferId, rejectionReason);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
    
    // Send notification
    const complaint = await Complaint.findById(result.transfer.complaint);
    await notificationService.notifyTransferRejected(result.transfer, complaint);
    
    res.json({
      success: true,
      message: 'Transfer rejected successfully',
      transfer: result.transfer
    });
    
  } catch (error) {
    console.error('Reject transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting transfer',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/departments/:id/pending-transfers
 * @desc    Get pending transfers for a department
 * @access  Private (Officer+)
 */
const getPendingTransfers = async (req, res) => {
  try {
    const { id: departmentId } = req.params;
    
    const result = await transferService.getPendingTransfers(departmentId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      count: result.transfers.length,
      transfers: result.transfers
    });
    
  } catch (error) {
    console.error('Get pending transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending transfers',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/transfers/stats
 * @desc    Get transfer statistics
 * @access  Private (Admin+)
 */
const getTransferStats = async (req, res) => {
  try {
    const { departmentId, startDate, endDate } = req.query;
    
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
    }
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    
    const result = await transferService.getTransferStats(departmentId, start, end);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      stats: result.stats,
      period: {
        startDate: start,
        endDate: end
      }
    });
    
  } catch (error) {
    console.error('Get transfer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transfer statistics',
      error: error.message
    });
  }
};

module.exports = {
  transferComplaint,
  getTransferHistory,
  acceptTransfer,
  rejectTransfer,
  getPendingTransfers,
  getTransferStats
};
