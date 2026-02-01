import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getSubDepartments, createSubDepartment, updateSubDepartment, deleteSubDepartment, getDepartments } from '../../services/departmentService';
import { ROUTES } from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { 
  GitBranch, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Search, 
  X, 
  Loader2, 
  Layers, 
  Info,
  ChevronRight
} from 'lucide-react';

const AdminSubDepartments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [subDepartments, setSubDepartments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubDept, setEditingSubDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', department: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subDeptsRes, deptsRes] = await Promise.all([
        getSubDepartments(),
        getDepartments({ isActive: true })
      ]);
      setSubDepartments(subDeptsRes.subDepartments || []);
      setDepartments(deptsRes.departments || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubDept(null);
    setFormData({ name: '', code: '', department: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (subDept) => {
    setEditingSubDept(subDept);
    setFormData({
      name: subDept.name,
      code: subDept.code,
      department: subDept.department._id || subDept.department,
      description: subDept.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubDept) {
        await updateSubDepartment(editingSubDept._id, formData);
      } else {
        await createSubDepartment(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this sub-department?')) {
      try {
        await deleteSubDepartment(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Premium Header with Breadcrumbs */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{t('admin.dashboard')}</span>
                <ChevronRight size={10} />
                <span className="text-slate-900">{t('admin.subDepartments')}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">
                {t('admin.subDepartments')}
              </h1>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name, code or parent..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={handleCreate}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.25rem] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
          >
            <Plus size={20} /> {t('admin.createSubDepartment')}
          </button>
        </div>

        {/* Data Grid with Enhanced Rows */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={48} strokeWidth={1.5} />
              <p className="font-bold tracking-wide uppercase text-xs">Loading structure...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Service Code</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Sub-Department Name</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Parent Authority</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subDepartments.map((subDept) => (
                  <tr key={subDept._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 text-sm px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 shadow-inner">
                        {subDept.code}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{subDept.name}</span>
                        <span className="text-xs text-slate-400 truncate max-w-xs">{subDept.description || 'No description provided'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 w-fit">
                        <Layers size={14} />
                        <span className="text-xs font-black uppercase tracking-wider">{subDept.department?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        subDept.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${subDept.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {subDept.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                        <button
                          onClick={() => handleEdit(subDept)}
                          className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-none hover:shadow-sm"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(subDept._id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
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

      {/* Modern Hierarchical Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[3rem] shadow-2xl relative z-10 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-lg">
                  <GitBranch size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {editingSubDept ? 'Modify Branch' : 'New Sub-Unit'}
                  </h3>
                  <p className="text-slate-500 font-medium">Define specialized services within a department</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Parent Entity *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-700 cursor-pointer appearance-none"
                    required
                    disabled={!!editingSubDept}
                  >
                    <option value="">Choose Parent...</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Unit Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-mono font-bold tracking-widest disabled:opacity-50"
                    required
                    disabled={!!editingSubDept}
                    placeholder="E.G. BILLS"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sub-Department Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-bold"
                  required
                  placeholder="E.G. Billing & Collections"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                   Description <Info size={12} />
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all resize-none font-medium"
                  placeholder="Explain the specific scope of this sub-unit..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4.5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20">
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4.5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-bold text-lg hover:bg-slate-200 transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubDepartments;