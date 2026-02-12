/**
 * SUVIDHA 2026 - Complaint Service
 *
 * Handles all complaint-related API calls
 */

import api from "./api";

// Create complaint (with file upload)
export const createComplaint = async (formData) => {
  const response = await api.post("/complaints", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get all complaints
export const getComplaints = async (params = {}) => {
  const response = await api.get("/complaints", { params });
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
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Download receipt as PDF
export const downloadReceipt = async (id) => {
  const response = await api.get(`/complaints/${id}/receipt`, {
    responseType: "blob", // Important: Tell axios to expect binary data
  });

  // Create blob from response
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers["content-disposition"];
  let filename = `SUVIDHA_Receipt_${id}.pdf`;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return { success: true, message: "Receipt downloaded successfully" };
};

// Public API - Get complaint by ID (no auth required)
export const getComplaintByIdPublic = async (id) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/complaints/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch complaint');
  }
  return response.json();
};

// Public API - Download receipt (no auth required)
export const downloadReceiptPublic = async (id) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/complaints/${id}/receipt`);
  
  if (!response.ok) {
    throw new Error('Failed to download receipt');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get("content-disposition");
  let filename = `SUVIDHA_Receipt_${id}.pdf`;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return { success: true, message: "Receipt downloaded successfully" };
};
