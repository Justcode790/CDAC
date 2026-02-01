// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useLanguage } from '../../context/LanguageContext';
// import { useAuth } from '../../context/AuthContext';
// import { registerCitizen, loginCitizen, verifyCitizenOTP, resendCitizenOTP } from '../../services/authService';
// import { ROUTES } from '../../utils/constants';
// import LanguageSwitcher from '../../components/LanguageSwitcher';
// import { 
//   UserPlus, 
//   LogIn, 
//   Smartphone, 
//   ArrowLeft, 
//   ShieldCheck, 
//   RefreshCw, 
//   Loader2,
//   Mail,
//   User,
//   MapPin
// } from 'lucide-react';

// const CitizenLogin = () => {
//   const navigate = useNavigate();
//   const { t } = useLanguage();
//   const { login } = useAuth();

//   const [mode, setMode] = useState('choice'); // 'choice', 'login', 'register'
//   const [step, setStep] = useState('mobile'); // 'mobile' or 'verify'
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [otp, setOtp] = useState('');
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [address, setAddress] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError(''); setSuccess(''); setLoading(true);
//     try {
//       const response = await loginCitizen(mobileNumber);
//       setSuccess(response.message || 'OTP sent successfully');
//       setStep('verify');
//       if (response.otp) setSuccess(`OTP: ${response.otp} (Dev Mode)`);
//     } catch (err) {
//       setError(err.response?.status === 404 ? 'Number not registered. Please register.' : 'Login failed.');
//     } finally { setLoading(false); }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError(''); setSuccess(''); setLoading(true);
//     try {
//       const response = await registerCitizen({ mobileNumber, name, email, address });
//       setSuccess(response.message || 'OTP sent successfully');
//       setStep('verify');
//       if (response.otp) setSuccess(`OTP: ${response.otp} (Dev Mode)`);
//     } catch (err) {
//       setError('Registration failed. Number might already be registered.');
//     } finally { setLoading(false); }
//   };

//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();
//     setError(''); setLoading(true);
//     try {
//       const response = await verifyCitizenOTP(mobileNumber, otp);
//       login(response.user, response.token);
//       navigate(ROUTES.CITIZEN_DASHBOARD);
//     } catch (err) {
//       setError('Invalid OTP. Please try again.');
//     } finally { setLoading(false); }
//   };

//   const handleResendOTP = async () => {
//     setLoading(true);
//     try {
//       const response = await resendCitizenOTP(mobileNumber);
//       setSuccess('OTP resent successfully');
//     } catch (err) { setError('Failed to resend OTP.'); }
//     finally { setLoading(false); }
//   };

//   const resetForm = () => {
//     setMode('choice'); setStep('mobile'); setMobileNumber('');
//     setOtp(''); setName(''); setEmail(''); setAddress('');
//     setError(''); setSuccess('');
//   };

//   return (
//     <div className="min-h-screen bg-primary-600 flex items-center justify-center p-6 relative overflow-hidden font-sans">
//       {/* Background Graphic elements */}
//       <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[120px]" />
//       <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px]" />

//       <div className="absolute top-8 right-8 z-20">
//         <LanguageSwitcher />
//       </div>

//       <div className="w-full max-w-xl relative z-10">
//         <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
          
//           {/* Progress / Status Header */}
//           <div className="bg-slate-50 border-b border-slate-100 p-12 text-center">
//             <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3 uppercase">
//               {step === 'verify' ? 'Identity Verification' : mode === 'choice' ? 'Citizen Portal' : mode}
//             </h1>
//             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
//               {step === 'verify' ? 'Secure OTP Verification' : 'Official Smart City Initiative'}
//             </p>
//           </div>

//           <div className="p-12">
//             {/* Feedback Messages */}
//             {error && <div className="mb-8 p-5 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl text-rose-700 font-bold text-sm animate-shake">{error}</div>}
//             {success && <div className="mb-8 p-5 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl text-emerald-700 font-bold text-sm">{success}</div>}

//             {/* CHOICE MODE */}
//             {mode === 'choice' && (
//               <div className="grid grid-cols-1 gap-6">
//                 <button
//                   onClick={() => setMode('login')}
//                   className="group flex flex-col items-center justify-center p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-600/10 transition-all active:scale-95"
//                 >
//                   <div className="p-5 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors mb-4">
//                     <LogIn size={32} />
//                   </div>
//                   <span className="text-2xl font-black text-slate-900">Sign In</span>
//                   <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Existing User</p>
//                 </button>
                
