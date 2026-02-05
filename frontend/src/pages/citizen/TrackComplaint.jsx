import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getComplaintById, getComplaints, downloadReceipt } from '../../services/complaintService';
import { ROUTES, COMPLAINT_STATUS } from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { 
  Search, 
  ArrowLeft, 
  FileText, 
  MapPin, 
  Calendar, 
  Download, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Building2,
  ExternalLink,
  Loader2
} from 'lucide-react';

const TrackComplaint = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const complaintId = searchParams.get('id');
    if (complaintId) {
      fetchComplaint(complaintId);
      setSearchMode(false);
    } else {
      setSearchMode(true);
      setLoading(false);
    }
  }, [searchParams]);

  const fetchComplaint = async (id) => {
    try {
      setLoading(true);
      setError('');
      const response = await getComplaintById(id);
      setComplaint(response.complaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a complaint number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getComplaints({ 
        search: searchQuery.trim(),
        page: 1,
        limit: 10 
      });
      
      if (response.complaints && response.complaints.length > 0) {
        setSearchResults(response.complaints);
        if (response.complaints.length === 1) {
          handleSelectComplaint(response.complaints[0]);
        }
      } else {
        setError('No complaints found with that number');
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to search complaints');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectComplaint = (selected) => {
    setComplaint(selected);
    setSearchMode(false);
    setSearchResults([]);
    setSearchParams({ id: selected._id });
  };

  const handleBackToSearch = () => {
    setSearchMode(true);
    setComplaint(null);
    setSearchParams({});
    setSearchQuery('');
    setError('');
  };

  const handleDownloadReceipt = async () => {
    try {
      await downloadReceipt(complaint._id);
      alert('Receipt downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download receipt. Please try again.');
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

  if (loading && !searchMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Records...</p>
      </div>
    );
  }

  // SEARCH MODE UI
  if (searchMode) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">{t('citizen.trackComplaint')}</h1>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Public Grievance Search</p>
            </div>
            <button onClick={() => navigate(ROUTES.CITIZEN_DASHBOARD)} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <ArrowLeft size={16} /> {t('common.back')}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-slate-100 p-10 md:p-12">
                <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl w-fit mb-8">
                  <Search size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-none">Find your<br/>application.</h2>
                <p className="text-slate-500 font-medium mb-10">Enter your unique reference number to see real-time updates and official remarks.</p>
                
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Complaint ID</label>
                    <input 
                      type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                      placeholder="SUV2026..." 
                      className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-3xl outline-none transition-all font-mono font-bold text-xl shadow-inner uppercase"
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-6 bg-primary-600 text-white rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-primary-700 active:scale-[0.98] transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" /> : <>Start Tracking <ChevronRight size={20}/></>}
                  </button>
                </form>

                {error && <div className="mt-8 p-5 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl text-rose-700 font-bold text-sm animate-in slide-in-from-top-2">{error}</div>}
              </div>
            </div>

            <div className="lg:col-span-7">
              {searchResults.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Potential Matches</h3>
                  {searchResults.map((result) => (
                    <button key={result._id} onClick={() => handleSelectComplaint(result)} className="w-full text-left bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:border-primary-600 hover:shadow-xl transition-all group flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="font-mono font-black text-primary-600 px-3 py-1 bg-primary-50 rounded-lg text-sm tracking-tight border border-primary-100">#{result.complaintNumber}</span>
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(result.status)}`}>{result.status}</span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">{result.title}</h4>
                        <p className="text-slate-400 font-medium text-sm line-clamp-1">{result.description}</p>
                      </div>
                      <div className="p-4 bg-slate-50 text-slate-300 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all ml-4">
                        <ChevronRight size={24} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DETAILED VIEW UI
  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <div className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
               <span className="font-mono font-black text-primary-400 text-lg tracking-tight bg-white/5 px-4 py-1.5 rounded-xl border border-white/10">{complaint.complaintNumber}</span>
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getStatusStyle(complaint.status)}`}>
                 {t(`status.${complaint.status.toLowerCase()}`)}
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none max-w-2xl">{complaint.title}</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={handleBackToSearch} className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 font-bold text-xs uppercase tracking-widest transition-all">New Search</button>
            <button onClick={() => navigate(ROUTES.CITIZEN_DASHBOARD)} className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all shadow-xl"><ArrowLeft size={24}/></button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 -mt-12 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Core Data */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-900/5 border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><FileText size={14}/> Incident Description</h3>
            <p className="text-slate-700 text-lg font-medium leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-10 border-t border-slate-50">
               {[
                 { icon: Building2, label: 'Department', val: complaint.department?.name },
                 { icon: Clock, label: 'Submitted On', val: new Date(complaint.createdAt).toLocaleString() },
                 { icon: MapPin, label: 'Location', val: complaint.location?.address || 'Not Provided' },
                 { icon: AlertCircle, label: 'Current Priority', val: complaint.priority },
               ].map((item, i) => (
                 <div key={i} className="flex gap-4">
                    <div className="p-3 bg-slate-50 text-slate-400 rounded-xl h-fit"><item.icon size={20}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-slate-900">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Evidence Section */}
          {complaint.documents?.length > 0 && (
            <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-900/5 border border-slate-100">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Attachments & Evidence</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                 {complaint.documents.map((doc, i) => (
                    <a key={i} href={doc.secure_url} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-[2rem] border-2 border-slate-50 shadow-sm aspect-video">
                       {doc.secure_url.match(/\.(jpg|jpeg|png)$/i) ? (
                         <img src={doc.secure_url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400"><FileText size={32}/></div>
                       )}
                       <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest">View File <ExternalLink size={14} className="ml-2"/></div>
                    </a>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* Right Column: Timeline & Remarks */}
        <div className="space-y-8">
          <button onClick={handleDownloadReceipt} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 active:scale-95">
            <Download size={20}/> Download Receipt
          </button>

          {/* official Resolution/Rejection Logic */}
          {(complaint.status === COMPLAINT_STATUS.RESOLVED || complaint.status === COMPLAINT_STATUS.REJECTED) && (
            <div className={`p-8 rounded-[2.5rem] border-2 shadow-lg animate-in zoom-in-95 ${complaint.status === COMPLAINT_STATUS.RESOLVED ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
               <div className="flex items-center gap-3 mb-4">
                  {complaint.status === COMPLAINT_STATUS.RESOLVED ? <CheckCircle2 className="text-emerald-600"/> : <AlertCircle className="text-rose-600"/>}
                  <h4 className={`font-black uppercase tracking-widest text-xs ${complaint.status === COMPLAINT_STATUS.RESOLVED ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {complaint.status === COMPLAINT_STATUS.RESOLVED ? 'Resolution Protocol' : 'Rejection Notice'}
                  </h4>
               </div>
               <p className="text-slate-700 font-bold mb-4 leading-relaxed italic">
                 "{complaint.status === COMPLAINT_STATUS.RESOLVED ? complaint.resolutionDetails?.resolutionNotes : complaint.rejectionDetails?.rejectionReason}"
               </p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Closed on: {new Date(complaint.status === COMPLAINT_STATUS.RESOLVED ? complaint.resolutionDetails?.resolvedAt : complaint.rejectionDetails?.rejectedAt).toLocaleDateString()}</p>
            </div>
          )}

          {/* Narrative Log */}
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-900/5 border border-slate-100">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><MessageSquare size={14}/> Activity Stream</h3>
             {complaint.remarks?.length > 0 ? (
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                   {complaint.remarks.map((remark, i) => (
                      <div key={i} className="relative pl-10">
                         <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 border-primary-600 z-10" />
                         <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{remark.text}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{remark.role} • {new Date(remark.addedAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="text-center py-6">
                   <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">No official remarks yet</p>
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackComplaint;