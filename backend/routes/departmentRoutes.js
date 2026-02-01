/**
 * SUVIDHA 2026 - Department Routes
 * 
 * All department management endpoints.
 * Only ADMIN can create, update, or delete.
 * ADMIN and OFFICER can view.
 */

const express = require('express');
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController.js');
const { authenticate, isAdmin, authorize } = require('../middleware/auth.js');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create, update, delete - ADMIN and SUPER_ADMIN
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createDepartment);
router.put('/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateDepartment);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteDepartment);

// View - ADMIN, SUPER_ADMIN, OFFICER, and PUBLIC (citizens need to see departments for complaints)
router.get('/', authorize('ADMIN', 'SUPER_ADMIN', 'OFFICER', 'PUBLIC'), getDepartments);
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'OFFICER', 'PUBLIC'), getDepartmentById);

module.exports = router;
