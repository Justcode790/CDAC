/**
 * SUVIDHA 2026 - Officer Routes
 * 
 * All officer management endpoints.
 * Only ADMIN can access these routes.
 */

const express = require('express');
const {
  createOfficer,
  getOfficers,
  getOfficerById,
  updateOfficer,
  assignOfficer,
  deactivateOfficer
} = require('../controllers/officerController.js');
const { authenticate, isAdmin } = require('../middleware/auth.js');

const router = express.Router();

// All routes require ADMIN authentication
router.use(authenticate);
router.use(isAdmin);

router.post('/', createOfficer);
router.get('/', getOfficers);
router.get('/:id', getOfficerById);
router.put('/:id', updateOfficer);
router.put('/:id/assign', assignOfficer);
router.put('/:id/deactivate', deactivateOfficer);

module.exports = router;
