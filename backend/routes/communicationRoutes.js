/**
 * SUVIDHA 2026 - Communication Routes
 * 
 * Routes for inter-department communication
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const communicationController = require('../controllers/communicationController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
    }
  }
});

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/complaints/:id/communications
 * @desc    Add communication message to complaint
 * @access  Private (Officer+)
 */
router.post(
  '/complaints/:id/communications',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  upload.array('attachments', 5),
  communicationController.addCommunication
);

/**
 * @route   GET /api/complaints/:id/communications
 * @desc    Get communications for a complaint
 * @access  Private
 */
router.get(
  '/complaints/:id/communications',
  communicationController.getCommunications
);

/**
 * @route   PUT /api/communications/:id/read
 * @desc    Mark communication as read
 * @access  Private
 */
router.put(
  '/communications/:id/read',
  communicationController.markAsRead
);

/**
 * @route   GET /api/communications/unread/count
 * @desc    Get unread communication count for user
 * @access  Private (Officer+)
 */
router.get(
  '/communications/unread/count',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  communicationController.getUnreadCount
);

/**
 * @route   GET /api/communications/recent
 * @desc    Get recent communications for dashboard
 * @access  Private (Officer+)
 */
router.get(
  '/communications/recent',
  authorize('OFFICER', 'ADMIN', 'SUPER_ADMIN'),
  communicationController.getRecentCommunications
);

module.exports = router;
