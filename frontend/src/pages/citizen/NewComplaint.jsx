// /**
//  * SUVIDHA 2026 - New Complaint Page
//  * 
//  * Form to create a new complaint with file upload
//  */

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useLanguage } from '../../context/LanguageContext';
// import { createComplaint } from '../../services/complaintService';
// import { getDepartmentsPublic, getSubDepartmentsPublic } from '../../services/departmentService';
// import { ROUTES, COMPLAINT_CATEGORIES, COMPLAINT_PRIORITY } from '../../utils/constants';

// const NewComplaint = () => {
//   const navigate = useNavigate();
//   const { t } = useLanguage();

//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     category: '',
//     priority: COMPLAINT_PRIORITY.MEDIUM,
//     department: '',
//     subDepartment: '',
//     location: {
//       address: '',
//       latitude: '',
//       longitude: ''
//     }
//   });

//   const [files, setFiles] = useState([]);
//   const [filePreviews, setFilePreviews] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [subDepartments, setSubDepartments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     fetchDepartments();
//   }, []);

//   useEffect(() => {
//     if (formData.department) {
//       fetchSubDepartments(formData.department);
//     } else {
//       setSubDepartments([]);
//       setFormData(prev => ({ ...prev, subDepartment: '' }));
//     }
//   }, [formData.department]);

//   const fetchDepartments = async () => {
//     try {
//       const response = await getDepartmentsPublic({ isActive: true });
//       setDepartments(response.departments || []);
//     } catch (err) {
//       console.error('Failed to load departments:', err);
//     }
//   };

//   const fetchSubDepartments = async (departmentId) => {
//     try {
//       const response = await getSubDepartmentsPublic({ 
//         department: departmentId, 
//         isActive: true 
//       });
//       setSubDepartments(response.subDepartments || []);
//     } catch (err) {
//       console.error('Failed to load sub-departments:', err);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name.startsWith('location.')) {
//       const locationField = name.split('.')[1];
//       setFormData(prev => ({
//         ...prev,
//         location: {
//           ...prev.location,
//           [locationField]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   const handleFileChange = (e) => {
//     const selectedFiles = Array.from(e.target.files);
    
//     // Limit to 5 files
//     if (files.length + selectedFiles.length > 5) {
//       setError('Maximum 5 files allowed');
//       return;
//     }

//     // Validate file types and size
//     const validFiles = selectedFiles.filter(file => {
//       const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 
//                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//       const maxSize = 10 * 1024 * 1024; // 10MB

//       if (!validTypes.includes(file.type)) {
//         setError(`${file.name}: Invalid file type. Only images and documents are allowed.`);
//         return false;
//       }
//       if (file.size > maxSize) {
//         setError(`${file.name}: File size exceeds 10MB limit.`);
//         return false;
//       }
//       return true;
//     });

//     setFiles(prev => [...prev, ...validFiles]);

//     // Create previews for images
//     validFiles.forEach(file => {
//       if (file.type.startsWith('image/')) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//           setFilePreviews(prev => [...prev, {
//             file,
//             preview: e.target.result
//           }]);
//         };
//         reader.readAsDataURL(file);
//       }
//     });
//   };

//   const removeFile = (index) => {
//     setFiles(prev => prev.filter((_, i) => i !== index));
//     setFilePreviews(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setLoading(true);

//     // Validation
//     if (!formData.title || !formData.description || !formData.category || 
//         !formData.department || !formData.subDepartment) {
//       setError('Please fill all required fields');
//       setLoading(false);
//       return;
//     }

//     try {
//       // Create FormData for multipart/form-data
//       const formDataToSend = new FormData();
//       formDataToSend.append('title', formData.title);
//       formDataToSend.append('description', formData.description);
//       formDataToSend.append('category', formData.category);
//       formDataToSend.append('priority', formData.priority);
//       formDataToSend.append('department', formData.department);
//       formDataToSend.append('subDepartment', formData.subDepartment);
      
//       if (formData.location.address) {
//         formDataToSend.append('location[address]', formData.location.address);
//       }
//       if (formData.location.latitude) {
//         formDataToSend.append('location[latitude]', formData.location.latitude);
//       }
//       if (formData.location.longitude) {
//         formDataToSend.append('location[longitude]', formData.location.longitude);
//       }

