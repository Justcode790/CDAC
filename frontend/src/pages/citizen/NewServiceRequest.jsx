/**
 * SUVIDHA 2026 - New Service Request Page
 * 
 * Unified form for all service request types:
 * - Complaints, Certificates, Licenses, Permits, RTI
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  createServiceRequest, 
  validateServiceRequestData 
} from '../../services/serviceRequestService';
import { getDepartments } from '../../services/departmentService';
import { 
  SERVICE_REQUEST_TYPES,
  CERTIFICATE_TYPES,
  LICENSE_TYPES,
  PERMIT_TYPES,
  RTI_CATEGORIES,
  COMPLAINT_CATEGORIES,
  ROUTES 
} from '../../utils/constants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react';

const NewServiceRequest = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    requestType: 'COMPLAINT',
    title: '',
    description: '',
    priority: 'MEDIUM',
    department: '',
    subDepartment: '',
    category: '',
    certificateType: '',
    licenseType: '',
    licenseAction: 'NEW',
    permitType: '',
    rtiCategory: '',
    location: {
      address: '',
      pincode: ''
    },
    serviceData: {}
  });
  
  useEffect(() => {
    fetchDepartments();
  }, []);
  
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
      const response = await getDepartments();
      if (response.success) {
        setDepartments(response.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };
  
  const fetchSubDepartments = async (departmentId) => {
    try {
      const response = await getDepartments();
      if (response.success) {
        const dept = response.departments.find(d => d._id === departmentId);
        if (dept && dept.subDepartments) {
          setSubDepartments(dept.subDepartments);
        }
      }
    } catch (error) {
      console.error('Error fetching sub-departments:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file count
    if (files.length + selectedFiles.length > 5) {
      setErrors(prev => ({ ...prev, files: 'Maximum 5 files allowed' }));
      return;
    }
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, files: 'Only JPEG, PNG, and PDF files allowed' }));
        return false;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, files: 'File size must be less than 10MB' }));
        return false;
      }
      
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
    setErrors(prev => ({ ...prev, files: '' }));
  };
  
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateServiceRequestData(formData.requestType, formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await createServiceRequest(formData, files);
      
      if (response.success) {
        // Show success message and redirect
        navigate(ROUTES.CITIZEN_DASHBOARD, {
          state: {
            message: `${formData.requestType} request submitted successfully!`,
            requestNumber: response.serviceRequest.requestNumber
          }
        });
      }
    } catch (error) {
      console.error('Error creating service request:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to submit request' });
    } finally {
      setLoading(false);
    }
  };
  
  const renderRequestTypeSelector = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Select Service Type</h2>
      <p className="text-gray-600">Choose the type of service you need</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Object.entries(SERVICE_REQUEST_TYPES).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, requestType: value }));
              setCurrentStep(2);
            }}
            className={`p-6 border-2 rounded-lg text-left transition-all hover:border-blue-500 hover:shadow-md ${
              formData.requestType === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">{key.replace(/_/g, ' ')}</h3>
            <p className="text-sm text-gray-600">
              {getServiceTypeDescription(value)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
  
  const renderTypeSpecificFields = () => {
    switch (formData.requestType) {
      case 'COMPLAINT':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {Object.entries(COMPLAINT_CATEGORIES).map(([key, value]) => (
                <option key={key} value={value}>{key.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
        );
        
      case 'CERTIFICATE':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Type *
            </label>
            <select
              name="certificateType"
              value={formData.certificateType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Certificate Type</option>
              {Object.entries(CERTIFICATE_TYPES).map(([key, value]) => (
                <option key={key} value={value}>{key.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.certificateType && <p className="text-red-500 text-sm mt-1">{errors.certificateType}</p>}
          </div>
        );
        
      case 'LICENSE':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Type *
              </label>
              <select
                name="licenseType"
                value={formData.licenseType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select License Type</option>
                {Object.entries(LICENSE_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>{key.replace(/_/g, ' ')}</option>
                ))}
              </select>
              {errors.licenseType && <p className="text-red-500 text-sm mt-1">{errors.licenseType}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Action *
              </label>
              <select
                name="licenseAction"
                value={formData.licenseAction}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="NEW">New Application</option>
                <option value="RENEWAL">Renewal</option>
                <option value="MODIFICATION">Modification</option>
                <option value="VERIFICATION">Verification</option>
              </select>
              {errors.licenseAction && <p className="text-red-500 text-sm mt-1">{errors.licenseAction}</p>}
            </div>
          </>
        );
        
      case 'PERMIT':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permit Type *
            </label>
            <select
              name="permitType"
              value={formData.permitType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Permit Type</option>
              {Object.entries(PERMIT_TYPES).map(([key, value]) => (
                <option key={key} value={value}>{key.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.permitType && <p className="text-red-500 text-sm mt-1">{errors.permitType}</p>}
          </div>
        );
        
      case 'RTI':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RTI Category *
            </label>
            <select
              name="rtiCategory"
              value={formData.rtiCategory}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select RTI Category</option>
              {Object.entries(RTI_CATEGORIES).map(([key, value]) => (
                <option key={key} value={value}>{key.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.rtiCategory && <p className="text-red-500 text-sm mt-1">{errors.rtiCategory}</p>}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const renderRequestForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Service Type:</strong> {formData.requestType.replace(/_/g, ' ')}
        </p>
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="text-sm text-blue-600 hover:underline mt-2"
        >
          Change Service Type
        </button>
      </div>
      
      {/* Type-specific fields */}
      {renderTypeSpecificFields()}
      
      {/* Common fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          maxLength={200}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Brief title for your request"
          required
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          maxLength={2000}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Provide detailed information about your request"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.description.length}/2000 characters
        </p>
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Department *
        </label>
        <select
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Department</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>
        {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
      </div>
      
      {formData.department && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub-Department *
          </label>
          <select
            name="subDepartment"
            value={formData.subDepartment}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Sub-Department</option>
            {subDepartments.map(subDept => (
              <option key={subDept._id} value={subDept._id}>{subDept.name}</option>
            ))}
          </select>
          {errors.subDepartment && <p className="text-red-500 text-sm mt-1">{errors.subDepartment}</p>}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location Address
        </label>
        <input
          type="text"
          name="location.address"
          value={formData.location.address}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter location address (if applicable)"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pincode
        </label>
        <input
          type="text"
          name="location.pincode"
          value={formData.location.pincode}
          onChange={handleInputChange}
          pattern="[1-9][0-9]{5}"
          maxLength={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter 6-digit pincode"
        />
      </div>
      
      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attach Documents (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-2">
            Upload supporting documents (Max 5 files, 10MB each)
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Supported formats: JPEG, PNG, PDF
          </p>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
          >
            Choose Files
          </label>
        </div>
        {errors.files && <p className="text-red-500 text-sm mt-1">{errors.files}</p>}
        
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errors.submit}</p>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => navigate(ROUTES.CITIZEN_DASHBOARD)}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Request</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(ROUTES.CITIZEN_DASHBOARD)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Service Request</h1>
                <p className="text-sm text-gray-600">Submit a new request for government services</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 1 ? renderRequestTypeSelector() : renderRequestForm()}
        </div>
      </main>
    </div>
  );
};

// Helper function
const getServiceTypeDescription = (type) => {
  const descriptions = {
    'COMPLAINT': 'Report issues related to infrastructure, sanitation, utilities, and public services',
    'CERTIFICATE': 'Apply for birth, death, marriage, residence, income, and other certificates',
    'LICENSE': 'Apply for new licenses, renewals, or modifications for trade, food, health, etc.',
    'PERMIT': 'Request permits for construction, events, utilities, and other activities',
    'RTI': 'File Right to Information requests for government records and information'
  };
  return descriptions[type] || '';
};

export default NewServiceRequest;
