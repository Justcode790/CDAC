/**
 * SUVIDHA 2026 - Transfer Utilities
 * 
 * Helper functions for complaint transfer operations
 */

import { TRANSFER_REASONS, TRANSFER_STATUS, TRANSFER_TYPES, ROLES } from './constants';

/**
 * Get display text for transfer reason
 */
export const getTransferReasonDisplay = (reason) => {
  const reasonMap = {
    [TRANSFER_REASONS.CLARIFICATION]: 'Clarification Required',
    [TRANSFER_REASONS.RE_VERIFICATION]: 'Re-verification Needed',
    [TRANSFER_REASONS.FURTHER_INVESTIGATION]: 'Further Investigation',
    [TRANSFER_REASONS.SPECIALIZED_HANDLING]: 'Specialized Handling Required',
    [TRANSFER_REASONS.WRONG_DEPARTMENT]: 'Wrong Department',
    [TRANSFER_REASONS.ESCALATION]: 'Escalation',
    [TRANSFER_REASONS.OTHER]: 'Other'
  };
  return reasonMap[reason] || reason;
};

/**
 * Get color classes for transfer status
 */
export const getTransferStatusColor = (status) => {
  const colorMap = {
    [TRANSFER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [TRANSFER_STATUS.ACCEPTED]: 'bg-green-100 text-green-800 border-green-200',
    [TRANSFER_STATUS.REJECTED]: 'bg-red-100 text-red-800 border-red-200'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Get icon color for transfer status
 */
export const getTransferStatusIconColor = (status) => {
  const colorMap = {
    [TRANSFER_STATUS.PENDING]: 'text-yellow-600',
    [TRANSFER_STATUS.ACCEPTED]: 'text-green-600',
    [TRANSFER_STATUS.REJECTED]: 'text-red-600'
  };
  return colorMap[status] || 'text-gray-600';
};

/**
 * Format transfer date with relative time
 */
export const formatTransferDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Relative time for recent transfers
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  // Absolute date for older transfers
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date in full format
 */
export const formatTransferDateFull = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Check if user can transfer a complaint
 */
export const canTransferComplaint = (user, complaint) => {
  if (!user || !complaint) return false;
  
  // Super admin can transfer any complaint
  if (user.role === ROLES.SUPER_ADMIN) return true;
  
  // Get user's department (officers have assignedDepartment, admins have department)
  const userDepartment = user.assignedDepartment || user.department;
  
  if (!userDepartment) return false;
  
  // Check if complaint is in user's department
  const complaintDepartment = complaint.department?._id || complaint.department;
  const sameDepartment = complaintDepartment === userDepartment || 
                        complaintDepartment?.toString() === userDepartment?.toString();
  
  // Admin can transfer complaints in their department
  if (user.role === ROLES.ADMIN) {
    return sameDepartment;
  }
  
  // Officer can transfer complaints in their department
  if (user.role === ROLES.OFFICER) {
    return sameDepartment;
  }
  
  return false;
};

/**
 * Check if user can accept a transfer
 */
export const canAcceptTransfer = (user, transfer) => {
  if (!user || !transfer) return false;
  
  // Transfer must be pending
  if (transfer.transferStatus !== TRANSFER_STATUS.PENDING) return false;
  
  // Super admin can accept any transfer
  if (user.role === ROLES.SUPER_ADMIN) return true;
  
  // Get user's department (officers have assignedDepartment, admins have department)
  const userDepartment = user.assignedDepartment || user.department;
  
  // Admin can accept transfers to their department
  if (user.role === ROLES.ADMIN) {
    return transfer.toDepartment?._id === userDepartment?._id ||
           transfer.toDepartment === userDepartment;
  }
  
  // Officer can accept transfers to their department
  if (user.role === ROLES.OFFICER) {
    return transfer.toDepartment?._id === userDepartment?._id ||
           transfer.toDepartment === userDepartment;
  }
  
  return false;
};

/**
 * Check if user can reject a transfer
 */
export const canRejectTransfer = (user, transfer) => {
  // Same logic as accepting
  return canAcceptTransfer(user, transfer);
};

/**
 * Get transfer type display text
 */
export const getTransferTypeDisplay = (type) => {
  const typeMap = {
    [TRANSFER_TYPES.DEPARTMENT]: 'Department Transfer',
    [TRANSFER_TYPES.SUB_DEPARTMENT]: 'Sub-Department Transfer',
    [TRANSFER_TYPES.ESCALATION]: 'Escalation'
  };
  return typeMap[type] || type;
};

/**
 * Calculate transfer duration (time between transfer and acceptance/rejection)
 */
export const calculateTransferDuration = (transfer) => {
  if (!transfer.transferredAt) return null;
  
  const startDate = new Date(transfer.transferredAt);
  const endDate = transfer.acceptedAt 
    ? new Date(transfer.acceptedAt) 
    : transfer.rejectedAt 
      ? new Date(transfer.rejectedAt)
      : new Date();
  
  const diffMs = endDate - startDate;
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
};

/**
 * Check if transfer is overdue (pending for more than 48 hours)
 */
export const isTransferOverdue = (transfer) => {
  if (transfer.transferStatus !== TRANSFER_STATUS.PENDING) return false;
  
  const transferDate = new Date(transfer.transferredAt);
  const now = new Date();
  const diffHours = Math.floor((now - transferDate) / 3600000);
  
  return diffHours > 48; // 48 hours threshold
};

/**
 * Get priority level based on transfer reason
 */
export const getTransferPriority = (reason) => {
  const priorityMap = {
    [TRANSFER_REASONS.ESCALATION]: 'URGENT',
    [TRANSFER_REASONS.WRONG_DEPARTMENT]: 'HIGH',
    [TRANSFER_REASONS.SPECIALIZED_HANDLING]: 'HIGH',
    [TRANSFER_REASONS.FURTHER_INVESTIGATION]: 'MEDIUM',
    [TRANSFER_REASONS.RE_VERIFICATION]: 'MEDIUM',
    [TRANSFER_REASONS.CLARIFICATION]: 'LOW',
    [TRANSFER_REASONS.OTHER]: 'MEDIUM'
  };
  return priorityMap[reason] || 'MEDIUM';
};

/**
 * Get priority color classes
 */
export const getPriorityColor = (priority) => {
  const colorMap = {
    'URGENT': 'bg-red-100 text-red-800 border-red-300',
    'HIGH': 'bg-orange-100 text-orange-800 border-orange-300',
    'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'LOW': 'bg-blue-100 text-blue-800 border-blue-300'
  };
  return colorMap[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
};

/**
 * Validate transfer data before submission
 */
export const validateTransferData = (data) => {
  const errors = {};
  
  if (!data.targetDepartment) {
    errors.targetDepartment = 'Target department is required';
  }
  
  if (!data.transferReason) {
    errors.transferReason = 'Transfer reason is required';
  }
  
  if (data.transferReason === TRANSFER_REASONS.OTHER) {
    if (!data.transferNotes || data.transferNotes.trim().length < 20) {
      errors.transferNotes = 'Please provide detailed notes (minimum 20 characters) when selecting "Other"';
    }
  }
  
  if (data.transferNotes && data.transferNotes.length > 500) {
    errors.transferNotes = 'Transfer notes cannot exceed 500 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate rejection reason
 */
export const validateRejectionReason = (reason) => {
  if (!reason || reason.trim().length === 0) {
    return {
      isValid: false,
      error: 'Rejection reason is required'
    };
  }
  
  if (reason.trim().length < 10) {
    return {
      isValid: false,
      error: 'Rejection reason must be at least 10 characters'
    };
  }
  
  if (reason.length > 500) {
    return {
      isValid: false,
      error: 'Rejection reason cannot exceed 500 characters'
    };
  }
  
  return { isValid: true };
};

/**
 * Group transfers by status
 */
export const groupTransfersByStatus = (transfers) => {
  return transfers.reduce((acc, transfer) => {
    const status = transfer.transferStatus;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(transfer);
    return acc;
  }, {});
};

/**
 * Sort transfers by date (newest first)
 */
export const sortTransfersByDate = (transfers, ascending = false) => {
  return [...transfers].sort((a, b) => {
    const dateA = new Date(a.transferredAt);
    const dateB = new Date(b.transferredAt);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Filter transfers by date range
 */
export const filterTransfersByDateRange = (transfers, startDate, endDate) => {
  return transfers.filter(transfer => {
    const transferDate = new Date(transfer.transferredAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && transferDate < start) return false;
    if (end && transferDate > end) return false;
    return true;
  });
};

/**
 * Get transfer statistics
 */
export const calculateTransferStats = (transfers) => {
  const total = transfers.length;
  const pending = transfers.filter(t => t.transferStatus === TRANSFER_STATUS.PENDING).length;
  const accepted = transfers.filter(t => t.transferStatus === TRANSFER_STATUS.ACCEPTED).length;
  const rejected = transfers.filter(t => t.transferStatus === TRANSFER_STATUS.REJECTED).length;
  const overdue = transfers.filter(t => isTransferOverdue(t)).length;
  
  // Calculate average response time for completed transfers
  const completedTransfers = transfers.filter(t => 
    t.transferStatus !== TRANSFER_STATUS.PENDING && 
    (t.acceptedAt || t.rejectedAt)
  );
  
  let avgResponseTime = 0;
  if (completedTransfers.length > 0) {
    const totalHours = completedTransfers.reduce((sum, transfer) => {
      const start = new Date(transfer.transferredAt);
      const end = new Date(transfer.acceptedAt || transfer.rejectedAt);
      return sum + Math.floor((end - start) / 3600000);
    }, 0);
    avgResponseTime = Math.round(totalHours / completedTransfers.length);
  }
  
  return {
    total,
    pending,
    accepted,
    rejected,
    overdue,
    acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
    rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
    avgResponseTimeHours: avgResponseTime
  };
};

/**
 * Format department path (Department > Sub-Department)
 */
export const formatDepartmentPath = (department, subDepartment) => {
  if (!department) return 'N/A';
  
  let path = department.name || department;
  if (subDepartment) {
    path += ` > ${subDepartment.name || subDepartment}`;
  }
  return path;
};

/**
 * Check if departments are the same
 */
export const isSameDepartment = (dept1, dept2) => {
  if (!dept1 || !dept2) return false;
  
  const id1 = dept1._id || dept1;
  const id2 = dept2._id || dept2;
  
  return id1 === id2;
};

/**
 * Get transfer notification message
 */
export const getTransferNotificationMessage = (transfer, action) => {
  const complaintNumber = transfer.complaint?.complaintNumber || 'N/A';
  const fromDept = transfer.fromDepartment?.name || 'Unknown';
  const toDept = transfer.toDepartment?.name || 'Unknown';
  
  switch (action) {
    case 'created':
      return `Complaint #${complaintNumber} has been transferred from ${fromDept} to ${toDept}`;
    case 'accepted':
      return `Transfer of complaint #${complaintNumber} has been accepted by ${toDept}`;
    case 'rejected':
      return `Transfer of complaint #${complaintNumber} has been rejected by ${toDept}`;
    default:
      return `Transfer update for complaint #${complaintNumber}`;
  }
};

export default {
  getTransferReasonDisplay,
  getTransferStatusColor,
  getTransferStatusIconColor,
  formatTransferDate,
  formatTransferDateFull,
  canTransferComplaint,
  canAcceptTransfer,
  canRejectTransfer,
  getTransferTypeDisplay,
  calculateTransferDuration,
  isTransferOverdue,
  getTransferPriority,
  getPriorityColor,
  validateTransferData,
  validateRejectionReason,
  groupTransfersByStatus,
  sortTransfersByDate,
  filterTransfersByDateRange,
  calculateTransferStats,
  formatDepartmentPath,
  isSameDepartment,
  getTransferNotificationMessage
};
