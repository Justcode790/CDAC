/**
 * SUVIDHA 2026 - Authentication Controller
 * 
 * Handles authentication for all user roles:
 * - PUBLIC (Citizen): Mobile + OTP
 * - OFFICER: Officer ID + Password
 * - ADMIN: Email + Password
 */

const User = require('../models/User.js');
const { generateToken } = require('../utils/jwt.js');
const { logUserLogin, logUserLogout } = require('../utils/auditLogger.js');

/**
 * @route   POST /api/auth/citizen/register
 * @desc    Register new citizen (PUBLIC user)
 * @access  Public
 */
const registerCitizen = async (req, res) => {
  try {
    const { mobileNumber, name, email, address } = req.body;

    // Validate mobile number
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ mobileNumber, role: 'PUBLIC' });

    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number already registered'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create or update user
    if (user) {
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    } else {
      user = new User({
        role: 'PUBLIC',
        mobileNumber,
        name: name || '',
        email: email || '',
        address: address || '',
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
      });
    }

    await user.save();

    // In production, send OTP via SMS service
    // For now, return OTP in response (mock)
    res.status(201).json({
      success: true,
      message: 'OTP sent to mobile number',
      // Remove this in production - only for development
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      mobileNumber: mobileNumber
    });
  } catch (error) {
    console.error('Citizen registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering citizen',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/citizen/verify-otp
 * @desc    Verify OTP and login citizen
 * @access  Public
 */
const verifyCitizenOTP = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    // Find user with OTP (select OTP fields)
    const user = await User.findOne({ mobileNumber, role: 'PUBLIC' })
      .select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number not registered'
      });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark mobile as verified and clear OTP
    user.isMobileVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Log login
    await logUserLogin(user, req);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        role: user.role,
        mobileNumber: user.mobileNumber,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/citizen/login
 * @desc    Login existing citizen (send OTP)
 * @access  Public
 */
const loginCitizen = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Validate mobile number
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Check if user exists
    const user = await User.findOne({ mobileNumber, role: 'PUBLIC' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number not registered. Please register first.'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // In production, send OTP via SMS service
    res.json({
      success: true,
      message: 'OTP sent to your mobile number',
      // Remove this in production - only for development
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      mobileNumber: mobileNumber
    });
  } catch (error) {
    console.error('Citizen login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending login OTP',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/citizen/resend-otp
 * @desc    Resend OTP to citizen
 * @access  Public
 */
const resendCitizenOTP = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    const user = await User.findOne({ mobileNumber, role: 'PUBLIC' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number not registered'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // In production, send OTP via SMS
    res.json({
      success: true,
      message: 'OTP resent to mobile number',
      // Remove this in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/officer/login
 * @desc    Login officer with Officer ID and Password
 * @access  Public
 */
const loginOfficer = async (req, res) => {
  try {
    const { officerId, password } = req.body;

    if (!officerId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Officer ID and password are required'
      });
    }

    // Find officer with password field
    const user = await User.findOne({ 
      officerId: officerId.toUpperCase(), 
      role: 'OFFICER' 
    }).select('+password').populate('assignedDepartment assignedSubDepartment');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Officer ID or password'
      });
    }

    // Check if officer is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Officer account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Officer ID or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Log login
    await logUserLogin(user, req);

    res.json({
      success: true,
      message: 'Officer logged in successfully',
      token,
      user: {
        id: user._id,
        role: user.role,
        officerId: user.officerId,
        officerName: user.officerName,
        assignedDepartment: user.assignedDepartment,
        assignedSubDepartment: user.assignedSubDepartment
      }
    });
  } catch (error) {
    console.error('Officer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in officer',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/admin/login
 * @desc    Login admin with Email and Password
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin with password field (both ADMIN and SUPER_ADMIN)
    const user = await User.findOne({ 
      adminEmail: email.toLowerCase(), 
      role: { $in: ['ADMIN', 'SUPER_ADMIN'] }
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Log login
    await logUserLogin(user, req);

    res.json({
      success: true,
      message: 'Admin logged in successfully',
      token,
      user: {
        id: user._id,
        role: user.role,
        adminEmail: user.adminEmail,
        adminName: user.adminName
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in admin',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private (all roles)
 */
const logout = async (req, res) => {
  try {
    // Log logout
    await logUserLogout(req.user, req);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (all roles)
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('assignedDepartment assignedSubDepartment')
      .select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  verifyCitizenOTP,
  resendCitizenOTP,
  loginOfficer,
  loginAdmin,
  logout,
  getMe
};
