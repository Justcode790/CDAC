/**
 * SUVIDHA 2026 - Complaint Number Generator
 * 
 * This utility generates unique complaint numbers in the format:
 * SUV{YYYY}{6-digit-sequence}
 * 
 * Example: SUV2026000001, SUV2026000002, etc.
 */

const Complaint = require('../models/Complaint.js');

/**
 * Generate unique complaint number
 * Format: SUV{YYYY}{6-digit-sequence}
 * @returns {Promise<String>} Unique complaint number
 */
const generateComplaintNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `SUV${year}`;
  
  try {
    // Find the last complaint number for this year
    const lastComplaint = await Complaint.findOne({
      complaintNumber: new RegExp(`^${prefix}`)
    }).sort({ complaintNumber: -1 });
    
    let sequence = 1;
    if (lastComplaint) {
      // Extract sequence number from last complaint
      const lastSeq = parseInt(lastComplaint.complaintNumber.slice(-6));
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
    
    // Format: SUV2026000001
    const complaintNumber = `${prefix}${sequence.toString().padStart(6, '0')}`;
    
    return complaintNumber;
  } catch (error) {
    console.error('Error generating complaint number:', error);
    // Fallback: use timestamp-based number
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }
};

module.exports = {
  generateComplaintNumber
};
