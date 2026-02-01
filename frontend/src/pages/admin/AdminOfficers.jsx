import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  getOfficers,
  createOfficer,
  updateOfficer,
  assignOfficer,
  deactivateOfficer,
} from "../../services/officerService";
import { getSubDepartments } from "../../services/departmentService";
import { ROUTES } from "../../utils/constants";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { 
  UserPlus, 
  UserCog, 
  UserMinus, 
  ArrowLeft, 
  ShieldCheck, 
  Search, 
  X, 
  Loader2, 
  User, 
  Key, 
  Briefcase 
} from "lucide-react";

const AdminOfficers = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [officers, setOfficers] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [formData, setFormData] = useState({
    officerId: "",
    password: "",
    officerName: "",
    assignedSubDepartment: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [officersRes, subDeptsRes] = await Promise.all([
        getOfficers(),
        getSubDepartments({ isActive: true }),
      ]);
      setOfficers(officersRes.officers || []);
      setSubDepartments(subDeptsRes.subDepartments || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOfficer(null);
    setFormData({ officerId: "", password: "", officerName: "", assignedSubDepartment: "" });
    setShowModal(true);
  };

  const handleEdit = (officer) => {
    setEditingOfficer(officer);
    setFormData({
      officerId: officer.officerId,
      password: "",
      officerName: officer.officerName,
      assignedSubDepartment: officer.assignedSubDepartment?._id || officer.assignedSubDepartment || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOfficer) {
        await updateOfficer(editingOfficer._id, formData);
      } else {
        await createOfficer(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleAssign = async (officerId, subDeptId) => {
    try {
      await assignOfficer(officerId, subDeptId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign");
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this officer?")) {
      try {
        await deactivateOfficer(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to deactivate");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Professional Sticky Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t("admin.officers")}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or name..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
          >
            <UserPlus size={20} /> {t("admin.createOfficer")}
          </button>
        </div>

        {/* Officers Grid/Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-medium">Syncing officer records...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Official Info</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Department Assignment</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Security Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officers.map((officer) => (
                  <tr key={officer._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <User size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{officer.officerName}</p>
                          <p className="text-sm font-mono text-slate-500">{officer.officerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <span className={`text-sm font-bold ${officer.assignedSubDepartment ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                          {officer.assignedSubDepartment?.name || "Unassigned"}
                        </span>
                        <select
                          value={officer.assignedSubDepartment?._id || ""}
                          onChange={(e) => handleAssign(officer._id, e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:border-slate-900 outline-none w-48"
                        >
                          <option value="">Re-assign Department...</option>
                          {subDepartments.map((subDept) => (
                            <option key={subDept._id} value={subDept._id}>{subDept.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        officer.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {officer.isActive ? <ShieldCheck size={14} /> : <X size={14} />}
                        {officer.isActive ? "Active Account" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(officer)}
                          className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-none hover:shadow-sm"
                        >
                          <UserCog size={20} />
                        </button>
                        <button
                          onClick={() => handleDeactivate(officer._id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <UserMinus size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Officer Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-50 text-center">
              <div className="inline-flex p-4 bg-slate-900 text-white rounded-2xl mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {editingOfficer ? "Profile Settings" : "Enroll Officer"}
              </h3>
              <p className="text-slate-500 font-medium">Configure credentials and departmental access</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Official ID
                </label>
                <input
                  type="text"
                  value={formData.officerId}
                  onChange={(e) => setFormData((p) => ({ ...p, officerId: e.target.value.toUpperCase() }))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-mono font-bold tracking-wider disabled:opacity-50"
                  required
                  disabled={!!editingOfficer}
                  placeholder="EX: OFF-2026-001"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} /> Security Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all"
                  required={!editingOfficer}
                  placeholder={editingOfficer ? "••••••••" : "Enter temporary password"}
                />
                {editingOfficer && <p className="text-[10px] text-slate-400 ml-1">Leave empty to keep current password</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Full Legal Name
                </label>
                <input
                  type="text"
                  value={formData.officerName}
                  onChange={(e) => setFormData((p) => ({ ...p, officerName: e.target.value }))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-semibold"
                  required
                  placeholder="Officer's full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={14} /> Primary Sub-Department
                </label>
                <select
                  value={formData.assignedSubDepartment}
                  onChange={(e) => setFormData((p) => ({ ...p, assignedSubDepartment: e.target.value }))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-semibold appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Sub-Department</option>
                  {subDepartments.map((subDept) => (
                    <option key={subDept._id} value={subDept._id}>{subDept.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98]">
                  {t("common.save")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOfficers;