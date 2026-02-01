
// export default Landing;
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../utils/constants';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden flex flex-col items-center justify-center p-8">
      {/* Dynamic Background Elements for Modern Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />

      {/* Language Switcher - Top Right with Glass Effect */}
      <div className="absolute top-8 right-8 z-20 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-sm">
        <LanguageSwitcher />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-6xl w-full">
        {/* Logo/Title Section */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight mb-6">
            SUVIDHA <span className="text-primary-600">2026</span>
          </h1>
          <div className="h-1.5 w-24 bg-primary-500 mx-auto rounded-full mb-8" />
          <p className="text-2xl md:text-3xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('landing.subtitle')}
          </p>
        </div>

        {/* Role Selection Buttons - Enhanced for Touch/Kiosk */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12 px-4">
          
          {/* Citizen Services Button */}
          <button
            onClick={() => navigate(ROUTES.CITIZEN_LOGIN)}
            className="group relative bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] hover:border-primary-200 transition-all duration-300 flex flex-col items-center justify-center space-y-6 active:scale-95"
          >
            <div className="p-6 bg-primary-50 rounded-3xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-slate-800">
              {t('landing.citizenServices')}
            </span>
            <p className="text-slate-400 font-medium">Access public resources</p>
          </button>

          {/* Department Login Button */}
          <button
            onClick={() => navigate(ROUTES.OFFICER_LOGIN)}
            className="group relative bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:border-slate-300 transition-all duration-300 flex flex-col items-center justify-center space-y-6 active:scale-95"
          >
            <div className="p-6 bg-slate-50 rounded-3xl text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-slate-800">
              {t('landing.departmentLogin')}
            </span>
            <p className="text-slate-400 font-medium">Officer administration</p>
          </button>

          {/* Admin Login Button */}
          <button
            onClick={() => navigate(ROUTES.ADMIN_LOGIN)}
            className="group relative bg-slate-900 p-10 rounded-[2.5rem] shadow-xl hover:bg-slate-800 transition-all duration-300 flex flex-col items-center justify-center space-y-6 active:scale-95"
          >
            <div className="p-6 bg-white/10 rounded-3xl text-white group-hover:bg-white group-hover:text-slate-900 transition-colors duration-300">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">
              {t('landing.adminLogin')}
            </span>
            <p className="text-slate-400 font-medium">System configuration</p>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-20 border-t border-slate-200 pt-8 max-w-md mx-auto">
          <p className="text-lg font-semibold text-slate-400 tracking-widest uppercase">
            Smart City Initiative
          </p>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            C-DAC Hackathon 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;