//       // Append files
//       files.forEach((file) => {
//         formDataToSend.append('documents', file);
//       });

//       const response = await createComplaint(formDataToSend);
      
//       setSuccess('Complaint created successfully!');
      
//       // Redirect to dashboard after 2 seconds
//       setTimeout(() => {
//         navigate(ROUTES.CITIZEN_DASHBOARD);
//       }, 2000);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create complaint. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-6 flex items-center justify-between">
//           <h1 className="text-3xl font-bold text-primary-800">
//             {t('citizen.newComplaint')}
//           </h1>
//           <button
//             onClick={() => navigate(ROUTES.CITIZEN_DASHBOARD)}
//             className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
//           >
//             {t('common.back')}
//           </button>
//         </div>

//         {/* Error/Success Messages */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
//             {success}
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
//           {/* Title */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('complaint.title')} *
//             </label>
//             <input
//               type="text"
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               className="input-kiosk w-full"
//               required
//               maxLength={200}
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('complaint.description')} *
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               className="input-kiosk w-full min-h-[150px]"
//               required
//               maxLength={5000}
//             />
//           </div>

//           {/* Category */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('complaint.category')} *
//             </label>
//             <select
//               name="category"
//               value={formData.category}
//               onChange={handleInputChange}
//               className="input-kiosk w-full"
//               required
//             >
//               <option value="">Select Category</option>
//               {Object.values(COMPLAINT_CATEGORIES).map(cat => (
//                 <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
//               ))}
//             </select>
//           </div>

//           {/* Priority */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('complaint.priority')}
//             </label>
//             <select
//               name="priority"
//               value={formData.priority}
//               onChange={handleInputChange}
//               className="input-kiosk w-full"
//             >
//               {Object.values(COMPLAINT_PRIORITY).map(pri => (
//                 <option key={pri} value={pri}>{pri}</option>
//               ))}
//             </select>
//           </div>

//           {/* Department */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('complaint.department')} *
//             </label>
//             <select
//               name="department"
//               value={formData.department}
//               onChange={handleInputChange}
//               className="input-kiosk w-full"
//               required
//             >
//               <option value="">Select Department</option>
//               {departments.map(dept => (
//                 <option key={dept._id} value={dept._id}>{dept.name}</option>
//               ))}
//             </select>
//           </div>

//           {/* Sub-Department */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('complaint.subDepartment')} *
//             </label>
//             <select
//               name="subDepartment"
//               value={formData.subDepartment}
//               onChange={handleInputChange}
//               className="input-kiosk w-full"
//               required
//               disabled={!formData.department}
//             >
//               <option value="">Select Sub-Department</option>
//               {subDepartments.map(subDept => (
//                 <option key={subDept._id} value={subDept._id}>{subDept.name}</option>
//               ))}
//             </select>
//           </div>

//           {/* Location */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('complaint.location')}
//             </label>
//             <input
//               type="text"
//               name="location.address"
//               value={formData.location.address}
//               onChange={handleInputChange}
//               placeholder="Enter address"
//               className="input-kiosk w-full mb-2"
//             />
//             <div className="grid grid-cols-2 gap-2">
//               <input
//                 type="number"
//                 name="location.latitude"
//                 value={formData.location.latitude}
//                 onChange={handleInputChange}
//                 placeholder="Latitude (optional)"
//                 className="input-kiosk w-full"
//                 step="any"
//               />
//               <input
//                 type="number"
//                 name="location.longitude"
//                 value={formData.location.longitude}
//                 onChange={handleInputChange}
//                 placeholder="Longitude (optional)"
//                 className="input-kiosk w-full"
//                 step="any"
//               />
//             </div>
//           </div>

//           {/* File Upload */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               {t('complaint.uploadDocuments')} (Max 5 files, 10MB each)
//             </label>
//             <input
//               type="file"
//               multiple
//               onChange={handleFileChange}
//               accept="image/*,.pdf,.doc,.docx"
//               className="input-kiosk w-full"
//             />
            
