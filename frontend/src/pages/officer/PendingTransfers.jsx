/**
 * SUVIDHA 2026 - Pending Transfers Page
 * 
 * Full page for managing pending complaint transfers
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Building, 
  FileText, 
  User, 
  Calendar,
  Filter,
  Search,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { getPendingTransfers, acceptTransfer, rejectTransfer } from '../../services/transferService';
import { ROUTES } from '../../utils/constants';

const PendingTransfers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  
  // Rejection modal
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
  
  useEffect(() => {
    applyFilters();
  }, [transfers, searchQuery, priorityFilter, departmentFilter]);
  
  const fetchPendingTransfers = async () => {
    try {
      setLoading(true);
      
      // Get user's department ID (officers have assignedDepartment)
      // Handle both string and object cases
      const departmentId = user?.assignedDepartment?._id || user?.assignedDepartment || 
                          user?.department?._id || user?.department;
      
      if (!departmentId) {
        setError('User department information not available');
        setLoading(false);
        return;
      }
      
      const response = await getPendingTransfers(departmentId);
      if (response.success) {
        setTransfers(response.transfers);
      }
    } catch (err) {
      setError('Failed to load pending transfers');
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...transfers];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.complaint?.complaintNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.complaint?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.fromDepartment?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Priority filter
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(t => t.complaint?.priority === priorityFilter);
    }
    
    // Department filter
    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(t => t.fromDepartment?._id === departmentFilter);
    }
    
    setFilteredTransfers(filtered);
  };
  
  const handleAccept = async (transfer) => {
    if (!confirm('Accept this complaint transfer?')) return;
    
    setActionLoading(transfer._id);
    try {
      const response = await acceptTransfer(transfer.complaint._id, transfer._id);
      if (response.success) {
        setTransfers(prev => prev.filter(t => t._id !== transfer._id));
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
  
  const uniqueDepartments = [...new Set(transfers.map(t => t.fromDepartment?._id))];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
          <p className="font-bold text-slate-600">Loading pending transfers...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <header className="bg-indigo-900 text-white sticky top-0 z-30 shadow-xl border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(ROUTES.OFFICER_DASHBOARD)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none uppercase italic">
                Pending Transfers
              </h1>
              <p className="text-[10px] text-indigo-300 font-bold mt-1.5 uppercase tracking-[0.2em]">
                Manage Incoming Transfers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                Pending
              </span>
              <span className="ml-2 text-xl font-black">{transfers.length}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-10">
        {/* Filters Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Filter size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Filters
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
              />
            </div>
            
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
            
            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold"
            >
              <option value="ALL">All Departments</option>
              {uniqueDepartments.map(deptId => {
                const dept = transfers.find(t => t.fromDepartment?._id === deptId)?.fromDepartment;
                return dept ? <option key={deptId} value={deptId}>{dept.name}</option> : null;
              })}
            </select>
          </div>
          
          {/* Active filters summary */}
          {(searchQuery || priorityFilter !== 'ALL' || departmentFilter !== 'ALL') && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-slate-600 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">
                  Search: {searchQuery}
                </span>
              )}
              {priorityFilter !== 'ALL' && (
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">
                  Priority: {priorityFilter}
                </span>
              )}
              {departmentFilter !== 'ALL' && (
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">
                  Department
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('ALL');
                  setDepartmentFilter('ALL');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-bold ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {error ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-12 text-center">
            <XCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h3 className="text-xl font-black text-slate-900 mb-2">Error Loading Transfers</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-12 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {transfers.length === 0 ? 'No Pending Transfers' : 'No Results Found'}
            </h3>
            <p className="text-slate-600">
              {transfers.length === 0 
                ? 'All transfers have been processed' 
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-600">
                Showing {filteredTransfers.length} of {transfers.length} transfers
              </p>
            </div>
            
            {filteredTransfers.map((transfer) => (
              <div 
                key={transfer._id} 
                className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 hover:border-indigo-300 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Complaint Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="text-indigo-600" size={20} />
                          <span className="font-mono font-black text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                            {transfer.complaint?.complaintNumber}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            transfer.complaint?.priority === 'HIGH' 
                              ? 'bg-red-100 text-red-800'
                              : transfer.complaint?.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {transfer.complaint?.priority}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed mb-4">
                          {transfer.complaint?.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Transfer Flow */}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border flex-1">
                          <Building size={18} className="text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500 font-bold">From</p>
                            <p className="text-sm font-black text-slate-900">
                              {transfer.fromDepartment?.name}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="text-slate-400" size={24} />
                        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-200 flex-1">
                          <Building size={18} className="text-indigo-600" />
                          <div>
                            <p className="text-xs text-indigo-600 font-bold">To</p>
                            <p className="text-sm font-black text-indigo-900">
                              {transfer.toDepartment?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Transfer Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-slate-400" />
                        <span className="text-slate-500">By:</span>
                        <span className="font-bold text-slate-700">
                          {transfer.transferredBy?.officerName || transfer.transferredBy?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-slate-500">Date:</span>
                        <span className="font-bold text-slate-700">
                          {formatDate(transfer.transferredAt)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Reason */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                            Transfer Reason
                          </p>
                          <p className="text-sm font-bold text-blue-900 mt-1">
                            {getTransferReasonText(transfer.transferReason)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {transfer.transferNotes && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                          Transfer Notes
                        </p>
                        <p className="text-sm text-slate-700 font-medium">
                          {transfer.transferNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Right: Actions */}
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleAccept(transfer)}
                      disabled={actionLoading === transfer._id}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-black text-sm uppercase tracking-widest shadow-lg"
                    >
                      {actionLoading === transfer._id ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Accept Transfer
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleRejectClick(transfer)}
                      disabled={actionLoading === transfer._id}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-black text-sm uppercase tracking-widest shadow-lg"
                    >
                      <XCircle size={20} />
                      Reject Transfer
                    </button>
                    
                    <button
                      onClick={() => navigate(`/officer/complaint/${transfer.complaint?._id}`)}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all font-bold text-sm"
                    >
                      <FileText size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <XCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Reject Transfer</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 font-medium">
              Please provide a reason for rejecting this transfer. This will be visible to the sending department.
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none font-medium"
              rows={5}
              maxLength={500}
            />
            
            <div className="flex items-center justify-between mt-2 mb-6">
              <span className="text-xs text-slate-500 font-bold">
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
                className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || actionLoading}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-black"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTransfers;
