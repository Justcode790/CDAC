/**
 * SUVIDHA 2026 - Transfer Modal Component
 * 
 * Modal for transferring complaints to other departments
 */

import { useState, useEffect } from 'react';
import { X, Send, AlertCircle, Loader2 } from 'lucide-react';
import { transferComplaint, validateTransferData, getTransferReasonText } from '../services/transferService';
import { getDepartmentsPublic } from '../services/departmentService';
import { TRANSFER_REASONS } from '../utils/constants';

const TransferModal = ({ complaint, isOpen, onClose, onSuccess }) => {
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    targetDepartment: '',
    targetSubDepartment: '',
    transferType: 'DEPARTMENT',
    transferReason: '',
    transferNotes: ''
  });
  
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (formData.targetDepartment) {
      fetchSubDepartments(formData.targetDepartment);
    } else {
      setSubDepartments([]);
      setFormData(prev => ({ ...prev, targetSubDepartment: '' }));
    }
  }, [formData.targetDepartment]);
  
  const fetchDepartments = async () => {
    try {
      const response = await getDepartmentsPublic();
      if (response.success) {
        // Include all departments (including current one for internal transfers)
        setDepartments(response.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };
  
  const fetchSubDepartments = async (departmentId) => {
    try {
      const response = await getDepartmentsPublic();
      if (response.success) {
        const dept = response.departments.find(d => d._id === departmentId);
        if (dept && dept.subDepartments) {
          setSubDepartments(dept.subDepartments);
        }
      }
    } catch (error) {
      console.error('Error fetching sub-departments:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    const updatedData = { ...formData, [name]: value };
    
    // Automatically set transferType based on whether sub-department is selected
    if (name === 'targetSubDepartment') {
      updatedData.transferType = value ? 'SUB_DEPARTMENT' : 'DEPARTMENT';
    }
    
    setFormData(updatedData);
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const validation = validateTransferData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await transferComplaint(complaint._id, formData);
      
      if (response.success) {
        // Call success callback first (this will refetch data)
        onSuccess(response);
        // Then close modal
        handleClose();
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to transfer complaint' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setFormData({
      targetDepartment: '',
      targetSubDepartment: '',
      transferType: 'DEPARTMENT',
      transferReason: '',
      transferNotes: ''
    });
    setErrors({});
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Transfer Complaint</h2>
            <p className="text-sm text-gray-600 mt-1">Complaint #{complaint.complaintNumber}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Department */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Target Department *
            </label>
            <select
              name="targetDepartment"
              value={formData.targetDepartment}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
            {errors.targetDepartment && (
              <p className="text-red-500 text-sm mt-1">{errors.targetDepartment}</p>
            )}
          </div>
          
          {/* Target Sub-Department */}
          {formData.targetDepartment && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Target Sub-Department (Optional)
              </label>
              <select
                name="targetSubDepartment"
                value={formData.targetSubDepartment}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value="">Select Sub-Department</option>
                {subDepartments.map(subDept => (
                  <option key={subDept._id} value={subDept._id}>{subDept.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Transfer Reason */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Transfer Reason *
            </label>
            <select
              name="transferReason"
              value={formData.transferReason}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
              required
            >
              <option value="">Select Reason</option>
              {Object.entries(TRANSFER_REASONS).map(([key, value]) => (
                <option key={key} value={value}>{getTransferReasonText(value)}</option>
              ))}
            </select>
            {errors.transferReason && (
              <p className="text-red-500 text-sm mt-1">{errors.transferReason}</p>
            )}
          </div>
          
          {/* Transfer Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Transfer Notes {formData.transferReason === 'OTHER' && '*'}
            </label>
            <textarea
              name="transferNotes"
              value={formData.transferNotes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium resize-none"
              placeholder="Provide additional details about the transfer..."
              required={formData.transferReason === 'OTHER'}
            />
            {errors.transferNotes && (
              <p className="text-red-500 text-sm mt-1">{errors.transferNotes}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.transferNotes.length}/500 characters
            </p>
          </div>
          
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-500 p-5 rounded-xl animate-in fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <p className="text-red-900 font-bold text-sm mb-1">Transfer Failed</p>
                  <p className="text-red-800 text-sm leading-relaxed">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Transferring...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Transfer Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
