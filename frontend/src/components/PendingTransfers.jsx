/**
 * SUVIDHA 2026 - Pending Transfers Component
 * 
 * Component for displaying and managing pending complaint transfers
 */

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Building, FileText, User, Calendar } from 'lucide-react';
import { getPendingTransfers, acceptTransfer, rejectTransfer } from '../services/transferService';
import { canAcceptTransfer, canRejectTransfer } from '../utils/transferUtils';
import { useAuth } from '../context/AuthContext';

const PendingTransfers = ({ limit = null, onTransferAction = null }) => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  useEffect(() => {
    // Extract department ID - handle both string and object cases
    const departmentId = user?.assignedDepartment?._id || user?.assignedDepartment || 
                        user?.department?._id || user?.department;
    if (user && departmentId) {
      fetchPendingTransfers();
    }
  }, [user]);
  
  const fetchPendingTransfers = async () => {
    try {
      setLoading(true);
      
      // Get user's department ID (officers have assignedDepartment)
      // Handle both string and object cases
      const departmentId = user?.assignedDepartment?._id || user?.assignedDepartment || 
                          user?.department?._id || user?.department;
      
      if (!user || !departmentId) {
        setError('User department information not available');
        setLoading(false);
        return;
      }
      
      const response = await getPendingTransfers(departmentId);
      if (response.success) {
        const transfersToShow = limit ? response.transfers.slice(0, limit) : response.transfers;
        setTransfers(transfersToShow);
      }
    } catch (err) {
      setError('Failed to load pending transfers');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAccept = async (transfer) => {
    if (!confirm('Accept this complaint transfer?')) return;
    
    setActionLoading(transfer._id);
    try {
      const response = await acceptTransfer(transfer.complaint._id, transfer._id);
      if (response.success) {
        setTransfers(prev => prev.filter(t => t._id !== transfer._id));
        if (onTransferAction) onTransferAction();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept transfer');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleRejectClick = (transfer) => {
    setSelectedTransfer(transfer);
    setShowRejectModal(true);
  };
  
  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setActionLoading(selectedTransfer._id);
    try {
      const response = await rejectTransfer(selectedTransfer.complaint._id, selectedTransfer._id, rejectionReason);
      if (response.success) {
        setTransfers(prev => prev.filter(t => t._id !== selectedTransfer._id));
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedTransfer(null);
        if (onTransferAction) onTransferAction();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject transfer');
    } finally {
      setActionLoading(null);
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getTransferReasonText = (reason) => {
    const reasons = {
      WRONG_DEPARTMENT: 'Wrong Department',
      REQUIRES_EXPERTISE: 'Requires Expertise',
      WORKLOAD_DISTRIBUTION: 'Workload Distribution',
      JURISDICTION_CHANGE: 'Jurisdiction Change',
      OTHER: 'Other'
    };
    return reasons[reason] || reason;
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="text-gray-400" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Pending Transfers</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-200 rounded-xl p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="text-gray-400" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Pending Transfers</h3>
        </div>
        <div className="text-center py-8">
          <XCircle className="mx-auto text-red-500 mb-3" size={48} />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="text-orange-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Pending Transfers</h3>
            {transfers.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                {transfers.length}
              </span>
            )}
          </div>
        </div>
        
        {transfers.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No pending transfers</p>
            <p className="text-gray-400 text-sm mt-1">All transfers have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <div key={transfer._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="text-blue-600" size={16} />
                      <span className="font-bold text-gray-900">
                        Complaint #{transfer.complaint?.complaintNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        transfer.complaint?.priority === 'HIGH' 
                          ? 'bg-red-100 text-red-800'
                          : transfer.complaint?.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {transfer.complaint?.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {transfer.complaint?.description}
                    </p>
                  </div>
                </div>
                
                {/* Transfer details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Building size={14} className="text-gray-400" />
                    <span className="text-gray-500">From:</span>
                    <span className="font-medium text-gray-700">
                      {transfer.fromDepartment?.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-gray-400" />
                    <span className="text-gray-500">By:</span>
                    <span className="font-medium text-gray-700">
                      {transfer.transferredBy?.officerName || transfer.transferredBy?.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle size={14} className="text-gray-400" />
                    <span className="text-gray-500">Reason:</span>
                    <span className="font-medium text-gray-700">
                      {getTransferReasonText(transfer.transferReason)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium text-gray-700">
                      {formatDate(transfer.transferredAt)}
                    </span>
                  </div>
                </div>
                
                {/* Transfer notes */}
                {transfer.transferNotes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notes:</span>
                    <p className="text-sm text-gray-700 mt-1">{transfer.transferNotes}</p>
                  </div>
                )}
                
                {/* Action buttons */}
                {canAcceptTransfer(user, transfer) || canRejectTransfer(user, transfer) ? (
                  <div className="flex gap-3">
                    {canAcceptTransfer(user, transfer) && (
                      <button
                        onClick={() => handleAccept(transfer)}
                        disabled={actionLoading === transfer._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === transfer._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Accept
                          </>
                        )}
                      </button>
                    )}
                    
                    {canRejectTransfer(user, transfer) && (
                      <button
                        onClick={() => handleRejectClick(transfer)}
                        disabled={actionLoading === transfer._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-yellow-800 font-medium">
                        You don't have permission to accept or reject this transfer. Only officers in the target department can take action.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reject Transfer</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this transfer. This will be visible to the sending department.
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            
            <div className="flex items-center justify-between mt-2 mb-4">
              <span className="text-xs text-gray-500">
                {rejectionReason.length}/500
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedTransfer(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendingTransfers;
