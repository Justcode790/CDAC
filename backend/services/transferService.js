/**
 * SUVIDHA 2026 - Transfer Service
 *
 * Business logic for complaint transfers between departments and sub-departments
 * Handles validation, execution, and connection management
 */

const mongoose = require("mongoose");
const ComplaintTransfer = require("../models/ComplaintTransfer");
const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const SubDepartment = require("../models/SubDepartment");
const DepartmentConnection = require("../models/DepartmentConnection");
const { createAuditLog } = require("../utils/auditLogger");

/**
 * Validate transfer permissions and requirements
 */
const validateTransfer = async (
  user,
  complaint,
  targetDepartmentId,
  targetSubDepartmentId,
) => {
  // Check user role - Allow OFFICER, ADMIN, and SUPER_ADMIN to transfer any complaint
  if (!["OFFICER", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return {
      valid: false,
      error: "TRANSFER_PERMISSION_DENIED",
      message: "You do not have permission to transfer complaints",
    };
  }

  // No sub-department restriction - officers can transfer any complaint

  // Check if target department exists and is active
  const targetDepartment = await Department.findById(targetDepartmentId);
  if (!targetDepartment || !targetDepartment.isActive) {
    return {
      valid: false,
      error: "INVALID_TARGET_DEPARTMENT",
      message: "Target department does not exist or is inactive",
    };
  }

  // Check if target sub-department exists and belongs to target department (if provided)
  if (targetSubDepartmentId) {
    const targetSubDepartment = await SubDepartment.findById(
      targetSubDepartmentId,
    );
    if (!targetSubDepartment || !targetSubDepartment.isActive) {
      return {
        valid: false,
        error: "INVALID_TARGET_SUBDEPARTMENT",
        message: "Target sub-department does not exist or is inactive",
      };
    }

    if (
      targetSubDepartment.department.toString() !==
      targetDepartmentId.toString()
    ) {
      return {
        valid: false,
        error: "SUBDEPARTMENT_MISMATCH",
        message: "Target sub-department does not belong to target department",
      };
    }
  }

  // Check if transferring to same department AND same sub-department
  if (complaint.department.toString() === targetDepartmentId.toString()) {
    // If same department, must have different sub-department
    if (
      !targetSubDepartmentId ||
      complaint.subDepartment.toString() === targetSubDepartmentId.toString()
    ) {
      return {
        valid: false,
        error: "SAME_DEPARTMENT_SUBDEPARTMENT_TRANSFER",
        message:
          "Cannot transfer to the same department and sub-department. Please select a different sub-department for internal transfers.",
      };
    }
  }

  // Check for duplicate pending transfer
  const pendingTransfer = await ComplaintTransfer.findOne({
    complaint: complaint._id,
    transferStatus: "PENDING",
    isActive: true,
  });

  if (pendingTransfer) {
    return {
      valid: false,
      error: "DUPLICATE_PENDING_TRANSFER",
      message:
        "A transfer is already pending for this complaint. Please wait for it to be accepted or rejected before initiating another transfer.",
    };
  }

  // Check if user's sub-department is the source of a pending transfer (prevent transfer-back)
  if (user.role === "OFFICER" && user.assignedSubDepartment) {
    const outgoingPendingTransfer = await ComplaintTransfer.findOne({
      complaint: complaint._id,
      fromSubDepartment: user.assignedSubDepartment,
      transferStatus: "PENDING",
      isActive: true,
    });

    if (outgoingPendingTransfer) {
      return {
        valid: false,
        error: "TRANSFER_ALREADY_SENT",
        message:
          "Your sub-department has already sent this complaint for transfer. Please wait for the destination to accept or reject it.",
      };
    }
  }

  return { valid: true };
};

/**
 * Validate or create department connection
 */
const validateConnection = async (
  sourceDepartmentId,
  targetDepartmentId,
  establishedBy,
) => {
  try {
    const result = await DepartmentConnection.getOrCreateConnection(
      sourceDepartmentId,
      targetDepartmentId,
      establishedBy,
    );

    return {
      success: true,
      connection: result.connection,
      created: result.created,
    };
  } catch (error) {
    return {
      success: false,
      error: "CONNECTION_VALIDATION_FAILED",
      message: error.message,
    };
  }
};

/**
 * Execute complaint transfer with proper transaction handling
 * Ensures atomicity - either all operations succeed or none do
 */
const executeTransfer = async (user, complaintId, transferData) => {
  const {
    targetDepartment,
    targetSubDepartment,
    transferType,
    transferReason,
    transferNotes,
  } = transferData;

  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ============================================
    // PHASE 1: VALIDATION (No DB modifications)
    // ============================================

    // Get complaint with populated fields
    const complaint = await Complaint.findById(complaintId)
      .populate("department")
      .populate("subDepartment")
      .session(session);

    if (!complaint) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        error: "COMPLAINT_NOT_FOUND",
        message: "Complaint not found",
      };
    }

    // Validate transfer (checks permissions, duplicate transfers, etc.)
    const validation = await validateTransfer(
      user,
      complaint,
      targetDepartment,
      targetSubDepartment,
    );
    if (!validation.valid) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        error: validation.error,
        message: validation.message,
      };
    }

    // ============================================
    // PHASE 2: CONNECTION VALIDATION
    // ============================================

    let connectionResult = null;
    let connectionCreated = false;

    // Validate/create connection only if transferring to a different department
    const isDifferentDepartment =
      complaint.department._id.toString() !== targetDepartment.toString();

    if (isDifferentDepartment) {
      connectionResult = await validateConnection(
        complaint.department._id,
        targetDepartment,
        user._id,
      );

      if (!connectionResult.success) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: connectionResult.error,
          message: connectionResult.message,
        };
      }

      connectionCreated = connectionResult.created;
    }

    // ============================================
    // PHASE 3: DATABASE MODIFICATIONS (Atomic)
    // ============================================

    // Create transfer record
    const transfer = await ComplaintTransfer.create(
      [
        {
          complaint: complaint._id,
          fromDepartment: complaint.department._id,
          fromSubDepartment: complaint.subDepartment._id,
          toDepartment: targetDepartment,
          toSubDepartment: targetSubDepartment || null,
          transferType: transferType || "DEPARTMENT",
          transferReason,
          transferNotes: transferNotes || "",
          transferredBy: user._id,
          transferredByRole: user.role,
          transferStatus: "PENDING",
        },
      ],
      { session },
    );

    // Add to complaint's transfer history
    await complaint.addTransferToHistory({
      fromDepartment: complaint.department._id,
      fromSubDepartment: complaint.subDepartment._id,
      toDepartment: targetDepartment,
      toSubDepartment: targetSubDepartment,
      transferredBy: user._id,
      reason: transferReason,
    });

    // Save complaint with session
    await complaint.save({ session });

    // Update connection statistics (only if different department)
    if (
      isDifferentDepartment &&
      connectionResult &&
      connectionResult.connection
    ) {
      await connectionResult.connection.incrementTransferCount();
    }

    // Create audit log
    await createAuditLog({
      action: "COMPLAINT_TRANSFER_INITIATED",
      user: user,
      entityType: "COMPLAINT",
      entityId: complaint._id,
      details: {
        complaintNumber: complaint.complaintNumber,
        fromDepartment: complaint.department.name,
        toDepartment: targetDepartment,
        transferReason,
        transferId: transfer[0]._id,
      },
    });

    // ============================================
    // PHASE 4: COMMIT TRANSACTION
    // ============================================

    await session.commitTransaction();
    session.endSession();

    // Populate transfer for response (after transaction)
    await transfer[0].populate([
      { path: "fromDepartment", select: "name code" },
      { path: "fromSubDepartment", select: "name code" },
      { path: "toDepartment", select: "name code" },
      { path: "toSubDepartment", select: "name code" },
      { path: "transferredBy", select: "name officerName officerId" },
    ]);

    return {
      success: true,
      transfer: transfer[0],
      connectionCreated,
    };
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    session.endSession();

    console.error("Transfer execution error:", error);
    return {
      success: false,
      error: "TRANSFER_EXECUTION_FAILED",
      message: error.message || "Failed to execute transfer",
    };
  }
};

