/**
 * SUVIDHA 2026 - Sub-Department Routes
 * 
 * All sub-department management endpoints.
 * Only ADMIN can create, update, or delete.
 * ADMIN and OFFICER can view.
 */

const express = require('express');
const {
  createSubDepartment,
  getSubDepartments,
  getSubDepartmentById,
  updateSubDepartment,
  deleteSubDepartment
} = require('../controllers/subDepartmentController.js');
const { authenticate, isAdmin, authorize } = require('../middleware/auth.js');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create, update, delete - ADMIN and SUPER_ADMIN
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createSubDepartment);
router.put('/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateSubDepartment);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteSubDepartment);

// View - ADMIN, SUPER_ADMIN, OFFICER, and PUBLIC (citizens need to see sub-departments for complaints)
router.get('/', authorize('ADMIN', 'SUPER_ADMIN', 'OFFICER', 'PUBLIC'), getSubDepartments);
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'OFFICER', 'PUBLIC'), getSubDepartmentById);

module.exports = router;