//             {/* File Previews */}
//             {filePreviews.length > 0 && (
//               <div className="mt-4 grid grid-cols-3 gap-4">
//                 {filePreviews.map((preview, index) => (
//                   <div key={index} className="relative">
//                     <img
//                       src={preview.preview}
//                       alt={preview.file.name}
//                       className="w-full h-32 object-cover rounded-lg"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => removeFile(index)}
//                       className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
//                     >
//                       ×
//                     </button>
//                     <p className="text-xs text-gray-600 mt-1 truncate">{preview.file.name}</p>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* File List (non-images) */}
//             {files.filter(f => !f.type.startsWith('image/')).length > 0 && (
//               <div className="mt-4 space-y-2">
//                 {files
//                   .filter(f => !f.type.startsWith('image/'))
//                   .map((file, index) => (
//                     <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
//                       <span className="text-sm">{file.name}</span>
//                       <button
//                         type="button"
//                         onClick={() => removeFile(files.indexOf(file))}
//                         className="text-red-600 font-semibold"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//               </div>
//             )}
//           </div>

//           {/* Submit Button */}
//           <div className="flex gap-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="btn-kiosk btn-kiosk-primary flex-1"
//             >
//               {loading ? t('common.loading') : t('complaint.createComplaint')}
//             </button>
//             <button
//               type="button"
//               onClick={() => navigate(ROUTES.CITIZEN_DASHBOARD)}
//               className="btn-kiosk bg-gray-200 text-gray-700 hover:bg-gray-300"
//             >
//               {t('common.cancel')}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default NewComplaint;



import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { createComplaint } from '../../services/complaintService';
import { getDepartmentsPublic, getSubDepartmentsPublic } from '../../services/departmentService';
import { ROUTES, COMPLAINT_CATEGORIES, COMPLAINT_PRIORITY } from '../../utils/constants';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  X, 
  CheckCircle2, 
  Building2, 
  FileText, 
  MapPin, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

