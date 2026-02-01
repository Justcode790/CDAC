/**
 * SUVIDHA 2026 - Officer Lifecycle Management Service
 * 
 * This service handles the complete lifecycle of government officers:
 * - Creation with auto-generated credentials
 * - Transfer between departments with audit trail
 * - Retirement with proper cleanup
 * 
 * Enforces strict government business rules and maintains data integrity.
 */

const User = require('../models/User.js');
const Department = require('../models/Department.js');
const SubDepartment = require('../models/SubDepartment.js');
const { createAuditLog } = require('../utils/auditLogger.js');
const { validateOfficerAssignment, DataIntegrityError } = require('./dataIntegrityService.js');
const mongoose = require('mongoose');

/**
 * Generates a unique Officer ID based on department and sequence
 * Format: DEPT_CODE_YYYY_NNNN (e.g., PWD_2026_0001)
 * @param {string} departmentId - Department MongoDB ID
 * @param {string} subDepartmentId - Sub-department MongoDB ID
 * @returns {Promise<string>} Generated Officer ID
 */
const generateOfficerId = async (departmentId, subDepartmentId) => {
  try {
    const department = await Department.findById(departmentId);
    const subDepartment = await SubDepartment.findById(subDepartmentId);
    
    if (!department || !subDepartment) {
      throw new Error('Invalid department or sub-department for Officer ID generation');
    }
    
    const currentYear = new Date().getFullYear();
    const deptCode = department.code;
    const subDeptCode = subDepartment.code;
    
    // Find the highest sequence number for this department in current year
    const lastOfficer = await User.findOne({
      role: 'OFFICER',
      officerId: new RegExp(`^${deptCode}_${subDeptCode}_${currentYear}_\\d{4}$`)
    }).sort({ officerId: -1 });
    
    let sequence = 1;
    if (lastOfficer) {
      const lastSequence = parseInt(lastOfficer.officerId.split('_').pop());
      sequence = lastSequence + 1;
    }
    
    // Format: DEPT_SUBDEPT_YYYY_NNNN
    const officerId = `${deptCode}_${subDeptCode}_${currentYear}_${sequence.toString().padStart(4, '0')}`;
    
    return officerId;
  } catch (error) {
    console.error('Error generating Officer ID:', error);
    throw new Error(`Failed to generate Officer ID: ${error.message}`);
  }
};

/**
 * Generates a secure temporary password for new officers
 * @returns {string} Generated temporary password
 */
