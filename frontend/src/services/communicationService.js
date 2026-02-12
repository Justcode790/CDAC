/**
 * SUVIDHA 2026 - Communication Service (Frontend)
 * 
 * API integration for inter-department communication
 */

import api from './api';

/**
 * Add communication message to complaint
 */
export const addCommunication = async (complaintId, messageData, files = []) => {
  const formData = new FormData();
  
  // Add message data
  formData.append('message', messageData.message);
  if (messageData.messageType) formData.append('messageType', messageData.messageType);
  if (messageData.isInternal !== undefined) formData.append('isInternal', messageData.isInternal);
  
  // Add tagged departments
  if (messageData.taggedDepartments && messageData.taggedDepartments.length > 0) {
    messageData.taggedDepartments.forEach(deptId => {
      formData.append('taggedDepartments[]', deptId);
    });
  }
  
  // Add tagged officers
  if (messageData.taggedOfficers && messageData.taggedOfficers.length > 0) {
    messageData.taggedOfficers.forEach(officerId => {
      formData.append('taggedOfficers[]', officerId);
    });
  }
  
  // Add file attachments
  files.forEach(file => {
    formData.append('attachments', file);
  });
  
  const response = await api.post(`/complaints/${complaintId}/communications`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

/**
 * Get communications for a complaint
 */
export const getCommunications = async (complaintId) => {
  const response = await api.get(`/complaints/${complaintId}/communications`);
  return response.data;
};

/**
 * Mark communication as read
 */
export const markAsRead = async (communicationId) => {
  const response = await api.put(`/communications/${communicationId}/read`);
  return response.data;
};

/**
 * Get unread communication count
 */
export const getUnreadCount = async () => {
  const response = await api.get('/communications/unread/count');
  return response.data;
};

/**
 * Get recent communications for dashboard
 */
export const getRecentCommunications = async (limit = 10) => {
  const response = await api.get(`/communications/recent?limit=${limit}`);
  return response.data;
};

/**
 * Helper: Get message type display text
 */
export const getMessageTypeText = (type) => {
  const types = {
    'INTERNAL': 'Internal Note',
    'INTER_DEPARTMENT': 'Inter-Department',
    'ESCALATION': 'Escalation'
  };
  return types[type] || type;
};

/**
 * Helper: Get message type color
 */
export const getMessageTypeColor = (type) => {
  const colors = {
    'INTERNAL': 'bg-gray-100 text-gray-800',
    'INTER_DEPARTMENT': 'bg-blue-100 text-blue-800',
    'ESCALATION': 'bg-red-100 text-red-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

/**
 * Helper: Format timestamp
 */
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

/**
 * Helper: Validate message data
 */
export const validateMessageData = (data) => {
  const errors = {};
  
  if (!data.message || data.message.trim().length === 0) {
    errors.message = 'Message is required';
  }
  
  if (data.message && data.message.length > 1000) {
    errors.message = 'Message cannot exceed 1000 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
