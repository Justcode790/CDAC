/**
 * SUVIDHA 2026 - Demo Credentials Controller
 * 
 * SECURITY WARNING: This controller exposes login credentials
 * ONLY FOR HACKATHON/DEMO ENVIRONMENTS
 * 
 * This should NEVER be enabled in production
 */

const User = require('../models/User.js');

/**
 * @route   GET /api/demo/credentials
 * @desc    Get demo login credentials for hackathon evaluation
 * @access  Public (only in demo mode)
 */
const getDemoCredentials = async (req, res) => {
  try {
    // SECURITY NOTE: Demo credentials are enabled for hackathon/evaluation
    // You can control visibility via SHOW_DEMO_CREDENTIALS flag
    const isDemoMode = process.env.SHOW_DEMO_CREDENTIALS === 'true' || 
                       process.env.NODE_ENV === 'development';

    // Allow in production if explicitly enabled
    if (!isDemoMode && process.env.NODE_ENV === 'production' && process.env.SHOW_DEMO_CREDENTIALS !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Demo credentials are not available'
      });
    }

    // Fetch demo users from database
    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' })
      .select('adminEmail adminName role');

    const officers = await User.find({ role: 'OFFICER' })
      .populate('assignedDepartment', 'name code')
      .populate('assignedSubDepartment', 'name code')
      .select('officerId officerName role assignedDepartment assignedSubDepartment')
      .limit(10); // Limit to first 10 officers for display

    const citizens = await User.find({ role: 'PUBLIC' })
      .select('name mobileNumber email role')
      .limit(5); // Limit to first 5 citizens

    // Format credentials for display
    const credentials = {
      superAdmin: superAdmin ? {
        role: 'Super Admin',
        username: superAdmin.adminEmail,
        password: '123456', // Demo password
        name: superAdmin.adminName,
        loginEndpoint: '/admin/login'
      } : null,

      officers: officers.map(officer => ({
        role: 'Officer',
        username: officer.officerId,
        password: '123456', // Demo password
        name: officer.officerName,
        department: officer.assignedDepartment?.name || 'N/A',
        subDepartment: officer.assignedSubDepartment?.name || 'N/A',
        loginEndpoint: '/officer/login'
      })),

      citizens: citizens.map(citizen => ({
        role: 'Citizen',
        username: citizen.mobileNumber,
        password: 'OTP-based', // Citizens use OTP
        name: citizen.name,
        email: citizen.email,
        loginEndpoint: '/citizen/login',
        note: 'Use mobile number to receive OTP'
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Demo credentials fetched successfully',
      credentials,
      warning: '⚠️ DEMO MODE ONLY - These credentials are for hackathon evaluation purposes'
    });

  } catch (error) {
    console.error('Get demo credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching demo credentials'
    });
  }
};

module.exports = {
  getDemoCredentials
};