const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const specialChars = '!@#$%&*';
  
  let password = '';
  
  // Ensure at least one uppercase, lowercase, number, and special char
  password += chars.charAt(Math.floor(Math.random() * 26)); // Uppercase
  password += chars.charAt(Math.floor(Math.random() * 26) + 26); // Lowercase
  password += chars.charAt(Math.floor(Math.random() * 10) + 52); // Number
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length)); // Special
  
  // Fill remaining 4 characters randomly
  for (let i = 4; i < 8; i++) {
    const allChars = chars + specialChars;
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Creates a new officer with auto-generated credentials
 * @param {Object} adminUser - Super Admin creating the officer
 * @param {Object} officerData - Officer creation data
 * @returns {Promise<Object>} Created officer with credentials
 */
const createOfficer = async (adminUser, officerData) => {
  const session = await mongoose.startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      const { 
        officerName, 
        assignedDepartment, 
        assignedSubDepartment, 
        email,
        mobileNumber 
      } = officerData;
      
      // Validate Super Admin authority
      if (adminUser.role !== 'SUPER_ADMIN') {
        throw new DataIntegrityError(
          'INSUFFICIENT_AUTHORITY',
          'Officer Creation',
          { requiredRole: 'SUPER_ADMIN', userRole: adminUser.role }
        );
      }
      
      // Validate assignment
      const assignmentValidation = await validateOfficerAssignment(
        null, 
        assignedDepartment, 
        assignedSubDepartment
      );
      
      if (!assignmentValidation.isValid) {
        throw new DataIntegrityError(
          'INVALID_ASSIGNMENT',
          'Officer Creation',
          { violations: assignmentValidation.violations }
        );
      }
      
      // Generate Officer ID and temporary password
      const officerId = await generateOfficerId(assignedDepartment, assignedSubDepartment);
      const temporaryPassword = generateTemporaryPassword();
      
      // Create officer
      const officer = new User({
        role: 'OFFICER',
        officerId,
        password: temporaryPassword, // Will be hashed by pre-save middleware
        officerName,
        assignedDepartment,
        assignedSubDepartment,
        email: email?.toLowerCase().trim(),
        mobileNumber,
        isActive: true,
        isTemporaryPassword: true,
        passwordChangeRequired: true,
        createdAt: new Date()
      });
      
      await officer.save({ session });
      
      // Create audit log
      await createAuditLog({
        action: 'OFFICER_CREATE',
        user: adminUser,
        entityType: 'USER',
        entityId: officer._id,
        details: {
          officerId: officer.officerId,
          officerName: officer.officerName,
          assignedDepartment: assignmentValidation.details.department,
          assignedSubDepartment: assignmentValidation.details.subDepartment,
          createdBy: adminUser.adminName
        }
      });
      
      return {
        officer: {
          id: officer._id,
          officerId: officer.officerId,
          officerName: officer.officerName,
          email: officer.email,
          mobileNumber: officer.mobileNumber,
          assignedDepartment: assignmentValidation.details.department,
          assignedSubDepartment: assignmentValidation.details.subDepartment,
          isActive: officer.isActive
        },
        credentials: {
          officerId: officer.officerId,
          temporaryPassword: temporaryPassword,
          passwordChangeRequired: true
        }
      };
    });
    
    return {
      success: true,
      ...result,
      message: 'Officer created successfully'
    };
    
  } catch (error) {
    console.error('Error creating officer:', error);
    
    if (error instanceof DataIntegrityError) {
      throw error;
    }
    
    throw new Error(`Failed to create officer: ${error.message}`);
  } finally {
    await session.endSession();
  }
};

/**
 * Transfers an officer to a new department/sub-department
 * @param {Object} adminUser - Super Admin performing the transfer
 * @param {string} officerId - Officer's MongoDB ID
 * @param {Object} transferData - Transfer details
 * @returns {Promise<Object>} Transfer result
 */
const transferOfficer = async (adminUser, officerId, transferData) => {
  const session = await mongoose.startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      const { toDepartment, toSubDepartment, reason } = transferData;
      
      // Validate Super Admin authority
      if (adminUser.role !== 'SUPER_ADMIN') {
        throw new DataIntegrityError(
          'INSUFFICIENT_AUTHORITY',
          'Officer Transfer',
          { requiredRole: 'SUPER_ADMIN', userRole: adminUser.role }
        );
      }
      
      // Get current officer
      const officer = await User.findById(officerId).session(session);
      if (!officer || officer.role !== 'OFFICER') {
        throw new DataIntegrityError(
          'OFFICER_NOT_FOUND',
          'Officer Transfer',
          { officerId }
        );
      }
      
      if (!officer.isActive) {
        throw new DataIntegrityError(
          'OFFICER_INACTIVE',
          'Officer Transfer',
          { officerId, officerName: officer.officerName }
        );
      }
      
      // Store current assignment for history
      const fromDepartment = officer.assignedDepartment;
      const fromSubDepartment = officer.assignedSubDepartment;
      
      // Validate new assignment
      const assignmentValidation = await validateOfficerAssignment(
        officerId, 
        toDepartment, 
        toSubDepartment
      );
      
      if (!assignmentValidation.isValid) {
        throw new DataIntegrityError(
          'INVALID_TRANSFER_ASSIGNMENT',
          'Officer Transfer',
          { violations: assignmentValidation.violations }
        );
      }
      
      // Check if transferring to same department (should be prevented)
      if (fromDepartment?.toString() === toDepartment.toString() && 
          fromSubDepartment?.toString() === toSubDepartment.toString()) {
        throw new DataIntegrityError(
          'SAME_DEPARTMENT_TRANSFER',
          'Officer Transfer',
          { message: 'Cannot transfer officer to the same department and sub-department' }
        );
      }
      
      // Update officer assignment
      officer.assignedDepartment = toDepartment;
      officer.assignedSubDepartment = toSubDepartment;
      officer.updatedAt = new Date();
      
      // Add to transfer history
      officer.addTransferHistory(
        fromDepartment,
        fromSubDepartment,
        toDepartment,
        toSubDepartment,
        adminUser._id,
        reason
      );
      
      await officer.save({ session });
      
      // Create audit log
      await createAuditLog({
        action: 'OFFICER_TRANSFER',
        user: adminUser,
        entityType: 'USER',
        entityId: officer._id,
        details: {
          officerId: officer.officerId,
          officerName: officer.officerName,
          fromDepartment: fromDepartment,
          fromSubDepartment: fromSubDepartment,
          toDepartment: toDepartment,
          toSubDepartment: toSubDepartment,
          reason: reason,
          transferredBy: adminUser.adminName
        }
      });
      
      return {
        officer: {
          id: officer._id,
          officerId: officer.officerId,
          officerName: officer.officerName,
          newAssignment: {
            department: assignmentValidation.details.department,
            subDepartment: assignmentValidation.details.subDepartment
          }
        },
        transfer: {
          reason: reason,
          transferDate: new Date(),
          transferredBy: adminUser.adminName
        }
      };
    });
    
    return {
      success: true,
      ...result,
      message: 'Officer transferred successfully'
    };
    
  } catch (error) {
    console.error('Error transferring officer:', error);
    
    if (error instanceof DataIntegrityError) {
      throw error;
    }
    
    throw new Error(`Failed to transfer officer: ${error.message}`);
  } finally {
    await session.endSession();
  }
};

