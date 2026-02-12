import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { createComplaint, downloadReceipt } from "../../services/complaintService";
import {
  getDepartmentsPublic,
  getSubDepartmentsPublic,
} from "../../services/departmentService";
import {
  ROUTES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITY,
} from "../../utils/constants";
import ComplaintQRCode from "../../components/ComplaintQRCode";
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
  ChevronRight,
  Download,
  QrCode,
} from "lucide-react";

const NewComplaint = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState(1); // 1: Authority, 2: Details, 3: Evidence
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: COMPLAINT_PRIORITY.MEDIUM,
    department: "",
    subDepartment: "",
    location: { address: "", latitude: "", longitude: "" },
  });

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.department) {
      fetchSubDepartments(formData.department);
    } else {
      setSubDepartments([]);
      setFormData((prev) => ({ ...prev, subDepartment: "", category: "" })); // Reset category too
    }
  }, [formData.department]);

  // Reset category when sub-department changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, category: "" }));
  }, [formData.subDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartmentsPublic({ isActive: true });
      setDepartments(response.departments || []);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  const fetchSubDepartments = async (departmentId) => {
    try {
      const response = await getSubDepartmentsPublic({
        department: departmentId,
        isActive: true,
      });
      setSubDepartments(response.subDepartments || []);
    } catch (err) {
      console.error("Failed to load sub-departments:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [locationField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      setError("Maximum 5 files allowed");
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setError(
          "Invalid file type. Only JPEG, PNG, and PDF files are allowed.",
        );
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File exceeds 10MB limit.");
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) =>
          setFilePreviews((prev) => [
            ...prev,
            { file, preview: e.target.result },
          ]);
        reader.readAsDataURL(file);
      }
    });
    setError(""); // Clear any previous errors
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate that at least one document is uploaded
    if (files.length === 0) {
      setError(
        "Please upload at least one document as proof before submitting your complaint.",
      );
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("subDepartment", formData.subDepartment);

      if (formData.location.address)
        formDataToSend.append("location[address]", formData.location.address);
      files.forEach((file) => formDataToSend.append("documents", file));

      const response = await createComplaint(formDataToSend);
      setCreatedComplaint(response.complaint);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create complaint.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      await downloadReceipt(createdComplaint._id);
    } catch (err) {
      alert('Failed to download receipt');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* Visual Header */}
      <div className="bg-primary-700 text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="max-w-5xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic">
              {t("citizen.newComplaint")}
            </h1>
            <p className="text-primary-100 font-bold mt-2 uppercase tracking-widest text-[10px]">
              Portal Step {step} of 3
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.CITIZEN_DASHBOARD)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 shadow-inner"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
        {/* Progress Stepper */}
        <div className="bg-white rounded-[2.5rem] p-5 shadow-xl mb-8 flex justify-between items-center border border-slate-100">
          {[
            { id: 1, label: "Authority", icon: Building2 },
            { id: 2, label: "Details", icon: FileText },
            { id: 3, label: "Evidence", icon: ImageIcon },
          ].map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center group">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s.id ? "bg-primary-600 text-white shadow-lg shadow-primary-200" : "bg-slate-100 text-slate-400"}`}
                >
                  {step > s.id ? (
                    <CheckCircle2 size={28} />
                  ) : (
                    <s.icon size={26} />
                  )}
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-tighter mt-2 ${step >= s.id ? "text-primary-600" : "text-slate-400"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`h-1.5 flex-1 mx-4 rounded-full transition-all duration-700 ${step > s.id ? "bg-primary-600" : "bg-slate-100"}`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-5 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl text-rose-700 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-5 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl text-emerald-700 font-bold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 size={20} /> {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-900/5 border border-slate-100 overflow-hidden"
        >
          <div className="p-10 md:p-16">
            {/* STEP 1: Department & Category */}
            {step === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-lg shadow-inner appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                      Sub-Department *
                    </label>
                    <select
                      name="subDepartment"
                      value={formData.subDepartment}
                      onChange={handleInputChange}
                      className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-lg shadow-inner appearance-none disabled:opacity-40"
                      required
                      disabled={!formData.department}
                    >
                      <option value="">Select Sub-Department</option>
                      {subDepartments.map((sd) => (
                        <option key={sd._id} value={sd._id}>
                          {sd.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                    Grievance Category *
                  </label>
                  {!formData.subDepartment ? (
                    <div className="p-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                      <AlertCircle
                        size={48}
                        className="mx-auto text-slate-300 mb-4"
                      />
                      <p className="text-slate-500 font-bold text-lg">
                        Select a sub-department first
                      </p>
                      <p className="text-slate-400 text-sm mt-2">
                        Grievance categories are specific to each sub-department
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Object.values(COMPLAINT_CATEGORIES).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setFormData((p) => ({ ...p, category: cat }))
                          }
                          className={`p-6 rounded-[1.5rem] border-2 transition-all font-bold text-sm text-center ${formData.category === cat ? "bg-primary-600 border-primary-600 text-white shadow-xl scale-[1.02]" : "bg-white border-slate-100 text-slate-600 hover:border-primary-200 shadow-sm"}`}
                        >
                          {cat.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Details & Location */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                    Title / Subject *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Briefly name the issue"
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-lg shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                    Narrative / Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Provide complete details about the grievance..."
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[2rem] outline-none transition-all font-medium text-lg shadow-inner resize-none"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <MapPin size={14} /> Location Details
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    placeholder="Address, Landmark or Locality"
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Documentation Upload */}
            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={20}
                      className="text-amber-600 flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-amber-900 font-bold text-sm">
                        Evidence Required
                      </p>
                      <p className="text-amber-700 text-xs mt-1">
                        At least one document (photo or PDF) must be uploaded as
                        proof to submit your complaint.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-4 border-dashed border-slate-100 rounded-[3.5rem] p-16 text-center hover:border-primary-400 transition-colors relative group bg-slate-50/50">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center">
                    <div className="p-8 bg-white text-primary-600 rounded-full mb-6 shadow-xl group-hover:scale-110 transition-transform">
                      <Upload size={56} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">
                      Upload Evidence *
                    </h3>
                    <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto text-lg">
                      Tap to capture photos or attach supporting documents
                    </p>
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] mt-6">
                      PNG, JPG, PDF • Up to 10MB each
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {filePreviews.map((p, i) => (
                    <div
                      key={i}
                      className="relative animate-in zoom-in-95 group"
                    >
                      <img
                        src={p.preview}
                        alt="preview"
                        className="w-full h-40 object-cover rounded-[2rem] shadow-lg border-4 border-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -top-3 -right-3 bg-rose-600 text-white rounded-full p-2 shadow-2xl active:scale-90 transition-all border-2 border-white"
                      >
                        <X size={20} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                  {files
                    .filter((f) => !f.type.startsWith("image/"))
                    .map((f, i) => (
                      <div
                        key={i}
                        className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 shadow-sm"
                      >
                        <FileText size={40} className="text-primary-600" />
                        <span className="text-xs font-bold text-slate-700 truncate w-full text-center">
                          {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(files.indexOf(f))}
                          className="text-rose-600 text-[10px] font-black uppercase tracking-widest"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>

                {files.length > 0 && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl p-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-600" />
                      <p className="text-emerald-900 font-bold text-sm">
                        {files.length} document{files.length > 1 ? "s" : ""}{" "}
                        uploaded successfully
                      </p>
                    </div>
                  </div>
                )}

                {files.length === 0 && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl p-5">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={20} className="text-rose-600" />
                      <p className="text-rose-900 font-bold text-sm">
                        No documents uploaded yet. Please upload at least one
                        document to proceed.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Persistent Navigation Footer */}
          <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-6 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                <ArrowLeft size={22} /> Previous
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={
                  step === 1 &&
                  (!formData.department ||
                    !formData.subDepartment ||
                    !formData.category)
                }
                className="flex-[2] py-6 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale shadow-xl shadow-primary-900/10"
              >
                Continue to Details <ChevronRight size={22} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || files.length === 0}
                className="flex-[2] py-6 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-700 active:scale-[0.98] transition-all shadow-xl shadow-primary-900/20 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={22} /> Finalize Submission
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 animate-in zoom-in-95">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="text-green-600" size={64} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-black text-slate-900 text-center mb-2">
              Complaint Registered Successfully!
            </h2>
            <p className="text-slate-600 text-center mb-8">
              Your complaint has been submitted and assigned to the relevant department
            </p>

            {/* Complaint Number */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 mb-8 text-center">
              <p className="text-sm font-bold text-indigo-600 mb-2">Your Complaint Number</p>
              <p className="text-4xl font-black text-indigo-900 font-mono">
                {createdComplaint.complaintNumber}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Save this number for tracking your complaint
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-8">
              <ComplaintQRCode 
                complaintId={createdComplaint._id}
                complaintNumber={createdComplaint.complaintNumber}
                size={180}
                showDownload={true}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                <Download size={20} />
                Download Receipt (PDF)
              </button>
              <button
                onClick={() => navigate(`${ROUTES.CITIZEN_TRACK_COMPLAINT}?id=${createdComplaint._id}`)}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                <QrCode size={20} />
                Track Complaint
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate(ROUTES.CITIZEN_DASHBOARD);
              }}
              className="w-full mt-4 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewComplaint;
