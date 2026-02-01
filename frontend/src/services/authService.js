/**
 * SUVIDHA 2026 - Authentication Service
 * 
 * Handles all authentication-related API calls
 */

import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

// Citizen Authentication
export const registerCitizen = async (data) => {
  const response = await api.post('/auth/citizen/register', data);
  return response.data;
};

export const loginCitizen = async (mobileNumber) => {
  const response = await api.post('/auth/citizen/login', { mobileNumber });
  return response.data;
};

export const verifyCitizenOTP = async (mobileNumber, otp) => {
  const response = await api.post('/auth/citizen/verify-otp', {
    mobileNumber,
    otp
  });
  
  // Store token and user data
  if (response.data.token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
  }
  
  return response.data;
};

export const resendCitizenOTP = async (mobileNumber) => {
  const response = await api.post('/auth/citizen/resend-otp', { mobileNumber });
  return response.data;
};

// Officer Authentication
export const loginOfficer = async (officerId, password) => {
  const response = await api.post('/auth/officer/login', {
    officerId,
    password
  });
  
  // Store token and user data
  if (response.data.token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// Admin Authentication
export const loginAdmin = async (email, password) => {
  const response = await api.post('/auth/admin/login', {
    email,
    password
  });
  
  // Store token and user data
  if (response.data.token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Logout
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call success
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

// Get stored user
export const getStoredUser = () => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
};

// Get stored token
export const getStoredToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};
