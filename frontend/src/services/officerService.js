/**
 * SUVIDHA 2026 - Officer Service
 * 
 * Handles all officer-related API calls (Admin only)
 */

import api from './api';

export const getOfficers = async (params = {}) => {
  const response = await api.get('/admin/officers', { params });
  return response.data;
};

export const getOfficerById = async (id) => {
  const response = await api.get(`/admin/officers/${id}`);
  return response.data;
};

export const createOfficer = async (data) => {
  const response = await api.post('/admin/officers', data);
  return response.data;
};

export const updateOfficer = async (id, data) => {
  const response = await api.put(`/admin/officers/${id}`, data);
  return response.data;
};

export const transferOfficer = async (id, transferData) => {
  const response = await api.put(`/admin/officers/${id}/transfer`, transferData);
  return response.data;
};

export const retireOfficer = async (id) => {
  const response = await api.delete(`/admin/officers/${id}`);
  return response.data;
};

// Legacy compatibility functions (for existing components)
export const assignOfficer = async (id, subDepartmentId) => {
  // This is a simplified version - in a real implementation, 
  // you'd need to get the department ID from the sub-department
  const response = await api.put(`/admin/officers/${id}/transfer`, {
    toSubDepartment: subDepartmentId,
    reason: 'Administrative assignment'
  });
  return response.data;
};

export const deactivateOfficer = async (id) => {
  // Map to retire officer for compatibility
  return await retireOfficer(id);
};