/**
 * Accept a transfer with proper transaction handling
 * Ensures atomicity and correct validation order
 */
const acceptTransfer = async (user, transferId) => {
  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ============================================
    // PHASE 1: VALIDATION (No DB modifications)
    // ============================================

    // Find transfer with all required data
    const transfer = await ComplaintTransfer.findById(transferId)
      .populate("complaint")
      .populate("toDepartment")
      .populate("toSubDepartment")
      .populate("fromDepartment")
      .populate("fromSubDepartment")
      .session(session);

    if (!transfer) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        error: "TRANSFER_NOT_FOUND",
        message: "Transfer not found",
      };
    }

    // Check if transfer is pending
    if (transfer.transferStatus !== "PENDING") {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        error: "TRANSFER_NOT_PENDING",
        message: `Transfer is already ${transfer.transferStatus.toLowerCase()}`,
      };
    }

    // Check if user belongs to target department/sub-department
    if (user.role === "OFFICER") {
      const userSubDeptId = user.assignedSubDepartment?.toString();
      const targetSubDeptId = transfer.toSubDepartment?._id?.toString();

      if (!userSubDeptId || userSubDeptId !== targetSubDeptId) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: "NOT_TARGET_SUBDEPARTMENT",
          message: "You can only accept transfers to your sub-department",
        };
      }
    }

    // Get complaint
    const complaint = await Complaint.findById(transfer.complaint._id).session(
      session,
    );

    if (!complaint) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        error: "COMPLAINT_NOT_FOUND",
        message: "Complaint not found",
      };
    }

    // ============================================
    // PHASE 2: DATABASE MODIFICATIONS (Atomic)
    // ============================================

    // Update transfer status in ComplaintTransfer collection
    transfer.transferStatus = "ACCEPTED";
    transfer.acceptedBy = user._id;
    transfer.acceptedAt = new Date();
    await transfer.save({ session });

    // Update complaint assignment
    complaint.department = transfer.toDepartment._id;
    if (transfer.toSubDepartment) {
      complaint.subDepartment = transfer.toSubDepartment._id;
    }

    // Unclaim complaint so new department can claim it
    complaint.currentlyAssignedTo = null;
    complaint.assignedOfficer = null;

    // Update transfer history in complaint (find by matching fields, not by ID)
    const historyEntry = complaint.transferHistory.find(
      (h) =>
        h.toDepartment?.toString() === transfer.toDepartment._id.toString() &&
        h.toSubDepartment?.toString() ===
          transfer.toSubDepartment?._id?.toString() &&
        h.transferredAt?.getTime() === transfer.transferredAt?.getTime(),
    );

    if (historyEntry) {
      historyEntry.status = "ACCEPTED";
      historyEntry.acceptedBy = user._id;
      historyEntry.acceptedAt = new Date();
    }

    // Save complaint
    await complaint.save({ session });

    // Create audit log
    await createAuditLog({
      action: "COMPLAINT_TRANSFER_ACCEPTED",
      user: user,
      entityType: "COMPLAINT",
      entityId: complaint._id,
      details: {
        complaintNumber: complaint.complaintNumber,
        transferId: transfer._id,
        fromDepartment: transfer.fromDepartment?.name,
        fromSubDepartment: transfer.fromSubDepartment?.name,
        toDepartment: transfer.toDepartment?.name,
        toSubDepartment: transfer.toSubDepartment?.name,
      },
    });

    // ============================================
    // PHASE 3: COMMIT TRANSACTION
    // ============================================

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      transfer,
      complaint,
    };
  } catch (error) {
    // Rollback on any error
    await session.abortTransaction();
    session.endSession();

    console.error("Accept transfer error:", error);
    return {
      success: false,
      error: "ACCEPT_TRANSFER_FAILED",
      message: error.message || "Failed to accept transfer",
    };
  }
};

