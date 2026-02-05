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
    // Navigate to detailed view instead of showing modal
    navigate(`/officer/complaint/${complaint._id}`);
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
                        View Details
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
    </div>
  );
};

export default OfficerDashboard;