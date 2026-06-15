import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  Building2, 
  Search, 
  Plus, 
  MoreVertical, 
  Users, 
  Briefcase, 
  ShieldAlert, 
  Trash2,
  Edit2,
  X,
  Sparkles,
  Check,
  RefreshCw,
  FolderOpen,
  MapPin,
  Calendar,
  User,
  Info
} from 'lucide-react';

const CompanyAdminsTab = ({ companyId, addActivityLog }) => {
  const { 
    getCompanyAdmins, 
    registerCompanyAdmin, 
    updateCompanyAdminDetails, 
    deleteCompanyAdminDetails 
  } = useAuth();

  // Local States
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Suspended'
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Admin Form State
  const [formData, setFormData] = useState({
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminAlternatePhone: '',
    adminGender: 'Male',
    adminDob: '',
    adminDesignation: '',
    adminDepartment: '',
    adminBio: '',
    adminAddress: '',
    adminCity: '',
    adminState: '',
    adminCountry: 'India',
    adminPincode: ''
  });

  // Fetch Admins
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminList = await getCompanyAdmins(companyId);
      setAdmins(adminList);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrator metadata records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchAdmins();
  }, [companyId]);

  // Input Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form entries
  const validateForm = () => {
    const errors = {};
    if (!formData.adminName.trim()) errors.adminName = 'Administrator full name is required';
    if (!formData.adminPhone.trim()) errors.adminPhone = 'Contact phone number is required';
    
    if (!isEditMode) {
      if (!formData.adminEmail.trim()) {
        errors.adminEmail = 'Login email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
        errors.adminEmail = 'Invalid email address format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setFormSuccess('');

    try {
      if (isEditMode) {
        // UPDATE Admin
        const updatePayload = {
          adminName: formData.adminName,
          adminPhone: formData.adminPhone,
          adminAlternatePhone: formData.adminAlternatePhone,
          adminGender: formData.adminGender,
          adminDob: formData.adminDob || null,
          adminDesignation: formData.adminDesignation,
          adminDepartment: formData.adminDepartment,
          adminBio: formData.adminBio,
          adminAddress: formData.adminAddress,
          adminCity: formData.adminCity,
          adminState: formData.adminState,
          adminCountry: formData.adminCountry,
          adminPincode: formData.adminPincode
        };

        await updateCompanyAdminDetails(editingId, updatePayload);
        setFormSuccess('Administrator profile updated successfully!');
        addActivityLog(`Modified credentials for role account: "${formData.adminName}"`);
        await fetchAdmins();
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        // CREATE Admin
        const tempPassword = 'TempPass!' + Math.random().toString(36).slice(-8) + '2026';
        const payload = {
          email: formData.adminEmail,
          password: tempPassword,
          adminData: {
            adminName: formData.adminName,
            adminPhone: formData.adminPhone,
            adminAlternatePhone: formData.adminAlternatePhone,
            adminGender: formData.adminGender,
            adminDob: formData.adminDob || null,
            adminDesignation: formData.adminDesignation,
            adminDepartment: formData.adminDepartment,
            adminBio: formData.adminBio,
            adminAddress: formData.adminAddress,
            adminCity: formData.adminCity,
            adminState: formData.adminState,
            adminCountry: formData.adminCountry,
            adminPincode: formData.adminPincode
          }
        };

        await registerCompanyAdmin(companyId, payload);
        setFormSuccess('Administrator account created successfully!');
        addActivityLog(`Provisioned new admin role: "${formData.adminName}"`);
        await fetchAdmins();
        setTimeout(() => setIsModalOpen(false), 1500);
      }
    } catch (err) {
      console.error(err);
      setFormErrors({ submit: err.message || 'Action failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle admin active status
  const handleToggleStatus = async (id, currentStatus, name) => {
    setActiveDropdownId(null);
    try {
      await updateCompanyAdminDetails(id, { isActive: !currentStatus });
      addActivityLog(`Toggled admin "${name}" active status to: ${!currentStatus}`);
      await fetchAdmins();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to toggle status.');
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id, name) => {
    setActiveDropdownId(null);
    if (!window.confirm(`Are you sure you want to deactivate and remove administrator "${name}"? This will disable their dashboard access instantly.`)) {
      return;
    }

    try {
      await deleteCompanyAdminDetails(id);
      addActivityLog(`Deactivated administrator role: "${name}"`);
      await fetchAdmins();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete administrator.');
    }
  };

  // Open modal for editing
  const handleOpenEdit = (admin) => {
    setActiveDropdownId(null);
    setIsEditMode(true);
    setEditingId(admin.id);
    setFormErrors({});
    setFormSuccess('');
    
    let formattedDate = '';
    if (admin.adminDob) {
      const dateObj = new Date(admin.adminDob);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0];
      }
    }

    setFormData({
      adminName: admin.adminName || '',
      adminEmail: admin.adminEmail || '',
      adminPhone: admin.adminPhone || '',
      adminAlternatePhone: admin.adminAlternatePhone || '',
      adminGender: admin.adminGender || 'Male',
      adminDob: formattedDate,
      adminDesignation: admin.adminDesignation || '',
      adminDepartment: admin.adminDepartment || '',
      adminBio: admin.adminBio || '',
      adminAddress: admin.adminAddress || '',
      adminCity: admin.adminCity || '',
      adminState: admin.adminState || '',
      adminCountry: admin.adminCountry || 'India',
      adminPincode: admin.adminPincode || ''
    });
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormErrors({});
    setFormSuccess('');
    setFormData({
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      adminAlternatePhone: '',
      adminGender: 'Male',
      adminDob: '',
      adminDesignation: '',
      adminDepartment: '',
      adminBio: '',
      adminAddress: '',
      adminCity: '',
      adminState: '',
      adminCountry: 'India',
      adminPincode: ''
    });
    setIsModalOpen(true);
  };

  // Filtering Logic
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = 
      admin.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.adminEmail && admin.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (admin.adminDesignation && admin.adminDesignation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (admin.adminDepartment && admin.adminDepartment.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Active') return matchesSearch && admin.isActive;
    if (statusFilter === 'Suspended') return matchesSearch && !admin.isActive;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-neutral-text tracking-tight">
            Company Role Accounts
          </h1>
          <p className="text-neutral-text-muted text-xs mt-0.5">
            Provision secure credentials, assign administrative scope, and monitor logins.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchAdmins}
            className="p-3 bg-neutral-surface hover:bg-neutral-muted text-neutral-text-muted hover:text-neutral-text border border-neutral-border rounded-theme-lg transition-colors focus:outline-none"
            title="Refresh database records"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold text-xs rounded-theme-lg shadow-theme-md hover:shadow-theme-glow transition-all duration-200 focus:outline-none"
          >
            <Plus className="w-5 h-5" />
            <span>Add Role Account</span>
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-4 shadow-theme-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status filtering */}
        <div className="flex bg-neutral-base p-1 border border-neutral-border rounded-theme-lg">
          {['All', 'Active', 'Suspended'].map((status) => (
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
            placeholder="Search role name, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text placeholder-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-neutral-text-muted font-medium">Fetching secure role records...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-danger font-semibold text-sm">
            {error}
          </div>
        ) : filteredAdmins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-border text-[11px] font-bold text-neutral-text-muted uppercase tracking-wider bg-neutral-base/40">
                  <th className="py-4 px-6">Admin Member</th>
                  <th className="py-4 px-6">Department & Job</th>
                  <th className="py-4 px-6">Contact Phone</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border text-sm">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-neutral-base/20 transition-colors">
                    
                    {/* Member Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-theme-lg bg-neutral-muted text-neutral-text font-black flex items-center justify-center border border-neutral-border uppercase shrink-0">
                          {admin.adminName ? admin.adminName.charAt(0) : 'A'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-neutral-text text-sm leading-snug truncate">
                            {admin.adminName}
                          </span>
                          <span className="text-xs text-neutral-text-muted truncate mt-0.5 max-w-[200px]">
                            {admin.adminEmail}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department / Designation */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-neutral-text font-semibold flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-neutral-text-muted" />
                          {admin.adminDesignation || 'Administrator'}
                        </span>
                        <span className="text-[10px] text-neutral-text-muted uppercase tracking-wider font-bold">
                          {admin.adminDepartment || 'Management'}
                        </span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 font-medium text-neutral-text">
                      <div className="flex flex-col">
                        <span>{admin.adminPhone || 'N/A'}</span>
                        {admin.adminAlternatePhone && (
                          <span className="text-[10px] text-neutral-text-muted mt-0.5">Alt: {admin.adminAlternatePhone}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        admin.isActive 
                          ? 'bg-success-light text-success border border-success/20' 
                          : 'bg-danger-light text-danger border border-danger/20'
                      }`}>
                        {admin.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    {/* Actions Popover */}
                    <td className="py-4 px-6 text-right relative">
                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === admin.id ? null : admin.id)}
                        className="p-1.5 rounded-theme-md text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text transition-colors focus:outline-none"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdownId === admin.id && (
                        <div className="absolute right-6 mt-1 w-[180px] bg-neutral-surface border border-neutral-border rounded-theme-lg shadow-theme-lg py-1.5 z-40 text-left animate-in fade-in slide-in-from-top-1 duration-150">
                          <button 
                            onClick={() => handleOpenEdit(admin)}
                            className="w-full px-4 py-2 text-xs text-neutral-text hover:bg-neutral-base flex items-center gap-2 transition-colors font-medium"
                          >
                            <Edit2 className="w-4 h-4 text-neutral-text-muted" />
                            <span>Edit Profile</span>
                          </button>
                          
                          <button 
                            onClick={() => handleToggleStatus(admin.id, admin.isActive, admin.adminName)}
                            className={`w-full px-4 py-2 text-xs hover:bg-neutral-base flex items-center gap-2 transition-colors font-medium ${
                              admin.isActive ? 'text-danger' : 'text-success'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>{admin.isActive ? 'Suspend' : 'Activate'}</span>
                          </button>

                          <div className="border-t border-neutral-border my-1" />
                          
                          <button 
                            onClick={() => handleDeleteAdmin(admin.id, admin.adminName)}
                            className="w-full px-4 py-2 text-xs text-danger hover:bg-danger-light flex items-center gap-2 transition-colors font-semibold"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Remove Account</span>
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
            <p className="text-sm text-neutral-text-muted font-medium">No role accounts provisioned.</p>
          </div>
        )}
      </div>

      {/* PROVISION FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm"
            onClick={() => { if(!submitting) setIsModalOpen(false); }}
          />

          <div className="relative w-full max-w-2xl bg-neutral-surface rounded-theme-2xl shadow-theme-xl border border-neutral-border z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-neutral-text">
                  {isEditMode ? 'Modify Administrator Profile' : 'Add Corporate Role Account'}
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
                
                {/* Section 1: Identity */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                    Workspace Linkage & Identity
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Admin Full Name *</label>
                      <input
                        type="text"
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleInputChange}
                        placeholder="e.g. Sarah Connor"
                        required
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.adminName ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.adminName && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.adminName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Login Email Address *</label>
                      <input
                        type="email"
                        name="adminEmail"
                        value={formData.adminEmail}
                        onChange={handleInputChange}
                        placeholder="e.g. sarah@cyberdyne.com"
                        required
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.adminEmail ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting || isEditMode}
                      />
                      {formErrors.adminEmail && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.adminEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Contact Phone *</label>
                      <input
                        type="text"
                        name="adminPhone"
                        value={formData.adminPhone}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 98765 43210"
                        required
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.adminPhone ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.adminPhone && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.adminPhone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Alternate Phone</label>
                      <input
                        type="text"
                        name="adminAlternatePhone"
                        value={formData.adminAlternatePhone}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Gender</label>
                      <select
                        name="adminGender"
                        value={formData.adminGender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="adminDob"
                        value={formData.adminDob}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Roles */}
                <div className="space-y-4 pt-1">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                    Corporate Department & Roles
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Job Designation</label>
                      <input
                        type="text"
                        name="adminDesignation"
                        value={formData.adminDesignation}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Recruiter"
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Corporate Department</label>
                      <input
                        type="text"
                        name="adminDepartment"
                        value={formData.adminDepartment}
                        onChange={handleInputChange}
                        placeholder="e.g. Human Resources"
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-neutral-text mb-1">Bio / Profile Notes</label>
                      <textarea
                        name="adminBio"
                        value={formData.adminBio}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Address */}
                <div className="space-y-4 pt-1">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                    Address Records
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-neutral-text mb-1">Residence Address</label>
                      <input
                        type="text"
                        name="adminAddress"
                        value={formData.adminAddress}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">City</label>
                      <input
                        type="text"
                        name="adminCity"
                        value={formData.adminCity}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">State</label>
                      <input
                        type="text"
                        name="adminState"
                        value={formData.adminState}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Country</label>
                      <input
                        type="text"
                        name="adminCountry"
                        value={formData.adminCountry}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Pincode</label>
                      <input
                        type="text"
                        name="adminPincode"
                        value={formData.adminPincode}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-neutral-base border-t border-neutral-border flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-neutral-border hover:bg-neutral-muted text-neutral-text text-sm font-semibold rounded-theme-lg transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-neutral-textInverse text-sm font-bold rounded-theme-lg shadow-theme-sm transition-all focus:outline-none"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                  ) : null}
                  <span>{isEditMode ? 'Update Account' : 'Provision Account'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyAdminsTab;
