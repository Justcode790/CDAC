/**
 * SUVIDHA 2026 - Communication Controller
 * 
 * API endpoints for inter-department communication
 */

const communicationService = require('../services/communicationService');
const notificationService = require('../services/notificationService');
const Complaint = require('../models/Complaint');

/**
 * @route   POST /api/complaints/:id/communications
 * @desc    Add communication message to complaint
 * @access  Private (Officer+)
 */
const addCommunication = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    const { message, messageType, taggedDepartments, taggedOfficers, isInternal } = req.body;
    
    // Validate message
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Get files from request
    const files = req.files || [];
    
    // Create communication
    const result = await communicationService.createMessage(
      req.user,
      complaintId,
      { message, messageType, taggedDepartments, taggedOfficers, isInternal },
      files
    );
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
    
    // Send notifications
    const complaint = await Complaint.findById(complaintId);
    await notificationService.notifyCommunication(result.communication, complaint);
    
    res.status(201).json({
      success: true,
      message: 'Communication added successfully',
      communication: result.communication
    });
    
  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding communication',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/complaints/:id/communications
 * @desc    Get communications for a complaint
 * @access  Private
 */
const getCommunications = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    
    const result = await communicationService.getComplaintCommunications(
      complaintId,
      req.user.role
    );
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      count: result.communications.length,
      communications: result.communications
    });
    
  } catch (error) {
    console.error('Get communications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching communications',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/communications/:id/read
 * @desc    Mark communication as read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { id: communicationId } = req.params;
    
    const result = await communicationService.markAsRead(req.user._id, communicationId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      message: 'Communication marked as read'
    });
    
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking communication as read',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/communications/unread/count
 * @desc    Get unread communication count for user
 * @access  Private (Officer+)
 */
const getUnreadCount = async (req, res) => {
  try {
    // Get user's department
    let departmentId;
    if (req.user.role === 'OFFICER') {
      const SubDepartment = require('../models/SubDepartment');
      const subDept = await SubDepartment.findById(req.user.assignedSubDepartment).select('department');
      departmentId = subDept.department;
    }
    
    const result = await communicationService.getUnreadCount(req.user._id, departmentId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      unreadCount: result.count
    });
    
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/communications/recent
 * @desc    Get recent communications for dashboard
 * @access  Private (Officer+)
 */
const getRecentCommunications = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get user's department
    let departmentId;
    if (req.user.role === 'OFFICER') {
      const SubDepartment = require('../models/SubDepartment');
      const subDept = await SubDepartment.findById(req.user.assignedSubDepartment).select('department');
      departmentId = subDept.department;
    }
    
    const result = await communicationService.getRecentCommunications(departmentId, parseInt(limit));
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      communications: result.communications
    });
    
  } catch (error) {
    console.error('Get recent communications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent communications',
      error: error.message
    });
  }
};

module.exports = {
  addCommunication,
  getCommunications,
  markAsRead,
  getUnreadCount,
  getRecentCommunications
};
