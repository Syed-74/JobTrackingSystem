import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  FolderOpen,
  Info,
  Calendar,
  Layers,
  RefreshCw
} from 'lucide-react';

const DepartmentsTab = ({ departments, onUpdateDepartments, addActivityLog }) => {
  const { user, getCompanyAdmins, registerDepartment, updateDepartmentDetails, deleteDepartmentDetails } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headcount: 0
  });

  const [errors, setErrors] = useState({});



  // Input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Department name is required';
    if (!formData.code.trim()) newErrors.code = 'Department code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open Add
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      headcount: 0
    });
    setErrors({});
    setSubmitError('');
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (dept) => {
    setIsEditMode(true);
    setEditingId(dept.id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      headcount: dept.headcount || 0
    });
    setErrors({});
    setSubmitError('');
    setIsModalOpen(true);
  };

  // Save (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        company_id: user?.company_id,
        department_name: formData.name,
        department_code: formData.code.toUpperCase(),
        headcount_quota: parseInt(formData.headcount) || 0,
        assigned_manager_id: null,
        description: formData.description || '',
        status: 'ACTIVE'
      };

      let updatedList = [];
      if (isEditMode) {
        const updatedDept = await updateDepartmentDetails(editingId, payload);
        updatedList = departments.map(d => d.id === editingId ? updatedDept : d);
        addActivityLog(`Updated department details for "${formData.name}"`);
      } else {
        const newDept = await registerDepartment(payload);
        updatedList = [newDept, ...departments];
        addActivityLog(`Created new department: "${formData.name}" (${formData.code.toUpperCase()})`);
      }

      onUpdateDepartments(updatedList);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || err.message || 'Failed to save department details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" department? This will remove all department associations.`)) {
      try {
        await deleteDepartmentDetails(id);
        const updatedList = departments.filter(d => d.id !== id);
        onUpdateDepartments(updatedList);
        addActivityLog(`Deleted department: "${name}"`);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || err.message || 'Failed to delete department.');
      }
    }
  };

  // Search filtering
  const filteredDepts = departments.filter(dept => 
    (dept.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-neutral-text tracking-tight">
            Corporate Departments
          </h1>
          <p className="text-neutral-text-muted text-xs mt-0.5">
            Organize work structures, manage headcount quotas, and assign managers.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold text-xs rounded-theme-lg shadow-theme-md transition-all focus:outline-none"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create Department</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-4 shadow-theme-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted" />
          <input
            type="text"
            placeholder="Search departments, codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text placeholder-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="text-xs text-neutral-text-muted font-semibold">
          Showing {filteredDepts.length} of {departments.length} departments
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-sm overflow-hidden">
        {filteredDepts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-border text-[11px] font-bold text-neutral-text-muted uppercase tracking-wider bg-neutral-base/40">
                  <th className="py-3 px-6">Dept Code</th>
                  <th className="py-3 px-6">Department Name</th>
                  <th className="py-3 px-6 text-center">Headcount</th>
                  <th className="py-3 px-6">Created</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border text-xs">
                {filteredDepts.map((dept) => (
                  <tr key={dept.id} className="hover:bg-neutral-base/20 transition-colors">
                    
                    {/* Code Badge */}
                    <td className="py-3.5 px-6 font-bold">
                      <span className="px-2.5 py-1 bg-primary-light text-primary border border-primary/20 rounded-full">
                        {dept.code}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-text">{dept.name}</span>
                        {dept.description && (
                          <span className="text-[10px] text-neutral-text-muted truncate max-w-[220px] mt-0.5">{dept.description}</span>
                        )}
                      </div>
                    </td>



                    {/* Headcount */}
                    <td className="py-3.5 px-6 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-neutral-muted text-neutral-text-muted">
                        {dept.headcount} members
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-6 text-neutral-text-muted font-medium flex items-center gap-1.5 mt-1.5 border-0">
                      <Calendar className="w-3.5 h-3.5 text-neutral-text-muted" />
                      <span>{dept.createdAt ? new Date(dept.createdAt).toISOString().split('T')[0] : 'N/A'}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          className="p-1.5 bg-neutral-base hover:bg-primary-light text-neutral-text-muted hover:text-primary rounded-theme-md transition-colors"
                          title="Edit Department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id, dept.name)}
                          className="p-1.5 bg-neutral-base hover:bg-danger-light text-neutral-text-muted hover:text-danger rounded-theme-md transition-colors"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <FolderOpen className="w-10 h-10 text-neutral-text-muted" />
            <p className="text-sm text-neutral-text-muted font-medium">No departments found in workspace.</p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-neutral-surface rounded-theme-xl shadow-theme-xl border border-neutral-border z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-neutral-text">
                  {isEditMode ? 'Modify Department Details' : 'Create New Department'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text rounded-theme-md">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Department Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Quality Assurance"
                  className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg text-xs focus:outline-none ${
                    errors.name ? 'border-danger' : 'border-neutral-border'
                  }`}
                />
                {errors.name && <p className="text-[9px] text-danger mt-1 font-semibold">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Department Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g. QA"
                    className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg text-xs focus:outline-none ${
                      errors.code ? 'border-danger' : 'border-neutral-border'
                    }`}
                  />
                  {errors.code && <p className="text-[9px] text-danger mt-1 font-semibold">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Headcount Quota</label>
                  <input
                    type="number"
                    name="headcount"
                    value={formData.headcount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>
              </div>



              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Brief summary of department objectives..."
                  className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                />
              </div>

              {submitError && (
                <div className="p-3 bg-danger-light border border-danger/10 text-danger text-xs rounded-theme-lg font-medium animate-in fade-in">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-neutral-border hover:bg-neutral-muted text-neutral-text text-xs font-semibold rounded-theme-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-neutral-textInverse text-xs font-bold rounded-theme-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEditMode ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentsTab;
