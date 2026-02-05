/**
 * SUVIDHA 2026 - Service Request Service
 * 
 * Frontend service for all types of service requests:
 * - Complaints, Certificates, Licenses, Permits, RTI
 */

import api from './api.js';

// Create a new service request
export const createServiceRequest = async (requestData, files = []) => {
  const formData = new FormData();
  
  // Add request data
  Object.keys(requestData).forEach(key => {
    if (requestData[key] !== null && requestData[key] !== undefined) {
      if (typeof requestData[key] === 'object') {
        formData.append(key, JSON.stringify(requestData[key]));
      } else {
        formData.append(key, requestData[key]);
      }
    }
  });
  
  // Add files
  files.forEach(file => {
    formData.append('documents', file);
  });
  
  const response = await api.post('/service-requests', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Get service requests (filtered by user role)
export const getServiceRequests = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });
  
  const response = await api.get(`/service-requests?${params.toString()}`);
  return response.data;
};

// Get single service request by ID
export const getServiceRequestById = async (id) => {
  const response = await api.get(`/service-requests/${id}`);
  return response.data;
};

// Update service request status (Officers/Admins only)
export const updateServiceRequestStatus = async (id, status, remark = null) => {
  const response = await api.put(`/service-requests/${id}/status`, {
    status,
    remark
  });
  return response.data;
};

// Add remark to service request
export const addServiceRequestRemark = async (id, message, isInternal = false) => {
  const response = await api.post(`/service-requests/${id}/remarks`, {
    message,
    isInternal
  });
  return response.data;
};

// Download service request receipt as PDF
export const downloadServiceRequestReceipt = async (id) => {
  const response = await api.get(`/service-requests/${id}/receipt`, {
    responseType: 'blob'
  });
  
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const contentDisposition = response.headers['content-disposition'];
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
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  return { success: true, message: 'Receipt downloaded successfully' };
};

// Helper functions for form validation
export const validateServiceRequestData = (requestType, data) => {
  const errors = {};
  
  // Common validations
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length > 2000) {
    errors.description = 'Description must be less than 2000 characters';
  }
  
  if (!data.department) {
    errors.department = 'Department is required';
  }
  
  if (!data.subDepartment) {
    errors.subDepartment = 'Sub-department is required';
  }
  
  // Type-specific validations
  switch (requestType) {
    case 'COMPLAINT':
      if (!data.category) {
        errors.category = 'Category is required for complaints';
      }
      break;
      
    case 'CERTIFICATE':
      if (!data.certificateType) {
        errors.certificateType = 'Certificate type is required';
      }
      break;
      
    case 'LICENSE':
      if (!data.licenseType) {
        errors.licenseType = 'License type is required';
      }
      if (!data.licenseAction) {
        errors.licenseAction = 'License action is required';
      }
      break;
      
    case 'PERMIT':
      if (!data.permitType) {
        errors.permitType = 'Permit type is required';
      }
      break;
      
    case 'RTI':
      if (!data.rtiCategory) {
        errors.rtiCategory = 'RTI category is required';
      }
      break;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Get service request type display name
export const getServiceRequestTypeDisplayName = (requestType) => {
  const displayNames = {
    'COMPLAINT': 'Complaint',
    'CERTIFICATE': 'Certificate Application',
    'LICENSE': 'License Service',
    'PERMIT': 'Permit Request',
    'RTI': 'RTI Application'
  };
  
  return displayNames[requestType] || requestType;
};

// Get status display name and color
export const getStatusDisplayInfo = (status) => {
  const statusInfo = {
    'PENDING': { name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    'UNDER_REVIEW': { name: 'Under Review', color: 'bg-blue-100 text-blue-800' },
    'DOCUMENTS_REQUIRED': { name: 'Documents Required', color: 'bg-orange-100 text-orange-800' },
    'IN_PROGRESS': { name: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
    'APPROVED': { name: 'Approved', color: 'bg-green-100 text-green-800' },
    'REJECTED': { name: 'Rejected', color: 'bg-red-100 text-red-800' },
    'COMPLETED': { name: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
    'DELIVERED': { name: 'Delivered', color: 'bg-teal-100 text-teal-800' }
  };
  
  return statusInfo[status] || { name: status, color: 'bg-gray-100 text-gray-800' };
};

// Get priority display info
export const getPriorityDisplayInfo = (priority) => {
  const priorityInfo = {
    'LOW': { name: 'Low', color: 'bg-gray-100 text-gray-800' },
    'MEDIUM': { name: 'Medium', color: 'bg-blue-100 text-blue-800' },
    'HIGH': { name: 'High', color: 'bg-orange-100 text-orange-800' },
    'URGENT': { name: 'Urgent', color: 'bg-red-100 text-red-800' }
  };
  
  return priorityInfo[priority] || { name: priority, color: 'bg-gray-100 text-gray-800' };
};
