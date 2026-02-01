/**
 * SUVIDHA 2026 - Complaint Service
 * 
 * Handles all complaint-related API calls
 */

import api from './api';

// Create complaint (with file upload)
export const createComplaint = async (formData) => {
  const response = await api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Get all complaints
export const getComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data;
};

// Get complaint by ID
export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

// Update complaint
export const updateComplaint = async (id, data) => {
  const response = await api.put(`/complaints/${id}`, data);
  return response.data;
};

// Add documents to complaint
export const addDocumentsToComplaint = async (id, formData) => {
  const response = await api.post(`/complaints/${id}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Download receipt
export const downloadReceipt = async (id) => {
  const response = await api.get(`/complaints/${id}/receipt`);
  return response.data;
};
