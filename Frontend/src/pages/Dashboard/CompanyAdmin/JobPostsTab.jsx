import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  FolderOpen,
  MapPin,
  Calendar,
  Layers,
  Info,
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react';

const JobPostsTab = ({ jobs, departments, onUpdateJobs, addActivityLog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Detailed View Modal states
  const [viewingJob, setViewingJob] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    salary: '',
    status: 'Active'
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
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.department) newErrors.department = 'Department selection is required';
    if (!formData.location.trim()) newErrors.location = 'Job location is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open Add
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      title: '',
      department: departments.length > 0 ? departments[0].name : '',
      location: '',
      type: 'Full-time',
      description: '',
      requirements: '',
      salary: '',
      status: 'Active'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (job) => {
    setIsEditMode(true);
    setEditingId(job.id);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description || '',
      requirements: job.requirements || '',
      salary: job.salary || '',
      status: job.status
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Save (Add or Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let updatedList = [];
    if (isEditMode) {
      updatedList = jobs.map(j => {
        if (j.id === editingId) {
          return {
            ...j,
            title: formData.title,
            department: formData.department,
            location: formData.location,
            type: formData.type,
            description: formData.description,
            requirements: formData.requirements,
            salary: formData.salary,
            status: formData.status
          };
        }
        return j;
      });
      addActivityLog(`Modified job posting details for: "${formData.title}"`);
    } else {
      const newJob = {
        id: 'job-' + Math.random().toString(36).substr(2, 9),
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        requirements: formData.requirements,
        salary: formData.salary,
        status: 'Active',
        applicationsCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updatedList = [newJob, ...jobs];
      addActivityLog(`Posted new job opening: "${formData.title}"`);
    }

    onUpdateJobs(updatedList);
    setIsModalOpen(false);
  };

  // Delete
  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete the job posting for "${title}"?`)) {
      const updatedList = jobs.filter(j => j.id !== id);
      onUpdateJobs(updatedList);
      addActivityLog(`Deleted job opening: "${title}"`);
    }
  };

  // Toggle Close/Open Status
  const handleToggleStatus = (id, currentStatus, title) => {
    const nextStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    const updatedList = jobs.map(j => {
      if (j.id === id) {
        return { ...j, status: nextStatus };
      }
      return j;
    });
    onUpdateJobs(updatedList);
    addActivityLog(`Changed job "${title}" status to: ${nextStatus}`);
  };

  // Filtering Logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'All' || job.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-neutral-text tracking-tight">
            Job Posting Board
          </h1>
          <p className="text-neutral-text-muted text-xs mt-0.5">
            Manage your open positions, edit salary grades, and toggle recruitment states.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold text-xs rounded-theme-lg shadow-theme-md transition-all focus:outline-none"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Filters Dashboard */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-4 shadow-theme-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted" />
          <input
            type="text"
            placeholder="Search job title, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text placeholder-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
          >
            <option value="All">All States</option>
            <option value="Active">Active Openings</option>
            <option value="Closed">Closed positions</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-sm overflow-hidden">
        {filteredJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-border text-[11px] font-bold text-neutral-text-muted uppercase tracking-wider bg-neutral-base/40">
                  <th className="py-3 px-6">Position / Role</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Contract</th>
                  <th className="py-3 px-6 text-center">Applications</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border text-xs">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-neutral-base/20 transition-colors">
                    
                    {/* Title */}
                    <td className="py-3.5 px-6 font-bold text-neutral-text">
                      <div className="flex flex-col">
                        <span>{job.title}</span>
                        {job.salary && (
                          <span className="text-[10px] text-neutral-text-muted mt-0.5">{job.salary}</span>
                        )}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-6 font-semibold text-neutral-text">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-neutral-text-muted" />
                        <span>{job.department}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-6 text-neutral-text-muted font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-text-muted" />
                        <span>{job.location}</span>
                      </div>
                    </td>

                    {/* Job Type */}
                    <td className="py-3.5 px-6 font-bold">
                      <span className="px-2.5 py-0.5 bg-secondary-light text-secondary rounded-full">
                        {job.type}
                      </span>
                    </td>

                    {/* Applications Count */}
                    <td className="py-3.5 px-6 text-center font-black text-neutral-text">
                      {job.applicationsCount} applicants
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(job.id, job.status, job.title)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          job.status === 'Active'
                            ? 'bg-success-light text-success border-success/20 hover:bg-success/15'
                            : 'bg-neutral-muted text-neutral-text-muted border-neutral-border hover:bg-neutral-base'
                        }`}
                      >
                        {job.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingJob(job)}
                          className="p-1.5 bg-neutral-base hover:bg-info-light text-neutral-text-muted hover:text-info rounded-theme-md transition-colors"
                          title="View Job Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(job)}
                          className="p-1.5 bg-neutral-base hover:bg-primary-light text-neutral-text-muted hover:text-primary rounded-theme-md transition-colors"
                          title="Edit Job opening"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id, job.title)}
                          className="p-1.5 bg-neutral-base hover:bg-danger-light text-neutral-text-muted hover:text-danger rounded-theme-md transition-colors"
                          title="Delete Job posting"
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
            <p className="text-sm text-neutral-text-muted font-medium">No job postings found on dashboard.</p>
          </div>
        )}
      </div>

      {/* VIEW JOB DETAILS MODAL */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm" onClick={() => setViewingJob(null)} />

          <div className="relative w-full max-w-xl bg-neutral-surface rounded-theme-xl shadow-theme-xl border border-neutral-border z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-neutral-text">Job Description & Details</h3>
              </div>
              <button onClick={() => setViewingJob(null)} className="p-1 text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text rounded-theme-md">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* View body */}
            <div className="overflow-y-auto p-6 space-y-5 text-xs text-neutral-text">
              <div>
                <h1 className="text-base font-black text-neutral-text">{viewingJob.title}</h1>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <span className="px-2.5 py-0.5 bg-primary-light text-primary border border-primary/20 rounded-full font-bold">{viewingJob.department}</span>
                  <span className="px-2.5 py-0.5 bg-secondary-light text-secondary rounded-full font-bold">{viewingJob.type}</span>
                  <span className="px-2.5 py-0.5 bg-neutral-muted text-neutral-text-muted border border-neutral-border rounded-full font-semibold">{viewingJob.location}</span>
                </div>
              </div>

              {viewingJob.salary && (
                <div>
                  <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-1">Salary Range</h4>
                  <p className="font-semibold text-neutral-text">{viewingJob.salary}</p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-1">Role Description</h4>
                <p className="leading-relaxed whitespace-pre-wrap font-medium">{viewingJob.description}</p>
              </div>

              {viewingJob.requirements && (
                <div>
                  <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-1">Core Requirements</h4>
                  <p className="leading-relaxed whitespace-pre-wrap font-medium">{viewingJob.requirements}</p>
                </div>
              )}

              <div className="border-t border-neutral-border pt-4 flex items-center justify-between text-[10px] text-neutral-text-muted font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Posted: {viewingJob.createdAt}</span>
                </span>
                <span>Applications Received: {viewingJob.applicationsCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-xl bg-neutral-surface rounded-theme-xl shadow-theme-xl border border-neutral-border z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-neutral-text">
                  {isEditMode ? 'Modify Job Posting' : 'Post New Job Opening'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text rounded-theme-md">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-text mb-1">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Software Architect"
                    className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg text-xs focus:outline-none ${
                      errors.title ? 'border-danger' : 'border-neutral-border'
                    }`}
                  />
                  {errors.title && <p className="text-[9px] text-danger mt-1 font-semibold">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Job Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Bangalore, India"
                    className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg text-xs focus:outline-none ${
                      errors.location ? 'border-danger' : 'border-neutral-border'
                    }`}
                  />
                  {errors.location && <p className="text-[9px] text-danger mt-1 font-semibold">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Salary Range</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹12,00,000 - ₹18,00,000 P.A."
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Role Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Summarize coding deliverables and daily sprints..."
                  className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg text-xs focus:outline-none ${
                    errors.description ? 'border-danger' : 'border-neutral-border'
                  }`}
                />
                {errors.description && <p className="text-[9px] text-danger mt-1 font-semibold">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Role Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g. 5+ years experience, Node.js expert, AWS..."
                  className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                />
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Active Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-border hover:bg-neutral-muted text-neutral-text text-xs font-semibold rounded-theme-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-neutral-textInverse text-xs font-bold rounded-theme-lg"
                >
                  {isEditMode ? 'Update Details' : 'Post Opening'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default JobPostsTab;
