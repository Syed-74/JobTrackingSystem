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
  Info,
  Shield
} from 'lucide-react';

const CompanyAdminsTab = ({ companyId, addActivityLog }) => {
  const { 
    getAllCompanyAccountManage, 
    registerCompanyAccountManage, 
    updateCompanyAccountManage, 
    deleteCompanyAccountManage,
    getAllDepartments
  } = useAuth();

  // Local States for Accounts
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Suspended'
  
  // Local States for Departments
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // Modal & Form States for Accounts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Account Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    contactPhone: '',
    alternatePhone: '',
    gender: 'Male',
    dateOfBirth: '',
    departmentId: '',
    designation: '',
    bio: '',
    address: '',
    role: 'Recruiter'
  });

  // Fetch Accounts
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllCompanyAccountManage(companyId);
      setAdmins(list || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch company staff account records.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Departments
  const fetchDepartments = async () => {
    setLoadingDepts(true);
    try {
      const list = await getAllDepartments(companyId);
      setDepartments(list || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchAdmins();
      fetchDepartments();
    }
  }, [companyId]);

  // Input Change Handlers
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

  // Validate Account Form
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Account full name is required';
    if (!formData.contactPhone.trim()) errors.contactPhone = 'Contact phone number is required';
    if (!formData.role) errors.role = 'Access role selection is required';
    
    if (!isEditMode) {
      if (!formData.email.trim()) {
        errors.email = 'Login email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Invalid email address format';
      }
      
      if (!formData.password) {
        errors.password = 'Login password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Account Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setFormSuccess('');

    try {
      if (isEditMode) {
        // UPDATE Admin
        const updatePayload = {
          fullName: formData.fullName,
          contactPhone: formData.contactPhone,
          alternatePhone: formData.alternatePhone || null,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth || null,
          departmentId: formData.departmentId || null,
          designation: formData.designation,
          bio: formData.bio,
          address: formData.address,
          role: formData.role,
          password: formData.password || null
        };

        await updateCompanyAccountManage(editingId, updatePayload);
        setFormSuccess('Administrator account updated successfully!');
        addActivityLog(`Modified credentials for account: "${formData.fullName}"`);
        await fetchAdmins();
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        // CREATE Admin
        const payload = {
          company_id: companyId,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          contactPhone: formData.contactPhone,
          alternatePhone: formData.alternatePhone || null,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth || null,
          departmentId: formData.departmentId || null,
          designation: formData.designation,
          bio: formData.bio,
          address: formData.address,
          role: formData.role
        };

        await registerCompanyAccountManage(payload);
        setFormSuccess('Staff account provisioned successfully!');
        addActivityLog(`Provisioned new staff account: "${formData.fullName}"`);
        await fetchAdmins();
        setTimeout(() => setIsModalOpen(false), 1500);
      }
    } catch (err) {
      console.error(err);
      setFormErrors({ submit: err.response?.data?.message || err.message || 'Action failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle admin active status
  const handleToggleStatus = async (id, currentStatus, name) => {
    setActiveDropdownId(null);
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateCompanyAccountManage(id, { status: nextStatus });
      addActivityLog(`Toggled account "${name}" status to: ${nextStatus}`);
      await fetchAdmins();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to toggle status.');
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id, name) => {
    setActiveDropdownId(null);
    if (!window.confirm(`Are you sure you want to deactivate and remove account "${name}"? This will disable their access instantly.`)) {
      return;
    }

    try {
      await deleteCompanyAccountManage(id);
      addActivityLog(`Deactivated staff account: "${name}"`);
      await fetchAdmins();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete account.');
    }
  };

  // Open Account Modal
  const handleOpenEdit = (admin) => {
    setActiveDropdownId(null);
    setIsEditMode(true);
    setEditingId(admin.id);
    setFormErrors({});
    setFormSuccess('');
    
    let formattedDate = '';
    if (admin.dateOfBirth) {
      const dateObj = new Date(admin.dateOfBirth);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0];
      }
    }

    setFormData({
      fullName: admin.fullName || '',
      email: admin.email || '',
      password: '',
      contactPhone: admin.contactPhone || '',
      alternatePhone: admin.alternatePhone || '',
      gender: admin.gender || 'Male',
      dateOfBirth: formattedDate,
      departmentId: admin.departmentId || '',
      designation: admin.designation || '',
      bio: admin.bio || '',
      address: admin.address || '',
      role: admin.role || 'Recruiter'
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormErrors({});
    setFormSuccess('');
    setFormData({
      fullName: '',
      email: '',
      password: '',
      contactPhone: '',
      alternatePhone: '',
      gender: 'Male',
      dateOfBirth: '',
      departmentId: '',
      designation: '',
      bio: '',
      address: '',
      role: 'Recruiter'
    });
    setIsModalOpen(true);
  };

  // Filter accounts
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = 
      (admin.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.departmentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.role || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Active') return matchesSearch && admin.status === 'ACTIVE';
    if (statusFilter === 'Suspended') return matchesSearch && admin.status !== 'ACTIVE';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-neutral-text tracking-tight">
            Company Role Accounts & Scope
          </h1>
          <p className="text-neutral-text-muted text-xs mt-0.5">
            Provision secure credentials and assign pre-defined administrative roles (HR, Recruiter, Department Manager).
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              fetchAdmins();
              fetchDepartments();
            }}
            className="p-3 bg-neutral-surface hover:bg-neutral-muted text-neutral-text-muted hover:text-neutral-text border border-neutral-border rounded-theme-lg transition-colors focus:outline-none"
            title="Refresh database records"
          >
            <RefreshCw className={`w-5 h-5 ${(loading || loadingDepts) ? 'animate-spin text-primary' : ''}`} />
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
            placeholder="Search name, designation, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text placeholder-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Contact Phone</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border text-xs">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-neutral-base/20 transition-colors">
                    
                    {/* Member Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-theme-lg bg-neutral-muted text-neutral-text font-black flex items-center justify-center border border-neutral-border uppercase shrink-0">
                          {admin.fullName ? admin.fullName.charAt(0) : 'A'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-neutral-text text-sm leading-snug truncate">
                            {admin.fullName}
                          </span>
                          <span className="text-[11px] text-neutral-text-muted truncate mt-0.5 max-w-[200px]">
                            {admin.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department / Designation */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-neutral-text font-semibold flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-neutral-text-muted" />
                          {admin.designation || 'Staff'}
                        </span>
                        <span className="text-[10px] text-neutral-text-muted uppercase tracking-wider font-bold">
                          {admin.departmentName || 'General'}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Role */}
                    <td className="py-4 px-6 font-bold text-neutral-text">
                      <span className="px-2 py-0.5 bg-primary-light text-primary border border-primary/20 rounded-full text-[10px] font-bold">
                        {admin.role || 'Unassigned'}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 font-medium text-neutral-text">
                      <div className="flex flex-col">
                        <span>{admin.contactPhone || 'N/A'}</span>
                        {admin.alternatePhone && (
                          <span className="text-[10px] text-neutral-text-muted mt-0.5">Alt: {admin.alternatePhone}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        admin.status === 'ACTIVE'
                          ? 'bg-success-light text-success border border-success/20' 
                          : 'bg-danger-light text-danger border border-danger/20'
                      }`}>
                        {admin.status === 'ACTIVE' ? 'Active' : 'Suspended'}
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
                            onClick={() => handleToggleStatus(admin.id, admin.status, admin.fullName)}
                            className={`w-full px-4 py-2 text-xs hover:bg-neutral-base flex items-center gap-2 transition-colors font-medium ${
                              admin.status === 'ACTIVE' ? 'text-danger' : 'text-success'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>{admin.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                          </button>

                          <div className="border-t border-neutral-border my-1" />
                          
                          <button 
                            onClick={() => handleDeleteAdmin(admin.id, admin.fullName)}
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

      {/* PROVISION ACCOUNT FORM MODAL */}
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
                <h3 className="font-bold text-sm text-neutral-text">
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
                  <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                    Workspace Linkage & Identity
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Sarah Connor"
                        required
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-xs text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.fullName ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.fullName && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Login Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. sarah@cyberdyne.com"
                        required
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-xs text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.email ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting || isEditMode}
                      />
                      {formErrors.email && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">
                        {isEditMode ? 'New Login Password' : 'Login Password *'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={isEditMode ? "Leave blank to keep current" : "Minimum 6 characters"}
                        required={!isEditMode}
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-xs text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.password ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.password && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Contact Phone *</label>
                      <input
                        type="text"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 98765 43210"
                        required
                        className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-xs text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.contactPhone ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      />
                      {formErrors.contactPhone && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.contactPhone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Alternate Phone</label>
                      <input
                        type="text"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
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
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Access Role select & Corporate Department select */}
                <div className="space-y-4 pt-1">
                  <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                    Access Role & Corporate Department
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Access Role *</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg text-xs text-neutral-text focus:outline-none ${
                          formErrors.role ? 'border-danger' : 'border-neutral-border'
                        }`}
                        disabled={submitting}
                      >
                        <option value="Recruiter">Recruiter</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Hiring Manager">Hiring Manager</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Technical Manager">Technical Manager</option>
                        <option value="Onboarding Manager">Onboarding Manager</option>
                      </select>
                      {formErrors.role && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.role}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Corporate Department</label>
                      {loadingDepts ? (
                        <p className="text-xs text-neutral-text-muted italic">Loading departments...</p>
                      ) : (
                        <select
                          name="departmentId"
                          value={formData.departmentId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                          disabled={submitting}
                        >
                          <option value="">Select Department...</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Job Designation</label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Recruiter"
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-neutral-text mb-1">Bio / Profile Notes</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Address */}
                <div className="space-y-4 pt-1">
                  <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                    Address Records
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-text mb-1">Residence Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
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
                  className="px-5 py-2.5 border border-neutral-border hover:bg-neutral-muted text-neutral-text text-xs font-semibold rounded-theme-lg transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-neutral-textInverse text-xs font-bold rounded-theme-lg shadow-theme-sm transition-all focus:outline-none"
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
