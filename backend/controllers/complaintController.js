/**
 * SUVIDHA 2026 - Complaint Controller
 * 
 * Handles CRUD operations for Complaints.
 * - Citizens can create complaints and upload documents
 * - Officers can view and update complaints from their sub-department
 * - Admin can view all complaints
 */

const Complaint = require('../models/Complaint.js');
const User = require('../models/User.js');
const SubDepartment = require('../models/SubDepartment.js');
const Department = require('../models/Department.js');
const { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.js');
const { generateComplaintNumber } = require('../utils/generateComplaintNumber.js');
const { logComplaintCreate, logComplaintStatusChange, createAuditLog } = require('../utils/auditLogger.js');
const { checkOfficerComplaintAccess, filterByOfficerSubDepartment } = require('../middleware/officerAccess.js');

/**
 * @route   POST /api/complaints
 * @desc    Create new complaint (Citizen only)
 * @access  Private (PUBLIC/Citizen)
 */
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, department, subDepartment, location } = req.body;

    // Validation
    if (!title || !description || !category || !department || !subDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, department, and sub-department are required'
      });
    }

    // Verify sub-department exists and belongs to department
    const subDept = await SubDepartment.findById(subDepartment)
      .populate('department');

    if (!subDept) {
      return res.status(404).json({
        success: false,
        message: 'Sub-department not found'
      });
    }

    if (subDept.department._id.toString() !== department) {
      return res.status(400).json({
        success: false,
        message: 'Sub-department does not belong to the specified department'
      });
    }

    // Generate complaint number
    const complaintNumber = await generateComplaintNumber();

    // Handle file uploads if any
    let documents = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => {
          return uploadToCloudinary(file.buffer, {
            folder: `suvidha2026/complaints/${complaintNumber}`,
            resource_type: 'auto',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
          });
        });

        const uploadResults = await Promise.all(uploadPromises);
        
        documents = uploadResults.map((result, index) => ({
          name: req.files[index].originalname,
          secure_url: result.secure_url,
          public_id: result.public_id,
          uploadedAt: new Date()
        }));
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading documents',
          error: uploadError.message
        });
      }
    }

    // Create complaint
    const complaint = new Complaint({
      complaintNumber,
      citizen: req.user._id,
      department,
      subDepartment,
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'MEDIUM',
      status: 'PENDING',
      location: location || {},
      documents
    });

    await complaint.save();
    
    // Populate the complaint with related data
    await complaint.populate([
      { path: 'citizen', select: 'name mobileNumber' },
      { path: 'department', select: 'name code' },
      { path: 'subDepartment', select: 'name code' }
    ]);

    // Log audit
    await logComplaintCreate(req.user, complaint, req);

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/complaints
 * @desc    Get all complaints (filtered by role)
 * @access  Private (all roles)
 */
