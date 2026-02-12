/**
 * SUVIDHA 2026 - Connection Routes
 * 
 * Routes for department connection management
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const connectionController = require('../controllers/connectionController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/connections
 * @desc    Create department connection
 * @access  Private (Admin+)
 */
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN'),
  connectionController.createConnection
);

/**
 * @route   GET /api/departments/:id/connections
 * @desc    Get connections for a department
 * @access  Private (Officer+)
 */
router.get(
  '/departments/:id/connections',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  connectionController.getDepartmentConnections
);

/**
 * @route   GET /api/connections/validate
 * @desc    Validate if connection exists between departments
 * @access  Private (Officer+)
 */
router.get(
  '/validate',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  connectionController.validateConnection
);

/**
 * @route   DELETE /api/connections/:id
 * @desc    Delete (deactivate) connection
 * @access  Private (Admin+)
 */
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN'),
  connectionController.deleteConnection
);

/**
 * @route   PUT /api/connections/:id/reactivate
 * @desc    Reactivate connection
 * @access  Private (Admin+)
 */
router.put(
  '/:id/reactivate',
  authorize('ADMIN', 'SUPER_ADMIN'),
  connectionController.reactivateConnection
);

/**
 * @route   GET /api/connections/stats/:departmentId
 * @desc    Get connection statistics for a department
 * @access  Private (Admin+)
 */
router.get(
  '/stats/:departmentId',
  authorize('ADMIN', 'SUPER_ADMIN'),
  connectionController.getConnectionStats
);

/**
 * @route   GET /api/connections/most-active
 * @desc    Get most active connections
 * @access  Private (Admin+)
 */
router.get(
  '/most-active',
  authorize('ADMIN', 'SUPER_ADMIN'),
  connectionController.getMostActiveConnections
);

module.exports = router;
