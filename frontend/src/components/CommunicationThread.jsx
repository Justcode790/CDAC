/**
 * SUVIDHA 2026 - Communication Thread Component
 * 
 * Displays inter-department communication messages in chronological order
 * with message input, department tagging, and attachment support
 */

import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  X, 
  Building2, 
  User, 
  Clock,
  CheckCheck,
  AlertCircle,
  Loader2,
  Tag,
  FileText,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getCommunications, 
  addCommunication, 
  markAsRead,
  getMessageTypeText,
  getMessageTypeColor,
  formatMessageTime,
  validateMessageData
} from '../services/communicationService';
import { getDepartments } from '../services/departmentService';
import { MESSAGE_TYPES } from '../utils/constants';

const CommunicationThread = ({ complaintId, onMessageSent }) => {
  const { user } = useAuth();
  const [communications, setCommunications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  
  // Message form state
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.INTER_DEPARTMENT);
  const [isInternal, setIsInternal] = useState(false);
  const [taggedDepartments, setTaggedDepartments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    if (complaintId) {
      fetchCommunications();
      fetchDepartments();
    }
  }, [complaintId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [communications]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const response = await getCommunications(complaintId);
      if (response.success) {
        setCommunications(response.communications || []);
        
        // Mark unread messages as read
        const unreadMessages = response.communications.filter(
          comm => !comm.readBy?.some(r => r.user === user._id)
        );
        
        for (const comm of unreadMessages) {
          try {
            await markAsRead(comm._id);
          } catch (err) {
            console.error('Error marking message as read:', err);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load communications');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      if (response.success) {
        setDepartments(response.departments || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setFormErrors(prev => ({ 
          ...prev, 
          attachments: `File ${file.name} exceeds 5MB limit` 
        }));
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
    setFormErrors(prev => ({ ...prev, attachments: '' }));
  };
  
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const toggleDepartmentTag = (deptId) => {
    setTaggedDepartments(prev => 
      prev.includes(deptId) 
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate message
    const validation = validateMessageData({ message });
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setSending(true);
    setFormErrors({});
    
    try {
      const messageData = {
        message: message.trim(),
        messageType,
        isInternal,
        taggedDepartments
      };
      
      const response = await addCommunication(complaintId, messageData, attachments);
      
      if (response.success) {
        // Clear form
        setMessage('');
        setTaggedDepartments([]);
        setAttachments([]);
        setIsInternal(false);
        
        // Refresh communications
        await fetchCommunications();
        
        // Notify parent
        if (onMessageSent) {
          onMessageSent(response.communication);
        }
      }
    } catch (err) {
      setFormErrors({ 
        submit: err.response?.data?.message || 'Failed to send message' 
      });
    } finally {
      setSending(false);
    }
  };
  
  const isMessageRead = (comm) => {
    return comm.readBy?.some(r => r.user === user._id);
  };
  
  const getReadCount = (comm) => {
    return comm.readBy?.length || 0;
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <span className="ml-3 text-slate-600 font-bold">Loading communications...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Inter-Department Communication
            </h3>
            <p className="text-xs text-slate-600 font-bold mt-1">
              {communications.length} message{communications.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="p-6 max-h-[600px] overflow-y-auto space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm ml-3">{error}</p>
            </div>
          </div>
        )}
        
        {communications.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <MessageSquare className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500 font-bold">No communications yet</p>
            <p className="text-slate-400 text-sm mt-1">Start a conversation with other departments</p>
          </div>
        ) : (
          communications.map((comm) => {
            const isSentByMe = comm.sentBy?._id === user._id;
            
            return (
              <div 
                key={comm._id} 
                className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isSentByMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Sender Info */}
                  <div className="flex items-center gap-2 mb-2 px-2">
                    {!isSentByMe && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {comm.sentBy?.name || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-1">
                            <Building2 size={10} className="text-slate-400" />
                            <p className="text-[10px] text-slate-500">
                              {comm.sentByDepartment?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {isSentByMe && (
                      <p className="text-xs font-bold text-slate-600">You</p>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div 
                    className={`rounded-2xl p-4 shadow-sm ${
                      isSentByMe 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    {/* Message Type Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        isSentByMe 
                          ? 'bg-white/20 text-white' 
                          : getMessageTypeColor(comm.messageType)
                      }`}>
                        {getMessageTypeText(comm.messageType)}
                      </span>
                      
                      {comm.isInternal && (
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          isSentByMe 
                            ? 'bg-white/20 text-white' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <EyeOff size={10} />
                          Internal
                        </span>
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {comm.message}
                    </p>
                    
                    {/* Tagged Departments */}
                    {comm.taggedDepartments && comm.taggedDepartments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag size={12} className={isSentByMe ? 'text-white/70' : 'text-slate-500'} />
                          {comm.taggedDepartments.map((dept) => (
                            <span 
                              key={dept._id} 
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                isSentByMe 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {dept.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Attachments */}
                    {comm.attachments && comm.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                        {comm.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                              isSentByMe 
                                ? 'bg-white/10 hover:bg-white/20' 
                                : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            <FileText size={14} className={isSentByMe ? 'text-white' : 'text-slate-600'} />
                            <span className={`text-xs font-medium flex-1 truncate ${
                              isSentByMe ? 'text-white' : 'text-slate-700'
                            }`}>
                              {attachment.filename}
                            </span>
                            <Download size={12} className={isSentByMe ? 'text-white/70' : 'text-slate-400'} />
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {/* Timestamp and Read Status */}
                    <div className={`flex items-center justify-between gap-3 mt-3 pt-2 border-t ${
                      isSentByMe ? 'border-white/20' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Clock size={10} className={isSentByMe ? 'text-white/70' : 'text-slate-400'} />
                        <span className={`text-[10px] font-medium ${
                          isSentByMe ? 'text-white/70' : 'text-slate-500'
                        }`}>
                          {formatMessageTime(comm.createdAt)}
                        </span>
                      </div>
                      
                      {isSentByMe && (
                        <div className="flex items-center gap-1">
                          <CheckCheck size={12} className="text-white/70" />
                          <span className="text-[10px] font-medium text-white/70">
                            {getReadCount(comm)} read
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input Form */}
      <div className="border-t border-slate-200 p-6 bg-slate-50">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message Type and Internal Toggle */}
          <div className="flex items-center gap-3">
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="px-3 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none"
            >
              {Object.entries(MESSAGE_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {getMessageTypeText(value)}
                </option>
              ))}
            </select>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <EyeOff size={14} />
                Internal (Hidden from citizen)
              </span>
            </label>
          </div>
          
          {/* Department Tagging */}
          {departments.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tag Departments (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept._id}
                    type="button"
                    onClick={() => toggleDepartmentTag(dept._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      taggedDepartments.includes(dept._id)
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Message Input */}
          <div>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (formErrors.message) {
                  setFormErrors(prev => ({ ...prev, message: '' }));
                }
              }}
              placeholder="Type your message..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-medium resize-none"
              maxLength={1000}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-500">
                {message.length}/1000 characters
              </p>
              {formErrors.message && (
                <p className="text-xs text-red-500 font-bold">{formErrors.message}</p>
              )}
            </div>
          </div>
          
          {/* Attachments */}
          <div>
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="attachments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-indigo-300 cursor-pointer transition-colors"
            >
              <Paperclip size={16} />
              Attach Files
            </label>
            
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                    <FileText size={14} className="text-slate-600" />
                    <span className="text-xs font-medium text-slate-700 flex-1 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {formErrors.attachments && (
              <p className="text-xs text-red-500 font-bold mt-1">{formErrors.attachments}</p>
            )}
          </div>
          
          {/* Submit Error */}
          {formErrors.submit && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl">
              <div className="flex items-start">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-red-800 text-xs ml-2">{formErrors.submit}</p>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommunicationThread;