const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, department, subDepartment, search, page = 1, limit = 10 } = req.query;

    // Build query based on user role
    const query = {};

    // Citizens can only see their own complaints
    if (req.user.role === 'PUBLIC') {
      query.citizen = req.user._id;
    }
    // Officers can only see complaints from their sub-department
    else if (req.user.role === 'OFFICER') {
      query.subDepartment = req.user.assignedSubDepartment;
    }
    // Admin can see all complaints

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (subDepartment) query.subDepartment = subDepartment;

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { complaintNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(query)
      .populate('citizen', 'name mobileNumber')
      .populate('department', 'name code')
      .populate('subDepartment', 'name code')
      .populate('assignedOfficer', 'officerId officerName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      count: complaints.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      complaints
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/complaints/:id
 * @desc    Get single complaint by ID
 * @access  Private (all roles with access control)
 */
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name mobileNumber email address')
      .populate('department', 'name code')
      .populate('subDepartment', 'name code')
      .populate('assignedOfficer', 'officerId officerName')
      .populate('remarks.addedBy', 'name officerName adminName mobileNumber officerId adminEmail');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Access control
    // Citizens can only see their own complaints
    if (req.user.role === 'PUBLIC' && complaint.citizen._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own complaints.'
      });
    }

    // Officers can only see complaints from their sub-department
    if (req.user.role === 'OFFICER' && 
        complaint.subDepartment._id.toString() !== req.user.assignedSubDepartment?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This complaint is not assigned to your sub-department.'
      });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/complaints/:id
 * @desc    Update complaint
 * @access  Private (OFFICER, ADMIN - with access control)
 */
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Access control for officers
    if (req.user.role === 'OFFICER' && 
        complaint.subDepartment.toString() !== req.user.assignedSubDepartment?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This complaint is not assigned to your sub-department.'
      });
    }

    // Only officers and admin can update
    if (req.user.role === 'PUBLIC') {
      return res.status(403).json({
        success: false,
        message: 'Citizens cannot update complaints. Please add remarks instead.'
      });
    }

    const { status, priority, assignedOfficer, remarks } = req.body;

    // Track status change for audit
    const oldStatus = complaint.status;

    // Update fields
    if (status && status !== complaint.status) {
      complaint.status = status;
      
      // Update resolution/rejection details
      if (status === 'RESOLVED') {
        complaint.resolutionDetails = {
          resolvedAt: new Date(),
          resolvedBy: req.user._id,
          resolutionNotes: req.body.resolutionNotes || ''
        };
      } else if (status === 'REJECTED') {
        complaint.rejectionDetails = {
          rejectedAt: new Date(),
          rejectedBy: req.user._id,
          rejectionReason: req.body.rejectionReason || ''
        };
      }
    }

    if (priority) complaint.priority = priority;
    if (assignedOfficer) {
      // Verify officer belongs to the same sub-department
      const officer = await User.findById(assignedOfficer);
      if (officer && officer.assignedSubDepartment?.toString() === complaint.subDepartment.toString()) {
        complaint.assignedOfficer = assignedOfficer;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Officer must belong to the same sub-department as the complaint'
        });
      }
    }

    // Add remarks if provided
    if (remarks && remarks.trim()) {
      complaint.remarks.push({
        text: remarks.trim(),
        addedBy: req.user._id,
        role: req.user.role,
        addedAt: new Date()
      });
    }

    await complaint.save();
    
    // Populate the complaint with related data
    await complaint.populate([
      { path: 'citizen', select: 'name mobileNumber' },
      { path: 'department', select: 'name code' },
      { path: 'subDepartment', select: 'name code' },
      { path: 'assignedOfficer', select: 'officerId officerName' }
    ]);

    // Log status change if changed
    if (oldStatus !== complaint.status) {
      await logComplaintStatusChange(req.user, complaint, oldStatus, complaint.status, req);
    }

    // Log update
    await createAuditLog({
      action: 'COMPLAINT_UPDATE',
      user: req.user,
      entityType: 'COMPLAINT',
      entityId: complaint._id,
      details: {
        complaintNumber: complaint.complaintNumber,
        updatedFields: Object.keys(req.body)
      },
      req
    });

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/complaints/:id/documents
 * @desc    Add documents to existing complaint
 * @access  Private (PUBLIC/Citizen - own complaints only)
 */
const addDocuments = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Only citizens can add documents, and only to their own complaints
    if (req.user.role !== 'PUBLIC' || complaint.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only citizens can add documents to their own complaints.'
      });
    }

    // Only allow adding documents to pending or in-progress complaints
    if (complaint.status === 'RESOLVED' || complaint.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add documents to resolved or rejected complaints'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    // Upload files to Cloudinary
    try {
      const uploadPromises = req.files.map(file => {
        return uploadToCloudinary(file.buffer, {
          folder: `suvidha2026/complaints/${complaint.complaintNumber}`,
          resource_type: 'auto'
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      const newDocuments = uploadResults.map((result, index) => ({
        name: req.files[index].originalname,
        secure_url: result.secure_url,
        public_id: result.public_id,
        uploadedAt: new Date()
      }));

      // Add documents to complaint
      complaint.documents.push(...newDocuments);
      await complaint.save();

      // Log audit
      await createAuditLog({
        action: 'FILE_UPLOAD',
        user: req.user,
        entityType: 'COMPLAINT',
        entityId: complaint._id,
        details: {
          complaintNumber: complaint.complaintNumber,
          fileCount: newDocuments.length
        },
        req
      });

      res.json({
        success: true,
        message: 'Documents added successfully',
        documents: newDocuments
      });
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Error uploading documents',
        error: uploadError.message
      });
    }
  } catch (error) {
    console.error('Add documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding documents',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/complaints/:id/receipt
 * @desc    Download complaint receipt as PDF
 * @access  Private (PUBLIC/Citizen - own complaints only)
 */
const downloadReceipt = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name mobileNumber email')
      .populate('department', 'name code')
      .populate('subDepartment', 'name code');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Only citizens can download receipts, and only for their own complaints
    if (req.user.role !== 'PUBLIC' || complaint.citizen._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only download receipts for your own complaints.'
      });
    }

    // Generate PDF receipt
    const { generateComplaintReceipt } = require('../services/receiptService.js');
    const pdfBuffer = await generateComplaintReceipt(complaint, complaint.citizen);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SUVIDHA_Receipt_${complaint.complaintNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Download receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating receipt',
      error: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  addDocuments,
  downloadReceipt
};
