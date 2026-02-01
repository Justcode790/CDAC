import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, updateComplaint } from '../../services/complaintService';
import { ROUTES, COMPLAINT_STATUS } from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Filter, 
  Calendar, 
  User, 
  ArrowUpRight,
  X,
  MessageSquare,
  Loader2,
  ChevronRight
} from 'lucide-react';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    remarks: '',
    resolutionNotes: '',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await getComplaints({ 
        page: 1, 
        limit: 50,
        status: '' 
      });
      setComplaints(response.complaints || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      remarks: '',
      resolutionNotes: '',
      rejectionReason: ''
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await updateComplaint(selectedComplaint._id, updateData);
      setShowUpdateModal(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LANDING);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case COMPLAINT_STATUS.PENDING:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case COMPLAINT_STATUS.IN_PROGRESS:
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case COMPLAINT_STATUS.RESOLVED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case COMPLAINT_STATUS.REJECTED:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.status === COMPLAINT_STATUS.PENDING || 
    c.status === COMPLAINT_STATUS.IN_PROGRESS
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Premium Header */}
      <header className="bg-indigo-900 text-white sticky top-0 z-30 shadow-xl border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <ClipboardCheck size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none uppercase italic">Officer Terminal</h1>
              <p className="text-[10px] text-indigo-300 font-bold mt-1.5 uppercase tracking-[0.2em]">
                {user?.assignedSubDepartment?.name || "Governance Unit"} • {user?.officerId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:block text-right pr-6 border-r border-white/10">
              <p className="text-sm font-black">{user?.officerName}</p>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Active Session</p>
            </div>
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="p-3 bg-white/5 hover:bg-rose-500 rounded-xl transition-all active:scale-90 border border-white/10"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-10">
        {/* Statistics Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Active Queue', val: filteredComplaints.length, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Pending Approval', val: complaints.filter(c => c.status === COMPLAINT_STATUS.PENDING).length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Field Execution', val: complaints.filter(c => c.status === COMPLAINT_STATUS.IN_PROGRESS).length, icon: ArrowUpRight, color: 'text-sky-600', bg: 'bg-sky-50' },
            { label: 'Total Resolved', val: complaints.filter(c => c.status === COMPLAINT_STATUS.RESOLVED).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-400 transition-all cursor-default">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className={`text-4xl font-black ${stat.color}`}>{loading ? '...' : stat.val}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon size={26} />
              </div>
            </div>
          ))}
        </div>

        {/* Complaints Work Queue */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
              <Filter className="text-indigo-600" size={24} />
              {t('officer.assignedComplaints')}
            </h2>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="py-24 text-center flex flex-col items-center">
                <Loader2 className="animate-spin mb-4 text-indigo-600" size={48} />
                <p className="font-bold text-slate-400 tracking-[0.2em] uppercase text-xs">{t('common.loading')}...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center bg-rose-50 rounded-[2rem] border border-rose-100">
                <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
                <p className="text-rose-700 font-bold text-lg">{error}</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="py-24 text-center">
                <div className="inline-flex p-8 bg-slate-50 rounded-full text-slate-200 mb-6">
                  <CheckCircle2 size={64} />
                </div>
                <h4 className="text-2xl font-black text-slate-900">Task List Clear</h4>
                <p className="text-slate-500 mt-2 font-medium">There are currently no active grievances assigned to your unit.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredComplaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="group bg-white border border-slate-100 rounded-[2rem] p-8 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col lg:flex-row justify-between gap-8 relative overflow-hidden"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className="font-mono font-black text-sm text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100 shadow-inner">
                          {complaint.complaintNumber}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusStyle(complaint.status)}`}>
                          {t(`status.${complaint.status.toLowerCase()}`)}
                        </span>
                        <div className="ml-auto flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                          <Calendar size={14} />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                        {complaint.title}
                      </h3>
                      <p className="text-slate-500 font-medium text-base leading-relaxed mb-8 max-w-4xl">
                        {complaint.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Citizen</p>
                            <p className="text-sm font-bold text-slate-700">{complaint.citizen?.name || complaint.citizen?.mobileNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                            <AlertCircle size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Priority</p>
                            <p className={`text-sm font-black uppercase ${complaint.priority === 'High' ? 'text-rose-600' : 'text-sky-600'}`}>
                              {complaint.priority}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center lg:pl-10 lg:border-l border-slate-100">
                      <button
                        onClick={() => handleUpdateClick(complaint)}
                        className="w-full lg:w-auto flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                      >
                        {t('officer.updateStatus')}
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Advanced Status Update Modal */}
      {showUpdateModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowUpdateModal(false)} />
          <div className="bg-white rounded-[3rem] shadow-2xl relative z-10 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-900 text-white rounded-[1.25rem] shadow-xl shadow-slate-900/20">
                  <MessageSquare size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Update Case</h3>
                  <p className="text-indigo-600 font-mono font-bold mt-2 text-sm">RE: {selectedComplaint.complaintNumber}</p>
                </div>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={32} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lifecycle State *</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-black text-lg shadow-inner appearance-none cursor-pointer"
                  required
                >
                  <option value={COMPLAINT_STATUS.PENDING}>Pending Allocation</option>
                  <option value={COMPLAINT_STATUS.IN_PROGRESS}>In-Field Execution</option>
                  <option value={COMPLAINT_STATUS.RESOLVED}>Officially Resolved</option>
                  <option value={COMPLAINT_STATUS.REJECTED}>Reject / Dismiss</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Remarks</label>
                <textarea
                  value={updateData.remarks}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[1.5rem] outline-none transition-all min-h-[120px] font-bold text-slate-700 shadow-inner resize-none"
                  placeholder="Summarize the action taken..."
                />
              </div>

              {updateData.status === COMPLAINT_STATUS.RESOLVED && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Resolution Protocol Notes</label>
                  <textarea
                    onChange={(e) => setUpdateData(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                    className="w-full px-6 py-5 bg-emerald-50 border-2 border-emerald-100 focus:border-emerald-500 focus:bg-white rounded-[1.5rem] outline-none transition-all min-h-[100px] font-bold text-slate-700"
                    placeholder="Enter final resolution details for the citizen..."
                    required
                  />
                </div>
              )}

              {updateData.status === COMPLAINT_STATUS.REJECTED && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Dismissal Reason *</label>
                  <textarea
                    onChange={(e) => setUpdateData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                    className="w-full px-6 py-5 bg-rose-50 border-2 border-rose-100 focus:border-rose-500 focus:bg-white rounded-[1.5rem] outline-none transition-all min-h-[100px] font-bold text-slate-700"
                    placeholder="Explain why this complaint was dismissed..."
                    required
                  />
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 py-5 bg-indigo-700 text-white rounded-2xl font-black text-lg hover:bg-indigo-800 transition-all active:scale-95 shadow-xl shadow-indigo-900/20">
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedComplaint(null);
                  }}
                  className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;