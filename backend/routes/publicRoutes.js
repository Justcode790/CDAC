/**
 * SUVIDHA 2026 - Public Routes
 * 
 * Public endpoints that don't require authentication
 * - Public complaint tracking
 * - Public receipt download
 */

const express = require('express');
const {
  getComplaintByIdPublic,
  downloadReceiptPublic
} = require('../controllers/complaintController.js');

const router = express.Router();

// Public complaint tracking - no auth required
router.get('/complaints/:id', getComplaintByIdPublic);

// Public receipt download - no auth required
router.get('/complaints/:id/receipt', downloadReceiptPublic);

module.exports = router;
