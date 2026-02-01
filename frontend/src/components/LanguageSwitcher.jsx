import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../utils/constants';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center p-1 bg-slate-200/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-inner relative overflow-hidden">
      {/* Icon Indicator */}
      <div className="pl-3 pr-1 text-slate-500 z-10">
        <Globe size={18} strokeWidth={2.5} />
      </div>

      <div className="flex relative items-center">
        {/* Animated Sliding Background */}
        <div 
          className={`absolute h-full w-1/2 bg-white rounded-xl shadow-md transition-all duration-300 ease-out border border-black/5 ${
            language === LANGUAGES.HI ? 'translate-x-full' : 'translate-x-0'
          }`}
        />

        {/* English Button */}
        <button
          onClick={() => changeLanguage(LANGUAGES.EN)}
          className={`relative z-10 px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition-colors duration-300 w-32 ${
            language === LANGUAGES.EN ? 'text-primary-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          English
        </button>

        {/* Hindi Button */}
        <button
          onClick={() => changeLanguage(LANGUAGES.HI)}
          className={`relative z-10 px-6 py-2 rounded-xl font-bold text-lg transition-colors duration-300 w-32 ${
            language === LANGUAGES.HI ? 'text-primary-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          हिंदी
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;