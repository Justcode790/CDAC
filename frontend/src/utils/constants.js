/**
 * SUVIDHA 2026 - Constants
 *
 * Application-wide constants and configuration
 */

// Environment Detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Configuration with fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isDevelopment ? 'http://localhost:5000/api' : 'http://13.60.195.81:5000/api');

// App Configuration
export const APP_CONFIG = {
  name: 'SUVIDHA 2026',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_APP_ENV || (isDevelopment ? 'development' : 'production'),
  isDevelopment,
  isProduction
};

// User Roles
export const ROLES = {
  PUBLIC: "PUBLIC",
  OFFICER: "OFFICER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

// Complaint Status
export const COMPLAINT_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

// Complaint Categories
export const COMPLAINT_CATEGORIES = {
  INFRASTRUCTURE: "INFRASTRUCTURE",
  SANITATION: "SANITATION",
  WATER_SUPPLY: "WATER_SUPPLY",
  ELECTRICITY: "ELECTRICITY",
  ROAD_MAINTENANCE: "ROAD_MAINTENANCE",
  PUBLIC_SAFETY: "PUBLIC_SAFETY",
  HEALTH: "HEALTH",
  EDUCATION: "EDUCATION",
  OTHER: "OTHER",
};

// Complaint Priority
export const COMPLAINT_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

// Languages
export const LANGUAGES = {
  EN: "en",
  HI: "hi",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "suvidha_token",
  USER: "suvidha_user",
  LANGUAGE: "suvidha_language",
};

// Routes
export const ROUTES = {
  LANDING: "/",
  // Citizen routes
  CITIZEN_LOGIN: "/citizen/login",
  CITIZEN_REGISTER: "/citizen/register",
  CITIZEN_DASHBOARD: "/citizen/dashboard",
  CITIZEN_NEW_COMPLAINT: "/citizen/new-complaint",
  CITIZEN_TRACK_COMPLAINT: "/citizen/track-complaint",
  // Officer routes
  OFFICER_LOGIN: "/officer/login",
  OFFICER_DASHBOARD: "/officer/dashboard",
  // Admin routes
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_DEPARTMENTS: "/admin/departments",
  ADMIN_SUBDEPARTMENTS: "/admin/subdepartments",
  ADMIN_OFFICERS: "/admin/officers",
};
