import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  X, 
  Check, 
  FolderOpen,
  Mail,
  Phone,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Eye,
  Info
} from 'lucide-react';

const EmployeesTab = ({ employees, departments, onUpdateEmployees, addActivityLog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Detailed Profile View modal
  const [viewingEmployee, setViewingEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    designation: '',
    email: '',
    phone: '',
    joinDate: ''
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
    if (!formData.name.trim()) newErrors.name = 'Employee name is required';
    if (!formData.department) newErrors.department = 'Department selection is required';
    if (!formData.designation.trim()) newErrors.designation = 'Job designation is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open Edit
  const handleOpenEdit = (emp) => {
    setIsEditMode(true);
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      department: emp.department,
      designation: emp.designation,
      email: emp.email,
      phone: emp.phone || '',
      joinDate: emp.joinDate || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Save changes
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedList = employees.map(emp => {
      if (emp.id === editingId) {
        return {
          ...emp,
          name: formData.name,
          department: formData.department,
          designation: formData.designation,
          email: formData.email,
          phone: formData.phone,
          joinDate: formData.joinDate
        };
      }
      return emp;
    });

    onUpdateEmployees(updatedList);
    addActivityLog(`Modified employee profile details for "${formData.name}"`);
    setIsModalOpen(false);
  };

  // Remove Employee
  const handleRemove = (id, name) => {
    if (window.confirm(`Are you sure you want to remove employee "${name}" from the company records? This will delete their profile.`)) {
      const updatedList = employees.filter(emp => emp.id !== id);
      onUpdateEmployees(updatedList);
      addActivityLog(`Removed employee "${name}" from corporate logs.`);
    }
  };

  // Filter list
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-neutral-text tracking-tight">
          Employee Directory
        </h1>
        <p className="text-neutral-text-muted text-xs mt-0.5">
          View employee profiles, adjust structural designations, and manage deactivation.
        </p>
      </div>

      {/* Control bar */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-4 shadow-theme-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted" />
          <input
            type="text"
            placeholder="Search employee, job designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text placeholder-neutral-text-muted focus:outline-none"
          />
        </div>

        {/* Dept Filter */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-sm overflow-hidden">
        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-border text-[11px] font-bold text-neutral-text-muted uppercase tracking-wider bg-neutral-base/40">
                  <th className="py-3 px-6">Employee</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Designation</th>
                  <th className="py-3 px-6">Joined Date</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border text-xs">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-neutral-base/20 transition-colors">
                    
                    {/* Name & Contact */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-light text-secondary font-black flex items-center justify-center border border-secondary/20 uppercase shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-neutral-text text-xs leading-snug truncate">
                            {emp.name}
                          </span>
                          <span className="text-[10px] text-neutral-text-muted truncate mt-0.5">
                            {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-6 font-semibold text-neutral-text">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-neutral-text-muted" />
                        <span>{emp.department}</span>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="py-3.5 px-6 text-neutral-text font-medium">
                      <span>{emp.designation}</span>
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-6 text-neutral-text-muted font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-text-muted" />
                        <span>{emp.joinDate}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="p-1.5 bg-neutral-base hover:bg-info-light text-neutral-text-muted hover:text-info rounded-theme-md transition-colors"
                          title="View Employee Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 bg-neutral-base hover:bg-primary-light text-neutral-text-muted hover:text-primary rounded-theme-md transition-colors"
                          title="Edit Employee profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(emp.id, emp.name)}
                          className="p-1.5 bg-neutral-base hover:bg-danger-light text-neutral-text-muted hover:text-danger rounded-theme-md transition-colors"
                          title="Remove Employee"
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
            <p className="text-sm text-neutral-text-muted font-medium">No employees found in directory.</p>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm" onClick={() => setViewingEmployee(null)} />

          <div className="relative w-full max-w-sm bg-neutral-surface rounded-theme-xl shadow-theme-xl border border-neutral-border z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-neutral-text">Employee Details</h3>
              </div>
              <button onClick={() => setViewingEmployee(null)} className="p-1 text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text rounded-theme-md">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Profile body */}
            <div className="p-6 space-y-4 text-xs text-neutral-text">
              <div className="text-center pb-4 border-b border-neutral-border">
                <div className="w-16 h-16 rounded-full bg-secondary-light text-secondary font-black text-xl flex items-center justify-center border border-secondary/20 uppercase mx-auto mb-2">
                  {viewingEmployee.name.charAt(0)}
                </div>
                <h2 className="text-sm font-black text-neutral-text">{viewingEmployee.name}</h2>
                <p className="text-neutral-text-muted mt-0.5 font-semibold">{viewingEmployee.designation}</p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-text-muted font-bold">Department</span>
                  <span className="font-semibold text-neutral-text">{viewingEmployee.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-text-muted font-bold">Email Address</span>
                  <span className="font-semibold text-neutral-text">{viewingEmployee.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-text-muted font-bold">Phone Number</span>
                  <span className="font-semibold text-neutral-text">{viewingEmployee.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-text-muted font-bold">Joining Date</span>
                  <span className="font-semibold text-neutral-text">{viewingEmployee.joinDate || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-neutral-surface rounded-theme-xl shadow-theme-xl border border-neutral-border z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-neutral-text">Modify Employee Profile</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text rounded-theme-md">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg focus:outline-none ${
                    errors.name ? 'border-danger' : 'border-neutral-border'
                  }`}
                />
                {errors.name && <p className="text-[9px] text-danger mt-1 font-semibold">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Job Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg focus:outline-none ${
                      errors.designation ? 'border-danger' : 'border-neutral-border'
                    }`}
                  />
                  {errors.designation && <p className="text-[9px] text-danger mt-1 font-semibold">{errors.designation}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg focus:outline-none ${
                    errors.email ? 'border-danger' : 'border-neutral-border'
                  }`}
                />
                {errors.email && <p className="text-[9px] text-danger mt-1 font-semibold">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Joining Date</label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-border hover:bg-neutral-muted text-neutral-text font-semibold rounded-theme-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold rounded-theme-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeesTab;
