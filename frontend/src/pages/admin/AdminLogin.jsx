// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useLanguage } from '../../context/LanguageContext';
// import { useAuth } from '../../context/AuthContext';
// import { loginAdmin } from '../../services/authService';
// import { ROUTES } from '../../utils/constants';
// import LanguageSwitcher from '../../components/LanguageSwitcher';
// import { ShieldCheck, Lock, Mail, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

// const AdminLogin = () => {
//   const navigate = useNavigate();
//   const { t } = useLanguage();
//   const { login } = useAuth();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false); // Added for better UX
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await loginAdmin(email, password);
//       login(response.user, response.token);
//       navigate(ROUTES.ADMIN_DASHBOARD);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
//       {/* Dynamic Background Mesh */}
//       <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
//       <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-slate-800/40 rounded-full blur-[100px] pointer-events-none" />

//       {/* Language Switcher Section */}
//       <div className="absolute top-8 right-8 z-30">
//         <LanguageSwitcher />
//       </div>

//       <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-500">
//         {/* Navigation Control */}
//         <Link
//           to={ROUTES.LANDING}
//           className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-all group px-4 py-2 rounded-xl hover:bg-white/5"
//         >
//           <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
//           <span className="font-bold tracking-wide uppercase text-xs">{t('common.back')} to Portal</span>
//         </Link>

//         <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10">
//           {/* Hero Header */}
//           <div className="bg-slate-50/50 border-b border-slate-100 p-12 text-center">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 text-white rounded-3xl mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
//               <ShieldCheck size={40} strokeWidth={1.5} />
//             </div>
//             <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
//               {t('landing.adminLogin')}
//             </h1>
//             <div className="flex items-center justify-center gap-2">
//                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
//                  Secure Node: 04-B
//                </p>
//             </div>
//           </div>

//           <div className="p-12">
//             {/* Contextual Feedback */}
//             {error && (
//               <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-2xl text-red-700 flex items-center gap-4 animate-bounce-short">
//                 <div className="bg-red-500 text-white p-1 rounded-full">
//                    <X size={14} strokeWidth={3} />
//                 </div>
//                 <span className="font-bold text-sm tracking-tight">{error}</span>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-8">
//               {/* Identity Field */}
//               <div className="space-y-3">
//                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
//                   {t('auth.email')}
//                 </label>
//                 <div className="relative group">
//                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value.toLowerCase())}
//                     placeholder={t('auth.enterEmail')}
//                     className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-[1.5rem] outline-none transition-all text-lg font-bold shadow-inner"
//                     required
//                     autoFocus
//                   />
//                 </div>
//               </div>

//               {/* Security Field */}
//               <div className="space-y-3">
//                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
//                   {t('auth.password')}
//                 </label>
//                 <div className="relative group">
//                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder={t('auth.enterPassword')}
//                     className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-[1.5rem] outline-none transition-all text-lg font-bold shadow-inner"
//                     required
//                   />
//                   <button 
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>

//               {/* Action Control */}
//               <button
//                 type="submit"
//                 disabled={loading || !email || !password}
//                 className="w-full mt-6 py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-xl hover:bg-slate-800 active:scale-[0.97] transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl shadow-slate-900/40 group"
//               >
//                 {loading ? (
//                   <Loader2 className="animate-spin" size={24} />
//                 ) : (
//                   <>
//                     <span>{t('auth.login')}</span>
//                     <ShieldCheck size={22} className="opacity-50 group-hover:opacity-100 transition-opacity" />
//                   </>
//                 )}
//               </button>
//             </form>
//           </div>
//         </div>

//         <div className="mt-12 flex flex-col items-center gap-2">
//           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
//             System Integrity Verified
//           </p>
//           <div className="h-px w-12 bg-slate-800" />
//           <p className="text-xs text-slate-600 font-bold tracking-wide">
//             C-DAC Smart Governance Unit • 2026
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLogin;


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { loginAdmin } from '../../services/authService';
import { ROUTES } from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { ShieldCheck, Lock, Mail, ArrowLeft, Loader2, Eye, EyeOff, MonitorSmartphone } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginAdmin(email, password);
      login(response.user, response.token);
      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 md:p-10 font-sans overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden border border-white/10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* LEFT PANEL: Branding & Status (Wide Horizontal Feel) */}
        <div className="w-full md:w-5/12 bg-slate-900 p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="relative z-10">
            <Link to={ROUTES.LANDING} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all group mb-12">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('common.back')}</span>
            </Link>

            <div className="space-y-4">
              <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white mb-2">
                <ShieldCheck size={40} strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                ADMIN<br /><span className="text-blue-500">ACCESS</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xs leading-relaxed">
                Centralized Governance Portal. Verified credentials required for system modification.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-10">
            <div className="flex items-center gap-3 text-emerald-500 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Encrypted</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Node ID: CDAC-GNT-2026</p>
          </div>
        </div>

        {/* RIGHT PANEL: Login Form */}
        <div className="w-full md:w-7/12 p-10 md:p-16 bg-white flex flex-col justify-center relative">
          <div className="absolute top-8 right-8">
            <LanguageSwitcher />
          </div>

          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
              <MonitorSmartphone className="text-blue-600" size={28} />
              Terminal Login
            </h2>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 font-bold text-sm animate-in fade-in slide-in-from-left-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Mail</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder="admin@suvidha2026.gov.in"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security Key</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg shadow-inner"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-900/30"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <span>Enter Terminal</span>
                    <ShieldCheck size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;