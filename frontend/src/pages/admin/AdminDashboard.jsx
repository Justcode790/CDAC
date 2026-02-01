import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getSystemStatus } from '../../services/systemService';
import { ROUTES } from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardList, 
  Users, 
  BarChart3, 
  LogOut, 
  ChevronRight,
  Activity,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    totalDepartments: 0,
    totalOfficers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const systemData = await getSystemStatus();
      if (systemData.success) {
        const stats = systemData.system.statistics;
        setStats({
          totalComplaints: stats.complaints.total || 0,
          pendingComplaints: stats.complaints.pending || 0,
          totalDepartments: stats.departments || 0,
          totalOfficers: stats.officers.total || 0
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LANDING);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-500 rounded-lg">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">SUVIDHA 2026</h1>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Admin Control Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right border-r border-slate-700 pr-6">
              <p className="text-sm font-bold text-white">{user?.adminName || 'Super Admin'}</p>
              <p className="text-xs text-slate-400">{user?.adminEmail}</p>
            </div>
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="p-2.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all duration-300 group"
              title="Logout"
            >
              <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-6 py-10">
        
        {/* Welcome Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('admin.dashboard')}
          </h2>
          <p className="text-slate-500 font-medium mt-1">Real-time system health and administration overview.</p>
        </div>

        {/* Stats Grid - High Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Complaints', val: stats.totalComplaints, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: ClipboardList },
            { label: 'Pending Action', val: stats.pendingComplaints, color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
            { label: 'Total Departments', val: stats.totalDepartments, color: 'text-sky-600', bg: 'bg-sky-50', icon: Building2 },
            { label: 'Active Officers', val: stats.totalOfficers, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Users },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 flex items-start justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">{item.label}</p>
                <h3 className={`text-4xl font-black ${item.color}`}>
                  {loading ? <span className="animate-pulse">...</span> : item.val}
                </h3>
              </div>
              <div className={`p-4 ${item.bg} ${item.color} rounded-2xl`}>
                <item.icon size={28} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions - Sidebar Style */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Quick Management</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { to: ROUTES.ADMIN_DEPARTMENTS, label: t('admin.departments'), icon: Building2, desc: 'Manage core units' },
                { to: ROUTES.ADMIN_SUBDEPARTMENTS, label: t('admin.subDepartments'), icon: ClipboardList, desc: 'Service categorization' },
                { to: ROUTES.ADMIN_OFFICERS, label: t('admin.officers'), icon: Users, desc: 'Access control' },
                { to: null, label: t('admin.allComplaints'), icon: BarChart3, desc: 'View global logs' },
              ].map((link, i) => (
                link.to ? (
                  <Link
                    key={i}
                    to={link.to}
                    className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-200/60 hover:border-slate-900 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <link.icon size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{link.label}</p>
                        <p className="text-xs text-slate-500 font-medium">{link.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-slate-900 transition-colors" size={20} />
                  </Link>
                ) : (
                  <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-200/60 opacity-80 cursor-not-allowed">
                     <div className="flex items-center gap-5">
                      <div className="p-3 bg-slate-100 text-slate-400 rounded-xl">
                        <link.icon size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-400">{link.label}</p>
                        <p className="text-xs text-slate-400 font-medium">{link.desc}</p>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Activity Log - Large Content Area */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 mb-6">Recent Activity</h3>
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 text-slate-300 rounded-full mb-6">
                  <Activity size={40} />
                </div>
                <h4 className="text-xl font-bold text-slate-900">No recent logs found</h4>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                  When system actions occur, they will appear here as a real-time activity stream.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;