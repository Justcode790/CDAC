// /**
//  * SUVIDHA 2026 - Officer Login Page
//  * 
//  * Login via Officer ID + Password
//  */

// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useLanguage } from '../../context/LanguageContext';
// import { useAuth } from '../../context/AuthContext';
// import { loginOfficer } from '../../services/authService';
// import { ROUTES } from '../../utils/constants';
// import LanguageSwitcher from '../../components/LanguageSwitcher';

// const OfficerLogin = () => {
//   const navigate = useNavigate();
//   const { t } = useLanguage();
//   const { login } = useAuth();

//   const [officerId, setOfficerId] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await loginOfficer(officerId, password);
      
//       // Login user
//       login(response.user, response.token);
      
//       // Redirect to dashboard
//       navigate(ROUTES.OFFICER_DASHBOARD);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid Officer ID or password. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 flex items-center justify-center p-4">
//       <div className="absolute top-6 right-6">
//         <LanguageSwitcher />
//       </div>

//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-secondary-800 mb-2">
//             {t('landing.departmentLogin')}
//           </h1>
//           <p className="text-gray-600">
//             Enter your Officer ID and password to continue
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
//             {error}
//           </div>
//         )}

//         {/* Login Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('auth.officerId')} *
//             </label>
//             <input
//               type="text"
//               value={officerId}
//               onChange={(e) => setOfficerId(e.target.value.toUpperCase())}
//               placeholder={t('auth.enterOfficerId')}
//               className="input-kiosk w-full"
//               required
//               autoFocus
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('auth.password')} *
//             </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder={t('auth.enterPassword')}
//               className="input-kiosk w-full"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading || !officerId || !password}
//             className="btn-kiosk btn-kiosk-secondary w-full"
//           >
//             {loading ? t('common.loading') : t('auth.login')}
//           </button>
//         </form>

//         {/* Back to Landing */}
//         <div className="mt-6 text-center">
//           <Link
//             to={ROUTES.LANDING}
//             className="text-secondary-600 hover:text-secondary-700 font-semibold"
//           >
//             ← {t('common.back')} to Home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OfficerLogin;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { loginOfficer } from '../../services/authService';
import { ROUTES } from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { UserCheck, Lock, Fingerprint, ArrowLeft, Loader2, Eye, EyeOff, Briefcase } from 'lucide-react';

const OfficerLogin = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();

  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginOfficer(officerId, password);
      login(response.user, response.token);
      navigate(ROUTES.OFFICER_DASHBOARD);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Officer ID or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 md:p-10 font-sans overflow-hidden">
      {/* Decorative Departmental Background Elements */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />

      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* LEFT PANEL: Professional Branding */}
        <div className="w-full md:w-5/12 bg-indigo-700 p-10 md:p-16 flex flex-col justify-between relative overflow-hidden text-white">
          {/* Subtle Wave Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(60deg, #ffffff 25%, transparent 25.5%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(60deg, #ffffff 25%, transparent 25.5%, transparent 75%, #ffffff 75%, #ffffff)', backgroundSize: '40px 70px' }} />
          
          <div className="relative z-10">
            <Link to={ROUTES.LANDING} className="inline-flex items-center gap-2 text-indigo-100 hover:text-white transition-all group mb-12">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('common.back')}</span>
            </Link>

            <div className="space-y-4">
              <div className="inline-flex p-4 bg-white/20 backdrop-blur-lg rounded-2xl text-white mb-2 shadow-inner">
                <Briefcase size={40} strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                OFFICER<br /><span className="text-indigo-200 uppercase">Login</span>
              </h1>
              <p className="text-indigo-100 font-medium max-w-xs leading-relaxed opacity-80">
                Official Departmental Access. Please use your government-issued credentials to sign in.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-10">
            <div className="flex items-center gap-3 text-indigo-200 mb-2">
              <Fingerprint size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Identity Verified</span>
            </div>
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">CDAC Digital Infrastructure</p>
          </div>
        </div>

        {/* RIGHT PANEL: Login Interface */}
        <div className="w-full md:w-7/12 p-10 md:p-16 bg-white flex flex-col justify-center relative">
          <div className="absolute top-8 right-8">
            <LanguageSwitcher />
          </div>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {t('landing.departmentLogin')}
              </h2>
              <p className="text-slate-400 font-medium mt-1">Authentication Required</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 font-bold text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {t('auth.officerId')}
                </label>
                <div className="relative group">
                  <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="text"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value.toUpperCase())}
                    placeholder="E.G. OFF-2026-X1"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                   {t('auth.password')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg shadow-inner"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-700 text-white rounded-2xl font-black text-xl hover:bg-indigo-800 active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-700/20 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <span>{t('auth.login')}</span>
                    <Fingerprint size={22} className="opacity-50 group-hover:opacity-100 transition-opacity" />
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

export default OfficerLogin;