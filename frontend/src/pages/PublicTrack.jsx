/**
 * SUVIDHA 2026 - Public Complaint Tracking
 * 
 * Public page for tracking complaints via QR code
 * No authentication required
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getComplaintByIdPublic, downloadReceiptPublic } from '../services/complaintService';
import { COMPLAINT_STATUS } from '../utils/constants';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Loader2,
  Home,
  QrCode
} from 'lucide-react';

const PublicTrack = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const complaintId = searchParams.get('id');
    if (complaintId) {
      fetchComplaint(complaintId);
    } else {
      setError('No complaint ID provided');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchComplaint = async (id) => {
    try {
      setLoading(true);
      setError('');
      const response = await getComplaintByIdPublic(id);
      setComplaint(response.complaint);
    } catch (err) {
      setError('Complaint not found or invalid ID');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      setDownloading(true);
      await downloadReceiptPublic(complaint._id);
    } catch (err) {
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case COMPLAINT_STATUS.PENDING: return 'bg-amber-50 text-amber-700 border-amber-200';
      case COMPLAINT_STATUS.IN_PROGRESS: return 'bg-sky-50 text-sky-700 border-sky-200';
      case COMPLAINT_STATUS.RESOLVED: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case COMPLAINT_STATUS.REJECTED: return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Complaint...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
          <div className="p-4 bg-rose-100 rounded-full w-fit mx-auto mb-6">
            <AlertCircle className="text-rose-600" size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Complaint Not Found</h2>
          <p className="text-slate-600 mb-8">{error || 'The complaint you are looking for does not exist or the link is invalid.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Home size={20} />
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="text-primary-400" size={32} />
            <span className="text-primary-400 font-black uppercase text-xs tracking-widest">Public Tracking</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono font-black text-primary-400 text-lg tracking-tight bg-white/5 px-4 py-1.5 rounded-xl border border-white/10">
                  {complaint.complaintNumber}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getStatusStyle(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none max-w-2xl">
                {complaint.title}
              </h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all shadow-xl flex items-center gap-2 font-bold"
            >
              <Home size={24} />
              Home
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 -mt-12 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Core Data */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-900/5 border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <FileText size={14}/> Complaint Description
            </h3>
            <p className="text-slate-700 text-lg font-medium leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-10 border-t border-slate-50">
              {[
                { icon: Building2, label: 'Department', val: complaint.department?.name },
                { icon: Clock, label: 'Submitted On', val: new Date(complaint.createdAt).toLocaleString() },
                { icon: MapPin, label: 'Location', val: complaint.location?.address || 'Not Provided' },
                { icon: AlertCircle, label: 'Priority', val: complaint.priority },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-xl h-fit">
                    <item.icon size={20}/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-slate-900">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Status */}
        <div className="space-y-8">
          {/* Download Receipt Button */}
          <button
            onClick={handleDownloadReceipt}
            disabled={downloading}
            className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Downloading...
              </>
            ) : (
              <>
                <Download size={20}/> Download Receipt
              </>
            )}
          </button>

          {/* Resolution/Rejection Notice */}
          {(complaint.status === COMPLAINT_STATUS.RESOLVED || complaint.status === COMPLAINT_STATUS.REJECTED) && (
            <div className={`p-8 rounded-[2.5rem] border-2 shadow-lg ${complaint.status === COMPLAINT_STATUS.RESOLVED ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                {complaint.status === COMPLAINT_STATUS.RESOLVED ? 
                  <CheckCircle2 className="text-emerald-600"/> : 
                  <AlertCircle className="text-rose-600"/>
                }
                <h4 className={`font-black uppercase tracking-widest text-xs ${complaint.status === COMPLAINT_STATUS.RESOLVED ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {complaint.status === COMPLAINT_STATUS.RESOLVED ? 'Resolution' : 'Rejection Notice'}
                </h4>
              </div>
              <p className="text-slate-700 font-bold mb-4 leading-relaxed italic">
                "{complaint.status === COMPLAINT_STATUS.RESOLVED ? 
                  complaint.resolutionDetails?.resolutionNotes : 
                  complaint.rejectionDetails?.rejectionReason}"
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Closed on: {new Date(complaint.status === COMPLAINT_STATUS.RESOLVED ? 
                  complaint.resolutionDetails?.resolvedAt : 
                  complaint.rejectionDetails?.rejectedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-[2.5rem] p-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-black text-blue-900 mb-2 text-sm">Public Tracking</h4>
                <p className="text-blue-800 text-xs leading-relaxed">
                  This is a public tracking page. For full complaint details and to add documents, please log in to your citizen account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicTrack;