/**
 * Reject a transfer with proper transaction handling
 */
const rejectTransfer = async (user, transferId, rejectionReason) => {
  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ============================================
    // PHASE 1: VALIDATION (No DB modifications)
    // ============================================

    // Find transfer
    const transfer = await ComplaintTransfer.findById(transferId)
      .populate("complaint")
      .populate("toDepartment")
      .populate("toSubDepartment")
      .populate("fromDepartment")
      .populate("fromSubDepartment")
      .session(session);

    if (!transfer) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        error: "TRANSFER_NOT_FOUND",
        message: "Transfer not found",
      };
    }

    // Check if transfer is pending
    if (transfer.transferStatus !== "PENDING") {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        error: "TRANSFER_NOT_PENDING",
        message: `Transfer is already ${transfer.transferStatus.toLowerCase()}`,
      };
    }

    // Check if user belongs to target sub-department
    if (user.role === "OFFICER") {
      const userSubDeptId = user.assignedSubDepartment?.toString();
      const targetSubDeptId = transfer.toSubDepartment?._id?.toString();

      if (!userSubDeptId || userSubDeptId !== targetSubDeptId) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: "NOT_TARGET_SUBDEPARTMENT",
          message: "You can only reject transfers to your sub-department",
        };
      }
    }

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        error: "INVALID_REJECTION_REASON",
        message: "Rejection reason must be at least 10 characters",
      };
    }

    // Get complaint
    const complaint = await Complaint.findById(transfer.complaint._id).session(
      session,
    );

    if (!complaint) {
      await session.abortTransaction();
      session.endSession();
      return {
        success: false,
        error: "COMPLAINT_NOT_FOUND",
        message: "Complaint not found",
      };
    }

    // ============================================
    // PHASE 2: DATABASE MODIFICATIONS (Atomic)
    // ============================================

    // Update transfer status in ComplaintTransfer collection
    transfer.transferStatus = "REJECTED";
    transfer.rejectedBy = user._id;
    transfer.rejectedAt = new Date();
    transfer.rejectionReason = rejectionReason;
    await transfer.save({ session });

    // Update transfer history in complaint (find by matching fields)
    const historyEntry = complaint.transferHistory.find(
      (h) =>
        h.toDepartment?.toString() === transfer.toDepartment._id.toString() &&
        h.toSubDepartment?.toString() ===
          transfer.toSubDepartment?._id?.toString() &&
        h.transferredAt?.getTime() === transfer.transferredAt?.getTime(),
    );

    if (historyEntry) {
      historyEntry.status = "REJECTED";
      historyEntry.rejectedBy = user._id;
      historyEntry.rejectedAt = new Date();
      historyEntry.rejectionReason = rejectionReason;
    }

    // Save complaint
    await complaint.save({ session });

    // Create audit log
    await createAuditLog({
      action: "COMPLAINT_TRANSFER_REJECTED",
      user: user,
      entityType: "COMPLAINT",
      entityId: complaint._id,
      details: {
        complaintNumber: complaint.complaintNumber,
        transferId: transfer._id,
        fromDepartment: transfer.fromDepartment?.name,
        fromSubDepartment: transfer.fromSubDepartment?.name,
        toDepartment: transfer.toDepartment?.name,
        toSubDepartment: transfer.toSubDepartment?.name,
        rejectionReason,
      },
    });

    // ============================================
    // PHASE 3: COMMIT TRANSACTION
    // ============================================

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      transfer,
    };
  } catch (error) {
    // Rollback on any error
    await session.abortTransaction();
    session.endSession();

    console.error("Reject transfer error:", error);
    return {
      success: false,
      error: "REJECT_TRANSFER_FAILED",
      message: error.message || "Failed to reject transfer",
    };
  }
};

