/**
 * SUVIDHA 2026 - Demo Credentials Display
 * 
 * Displays login credentials for hackathon evaluation
 * ONLY VISIBLE IN DEMO MODE
 */

import { useState, useEffect } from 'react';
import { getDemoCredentials } from '../services/demoService';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  User, 
  Phone, 
  Key, 
  Building2, 
  AlertTriangle,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const DemoCredentials = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    superAdmin: true,
    officers: false,
    citizens: false
  });

  // Check if demo mode is enabled (works in both dev and production)
  const isDemoMode = import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === 'true';

  useEffect(() => {
    if (isDemoMode) {
      fetchCredentials();
    }
  }, [isDemoMode]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await getDemoCredentials();
      setCredentials(response.credentials);
    } catch (err) {
      setError('Failed to load demo credentials');
      console.error('Demo credentials error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Don't render if not in demo mode
  if (!isDemoMode) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-amber-400">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !credentials) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={32} className="animate-pulse" />
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Hackathon Evaluator Credentials
          </h2>
        </div>
        <p className="text-amber-100 text-sm font-bold">
          🎯 Demo Mode Only - For Evaluation Purposes
        </p>
      </div>

      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        
        {/* Super Admin Section */}
        {credentials.superAdmin && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden">
            <button
              onClick={() => toggleSection('superAdmin')}
              className="w-full p-4 flex items-center justify-between hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Shield className="text-purple-600" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-lg text-purple-900">Super Admin</h3>
                  <p className="text-xs text-purple-600 font-bold">Full System Access</p>
                </div>
              </div>
              {expandedSections.superAdmin ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.superAdmin && (
              <div className="p-4 border-t border-purple-100 space-y-3">
                <CredentialField
                  icon={User}
                  label="Email"
                  value={credentials.superAdmin.username}
                  onCopy={() => copyToClipboard(credentials.superAdmin.username, 'superadmin-email')}
                  copied={copiedField === 'superadmin-email'}
                />
                <CredentialField
                  icon={Key}
                  label="Password"
                  value={credentials.superAdmin.password}
                  onCopy={() => copyToClipboard(credentials.superAdmin.password, 'superadmin-pass')}
                  copied={copiedField === 'superadmin-pass'}
                  isPassword
                />
                <button
                  onClick={() => navigate(credentials.superAdmin.loginEndpoint)}
                  className="w-full mt-2 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                >
                  Login as Super Admin →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Officers Section */}
        {credentials.officers && credentials.officers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden">
            <button
              onClick={() => toggleSection('officers')}
              className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Building2 className="text-blue-600" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-lg text-blue-900">
                    Officers ({credentials.officers.length})
                  </h3>
                  <p className="text-xs text-blue-600 font-bold">Department Access</p>
                </div>
              </div>
              {expandedSections.officers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.officers && (
              <div className="p-4 border-t border-blue-100 space-y-4 max-h-96 overflow-y-auto">
                {credentials.officers.slice(0, 5).map((officer, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-sm text-blue-900">{officer.name}</p>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-bold">
                        {officer.subDepartment}
                      </span>
                    </div>
                    <CredentialField
                      icon={User}
                      label="Officer ID"
                      value={officer.username}
                      onCopy={() => copyToClipboard(officer.username, `officer-${index}-id`)}
                      copied={copiedField === `officer-${index}-id`}
                      compact
                    />
                    <CredentialField
                      icon={Key}
                      label="Password"
                      value={officer.password}
                      onCopy={() => copyToClipboard(officer.password, `officer-${index}-pass`)}
                      copied={copiedField === `officer-${index}-pass`}
                      isPassword
                      compact
                    />
                  </div>
                ))}
                <button
                  onClick={() => navigate('/officer/login')}
                  className="w-full mt-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Login as Officer →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Citizens Section */}
        {credentials.citizens && credentials.citizens.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden">
            <button
              onClick={() => toggleSection('citizens')}
              className="w-full p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Phone className="text-green-600" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-lg text-green-900">
                    Citizens ({credentials.citizens.length})
                  </h3>
                  <p className="text-xs text-green-600 font-bold">OTP-Based Login</p>
                </div>
              </div>
              {expandedSections.citizens ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.citizens && (
              <div className="p-4 border-t border-green-100 space-y-4">
                {credentials.citizens.map((citizen, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded-xl space-y-2">
                    <p className="font-black text-sm text-green-900">{citizen.name}</p>
                    <CredentialField
                      icon={Phone}
                      label="Mobile"
                      value={citizen.username}
                      onCopy={() => copyToClipboard(citizen.username, `citizen-${index}-mobile`)}
                      copied={copiedField === `citizen-${index}-mobile`}
                      compact
                    />
                    <p className="text-xs text-green-700 font-bold italic">
                      {citizen.note}
                    </p>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/citizen/login')}
                  className="w-full mt-2 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                >
                  Login as Citizen →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Warning Footer */}
        <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1">
                Security Notice
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                These credentials are visible ONLY in development/demo mode. 
                Production builds will NOT expose this information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Credential Field Component
const CredentialField = ({ icon: Icon, label, value, onCopy, copied, isPassword, compact }) => {
  return (
    <div className={`flex items-center justify-between ${compact ? 'gap-2' : 'gap-3'}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon size={compact ? 14 : 16} className="text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-black text-slate-400 uppercase tracking-wider ${compact ? 'mb-0' : 'mb-1'}`}>
            {label}
          </p>
          <p className={`font-mono font-bold text-slate-900 truncate ${compact ? 'text-xs' : 'text-sm'} ${isPassword ? 'tracking-wider' : ''}`}>
            {value}
          </p>
        </div>
      </div>
      <button
        onClick={onCopy}
        className={`p-2 rounded-lg transition-all flex-shrink-0 ${
          copied 
            ? 'bg-green-100 text-green-600' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
        title="Copy to clipboard"
      >
        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
};

export default DemoCredentials;
