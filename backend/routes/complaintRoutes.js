/**
 * SUVIDHA 2026 - Complaint Routes
 * 
 * All complaint management endpoints.
 * - Citizens can create complaints and add documents
 * - Officers can view and update complaints from their sub-department
 * - Admin can view all complaints
 */

const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  addDocuments,
  downloadReceipt
} = require('../controllers/complaintController.js');
const { authenticate, isCitizen, authorize } = require('../middleware/auth.js');
const { uploadMultiple, handleUploadError } = require('../middleware/upload.js');
const { filterByOfficerSubDepartment } = require('../middleware/officerAccess.js');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create complaint - Citizen only
router.post('/', isCitizen, uploadMultiple, handleUploadError, createComplaint);

// Get all complaints - All roles (with access control)
router.get('/', filterByOfficerSubDepartment, getComplaints);

// Get single complaint - All roles (with access control)
router.get('/:id', getComplaintById);

// Update complaint - Officer and Admin only
router.put('/:id', authorize('OFFICER', 'ADMIN'), updateComplaint);

// Add documents - Citizen only (own complaints)
router.post('/:id/documents', isCitizen, uploadMultiple, handleUploadError, addDocuments);

// Download receipt - Citizen only (own complaints)
router.get('/:id/receipt', isCitizen, downloadReceipt);

module.exports = router;
