/**
 * SUVIDHA 2026 - Officer Complaint Details View
 *
 * Displays complete complaint information including:
 * - Full description and details
 * - All uploaded evidence/documents
 * - Citizen information
 * - Status update controls (after review)
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
  getComplaintById,
  updateComplaint,
} from "../../services/complaintService";
import {
  acceptTransfer,
  rejectTransfer,
} from "../../services/transferService";
import { ROUTES, COMPLAINT_STATUS } from "../../utils/constants";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import TransferModal from "../../components/TransferModal";
import TransferHistory from "../../components/TransferHistory";
import CommunicationThread from "../../components/CommunicationThread";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Eye,
  Shield,
  ArrowRightLeft,
  XCircle,
} from "lucide-react";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [roleContext, setRoleContext] = useState(null);
  const [pendingTransfer, setPendingTransfer] = useState(null);

  const [updateData, setUpdateData] = useState({
    status: "",
    remarks: "",
    resolutionNotes: "",
    rejectionReason: "",
  });

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const response = await getComplaintById(id);
      setComplaint(response.complaint);
      setRoleContext(response.roleContext);
      setPendingTransfer(response.pendingTransfer);
      setUpdateData((prev) => ({ ...prev, status: response.complaint.status }));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load complaint details",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await updateComplaint(complaint._id, updateData);
      navigate(ROUTES.OFFICER_DASHBOARD, {
        state: { message: "Complaint updated successfully" },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  const handleTransferSuccess = async () => {
    setShowTransferModal(false);
    // Show success message
    alert('Complaint transferred successfully! The page will refresh to show the updated status.');
    // Refresh complaint data to show new state
    await fetchComplaintDetails();
  };

  const handleAcceptTransfer = async (transferId) => {
    if (!confirm('Accept this complaint transfer? The complaint will be assigned to your sub-department and you will become the owner.')) return;
    
    setLoading(true); // Show loading state
    try {
      const response = await acceptTransfer(id, transferId);
      if (response.success) {
        // Refresh the complaint details to show updated state
        await fetchComplaintDetails();
        alert('Transfer accepted successfully! You are now the owner of this complaint.');
      } else {
        alert(response.message || 'Failed to accept transfer');
        setLoading(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting transfer');
      console.error(err);
      setLoading(false);
    }
  };

  const handleRejectTransfer = async (transferId) => {
    const reason = prompt('Please provide a reason for rejecting this transfer:');
    if (!reason || !reason.trim()) return;
    
    setLoading(true); // Show loading state
    try {
      const response = await rejectTransfer(id, transferId, reason);
      if (response.success) {
        alert('Transfer rejected successfully!');
        navigate(ROUTES.OFFICER_DASHBOARD);
      } else {
        alert(response.message || 'Failed to reject transfer');
        setLoading(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting transfer');
      console.error(err);
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case COMPLAINT_STATUS.PENDING:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case COMPLAINT_STATUS.IN_PROGRESS:
        return "bg-sky-50 text-sky-700 border-sky-200";
      case COMPLAINT_STATUS.RESOLVED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case COMPLAINT_STATUS.REJECTED:
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-indigo-600"
            size={48}
          />
          <p className="font-bold text-slate-600">
            Loading complaint details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md shadow-xl">
          <AlertCircle className="mx-auto mb-4 text-rose-500" size={64} />
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Error Loading Complaint
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(ROUTES.OFFICER_DASHBOARD)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <header className="bg-indigo-900 text-white sticky top-0 z-30 shadow-xl border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(ROUTES.OFFICER_DASHBOARD)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none uppercase italic">
                Complaint Review
              </h1>
              <p className="text-[10px] text-indigo-300 font-bold mt-1.5 uppercase tracking-[0.2em]">
                Case #{complaint.complaintNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Complaint Header Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono font-black text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                      {complaint.complaintNumber}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusStyle(complaint.status)}`}
                    >
                      {complaint.status}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3">
                    {complaint.title}
                  </h2>
                  <div className="flex items-center gap-6 text-sm text-slate-500 font-bold">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(complaint.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {new Date(complaint.createdAt).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Category
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {complaint.category?.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Priority
                  </p>
                  <p
                    className={`text-lg font-black ${complaint.priority === "High" ? "text-rose-600" : "text-sky-600"}`}
                  >
                    {complaint.priority}
                  </p>
                </div>
              </div>

              {/* Full Description */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-indigo-600" size={20} />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    Complete Description
                  </h3>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed text-base whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Location Information */}
              {complaint.location?.address && (
                <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="text-blue-600 flex-shrink-0 mt-1"
                      size={20}
                    />
                    <div>
                      <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-2">
                        Location
                      </h3>
                      <p className="text-blue-800 font-bold">
                        {complaint.location.address}
                      </p>
                      {complaint.location.latitude &&
                        complaint.location.longitude && (
                          <p className="text-xs text-blue-600 mt-2 font-mono">
                            {complaint.location.latitude},{" "}
                            {complaint.location.longitude}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence/Documents Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Evidence & Documents
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {complaint.documents?.length || 0} file(s) uploaded by
                    citizen
                  </p>
                </div>
              </div>

              {complaint.documents && complaint.documents.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {complaint.documents.map((doc, index) => (
                    <div key={index} className="group relative">
                      {doc.secure_url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <div
                          onClick={() => setSelectedImage(doc.secure_url)}
                          className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 border-slate-100 hover:border-indigo-500 transition-all"
                        >
                          <img
                            src={doc.secure_url}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <Eye
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              size={32}
                            />
                          </div>
                        </div>
                      ) : (
                        <a
                          href={doc.secure_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-2xl border-2 border-slate-100 hover:border-indigo-500 bg-slate-50 flex flex-col items-center justify-center gap-3 transition-all group"
                        >
                          <FileText
                            className="text-slate-400 group-hover:text-indigo-600"
                            size={40}
                          />
                          <span className="text-xs font-bold text-slate-600 px-3 text-center truncate w-full">
                            {doc.name || "Document"}
                          </span>
                          <Download
                            className="text-slate-400 group-hover:text-indigo-600"
                            size={16}
                          />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <ImageIcon
                    className="mx-auto text-slate-300 mb-3"
                    size={48}
                  />
                  <p className="text-slate-500 font-bold">
                    No documents uploaded
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-8">
            {/* Citizen Information */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                  <User size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Citizen Details
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Name
                  </p>
                  <p className="text-base font-bold text-slate-900">
                    {complaint.citizen?.name || "N/A"}
                  </p>
                </div>
                {complaint.citizen?.email && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Email
                    </p>
                    <p className="text-sm font-bold text-slate-900 break-all">
                      {complaint.citizen.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Department Information */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Assignment
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Department
                  </p>
                  <p className="text-base font-bold text-slate-900">
                    {complaint.department?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Sub-Department
                  </p>
                  <p className="text-base font-bold text-slate-900">
                    {complaint.subDepartment?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Update Status Section */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] shadow-xl p-8 text-white sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">
                  {roleContext?.isDestination ? 'Transfer Actions' : 'Update Status'}
                </h3>
              </div>

              {/* Show Accept/Reject for Destination with Pending Transfer */}
              {roleContext?.isDestination && pendingTransfer ? (
                <div className="space-y-4">
                  <div className="bg-yellow-500/20 border-2 border-yellow-300/30 rounded-xl p-4 mb-4">
                    <p className="text-yellow-100 font-bold text-sm mb-2">
                      📥 Transfer Received
                    </p>
                    <p className="text-yellow-50 text-xs">
                      From: {pendingTransfer.fromSubDepartment?.name}
                    </p>
                    <p className="text-yellow-50 text-xs mt-1">
                      Reason: {pendingTransfer.transferReason}
                    </p>
                    {pendingTransfer.transferNotes && (
                      <p className="text-yellow-50 text-xs mt-2 italic">
                        "{pendingTransfer.transferNotes}"
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAcceptTransfer(pendingTransfer._id)}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Accept Transfer
                  </button>
                  
                  <button
                    onClick={() => handleRejectTransfer(pendingTransfer._id)}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <XCircle size={20} />
                    Reject Transfer
                  </button>
                </div>
              ) : !showUpdateForm ? (
                <div className="space-y-4">
                  {/* Show warning if there's a pending transfer FROM this department */}
                  {roleContext?.isSource && (
                    <div className="bg-orange-500/20 border-2 border-orange-300/30 rounded-xl p-4 mb-4">
                      <p className="text-orange-100 font-bold text-sm mb-2">
                        ⏳ Transfer Sent
                      </p>
                      <p className="text-orange-50 text-xs leading-relaxed">
                        You have sent this complaint for transfer. It is awaiting acceptance by the destination department. You cannot transfer it again until the current transfer is accepted or rejected.
                      </p>
                    </div>
                  )}
                  
                  {/* Show info if user is destination but hasn't accepted yet */}
                  {roleContext?.isDestination && !roleContext?.isCurrentOwner && (
                    <div className="bg-blue-500/20 border-2 border-blue-300/30 rounded-xl p-4 mb-4">
                      <p className="text-blue-100 font-bold text-sm mb-2">
                        ℹ️ Pending Acceptance
                      </p>
                      <p className="text-blue-50 text-xs leading-relaxed">
                        You must accept this transfer before you can transfer it to another department or update its status.
                      </p>
                    </div>
                  )}
                  
                  <p className="text-indigo-100 font-medium text-sm leading-relaxed">
                    Review all complaint details and evidence before updating
                    the status.
                  </p>
                  
                  {roleContext?.canUpdateStatus && !roleContext?.isDestination && (
                    <button
                      onClick={() => setShowUpdateForm(true)}
                      className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl"
                    >
                      Proceed to Update
                    </button>
                  )}

                  {/* Transfer Button - Show based on canTransfer permission */}
                  {roleContext?.canTransfer ? (
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 border-white/30 flex items-center justify-center gap-2"
                    >
                      <ArrowRightLeft size={16} />
                      Transfer Complaint
                    </button>
                  ) : roleContext?.hasPendingTransfer && roleContext?.isCurrentOwner ? (
                    <button
                      disabled
                      className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-black text-sm uppercase tracking-widest border-2 border-white/10 flex items-center justify-center gap-2 cursor-not-allowed"
                      title="Cannot transfer while a transfer is pending"
                    >
                      <ArrowRightLeft size={16} />
                      Transfer Disabled (Pending)
                    </button>
                  ) : null}
                </div>
              ) : (
                <form onSubmit={handleUpdateSubmit} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 block">
                      Status *
                    </label>
                    <select
                      value={updateData.status}
                      onChange={(e) =>
                        setUpdateData((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 focus:border-white rounded-xl outline-none text-white font-bold backdrop-blur-sm"
                      required
                    >
                      <option
                        value={COMPLAINT_STATUS.PENDING}
                        className="text-slate-900"
                      >
                        Pending
                      </option>
                      <option
                        value={COMPLAINT_STATUS.IN_PROGRESS}
                        className="text-slate-900"
                      >
                        In Progress
                      </option>
                      <option
                        value={COMPLAINT_STATUS.RESOLVED}
                        className="text-slate-900"
                      >
                        Resolved
                      </option>
                      <option
                        value={COMPLAINT_STATUS.REJECTED}
                        className="text-slate-900"
                      >
                        Rejected
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 block">
                      Remarks
                    </label>
                    <textarea
                      value={updateData.remarks}
                      onChange={(e) =>
                        setUpdateData((prev) => ({
                          ...prev,
                          remarks: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 focus:border-white rounded-xl outline-none text-white font-medium backdrop-blur-sm resize-none"
                      rows={3}
                      placeholder="Add your comments..."
                    />
                  </div>

                  {updateData.status === COMPLAINT_STATUS.RESOLVED && (
                    <div>
                      <label className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-2 block">
                        Resolution Notes *
                      </label>
                      <textarea
                        value={updateData.resolutionNotes}
                        onChange={(e) =>
                          setUpdateData((prev) => ({
                            ...prev,
                            resolutionNotes: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 bg-emerald-500/20 border-2 border-emerald-300/30 focus:border-emerald-300 rounded-xl outline-none text-white font-medium backdrop-blur-sm resize-none"
                        rows={3}
                        placeholder="Describe the resolution..."
                        required
                      />
                    </div>
                  )}

                  {updateData.status === COMPLAINT_STATUS.REJECTED && (
                    <div>
                      <label className="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-2 block">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={updateData.rejectionReason}
                        onChange={(e) =>
                          setUpdateData((prev) => ({
                            ...prev,
                            rejectionReason: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 bg-rose-500/20 border-2 border-rose-300/30 focus:border-rose-300 rounded-xl outline-none text-white font-medium backdrop-blur-sm resize-none"
                        rows={3}
                        placeholder="Explain why rejected..."
                        required
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 py-4 bg-white text-indigo-700 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-xl flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Submit
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="px-4 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Transfer History Section */}
        <div className="mt-8">
          <TransferHistory complaintId={complaint._id} />
        </div>

        {/* Communication Thread Section */}
        <div className="mt-8">
          <CommunicationThread complaintId={complaint._id} />
        </div>
      </main>

      {/* Transfer Modal */}
      <TransferModal
        complaint={complaint}
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSuccess={handleTransferSuccess}
      />

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <img
            src={selectedImage}
            alt="Evidence"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;
