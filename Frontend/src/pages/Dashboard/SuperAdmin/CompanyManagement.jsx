import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from '../../../api/axios';
import { 
  Building2, 
  Search, 
  Plus, 
  MoreVertical, 
  Globe, 
  MapPin, 
  Trash2,
  Edit2, 
  Check, 
  X, 
  ShieldAlert, 
  Sparkles,
  RefreshCw,
  FolderOpen,
  Upload,
  Briefcase,
  Users
} from 'lucide-react';

const CompanyManagement = () => {
  const { 
    getAllCompanies, 
    registerCompanyWorkspace, 
    updateCompanyDetails, 
    deleteCompanyDetails 
  } = useAuth();

  // Page States
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Inactive'
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Image Upload States
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  // Redesigned Registration Form State
  const [formData, setFormData] = useState({
    // Company Profile Data
    companyName: '',
    companyDescription: '',
    companyAddress: '',
    companyState: '',
    companyCity: '',
    companyPincode: '',
    companyWebsite: '',
    industryType: 'Technology',
    companySize: '11-50 employees',
    companyEmail: '',
    companyPhone: '',
    companyLogo: '',
    // Credentials
    password: '',
    confirmPassword: ''
  });

  const backendUrl = 'http://localhost:5000';

  // Fetch Companies on mount
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch corporate profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle File Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validations
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFormErrors((prev) => ({ ...prev, companyLogo: 'Only image files (JPG, PNG, GIF, WEBP) are allowed' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      setFormErrors((prev) => ({ ...prev, companyLogo: 'File size must not exceed 2MB' }));
      return;
    }

    setLogoUploading(true);
    setFormErrors((prev) => ({ ...prev, companyLogo: '' }));

    const uploadData = new FormData();
    uploadData.append('logo', file);

    try {
      const response = await axios.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setFormData((prev) => ({ ...prev, companyLogo: response.data.logoUrl }));
        setLogoPreview(backendUrl + response.data.logoUrl);
      }
    } catch (err) {
      console.error('File upload error:', err);
      // Mock upload preview if backend connection is failed
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData((prev) => ({ ...prev, companyLogo: '/uploads/mock-logo.png' }));
      };
      reader.readAsDataURL(file);
    } finally {
      setLogoUploading(false);
    }
  };

  // Validate form entries
  const validateForm = () => {
    const errors = {};
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.companyDescription.trim()) errors.companyDescription = 'Short description is required';
    if (!formData.companyAddress.trim()) errors.companyAddress = 'Corporate address is required';
    if (!formData.companyCity.trim()) errors.companyCity = 'City name is required';
    if (!formData.companyState.trim()) errors.companyState = 'State is required';
    if (!formData.companyPincode.trim()) errors.companyPincode = 'Pincode is required';
    if (!formData.companyWebsite.trim()) errors.companyWebsite = 'Website URL is required';
    if (!formData.companyEmail.trim()) {
      errors.companyEmail = 'Company email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
      errors.companyEmail = 'Email format is invalid';
    }
    if (!formData.companyPhone.trim()) errors.companyPhone = 'Phone number is required';

    if (!isEditMode) {
      if (!formData.password || formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setFormSuccess('');

    try {
      if (isEditMode) {
        // UPDATE Company
        const updatePayload = {
          companyName: formData.companyName,
          companyDescription: formData.companyDescription,
          companyAddress: formData.companyAddress,
          companyState: formData.companyState,
          companyCity: formData.companyCity,
          companyPincode: formData.companyPincode,
          companyWebsite: formData.companyWebsite,
          industryType: formData.industryType,
          companySize: formData.companySize,
          companyEmail: formData.companyEmail,
          companyPhone: formData.companyPhone,
          companyLogo: formData.companyLogo
        };

        await updateCompanyDetails(editingId, updatePayload);
        setFormSuccess('Company profile parameters updated successfully!');
        await fetchCompanies();
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        // REGISTER Company Workspace
        const payload = {
          email: formData.companyEmail,
          password: formData.password,
          companyData: {
            companyName: formData.companyName,
            companyDescription: formData.companyDescription,
            companyAddress: formData.companyAddress,
            companyState: formData.companyState,
            companyCity: formData.companyCity,
            companyPincode: formData.companyPincode,
            companyWebsite: formData.companyWebsite,
            industryType: formData.industryType,
            companySize: formData.companySize,
            companyEmail: formData.companyEmail,
            companyPhone: formData.companyPhone,
            companyLogo: formData.companyLogo
          }
        };

        await registerCompanyWorkspace(payload);
        setFormSuccess('Workspace and credentials provisioned successfully.');
        await fetchCompanies();
        setTimeout(() => setIsModalOpen(false), 1500);
      }
    } catch (err) {
      console.error(err);
      setFormErrors({ submit: err.message || 'Action failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle company active status
  const handleToggleStatus = async (id, currentStatus) => {
    setActiveDropdownId(null);
    try {
      await updateCompanyDetails(id, { isActive: !currentStatus });
      await fetchCompanies();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to toggle status.');
    }
  };

  // Delete company workspace cascade
  const handleDeleteCompany = async (id) => {
    setActiveDropdownId(null);
    if (!window.confirm('WARNING: Deleting this company profile will permanently clean up its client databases, admin logs, and staff files. This action is irreversible. Continue?')) {
      return;
    }

    try {
      await deleteCompanyDetails(id);
      await fetchCompanies();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete workspace.');
    }
  };

  // Open modal for editing
  const handleOpenEdit = (company) => {
    setActiveDropdownId(null);
    setIsEditMode(true);
    setEditingId(company.id);
    setFormErrors({});
    setFormSuccess('');
    setLogoPreview(company.companyLogo ? (company.companyLogo.startsWith('data:') ? company.companyLogo : backendUrl + company.companyLogo) : '');
    setFormData({
      companyName: company.companyName || '',
      companyDescription: company.companyDescription || '',
      companyAddress: company.companyAddress || '',
      companyState: company.companyState || '',
      companyCity: company.companyCity || '',
      companyPincode: company.companyPincode || '',
      companyWebsite: company.companyWebsite || '',
      industryType: company.industryType || 'Technology',
      companySize: company.companySize || '11-50 employees',
      companyEmail: company.companyEmail || '',
      companyPhone: company.companyPhone || '',
      companyLogo: company.companyLogo || '',
      password: '••••••••',
      confirmPassword: '••••••••'
    });
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormErrors({});
    setFormSuccess('');
    setLogoPreview('');
    setFormData({
      companyName: '',
      companyDescription: '',
      companyAddress: '',
      companyState: '',
      companyCity: '',
      companyPincode: '',
      companyWebsite: '',
      industryType: 'Technology',
      companySize: '11-50 employees',
      companyEmail: '',
      companyPhone: '',
      companyLogo: '',
      password: '',
      confirmPassword: ''
    });
    setIsModalOpen(true);
  };

  // Filter lists
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = 
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.companyEmail && c.companyEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.industryType && c.industryType.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Active') return matchesSearch && c.isActive;
    if (statusFilter === 'Inactive') return matchesSearch && !c.isActive;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Enterprise Subdomains</h3>
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-text tracking-tight mt-0.5">
            Company Profile Oversight
          </h1>
          <p className="text-neutral-text-muted text-sm mt-1">
            Register corporate structures, update database profiles, and manage system subdomains.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchCompanies}
            className="p-3 bg-neutral-surface hover:bg-neutral-muted text-neutral-text-muted hover:text-neutral-text border border-neutral-border rounded-theme-lg transition-colors focus:outline-none"
            title="Refresh database records"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold text-sm rounded-theme-lg shadow-theme-md hover:shadow-theme-glow transition-all duration-200 focus:outline-none"
          >
            <Plus className="w-5 h-5" />
            <span>Register Company</span>
          </button>
        </div>
      </div>

      {/* Grid summary widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 shadow-theme-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-theme-lg bg-primary-light text-primary flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-text-muted font-bold uppercase tracking-wider">Total Companies</p>
            <p className="text-2xl font-black text-neutral-text mt-1">{companies.length}</p>
          </div>
        </div>

        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 shadow-theme-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-theme-lg bg-success-light text-success flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-text-muted font-bold uppercase tracking-wider">Active Workspace Tunnels</p>
            <p className="text-2xl font-black text-success mt-1">{companies.filter(c => c.isActive).length}</p>
          </div>
        </div>

        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 shadow-theme-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-theme-lg bg-danger-light text-danger flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-text-muted font-bold uppercase tracking-wider">Suspended Databases</p>
            <p className="text-2xl font-black text-danger mt-1">{companies.filter(c => !c.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Table controls */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-4 shadow-theme-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status filtering */}
        <div className="flex bg-neutral-base p-1 border border-neutral-border rounded-theme-lg">
          {['All', 'Active', 'Inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-theme-md text-xs font-semibold transition-all duration-150 focus:outline-none ${
                statusFilter === status 
                  ? 'bg-neutral-surface text-primary shadow-theme-sm' 
                  : 'text-neutral-text-muted hover:text-neutral-text'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative md:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted" />
          <input
            type="text"
            placeholder="Search company or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text placeholder-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Companies database table */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-neutral-text-muted font-medium">Fetching secure records...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-danger font-semibold text-sm">
            {error}
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-border text-[11px] font-bold text-neutral-text-muted uppercase tracking-wider bg-neutral-base/40">
                  <th className="py-4 px-6">Company / Description</th>
                  <th className="py-4 px-6">Industry & Size</th>
                  <th className="py-4 px-6">Contact / Web</th>
                  <th className="py-4 px-6">System Subdomain</th>
                  <th className="py-4 px-6 text-center">Tunnels</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border text-sm">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-neutral-base/20 transition-colors">
                    
                    {/* Brand details */}
                    <td className="py-4 px-6 max-w-[300px]">
                      <div className="flex items-center gap-3.5">
                        {company.companyLogo ? (
                          <img 
                            src={company.companyLogo.startsWith('data:') ? company.companyLogo : backendUrl + company.companyLogo} 
                            alt={company.companyName}
                            className="w-10 h-10 object-cover rounded-theme-lg border border-neutral-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-theme-lg bg-neutral-muted text-neutral-text font-black flex items-center justify-center border border-neutral-border">
                            {company.companyName.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-text text-sm leading-snug">
                            {company.companyName}
                          </span>
                          <span className="text-xs text-neutral-text-muted truncate mt-0.5 max-w-[200px]">
                            {company.companyDescription}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Industry & Size */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-neutral-text font-semibold flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-neutral-text-muted" />
                          {company.industryType || 'Technology'}
                        </span>
                        <span className="text-[10px] text-neutral-text-muted flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {company.companySize || '11-50 employees'}
                        </span>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-text text-xs">{company.companyEmail || 'admin@company.com'}</span>
                        <span className="text-[10px] text-neutral-text-muted mt-0.5 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {company.companyWebsite || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Subdomain */}
                    <td className="py-4 px-6 font-mono text-xs text-neutral-text-muted font-bold">
                      {company.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.jobtracker.com
                    </td>

                    {/* Active Tunnel Status */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        company.isActive 
                          ? 'bg-success-light text-success border border-success/20' 
                          : 'bg-danger-light text-danger border border-danger/20'
                      }`}>
                        {company.isActive ? 'Active' : 'Offline'}
                      </span>
                    </td>

                    {/* Actions dropdown */}
                    <td className="py-4 px-6 text-right relative">
                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === company.id ? null : company.id)}
                        className="p-1.5 rounded-theme-md text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text transition-colors focus:outline-none"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdownId === company.id && (
                        <div className="absolute right-6 mt-1 w-[180px] bg-neutral-surface border border-neutral-border rounded-theme-lg shadow-theme-lg py-1.5 z-40 text-left animate-in fade-in slide-in-from-top-1 duration-150">
                          <button 
                            onClick={() => handleOpenEdit(company)}
                            className="w-full px-4 py-2 text-xs text-neutral-text hover:bg-neutral-base flex items-center gap-2 transition-colors font-medium"
                          >
                            <Edit2 className="w-4 h-4 text-neutral-text-muted" />
                            <span>Edit Details</span>
                          </button>
                          
                          <button 
                            onClick={() => handleToggleStatus(company.id, company.isActive)}
                            className={`w-full px-4 py-2 text-xs hover:bg-neutral-base flex items-center gap-2 transition-colors font-medium ${
                              company.isActive ? 'text-danger' : 'text-success'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>{company.isActive ? 'Suspend' : 'Activate'}</span>
                          </button>

                          <div className="border-t border-neutral-border my-1" />
                          
                          <button 
                            onClick={() => handleDeleteCompany(company.id)}
                            className="w-full px-4 py-2 text-xs text-danger hover:bg-danger-light flex items-center gap-2 transition-colors font-semibold"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Company</span>
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <FolderOpen className="w-10 h-10 text-neutral-text-muted" />
            <p className="text-sm text-neutral-text-muted font-medium">No company records found.</p>
          </div>
        )}
      </div>

      {/* REGISTER / EDIT MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm"
            onClick={() => { if(!submitting) setIsModalOpen(false); }}
          />

          {/* Modal box */}
          <div className="relative w-full max-w-2xl bg-neutral-surface rounded-theme-2xl shadow-theme-xl border border-neutral-border z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-neutral-text">
                  {isEditMode ? 'Modify Corporate Profile' : 'Register Corporate Workspace'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-theme-md text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 flex flex-col">
              
              {/* Feedback messages */}
              {formSuccess && (
                <div className="mx-6 mt-4 p-3.5 bg-success-light border border-success/20 text-success text-xs font-semibold rounded-theme-lg flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formErrors.submit && (
                <div className="mx-6 mt-4 p-3.5 bg-danger-light border border-danger/20 text-danger text-xs font-semibold rounded-theme-lg">
                  {formErrors.submit}
                </div>
              )}

              <div className="p-6 space-y-5 flex-1">
                
                {/* SECTION 1: CORPORATE INFO */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                    Corporate Identity
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Company Legal Name *</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g. Apex Global Logistics"
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.companyName ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.companyName && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.companyName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Company Website *</label>
                      <input
                        type="text"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleInputChange}
                        placeholder="e.g. www.apexglobal.com"
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.companyWebsite ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.companyWebsite && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.companyWebsite}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-neutral-text mb-1">Company Description *</label>
                      <textarea
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleInputChange}
                        placeholder="Provide a brief description of company work domain..."
                        rows="2"
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.companyDescription ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.companyDescription && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.companyDescription}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Industry Type</label>
                      <select
                        name="industryType"
                        value={formData.industryType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        disabled={submitting}
                      >
                        <option value="Technology">Technology / SaaS</option>
                        <option value="Logistics">Logistics & Supply Chain</option>
                        <option value="Biotech">Biotech & Pharmaceuticals</option>
                        <option value="Finance">Finance & Investment</option>
                        <option value="Healthcare">Healthcare Services</option>
                        <option value="Retail">Retail & E-commerce</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Company Size</label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        disabled={submitting}
                      >
                        <option value="1-10 employees">1-10 employees</option>
                        <option value="11-50 employees">11-50 employees</option>
                        <option value="51-200 employees">51-200 employees</option>
                        <option value="201-500 employees">201-500 employees</option>
                        <option value="500+ employees">500+ employees</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* LOGO UPLOAD AREA */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-neutral-text">Company Logo</label>
                  <div className="flex items-center gap-5">
                    {logoPreview ? (
                      <div className="relative group">
                        <img 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          className="w-16 h-16 object-cover rounded-theme-xl border border-neutral-border" 
                        />
                        <button
                          type="button"
                          onClick={() => { setLogoPreview(''); setFormData(p => ({ ...p, companyLogo: '' })); }}
                          className="absolute -top-1.5 -right-1.5 p-0.5 bg-danger text-neutral-textInverse rounded-full hover:bg-danger-hover transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-16 h-16 rounded-theme-xl border-2 border-dashed border-neutral-border flex flex-col items-center justify-center text-neutral-text-muted hover:text-primary hover:border-primary transition-all cursor-pointer">
                        <Upload className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={logoUploading || submitting}
                        />
                      </label>
                    )}
                    
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-neutral-text">Upload corporate badge/logo</p>
                      <p className="text-neutral-text-muted mt-0.5">JPEG, PNG, WEBP, or GIF. Max upload limit 2MB.</p>
                      {logoUploading && <p className="text-primary font-bold mt-1 animate-pulse">Uploading file to server...</p>}
                      {formErrors.companyLogo && <p className="text-danger font-semibold mt-1">{formErrors.companyLogo}</p>}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ADRESS & LOCATION */}
                <div className="space-y-4 pt-1">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                    Corporate Address
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-neutral-text mb-1">Office Street Address *</label>
                      <input
                        type="text"
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleInputChange}
                        placeholder="e.g. 101, BKC Road, Bandra"
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.companyAddress ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.companyAddress && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.companyAddress}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">City *</label>
                      <input
                        type="text"
                        name="companyCity"
                        value={formData.companyCity}
                        onChange={handleInputChange}
                        placeholder="e.g. Mumbai"
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.companyCity ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.companyCity && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.companyCity}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">State *</label>
                      <input
                        type="text"
                        name="companyState"
                        value={formData.companyState}
                        onChange={handleInputChange}
                        placeholder="e.g. Maharashtra"
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.companyState ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.companyState && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.companyState}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Pincode *</label>
                      <input
                        type="text"
                        name="companyPincode"
                        value={formData.companyPincode}
                        onChange={handleInputChange}
                        placeholder="e.g. 400051"
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.companyPincode ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.companyPincode && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.companyPincode}</p>}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: CREDENTIALS (Hidden in Edit mode) */}
                <div className="space-y-4 pt-1">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                    Contact & Authentication Credentials
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Company Login Email *</label>
                      <input
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleInputChange}
                        placeholder="e.g. contact@company.com"
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.companyEmail ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting || isEditMode}
                      />
                      {formErrors.companyEmail && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.companyEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Company Contact Phone *</label>
                      <input
                        type="text"
                        name="companyPhone"
                        value={formData.companyPhone}
                        onChange={handleInputChange}
                        placeholder="e.g. 0221234567"
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.companyPhone ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.companyPhone && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.companyPhone}</p>}
                    </div>

                    {!isEditMode && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-neutral-text mb-1">Password *</label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Minimum 6 characters"
                            className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                              formErrors.password ? 'border-danger' : 'border-neutral-border'
                            }`}
                            disabled={submitting}
                          />
                          {formErrors.password && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.password}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-text mb-1">Confirm Password *</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Re-enter password"
                            className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                              formErrors.confirmPassword ? 'border-danger' : 'border-neutral-border'
                            }`}
                            disabled={submitting}
                          />
                          {formErrors.confirmPassword && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.confirmPassword}</p>}
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Form submit footer */}
              <div className="px-6 py-4 border-t border-neutral-border bg-neutral-base/10 flex justify-end gap-3 rounded-b-theme-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-border hover:bg-neutral-muted text-neutral-text text-sm font-semibold rounded-theme-lg transition-colors focus:outline-none"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || logoUploading}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-neutral-textInverse text-sm font-bold rounded-theme-lg shadow-theme-sm hover:shadow-theme-glow transition-all duration-200 focus:outline-none"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>{submitting ? 'Processing...' : isEditMode ? 'Save Profile' : 'Register Workspace'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyManagement;