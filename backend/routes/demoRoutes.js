/**
 * SUVIDHA 2026 - Demo Routes
 * 
 * Routes for hackathon/demo functionality
 * ONLY ENABLED IN DEVELOPMENT/DEMO MODE
 */

const express = require('express');
const { getDemoCredentials } = require('../controllers/demoController.js');

const router = express.Router();

// Get demo credentials - Public endpoint (only works in demo mode)
router.get('/credentials', getDemoCredentials);

module.exports = router;
