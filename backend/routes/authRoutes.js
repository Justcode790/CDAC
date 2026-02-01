/**
 * SUVIDHA 2026 - Authentication Routes
 * 
 * All authentication endpoints:
 * - Citizen registration and OTP verification
 * - Officer login
 * - Admin login
 * - Logout
 * - Get current user
 */

const express = require('express');
const {
  registerCitizen,
  loginCitizen,
  verifyCitizenOTP,
  resendCitizenOTP,
  loginOfficer,
  loginAdmin,
  logout,
  getMe
} = require('../controllers/authController.js');
const { authenticate } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.post('/citizen/register', registerCitizen);
router.post('/citizen/login', loginCitizen);
router.post('/citizen/verify-otp', verifyCitizenOTP);
router.post('/citizen/resend-otp', resendCitizenOTP);
router.post('/officer/login', loginOfficer);
router.post('/admin/login', loginAdmin);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
