/**
 * SUVIDHA 2026 - System Service
 * 
 * Handles system-level API calls for admin dashboard
 */

import api from './api';

export const getSystemStatus = async () => {
  const response = await api.get('/admin/system/status');
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/admin/audit/recent', { params });
  return response.data;
};

export const runIntegrityCheck = async (runCleanup = false) => {
  const response = await api.post('/admin/system/integrity-check', { runCleanup });
  return response.data;
};