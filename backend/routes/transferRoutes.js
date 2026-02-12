/**
 * SUVIDHA 2026 - Transfer Routes
 * 
 * Routes for complaint transfer operations
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const transferController = require('../controllers/transferController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/complaints/:id/transfer
 * @desc    Transfer complaint to another department
 * @access  Private (Officer+)
 */
router.post(
  '/complaints/:id/transfer',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  transferController.transferComplaint
);

/**
 * @route   GET /api/complaints/:id/transfers
 * @desc    Get transfer history for a complaint
 * @access  Private (Officer+)
 */
router.get(
  '/complaints/:id/transfers',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  transferController.getTransferHistory
);

/**
 * @route   PUT /api/complaints/:id/transfers/:transferId/accept
 * @desc    Accept a transfer
 * @access  Private (Officer+)
 */
router.put(
  '/complaints/:id/transfers/:transferId/accept',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  transferController.acceptTransfer
);

/**
 * @route   PUT /api/complaints/:id/transfers/:transferId/reject
 * @desc    Reject a transfer
 * @access  Private (Officer+)
 */
router.put(
  '/complaints/:id/transfers/:transferId/reject',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  transferController.rejectTransfer
);

/**
 * @route   GET /api/departments/:id/pending-transfers
 * @desc    Get pending transfers for a department
 * @access  Private (Officer+)
 */
router.get(
  '/departments/:id/pending-transfers',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  transferController.getPendingTransfers
);

/**
 * @route   GET /api/transfers/stats
 * @desc    Get transfer statistics
 * @access  Private (Admin+)
 */
router.get(
  '/transfers/stats',
  authorize('ADMIN', 'SUPER_ADMIN'),
  transferController.getTransferStats
);

module.exports = router;
