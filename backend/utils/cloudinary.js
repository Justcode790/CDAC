/**
 * SUVIDHA 2026 - Cloudinary Upload Utility
 * 
 * This module handles file uploads to Cloudinary.
 * Files are uploaded and secure_url is stored in MongoDB.
 * 
 * Supports:
 * - Image uploads (complaint documents)
 * - PDF uploads (documents)
 * - Automatic optimization
 */

const { v2: cloudinary } = require('cloudinary');
const { config } = require('dotenv');

config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {Buffer|String} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Object} Upload result with secure_url and public_id
 */
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const {
      folder = 'suvidha2026',
      resource_type = 'auto',
      allowed_formats = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      max_file_size = 10485760, // 10MB
      ...otherOptions
    } = options;

    // Upload options
    const uploadOptions = {
      folder,
      resource_type,
      allowed_formats,
      ...otherOptions
    };

    // If file is a Buffer, convert to base64 data URI
    let fileToUpload = file;
    if (Buffer.isBuffer(file)) {
      const base64 = file.toString('base64');
      fileToUpload = `data:application/octet-stream;base64,${base64}`;
    }

    // Upload file
    const result = await cloudinary.uploader.upload(fileToUpload, uploadOptions);

    return {
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @returns {Object} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file buffers or paths
 * @param {Object} options - Upload options
 * @returns {Array} Array of upload results
 */
const uploadMultipleToCloudinary = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple file upload error:', error);
    throw new Error(`Multiple file upload failed: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary
};