/**
 * Retires an officer from the system (hard delete)
 * @param {Object} adminUser - Super Admin performing the retirement
 * @param {string} officerId - Officer's MongoDB ID
 * @returns {Promise<Object>} Retirement result
 */
const retireOfficer = async (adminUser, officerId) => {
  const session = await mongoose.startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      // Validate Super Admin authority
      if (adminUser.role !== 'SUPER_ADMIN') {
        throw new DataIntegrityError(
          'INSUFFICIENT_AUTHORITY',
          'Officer Retirement',
          { requiredRole: 'SUPER_ADMIN', userRole: adminUser.role }
        );
      }
      
      // Get officer to retire
      const officer = await User.findById(officerId).session(session);
      if (!officer || officer.role !== 'OFFICER') {
        throw new DataIntegrityError(
          'OFFICER_NOT_FOUND',
          'Officer Retirement',
          { officerId }
        );
      }
      
      // Store officer details for audit before deletion
      const officerDetails = {
        id: officer._id,
        officerId: officer.officerId,
        officerName: officer.officerName,
        email: officer.email,
        assignedDepartment: officer.assignedDepartment,
        assignedSubDepartment: officer.assignedSubDepartment,
        transferHistory: officer.transferHistory
      };
      
      // Create audit log before deletion
      await createAuditLog({
        action: 'OFFICER_RETIRE',
        user: adminUser,
        entityType: 'USER',
        entityId: officer._id,
        details: {
          ...officerDetails,
          retiredBy: adminUser.adminName,
          retirementDate: new Date()
        }
      });
      
      // Hard delete the officer (as per government requirements)
      await User.findByIdAndDelete(officerId).session(session);
      
      // Note: Complaints handled by this officer remain for historical audit
      // but are no longer assigned to any officer
      
      return {
        retiredOfficer: {
          officerId: officerDetails.officerId,
          officerName: officerDetails.officerName,
          email: officerDetails.email
        },
        retirement: {
          retirementDate: new Date(),
          retiredBy: adminUser.adminName
        }
      };
    });
    
    return {
      success: true,
      ...result,
      message: 'Officer retired successfully'
    };
    
  } catch (error) {
    console.error('Error retiring officer:', error);
    
    if (error instanceof DataIntegrityError) {
      throw error;
    }
    
    throw new Error(`Failed to retire officer: ${error.message}`);
  } finally {
    await session.endSession();
  }
};

module.exports = {
  generateOfficerId,
  generateTemporaryPassword,
  createOfficer,
  transferOfficer,
  retireOfficer
};