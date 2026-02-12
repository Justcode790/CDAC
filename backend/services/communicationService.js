/**
 * SUVIDHA 2026 - Communication Service
 * 
 * Business logic for inter-department communication on complaints
 * Handles message creation, retrieval, and read status tracking
 */

const ComplaintCommunication = require('../models/ComplaintCommunication');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const { createAuditLog } = require('../utils/auditLogger');
const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * Create a new communication message
 */
const createMessage = async (user, complaintId, messageData, files = []) => {
  const { message, messageType, taggedDepartments, taggedOfficers, isInternal } = messageData;
  
  try {
    // Validate message
    if (!message || message.trim().length === 0) {
      return {
        success: false,
        error: 'INVALID_MESSAGE',
        message: 'Message content is required'
      };
    }
    
    if (message.length > 1000) {
      return {
        success: false,
        error: 'MESSAGE_TOO_LONG',
        message: 'Message cannot exceed 1000 characters'
      };
    }
    
    // Get complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return {
        success: false,
        error: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint not found'
      };
    }
    
    // Get user's department and sub-department
    let userDepartment, userSubDepartment;
    if (user.role === 'OFFICER') {
      const SubDepartment = require('../models/SubDepartment');
      userSubDepartment = await SubDepartment.findById(user.assignedSubDepartment).populate('department');
      userDepartment = userSubDepartment.department._id;
    } else {
      // For admins, use complaint's department
      userDepartment = complaint.department;
      userSubDepartment = complaint.subDepartment;
    }
    
    // Handle file attachments
    let attachments = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, {
        folder: `suvidha2026/communications/${complaintId}`,
        resource_type: 'auto'
      }));
      
      const uploadResults = await Promise.all(uploadPromises);
      attachments = uploadResults.map((result, index) => ({
        filename: result.public_id,
        originalName: files[index].originalname,
        mimeType: files[index].mimetype,
        size: files[index].size,
        url: result.secure_url
      }));
    }
    
    // Create communication
    const communication = await ComplaintCommunication.create({
      complaint: complaintId,
      message: message.trim(),
      messageType: messageType || 'INTER_DEPARTMENT',
      sentBy: user._id,
      sentByDepartment: userDepartment,
      sentBySubDepartment: userSubDepartment,
      taggedDepartments: taggedDepartments || [],
      taggedOfficers: taggedOfficers || [],
      isInternal: isInternal || false,
      attachments
    });
    
    // Update complaint communication count
    await complaint.incrementCommunicationCount();
    
    // Create audit log
    await createAuditLog({
      action: 'COMMUNICATION_CREATED',
      user: user,
      entityType: 'COMPLAINT',
      entityId: complaint._id,
      details: {
        complaintNumber: complaint.complaintNumber,
        messageType,
        communicationId: communication._id
      }
    });
    
    // Populate for response
    await communication.populate([
      { path: 'sentBy', select: 'name officerName officerId' },
      { path: 'sentByDepartment', select: 'name code' },
      { path: 'sentBySubDepartment', select: 'name code' },
      { path: 'taggedDepartments', select: 'name code' },
      { path: 'taggedOfficers', select: 'name officerName' }
    ]);
    
    return {
      success: true,
      communication
    };
    
  } catch (error) {
    console.error('Create message error:', error);
    return {
      success: false,
      error: 'CREATE_MESSAGE_FAILED',
      message: error.message
    };
  }
};

/**
 * Get communications for a complaint
 */
const getComplaintCommunications = async (complaintId, userRole) => {
  try {
    const communications = await ComplaintCommunication.getComplaintCommunications(complaintId, userRole);
    
    return {
      success: true,
      communications
    };
  } catch (error) {
    console.error('Get communications error:', error);
    return {
      success: false,
      error: 'GET_COMMUNICATIONS_FAILED',
      message: error.message
    };
  }
};

/**
 * Mark communication as read
 */
const markAsRead = async (userId, communicationId) => {
  try {
    const communication = await ComplaintCommunication.findById(communicationId);
    
    if (!communication) {
      return {
        success: false,
        error: 'COMMUNICATION_NOT_FOUND',
        message: 'Communication not found'
      };
    }
    
    await communication.markAsRead(userId);
    
    return {
      success: true,
      communication
    };
  } catch (error) {
    console.error('Mark as read error:', error);
    return {
      success: false,
      error: 'MARK_AS_READ_FAILED',
      message: error.message
    };
  }
};

/**
 * Get unread communication count for a user
 */
const getUnreadCount = async (userId, departmentId) => {
  try {
    const count = await ComplaintCommunication.getUnreadCount(userId, departmentId);
    
    return {
      success: true,
      count
    };
  } catch (error) {
    console.error('Get unread count error:', error);
    return {
      success: false,
      error: 'GET_UNREAD_COUNT_FAILED',
      message: error.message
    };
  }
};

/**
 * Get recent communications for dashboard
 */
const getRecentCommunications = async (departmentId, limit = 10) => {
  try {
    const communications = await ComplaintCommunication.getRecentCommunications(departmentId, limit);
    
    return {
      success: true,
      communications
    };
  } catch (error) {
    console.error('Get recent communications error:', error);
    return {
      success: false,
      error: 'GET_RECENT_COMMUNICATIONS_FAILED',
      message: error.message
    };
  }
};

/**
 * Get communication statistics
 */
const getCommunicationStats = async (departmentId, startDate, endDate) => {
  try {
    const stats = await ComplaintCommunication.getCommunicationStats(departmentId, startDate, endDate);
    
    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Get communication stats error:', error);
    return {
      success: false,
      error: 'GET_COMMUNICATION_STATS_FAILED',
      message: error.message
    };
  }
};

module.exports = {
  createMessage,
  getComplaintCommunications,
  markAsRead,
  getUnreadCount,
  getRecentCommunications,
  getCommunicationStats
};
