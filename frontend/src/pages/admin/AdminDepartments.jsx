import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/departmentService';
import { ROUTES } from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Plus, Edit3, Trash2, ArrowLeft, Building2, Search, X, Loader2, Info } from 'lucide-react';

const AdminDepartments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await getDepartments();
      setDepartments(response.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modern search filter logic
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, code: dept.code, description: dept.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await updateDepartment(editingDept._id, formData);
      } else {
        await createDepartment(formData);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this department?')) {
      try {
        await deleteDepartment(id);
        fetchDepartments();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Refined Top Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 active:scale-90"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('admin.departments')}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="relative w-full md:w-[400px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by code or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={handleCreate}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.97] shadow-xl shadow-slate-900/20"
          >
            <Plus size={20} strokeWidth={3} /> {t('admin.createDepartment')}
          </button>
        </div>

        {/* Data Grid */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="animate-spin text-slate-900" size={48} strokeWidth={1.5} />
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">{t('common.loading')}...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="py-32 text-center">
              <div className="inline-flex p-6 bg-slate-50 rounded-full text-slate-300 mb-4">
                <Building2 size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No departments found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or create a new entry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Unique Code</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Official Title</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Operational Status</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDepartments.map((dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-sm tracking-tighter shadow-inner">
                          {dept.code}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-lg">{dept.name}</span>
                          <span className="text-sm text-slate-400 font-medium truncate max-w-xs">{dept.description || 'No description available'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                          dept.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${dept.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                          {dept.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
                            title="Edit details"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(dept._id)}
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Deactivate"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modern Hierarchical Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[3rem] shadow-2xl relative z-10 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-slate-900 text-white rounded-[1.25rem] shadow-lg shadow-slate-900/20">
                  <Building2 size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {editingDept ? 'Update Details' : 'New Department'}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1.5">Official System Entry</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                   Department Code <Info size={12} />
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl outline-none transition-all font-mono font-bold tracking-widest disabled:opacity-50 text-lg shadow-inner"
                  required
                  disabled={!!editingDept}
                  placeholder="EX: ELECT"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg shadow-inner"
                  required
                  placeholder="Enter full department name"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Functional Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-2xl outline-none transition-all resize-none font-medium shadow-inner"
                  placeholder="What are the core responsibilities of this unit?"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20">
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-bold text-xl hover:bg-slate-200 transition-all"
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

export default AdminDepartments;