//                 <button
//                   onClick={() => setMode('register')}
//                   className="group flex flex-col items-center justify-center p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-900/10 transition-all active:scale-95"
//                 >
//                   <div className="p-5 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors mb-4">
//                     <UserPlus size={32} />
//                   </div>
//                   <span className="text-2xl font-black text-slate-900">Register</span>
//                   <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Create New Account</p>
//                 </button>
//               </div>
//             )}

//             {/* LOGIN/REGISTER MOBILE STEP */}
//             {mode !== 'choice' && step === 'mobile' && (
//               <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mobile Contact Number</label>
//                   <div className="relative group">
//                     <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
//                     <input
//                       type="tel"
//                       value={mobileNumber}
//                       onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
//                       placeholder="9876543210"
//                       className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all text-xl font-bold shadow-inner"
//                       required
//                       maxLength={10}
//                     />
//                   </div>
//                 </div>

//                 {mode === 'register' && (
//                   <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
//                     <div className="space-y-2">
//                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Legal Full Name</label>
//                       <div className="relative group">
//                         <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
//                         <input
//                           type="text" value={name} onChange={(e) => setName(e.target.value)}
//                           placeholder="E.g. Ankit Sharma"
//                           className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold shadow-inner"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Address / Ward No.</label>
//                       <div className="relative group">
//                         <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
//                         <textarea
//                           value={address} onChange={(e) => setAddress(e.target.value)}
//                           placeholder="Locality, City"
//                           className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold shadow-inner resize-none"
//                           rows={2} required
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   type="submit" disabled={loading}
//                   className="w-full py-6 bg-primary-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-xl shadow-primary-600/20"
//                 >
//                   {loading ? <Loader2 className="animate-spin" /> : 'Request OTP'}
//                 </button>
//               </form>
//             )}

//             {/* VERIFY OTP STEP */}
//             {step === 'verify' && (
//               <form onSubmit={handleVerifyOTP} className="space-y-8">
//                 <div className="space-y-4 text-center">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter 6-Digit Secure OTP</label>
//                   <input
//                     type="text"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                     className="w-full py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[2rem] outline-none transition-all text-5xl font-black text-center tracking-[0.5em] shadow-inner text-primary-700"
//                     required maxLength={6} autoFocus
//                   />
//                   <p className="text-xs text-slate-400 font-bold">OTP sent to: +91 {mobileNumber}</p>
//                 </div>

//                 <div className="space-y-4">
//                   <button
//                     type="submit" disabled={loading || otp.length !== 6}
//                     className="w-full py-6 bg-primary-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-xl shadow-primary-600/20"
//                   >
//                     {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
//                   </button>
//                   <button
//                     type="button" onClick={handleResendOTP}
//                     className="w-full py-4 bg-slate-100 text-slate-600 rounded-[1.25rem] font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
//                   >
//                     <RefreshCw size={16} /> Resend OTP
//                   </button>
//                 </div>
//               </form>
//             )}

//             {/* Back Button for sub-steps */}
//             {mode !== 'choice' && (
//               <button
//                 type="button" onClick={resetForm}
//                 className="mt-8 w-full py-2 text-slate-400 hover:text-primary-600 font-black uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-2"
//               >
//                 <ArrowLeft size={14} /> Change Option
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-12 text-center text-white/60">
//           <Link to={ROUTES.LANDING} className="font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors">
//             ← Cancel and Return Home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CitizenLogin;



import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { registerCitizen, loginCitizen, verifyCitizenOTP, resendCitizenOTP } from '../../services/authService';
import { ROUTES } from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { 
  UserPlus, 
  LogIn, 
  Smartphone, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw, 
  Loader2,
  User,
  MapPin,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const CitizenLogin = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();

  const [mode, setMode] = useState('choice'); // 'choice', 'login', 'register'
  const [step, setStep] = useState('mobile'); // 'mobile', 'verify'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handlers (Simplified for UI display)
  const handleNext = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const response = mode === 'login' ? await loginCitizen(mobileNumber) : await registerCitizen({ mobileNumber, name, address });
      setStep('verify');
      if (response.otp) setSuccess(`Dev OTP: ${response.otp}`);
    } catch (err) { setError('Action failed. Check credentials.'); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await verifyCitizenOTP(mobileNumber, otp);
      login(response.user, response.token);
      navigate(ROUTES.CITIZEN_DASHBOARD);
    } catch (err) { setError('Invalid OTP.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6 md:p-12 font-sans overflow-hidden">
      
      {/* Background Brand Element */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600 shadow-md" />

      <div className="max-w-7xl w-full flex flex-col md:flex-row bg-white rounded-[3.5rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.15)] overflow-hidden border border-white relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* LEFT PANEL: Contextual Identity */}
        <div className="w-full md:w-5/12 bg-primary-700 p-12 md:p-20 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <button onClick={() => mode === 'choice' ? navigate(ROUTES.LANDING) : setMode('choice')} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-all group mb-12">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Portal</span>
            </button>

            <div className="space-y-6">
              <div className="inline-flex p-5 bg-white/10 backdrop-blur-xl rounded-[1.5rem] text-white shadow-inner border border-white/20">
                {mode === 'choice' && <CheckCircle2 size={40} strokeWidth={1.5} />}
                {mode === 'login' && <LogIn size={40} strokeWidth={1.5} />}
                {mode === 'register' && <UserPlus size={40} strokeWidth={1.5} />}
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-[0.9] uppercase italic">
                {step === 'verify' ? 'Verify' : mode === 'choice' ? 'Citizen' : mode}<br />
                <span className="text-primary-300 not-italic">Services</span>
              </h1>
              <p className="text-primary-100 font-medium max-w-xs text-lg leading-relaxed opacity-80">
                {step === 'verify' ? 'Secure OTP sent to your mobile. Enter it to finalize access.' : 'Access smart city grievances, track your applications, and connect with officials.'}
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-center">Identity Verified Node</p>
            <div className="flex justify-center gap-4">
               <div className="h-1 w-12 bg-white/20 rounded-full" />
               <div className={`h-1 w-12 rounded-full transition-all duration-500 ${mode !== 'choice' ? 'bg-white' : 'bg-white/20'}`} />
               <div className={`h-1 w-12 rounded-full transition-all duration-500 ${step === 'verify' ? 'bg-white' : 'bg-white/20'}`} />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Dynamic Forms */}
        <div className="w-full md:w-7/12 p-12 md:p-20 bg-white flex flex-col justify-center relative">
          <div className="absolute top-10 right-10">
            <LanguageSwitcher />
          </div>

          <div className="max-w-md mx-auto w-full">
            {error && <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl text-rose-700 font-bold text-sm">{error}</div>}
            {success && <div className="mb-8 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-emerald-700 font-bold text-sm">{success}</div>}

            {/* MODE SELECTION */}
            {mode === 'choice' && (
              <div className="space-y-6">
                <button onClick={() => setMode('login')} className="w-full group flex items-center justify-between p-8 bg-slate-50 border-2 border-transparent hover:border-primary-600 hover:bg-white rounded-[2rem] transition-all active:scale-95">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-600/20">
                      <LogIn size={28} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-black text-slate-900 leading-none">Login</h3>
                      <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Registered User</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-slate-300 group-hover:text-primary-600" />
                </button>

                <button onClick={() => setMode('register')} className="w-full group flex items-center justify-between p-8 bg-slate-50 border-2 border-transparent hover:border-slate-900 hover:bg-white rounded-[2rem] transition-all active:scale-95">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20">
                      <UserPlus size={28} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-black text-slate-900 leading-none">Register</h3>
                      <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">New Profile</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-slate-300 group-hover:text-slate-900" />
                </button>
              </div>
            )}

            {/* INPUT FLOW */}
            {mode !== 'choice' && (
              <form onSubmit={step === 'mobile' ? handleNext : handleVerify} className="space-y-6">
                {step === 'mobile' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Mobile Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                          type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="9876543210"
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-2xl outline-none transition-all text-xl font-bold shadow-inner"
                          required maxLength={10}
                        />
                      </div>
                    </div>
                    {mode === 'register' && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                         <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-2xl outline-none transition-all font-bold shadow-inner" required />
                         </div>
                         <div className="relative">
                            <MapPin className="absolute left-5 top-5 text-slate-300" size={20} />
                            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-2xl outline-none transition-all font-bold shadow-inner resize-none" rows={2} required />
                         </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-8 py-4">
                    <div className="text-center space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">6-Digit Access Code</label>
                      <input
                        type="text" value={otp} onChange={(e) => setOtp(e.target.value.slice(0,6))}
                        className="w-full py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[2rem] outline-none transition-all text-5xl font-black text-center tracking-[0.4em] shadow-inner text-primary-700"
                        required maxLength={6} autoFocus
                      />
                      <button type="button" onClick={() => setStep('mobile')} className="text-xs font-bold text-primary-600">Change number: {mobileNumber}</button>
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-4">
                  <button type="submit" disabled={loading} className="w-full py-6 bg-primary-600 text-white rounded-2xl font-black text-xl hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-primary-600/20">
                    {loading ? <Loader2 className="animate-spin" /> : step === 'mobile' ? 'Proceed' : 'Verify Identity'}
                    <ChevronRight size={22} />
                  </button>
                  {step === 'verify' && (
                    <button type="button" className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                      <RefreshCw size={16} /> Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;