/**
 * Get pending transfers for a department
 */
const getPendingTransfers = async (departmentId) => {
  try {
    const transfers = await ComplaintTransfer.getPendingTransfers(departmentId);
    return {
      success: true,
      transfers,
    };
  } catch (error) {
    console.error("Get pending transfers error:", error);
    return {
      success: false,
      error: "GET_PENDING_TRANSFERS_FAILED",
      message: error.message,
    };
  }
};

/**
 * Get transfer history for a complaint
 */
const getTransferHistory = async (complaintId) => {
  try {
    const transfers = await ComplaintTransfer.getTransferHistory(complaintId);
    return {
      success: true,
      transfers,
    };
  } catch (error) {
    console.error("Get transfer history error:", error);
    return {
      success: false,
      error: "GET_TRANSFER_HISTORY_FAILED",
      message: error.message,
    };
  }
};

/**
 * Get transfer statistics
 */
const getTransferStats = async (departmentId, startDate, endDate) => {
  try {
    const stats = await ComplaintTransfer.getTransferStats(
      departmentId,
      startDate,
      endDate,
    );
    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("Get transfer stats error:", error);
    return {
      success: false,
      error: "GET_TRANSFER_STATS_FAILED",
      message: error.message,
    };
  }
};

module.exports = {
  validateTransfer,
  validateConnection,
  executeTransfer,
  acceptTransfer,
  rejectTransfer,
  getPendingTransfers,
  getTransferHistory,
  getTransferStats,
};
