/**
 * SUVIDHA 2026 - Transfer History Component
 * 
 * Displays the complete transfer history of a complaint in timeline format
 */

import { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  User, 
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getTransferHistory, getTransferReasonText, getTransferStatusColor } from '../services/transferService';

const TransferHistory = ({ complaintId }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTransfer, setExpandedTransfer] = useState(null);

  useEffect(() => {
    if (complaintId) {
      fetchTransferHistory();
    }
  }, [complaintId]);

  const fetchTransferHistory = async () => {
    try {
      setLoading(true);
      const response = await getTransferHistory(complaintId);
      if (response.success) {
        setTransfers(response.transfers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transfer history');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (transferId) => {
    setExpandedTransfer(expandedTransfer === transferId ? null : transferId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle2 className="text-green-600" size={20} />;
      case 'REJECTED':
        return <XCircle className="text-red-600" size={20} />;
      case 'PENDING':
        return <AlertCircle className="text-yellow-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <span className="ml-3 text-slate-600 font-bold">Loading transfer history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Transfer History
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-1">
              No transfers recorded
            </p>
          </div>
        </div>
        <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <ArrowRightLeft className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-bold">This complaint has not been transferred</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
          <ArrowRightLeft size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Transfer History
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            {transfers.length} transfer{transfers.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[29px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-100 to-transparent" />

        {/* Transfer Items */}
        <div className="space-y-6">
          {transfers.map((transfer, index) => (
            <div key={transfer._id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute left-0 top-6 w-[60px] h-[60px] bg-white border-4 border-indigo-100 rounded-full flex items-center justify-center shadow-lg z-10">
                {getStatusIcon(transfer.transferStatus)}
              </div>

              {/* Transfer Card */}
              <div className="ml-[90px]">
                <div className="bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 transition-all overflow-hidden">
                  {/* Main Content */}
                  <div className="p-6">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getTransferStatusColor(transfer.transferStatus)}`}>
                            {transfer.transferStatus}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                          <Clock size={14} />
                          {formatDate(transfer.transferredAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpand(transfer._id)}
                        className="p-2 hover:bg-white rounded-xl transition-colors"
                      >
                        {expandedTransfer === transfer._id ? (
                          <ChevronUp size={20} className="text-slate-600" />
                        ) : (
                          <ChevronDown size={20} className="text-slate-600" />
                        )}
                      </button>
                    </div>

                    {/* Transfer Flow */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 size={14} className="text-slate-400" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            From
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {transfer.fromDepartment?.name || 'N/A'}
                        </p>
                        {transfer.fromSubDepartment && (
                          <p className="text-xs text-slate-600 mt-1">
                            {transfer.fromSubDepartment.name}
                          </p>
                        )}
                      </div>
                      
                      <ArrowRightLeft className="text-indigo-400 flex-shrink-0" size={20} />
                      
                      <div className="flex-1 bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 size={14} className="text-slate-400" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            To
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {transfer.toDepartment?.name || 'N/A'}
                        </p>
                        {transfer.toSubDepartment && (
                          <p className="text-xs text-slate-600 mt-1">
                            {transfer.toSubDepartment.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reason Badge */}
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-indigo-600" />
                      <span className="text-xs font-bold text-slate-700">
                        Reason:
                      </span>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                        {getTransferReasonText(transfer.transferReason)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTransfer === transfer._id && (
                    <div className="border-t-2 border-slate-200 bg-white p-6 space-y-4">
                      {/* Transfer Type */}
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Transfer Type
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {transfer.transferType?.replace(/_/g, ' ')}
                        </p>
                      </div>

                      {/* Transferred By */}
                      {transfer.transferredBy && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Transferred By
                          </p>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-600" />
                            <p className="text-sm font-bold text-slate-900">
                              {transfer.transferredBy.name || 'N/A'}
                            </p>
                            {transfer.transferredByRole && (
                              <span className="text-xs text-slate-500 font-bold">
                                ({transfer.transferredByRole})
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Transfer Notes */}
                      {transfer.transferNotes && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Transfer Notes
                          </p>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">
                              {transfer.transferNotes}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Acceptance/Rejection Details */}
                      {transfer.transferStatus === 'ACCEPTED' && transfer.acceptedBy && (
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                          <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">
                            Accepted By
                          </p>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-green-600" />
                            <p className="text-sm font-bold text-green-900">
                              {transfer.acceptedBy.name || 'N/A'}
                            </p>
                          </div>
                          {transfer.acceptedAt && (
                            <p className="text-xs text-green-700 mt-2">
                              {formatDate(transfer.acceptedAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {transfer.transferStatus === 'REJECTED' && transfer.rejectionReason && (
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                          <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-2">
                            Rejection Reason
                          </p>
                          <p className="text-sm text-red-900 font-medium leading-relaxed">
                            {transfer.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransferHistory;
