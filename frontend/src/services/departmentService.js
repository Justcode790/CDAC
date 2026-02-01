/**
 * SUVIDHA 2026 - Department Service
 * 
 * Handles all department and sub-department related API calls
 */

import api from './api';

// Departments - Public access (for citizens creating complaints)
export const getDepartmentsPublic = async (params = {}) => {
  const response = await api.get('/departments', { params });
  return response.data;
};

export const getDepartmentByIdPublic = async (id) => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

// Departments - Admin access (for admin management)
export const getDepartments = async (params = {}) => {
  const response = await api.get('/admin/departments', { params });
  return response.data;
};

export const getDepartmentById = async (id) => {
  const response = await api.get(`/admin/departments/${id}`);
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post('/admin/departments', data);
  return response.data;
};

export const updateDepartment = async (id, data) => {
  const response = await api.put(`/admin/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/admin/departments/${id}`);
  return response.data;
};

// Sub-Departments - Public access (for citizens creating complaints)
export const getSubDepartmentsPublic = async (params = {}) => {
  const response = await api.get('/subdepartments', { params });
  return response.data;
};

export const getSubDepartmentByIdPublic = async (id) => {
  const response = await api.get(`/subdepartments/${id}`);
  return response.data;
};

// Sub-Departments - Admin access (for admin management)
export const getSubDepartments = async (params = {}) => {
  const response = await api.get('/admin/subdepartments', { params });
  return response.data;
};

export const getSubDepartmentById = async (id) => {
  const response = await api.get(`/admin/subdepartments/${id}`);
  return response.data;
};

export const createSubDepartment = async (data) => {
  const response = await api.post('/admin/subdepartments', data);
  return response.data;
};

export const updateSubDepartment = async (id, data) => {
  const response = await api.put(`/admin/subdepartments/${id}`, data);
  return response.data;
};

export const deleteSubDepartment = async (id) => {
  const response = await api.delete(`/admin/subdepartments/${id}`);
  return response.data;
};
