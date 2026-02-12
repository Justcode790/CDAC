/**
 * SUVIDHA 2026 - Connection Service (Frontend)
 * 
 * API integration for department connection management
 */

import api from './api';

/**
 * Create department connection (Admin only)
 */
export const createConnection = async (connectionData) => {
  const response = await api.post('/connections', connectionData);
  return response.data;
};

/**
 * Get connections for a department
 */
export const getDepartmentConnections = async (departmentId) => {
  const response = await api.get(`/departments/${departmentId}/connections`);
  return response.data;
};

/**
 * Validate if connection exists between departments
 */
export const validateConnection = async (sourceDeptId, targetDeptId) => {
  const response = await api.get(`/connections/validate?source=${sourceDeptId}&target=${targetDeptId}`);
  return response.data;
};

/**
 * Delete (deactivate) connection (Admin only)
 */
export const deleteConnection = async (connectionId) => {
  const response = await api.delete(`/connections/${connectionId}`);
  return response.data;
};

/**
 * Reactivate connection (Admin only)
 */
export const reactivateConnection = async (connectionId) => {
  const response = await api.put(`/connections/${connectionId}/reactivate`);
  return response.data;
};

/**
 * Get connection statistics for a department (Admin only)
 */
export const getConnectionStats = async (departmentId) => {
  const response = await api.get(`/connections/stats/${departmentId}`);
  return response.data;
};

/**
 * Get most active connections (Admin only)
 */
export const getMostActiveConnections = async (limit = 10) => {
  const response = await api.get(`/connections/most-active?limit=${limit}`);
  return response.data;
};

/**
 * Helper: Get connection type display text
 */
export const getConnectionTypeText = (type) => {
  const types = {
    'TRANSFER_ENABLED': 'Transfer Only',
    'COMMUNICATION_ENABLED': 'Communication Only',
    'BOTH': 'Transfer & Communication'
  };
  return types[type] || type;
};

/**
 * Helper: Get connection type color
 */
export const getConnectionTypeColor = (type) => {
  const colors = {
    'TRANSFER_ENABLED': 'bg-blue-100 text-blue-800',
    'COMMUNICATION_ENABLED': 'bg-purple-100 text-purple-800',
    'BOTH': 'bg-green-100 text-green-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};