const NewComplaint = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState(1); // 1: Authority, 2: Details, 3: Evidence
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: COMPLAINT_PRIORITY.MEDIUM,
    department: '',
    subDepartment: '',
    location: { address: '', latitude: '', longitude: '' }
  });

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchDepartments(); }, []);

  useEffect(() => {
    if (formData.department) {
      fetchSubDepartments(formData.department);
    } else {
      setSubDepartments([]);
      setFormData(prev => ({ ...prev, subDepartment: '' }));
    }
  }, [formData.department]);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartmentsPublic({ isActive: true });
      setDepartments(response.departments || []);
    } catch (err) { console.error('Failed to load departments:', err); }
  };

  const fetchSubDepartments = async (departmentId) => {
    try {
      const response = await getSubDepartmentsPublic({ department: departmentId, isActive: true });
      setSubDepartments(response.subDepartments || []);
    } catch (err) { console.error('Failed to load sub-departments:', err); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({ ...prev, location: { ...prev.location, [locationField]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) { setError('Maximum 5 files allowed'); return; }
    
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) { setError('Invalid file type.'); return false; }
      if (file.size > 10 * 1024 * 1024) { setError('File exceeds 10MB.'); return false; }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreviews(prev => [...prev, { file, preview: e.target.result }]);
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('subDepartment', formData.subDepartment);
      
      if (formData.location.address) formDataToSend.append('location[address]', formData.location.address);
      files.forEach((file) => formDataToSend.append('documents', file));

      await createComplaint(formDataToSend);
      setSuccess('Complaint created successfully!');
      setTimeout(() => navigate(ROUTES.CITIZEN_DASHBOARD), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create complaint.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* Visual Header */}
      <div className="bg-primary-700 text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="max-w-5xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic">{t('citizen.newComplaint')}</h1>
            <p className="text-primary-100 font-bold mt-2 uppercase tracking-widest text-[10px]">Portal Step {step} of 3</p>
          </div>
          <button onClick={() => navigate(ROUTES.CITIZEN_DASHBOARD)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 shadow-inner">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
        {/* Progress Stepper */}
        <div className="bg-white rounded-[2.5rem] p-5 shadow-xl mb-8 flex justify-between items-center border border-slate-100">
          {[
            { id: 1, label: 'Authority', icon: Building2 },
            { id: 2, label: 'Details', icon: FileText },
            { id: 3, label: 'Evidence', icon: ImageIcon }
          ].map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center group">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-100 text-slate-400'}`}>
                  {step > s.id ? <CheckCircle2 size={28} /> : <s.icon size={26} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter mt-2 ${step >= s.id ? 'text-primary-600' : 'text-slate-400'}`}>{s.label}</span>
              </div>
              {i < 2 && <div className={`h-1.5 flex-1 mx-4 rounded-full transition-all duration-700 ${step > s.id ? 'bg-primary-600' : 'bg-slate-100'}`} />}
            </div>
          ))}
        </div>

        {error && <div className="mb-6 p-5 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl text-rose-700 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2"><AlertCircle size={20} /> {error}</div>}
        {success && <div className="mb-6 p-5 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl text-emerald-700 font-bold flex items-center gap-3 animate-in fade-in"><CheckCircle2 size={20} /> {success}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
          <div className="p-10 md:p-16">
            
            {/* STEP 1: Department & Category */}
            {step === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Department *</label>
                    <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-lg shadow-inner appearance-none cursor-pointer" required>
                      <option value="">Select Department</option>
                      {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Sub-Department *</label>
                    <select name="subDepartment" value={formData.subDepartment} onChange={handleInputChange} className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-lg shadow-inner appearance-none disabled:opacity-40" required disabled={!formData.department}>
                      <option value="">Select Sub-Department</option>
                      {subDepartments.map(sd => <option key={sd._id} value={sd._id}>{sd.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Grievance Category *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.values(COMPLAINT_CATEGORIES).map(cat => (
                      <button key={cat} type="button" onClick={() => setFormData(p => ({ ...p, category: cat }))} className={`p-6 rounded-[1.5rem] border-2 transition-all font-bold text-sm text-center ${formData.category === cat ? 'bg-primary-600 border-primary-600 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:border-primary-200 shadow-sm'}`}>
                        {cat.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Details & Location */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Title / Subject *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Briefly name the issue" className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-lg shadow-inner" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Narrative / Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} placeholder="Provide complete details about the grievance..." className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[2rem] outline-none transition-all font-medium text-lg shadow-inner resize-none" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><MapPin size={14} /> Location Details</label>
                  <input type="text" name="location.address" value={formData.location.address} onChange={handleInputChange} placeholder="Address, Landmark or Locality" className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold shadow-inner" />
                </div>
              </div>
            )}

            {/* STEP 3: Documentation Upload */}
            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="border-4 border-dashed border-slate-100 rounded-[3.5rem] p-16 text-center hover:border-primary-400 transition-colors relative group bg-slate-50/50">
                  <input type="file" multiple onChange={handleFileChange} accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="flex flex-col items-center">
                    <div className="p-8 bg-white text-primary-600 rounded-full mb-6 shadow-xl group-hover:scale-110 transition-transform">
                      <Upload size={56} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">Upload Evidence</h3>
                    <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto text-lg">Tap to capture photos or attach supporting documents</p>
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] mt-6">PNG, JPG, PDF • Up to 10MB each</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {filePreviews.map((p, i) => (
                    <div key={i} className="relative animate-in zoom-in-95 group">
                      <img src={p.preview} alt="preview" className="w-full h-40 object-cover rounded-[2rem] shadow-lg border-4 border-white" />
                      <button type="button" onClick={() => removeFile(i)} className="absolute -top-3 -right-3 bg-rose-600 text-white rounded-full p-2 shadow-2xl active:scale-90 transition-all border-2 border-white"><X size={20} strokeWidth={3} /></button>
                    </div>
                  ))}
                  {files.filter(f => !f.type.startsWith('image/')).map((f, i) => (
                    <div key={i} className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 shadow-sm">
                      <FileText size={40} className="text-primary-600" />
                      <span className="text-xs font-bold text-slate-700 truncate w-full text-center">{f.name}</span>
                      <button type="button" onClick={() => removeFile(files.indexOf(f))} className="text-rose-600 text-[10px] font-black uppercase tracking-widest">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Persistent Navigation Footer */}
          <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-6">
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)} className="flex-1 py-6 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-[0.98] transition-all">
                <ArrowLeft size={22} /> Previous
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" onClick={() => setStep(s => s + 1)} 
                disabled={step === 1 && (!formData.department || !formData.subDepartment || !formData.category)} 
                className="flex-[2] py-6 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale shadow-xl shadow-primary-900/10">
                Continue to Details <ChevronRight size={22} />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="flex-[2] py-6 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-700 active:scale-[0.98] transition-all shadow-xl shadow-primary-900/20">
                {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={22} /> Finalize Submission</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewComplaint;