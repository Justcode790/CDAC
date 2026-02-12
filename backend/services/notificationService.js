/**
 * SUVIDHA 2026 - Notification Service
 * 
 * Handles notifications for transfers, communications, and escalations
 * Supports email and in-app notifications
 */

const User = require('../models/User');
const Department = require('../models/Department');
const SubDepartment = require('../models/SubDepartment');

/**
 * Send transfer notification to target department
 */
const notifyTransferInitiated = async (transfer, complaint) => {
  try {
    // Get officers in target department
    const targetSubDepts = await SubDepartment.find({ 
      department: transfer.toDepartment,
      isActive: true 
    }).select('_id');
    
    const targetSubDeptIds = targetSubDepts.map(sd => sd._id);
    
    const officers = await User.find({
      role: 'OFFICER',
      assignedSubDepartment: { $in: targetSubDeptIds },
      isActive: true
    });
    
    // In-app notification (would integrate with notification system)
    const notification = {
      type: 'TRANSFER_RECEIVED',
      title: 'New Complaint Transfer',
      message: `Complaint ${complaint.complaintNumber} has been transferred to your department`,
      data: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        transferId: transfer._id,
        fromDepartment: transfer.fromDepartment
      },
      recipients: officers.map(o => o._id)
    };
    
    // TODO: Send to notification queue/system
    console.log('Transfer notification:', notification);
    
    // Email notification (would integrate with email service)
    // TODO: Send emails to officers
    
    return {
      success: true,
      notificationsSent: officers.length
    };
  } catch (error) {
    console.error('Notify transfer initiated error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send notification when transfer is accepted
 */
const notifyTransferAccepted = async (transfer, complaint) => {
  try {
    // Notify the officer who initiated the transfer
    const notification = {
      type: 'TRANSFER_ACCEPTED',
      title: 'Transfer Accepted',
      message: `Your transfer of complaint ${complaint.complaintNumber} has been accepted`,
      data: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        transferId: transfer._id,
        acceptedBy: transfer.acceptedBy
      },
      recipients: [transfer.transferredBy]
    };
    
    console.log('Transfer accepted notification:', notification);
    
    return {
      success: true,
      notificationsSent: 1
    };
  } catch (error) {
    console.error('Notify transfer accepted error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send notification when transfer is rejected
 */
const notifyTransferRejected = async (transfer, complaint) => {
  try {
    // Notify the officer who initiated the transfer
    const notification = {
      type: 'TRANSFER_REJECTED',
      title: 'Transfer Rejected',
      message: `Your transfer of complaint ${complaint.complaintNumber} has been rejected`,
      data: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        transferId: transfer._id,
        rejectedBy: transfer.rejectedBy,
        rejectionReason: transfer.rejectionReason
      },
      recipients: [transfer.transferredBy]
    };
    
    console.log('Transfer rejected notification:', notification);
    
    return {
      success: true,
      notificationsSent: 1
    };
  } catch (error) {
    console.error('Notify transfer rejected error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send notification to citizen about major transfer
 */
const notifyCitizenTransfer = async (complaint, newDepartment) => {
  try {
    const citizen = await User.findById(complaint.citizen);
    
    if (!citizen) {
      return { success: false, error: 'Citizen not found' };
    }
    
    const notification = {
      type: 'COMPLAINT_TRANSFERRED',
      title: 'Complaint Transferred',
      message: `Your complaint ${complaint.complaintNumber} has been transferred to ${newDepartment.name} for better handling`,
      data: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        newDepartment: newDepartment.name
      },
      recipients: [citizen._id]
    };
    
    console.log('Citizen transfer notification:', notification);
    
    // TODO: Send SMS/Email to citizen
    
    return {
      success: true,
      notificationsSent: 1
    };
  } catch (error) {
    console.error('Notify citizen transfer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send notification for new communication
 */
const notifyCommunication = async (communication, complaint) => {
  try {
    const recipients = [];
    
    // Add tagged officers
    if (communication.taggedOfficers && communication.taggedOfficers.length > 0) {
      recipients.push(...communication.taggedOfficers);
    }
    
    // Add officers from tagged departments
    if (communication.taggedDepartments && communication.taggedDepartments.length > 0) {
      for (const deptId of communication.taggedDepartments) {
        const subDepts = await SubDepartment.find({ 
          department: deptId,
          isActive: true 
        }).select('_id');
        
        const officers = await User.find({
          role: 'OFFICER',
          assignedSubDepartment: { $in: subDepts.map(sd => sd._id) },
          isActive: true
        }).select('_id');
        
        recipients.push(...officers.map(o => o._id));
      }
    }
    
    // Remove duplicates
    const uniqueRecipients = [...new Set(recipients.map(r => r.toString()))];
    
    const notification = {
      type: 'NEW_COMMUNICATION',
      title: 'New Message',
      message: `New message on complaint ${complaint.complaintNumber}`,
      data: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        communicationId: communication._id,
        sentBy: communication.sentBy
      },
      recipients: uniqueRecipients
    };
    
    console.log('Communication notification:', notification);
    
    return {
      success: true,
      notificationsSent: uniqueRecipients.length
    };
  } catch (error) {
    console.error('Notify communication error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send escalation notification to senior officers and admins
 */
const notifyEscalation = async (complaint, escalatedBy, escalationReason) => {
  try {
    // Get admins and senior officers
    const admins = await User.find({
      role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
      isActive: true
    }).select('_id');
    
    // Get department head (if exists)
    const department = await Department.findById(complaint.department).populate('headOfficer');
    
    const recipients = admins.map(a => a._id);
    if (department && department.headOfficer) {
      recipients.push(department.headOfficer._id);
    }
    
    const notification = {
      type: 'COMPLAINT_ESCALATED',
      title: 'Complaint Escalated',
      message: `Complaint ${complaint.complaintNumber} has been escalated - Requires immediate attention`,
      data: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        escalatedBy: escalatedBy._id,
        escalationReason,
        priority: 'URGENT'
      },
      recipients,
      urgent: true
    };
    
    console.log('Escalation notification:', notification);
    
    // TODO: Send urgent email/SMS
    
    return {
      success: true,
      notificationsSent: recipients.length
    };
  } catch (error) {
    console.error('Notify escalation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send notification for unclaimed complaint (24 hours)
 */
const notifyUnclaimedComplaint = async (complaint) => {
  try {
    // Get officers in the assigned sub-department
    const officers = await User.find({
      role: 'OFFICER',
      assignedSubDepartment: complaint.subDepartment,
      isActive: true
    });
    
    const notification = {
      type: 'UNCLAIMED_COMPLAINT',
      title: 'Unclaimed Complaint',
      message: `Complaint ${complaint.complaintNumber} has been unclaimed for 24 hours`,
      data: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        createdAt: complaint.createdAt
      },
      recipients: officers.map(o => o._id)
    };
    
    console.log('Unclaimed complaint notification:', notification);
    
    return {
      success: true,
      notificationsSent: officers.length
    };
  } catch (error) {
    console.error('Notify unclaimed complaint error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Batch send notifications (for scheduled jobs)
 */
const sendBatchNotifications = async (notifications) => {
  try {
    // TODO: Implement batch notification sending
    // This would integrate with email service, SMS service, push notifications, etc.
    
    console.log(`Sending ${notifications.length} batch notifications`);
    
    return {
      success: true,
      sent: notifications.length
    };
  } catch (error) {
    console.error('Send batch notifications error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  notifyTransferInitiated,
  notifyTransferAccepted,
  notifyTransferRejected,
  notifyCitizenTransfer,
  notifyCommunication,
  notifyEscalation,
  notifyUnclaimedComplaint,
  sendBatchNotifications
};
