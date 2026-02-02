/**
 * SUVIDHA 2026 - API Service
 *
 * Axios instance with interceptors for authentication and error handling
 * Environment-aware configuration for seamless local/production deployment
 */

import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS, APP_CONFIG } from "../utils/constants";

// Create axios instance with environment-aware configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: APP_CONFIG.isProduction ? 30000 : 10000, // Longer timeout in production
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Development logging
if (APP_CONFIG.isDevelopment) {
  console.log("🔗 API Base URL:", API_BASE_URL);
  console.log("🌍 Environment:", APP_CONFIG.environment);
}

// Request interceptor - Add token and environment info
api.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add environment info for debugging
    if (APP_CONFIG.isDevelopment) {
      config.headers["X-Client-Environment"] = APP_CONFIG.environment;
      config.headers["X-Client-Version"] = APP_CONFIG.version;
    }

    // Log requests in development
    if (APP_CONFIG.isDevelopment) {
      console.log(
        `🚀 ${config.method?.toUpperCase()} ${config.url}`,
        config.data || "",
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (APP_CONFIG.isDevelopment) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data,
      );
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (APP_CONFIG.isDevelopment) {
      console.error("❌ API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // In production, show user-friendly message
      if (APP_CONFIG.isProduction) {
        console.warn("Session expired. Please login again.");
      }
    }

    // Handle network errors
    if (!error.response) {
      const networkError = new Error(
        APP_CONFIG.isProduction
          ? "Network error. Please check your connection."
          : `Network error: ${error.message}`,
      );
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  },
);

export default api;
