/**
 * SUVIDHA 2026 - File Upload Middleware
 * 
 * This middleware handles file uploads using Multer.
 * Files are temporarily stored in memory before being uploaded to Cloudinary.
 * 
 * Supported file types: Images (jpg, jpeg, png) and Documents (pdf, doc, docx)
 * Max file size: 10MB per file
 */

const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (jpg, jpeg, png) and documents (pdf, doc, docx) are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Maximum 5 files per request
  },
  fileFilter
});

// Middleware for single file upload
const uploadSingle = upload.single('document');

// Middleware for multiple file uploads
const uploadMultiple = upload.array('documents', 5);

// Error handler middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB per file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  
  next();
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  handleUploadError
};
