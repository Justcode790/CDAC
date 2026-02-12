/**
 * SUVIDHA 2026 - Connection Controller
 * 
 * API endpoints for department connection management
 */

const DepartmentConnection = require('../models/DepartmentConnection');
const Department = require('../models/Department');

/**
 * @route   POST /api/connections
 * @desc    Create department connection
 * @access  Private (Admin+)
 */
const createConnection = async (req, res) => {
  try {
    const { sourceDepartment, targetDepartment, connectionType, notes } = req.body;
    
    // Validate required fields
    if (!sourceDepartment || !targetDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Source and target departments are required'
      });
    }
    
    // Check if departments exist
    const [source, target] = await Promise.all([
      Department.findById(sourceDepartment),
      Department.findById(targetDepartment)
    ]);
    
    if (!source || !target) {
      return res.status(404).json({
        success: false,
        message: 'One or both departments not found'
      });
    }
    
    // Check if connection already exists
    const existingConnection = await DepartmentConnection.findOne({
      $or: [
        { sourceDepartment, targetDepartment },
        { sourceDepartment: targetDepartment, targetDepartment: sourceDepartment }
      ]
    });
    
    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection already exists between these departments',
        connection: existingConnection
      });
    }
    
    // Create connection
    const connection = await DepartmentConnection.create({
      sourceDepartment,
      targetDepartment,
      connectionType: connectionType || 'BOTH',
      notes,
      establishedBy: req.user._id
    });
    
    await connection.populate([
      { path: 'sourceDepartment', select: 'name code' },
      { path: 'targetDepartment', select: 'name code' },
      { path: 'establishedBy', select: 'name officerName' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Connection created successfully',
      connection
    });
    
  } catch (error) {
    console.error('Create connection error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Connection already exists between these departments'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating connection',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/departments/:id/connections
 * @desc    Get connections for a department
 * @access  Private (Officer+)
 */
const getDepartmentConnections = async (req, res) => {
  try {
    const { id: departmentId } = req.params;
    
    const connections = await DepartmentConnection.getDepartmentConnections(departmentId);
    
    res.json({
      success: true,
      count: connections.length,
      connections
    });
    
  } catch (error) {
    console.error('Get department connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department connections',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/connections/validate
 * @desc    Validate if connection exists between departments
 * @access  Private (Officer+)
 */
const validateConnection = async (req, res) => {
  try {
    const { source, target } = req.query;
    
    if (!source || !target) {
      return res.status(400).json({
        success: false,
        message: 'Source and target department IDs are required'
      });
    }
    
    const exists = await DepartmentConnection.connectionExists(source, target);
    
    res.json({
      success: true,
      exists,
      message: exists ? 'Connection exists' : 'Connection does not exist'
    });
    
  } catch (error) {
    console.error('Validate connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating connection',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/connections/:id
 * @desc    Delete (deactivate) connection
 * @access  Private (Admin+)
 */
const deleteConnection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await DepartmentConnection.findById(id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }
    
    // Deactivate instead of delete
    await connection.deactivate();
    
    res.json({
      success: true,
      message: 'Connection deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting connection',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/connections/:id/reactivate
 * @desc    Reactivate connection
 * @access  Private (Admin+)
 */
const reactivateConnection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await DepartmentConnection.findById(id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }
    
    await connection.reactivate();
    
    res.json({
      success: true,
      message: 'Connection reactivated successfully',
      connection
    });
    
  } catch (error) {
    console.error('Reactivate connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating connection',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/connections/stats/:departmentId
 * @desc    Get connection statistics for a department
 * @access  Private (Admin+)
 */
const getConnectionStats = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const stats = await DepartmentConnection.getConnectionStats(departmentId);
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Get connection stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching connection statistics',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/connections/most-active
 * @desc    Get most active connections
 * @access  Private (Admin+)
 */
const getMostActiveConnections = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const connections = await DepartmentConnection.getMostActiveConnections(parseInt(limit));
    
    res.json({
      success: true,
      connections
    });
    
  } catch (error) {
    console.error('Get most active connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching most active connections',
      error: error.message
    });
  }
};

module.exports = {
  createConnection,
  getDepartmentConnections,
  validateConnection,
  deleteConnection,
  reactivateConnection,
  getConnectionStats,
  getMostActiveConnections
};
