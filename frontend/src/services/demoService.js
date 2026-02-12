/**
 * SUVIDHA 2026 - Demo Service
 * 
 * Service for fetching demo credentials (hackathon mode only)
 */

import api from './api';

/**
 * Get demo credentials for hackathon evaluation
 * Only works when SHOW_DEMO_CREDENTIALS is enabled
 */
export const getDemoCredentials = async () => {
  const response = await api.get('/demo/credentials');
  return response.data;
};
