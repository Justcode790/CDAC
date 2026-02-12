import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, downloadReceipt } from '../../services/complaintService';
import { ROUTES, COMPLAINT_STATUS } from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { 
  PlusCircle, 
  Search, 
  LogOut, 
  Building, 
  Calendar, 
  ChevronRight, 
  Inbox, 
  LayoutGrid,
  Loader2,
  FileText,
  Download
} from 'lucide-react';

const CitizenDashboard = () => {
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
      const response = await getComplaints({ page: 1, limit: 10 });
      setComplaints(response.complaints || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (e, complaintId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await downloadReceipt(complaintId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download receipt');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case COMPLAINT_STATUS.PENDING:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case COMPLAINT_STATUS.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case COMPLAINT_STATUS.RESOLVED:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case COMPLAINT_STATUS.REJECTED:
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LANDING);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Dynamic Background Accents */}
      <div className="fixed top-0 left-0 w-full h-64 bg-primary-600 -z-10 rounded-b-[4rem] shadow-lg" />

      {/* Header Section */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex justify-between items-end ">
        <div>
          <h1 className="text-4xl font-black tracking-tight leading-none uppercase italic">
            {t('citizen.dashboard')}
          </h1>
          <p className="mt-3 text-danger-100 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Namaste, {user?.name || user?.mobileNumber}
          </p>
        </div>
        <div className="flex items-center gap-4 pb-1">
          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <LanguageSwitcher />
          </div>
          <button
            onClick={handleLogout}
            className="p-3 bg-white/10 hover:bg-rose-500 rounded-2xl backdrop-blur-md border border-white/20 transition-all active:scale-90"
          >
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Quick Action Tiles - Heavy Touch Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link
            to={ROUTES.CITIZEN_NEW_COMPLAINT}
            className="group relative bg-white p-10 rounded-[3rem] shadow-2xl shadow-primary-900/10 border-b-8 border-primary-600 hover:-translate-y-2 transition-all flex items-center gap-8"
          >
            <div className="p-6 bg-primary-50 text-primary-600 rounded-[2rem] group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
              <PlusCircle size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                {t('citizen.newComplaint')}
              </h2>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Start New Request</p>
            </div>
          </Link>

          <Link
            to={ROUTES.CITIZEN_TRACK_COMPLAINT}
            className="group relative bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-900/5 border-b-8 border-slate-200 hover:-translate-y-2 transition-all flex items-center gap-8"
          >
            <div className="p-6 bg-slate-50 text-slate-400 rounded-[2rem] group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
              <Search size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                {t('citizen.trackComplaint')}
              </h2>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Check Status</p>
            </div>
          </Link>
        </div>

        {/* Complaints Tracking Section */}
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-900/5 border border-slate-100 overflow-hidden mb-12">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <Inbox className="text-primary-600" size={28} />
              {t('citizen.myComplaints')}
            </h2>
            <div className="bg-primary-50 text-primary-700 px-5 py-2 rounded-2xl font-black text-sm uppercase tracking-widest border border-primary-100">
              {complaints.length} Total
            </div>
          </div>

          <div className="p-10">
            {loading ? (
              <div className="py-24 text-center flex flex-col items-center">
                <Loader2 className="animate-spin mb-4 text-primary-600" size={48} />
                <p className="font-black text-slate-400 tracking-[0.2em] uppercase text-xs">Accessing Records...</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center text-rose-600 bg-rose-50 rounded-[2.5rem] border border-rose-100">
                <p className="font-bold text-lg">{error}</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-24 text-center">
                <div className="inline-flex p-8 bg-slate-50 rounded-full text-slate-200 mb-6">
                  <FileText size={64} />
                </div>
                <h4 className="text-2xl font-black text-slate-900">{t('complaint.noComplaints')}</h4>
                <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto leading-relaxed">
                  You haven't filed any grievances yet. Use the "New Complaint" button above to start.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {complaints.map((complaint) => (
                  <Link
                    key={complaint._id}
                    to={`${ROUTES.CITIZEN_TRACK_COMPLAINT}?id=${complaint._id}`}
                    className="group bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 hover:bg-white hover:border-primary-600 hover:shadow-xl hover:shadow-primary-900/5 transition-all flex flex-col lg:flex-row justify-between items-center gap-6"
                  >
                    <div className="flex-1 w-full lg:w-auto">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className="font-mono font-black text-sm text-primary-700 bg-primary-50 px-4 py-1.5 rounded-xl border border-primary-100">
                          #{complaint.complaintNumber}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(complaint.status)}`}>
                          {t(`status.${complaint.status.toLowerCase()}`)}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-primary-700 transition-colors tracking-tight">
                        {complaint.title}
                      </h3>
                      <p className="text-slate-500 font-medium text-base mb-6 line-clamp-2 leading-relaxed">
                        {complaint.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <Building size={16} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">{complaint.department?.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDownloadReceipt(e, complaint._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors text-sm"
                        >
                          <Download size={16} />
                          Receipt
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm border border-slate-100">
                      <ChevronRight size={24} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenDashboard;