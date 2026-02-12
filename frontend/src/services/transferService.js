/**
 * SUVIDHA 2026 - Transfer Service (Frontend)
 * 
 * API integration for complaint transfer operations
 */

import api from './api';

/**
 * Transfer complaint to another department
 */
export const transferComplaint = async (complaintId, transferData) => {
  const response = await api.post(`/complaints/${complaintId}/transfer`, transferData);
  return response.data;
};

/**
 * Get transfer history for a complaint
 */
export const getTransferHistory = async (complaintId) => {
  const response = await api.get(`/complaints/${complaintId}/transfers`);
  return response.data;
};

/**
 * Accept a transfer
 */
export const acceptTransfer = async (complaintId, transferId) => {
  const response = await api.put(`/complaints/${complaintId}/transfers/${transferId}/accept`);
  return response.data;
};

/**
 * Reject a transfer
 */
export const rejectTransfer = async (complaintId, transferId, rejectionReason) => {
  const response = await api.put(`/complaints/${complaintId}/transfers/${transferId}/reject`, {
    rejectionReason
  });
  return response.data;
};

/**
 * Get pending transfers for a department
 */
export const getPendingTransfers = async (departmentId) => {
  const response = await api.get(`/departments/${departmentId}/pending-transfers`);
  return response.data;
};

/**
 * Get transfer statistics
 */
export const getTransferStats = async (departmentId, startDate, endDate) => {
  const params = new URLSearchParams();
  params.append('departmentId', departmentId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/transfers/stats?${params.toString()}`);
  return response.data;
};

/**
 * Helper: Get transfer reason display text
 */
export const getTransferReasonText = (reason) => {
  const reasons = {
    'CLARIFICATION': 'Clarification Required',
    'RE_VERIFICATION': 'Re-verification Needed',
    'FURTHER_INVESTIGATION': 'Further Investigation',
    'SPECIALIZED_HANDLING': 'Specialized Handling Required',
    'WRONG_DEPARTMENT': 'Wrong Department',
    'ESCALATION': 'Escalation',
    'OTHER': 'Other'
  };
  return reasons[reason] || reason;
};

/**
 * Helper: Get transfer status color
 */
export const getTransferStatusColor = (status) => {
  const colors = {
    'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'ACCEPTED': 'bg-green-100 text-green-800 border-green-200',
    'REJECTED': 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Helper: Validate transfer data
 */
export const validateTransferData = (data) => {
  const errors = {};
  
  if (!data.targetDepartment) {
    errors.targetDepartment = 'Target department is required';
  }
  
  if (!data.transferReason) {
    errors.transferReason = 'Transfer reason is required';
  }
  
  if (data.transferReason === 'OTHER' && (!data.transferNotes || data.transferNotes.trim().length < 20)) {
    errors.transferNotes = 'Please provide detailed notes (minimum 20 characters) when selecting "Other"';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
