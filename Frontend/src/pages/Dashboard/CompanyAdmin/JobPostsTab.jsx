import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as XLSX from 'xlsx';
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

const JobPostsTab = ({ jobs, departments, companyAccounts = [], onUpdateJobs, addActivityLog }) => {
  const { createJobPosting, updateJobPosting, deleteJobPosting } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Detailed View Modal states
  const [viewingJob, setViewingJob] = useState(null);

  // Bulk Upload states
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkJobs, setBulkJobs] = useState([]);
  const [bulkValidationErrors, setBulkValidationErrors] = useState([]);
  const [bulkStatus, setBulkStatus] = useState(''); // '', 'validating', 'validated', 'uploading', 'completed', 'error'
  const [bulkProgress, setBulkProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    responsibilities: '',
    workMode: 'Onsite',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'INR',
    experienceMin: '',
    experienceMax: '',
    education: '',
    skills: '',
    openings: 1,
    employmentLevel: 'Mid',
    status: 'Active',
    assignedUserId: '',
    applicationDeadline: '',
    expectedJoiningDate: ''
  });

  const [errors, setErrors] = useState({});

  // Get assignee full name helper
  const getAssigneeName = (userId) => {
    const account = companyAccounts?.find(acc => acc.userId === userId);
    return account ? account.fullName : 'Unassigned';
  };

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
    if (!formData.assignedUserId) newErrors.assignedUserId = 'Assignee selection is required';
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
      responsibilities: '',
      workMode: 'Onsite',
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'INR',
      experienceMin: '',
      experienceMax: '',
      education: '',
      skills: '',
      openings: 1,
      employmentLevel: 'Mid',
      status: 'Active',
      assignedUserId: '',
      applicationDeadline: '',
      expectedJoiningDate: ''
    });
    setErrors({});
    setSubmitError('');
    setSubmitting(false);
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
      responsibilities: job.responsibilities || '',
      workMode: job.workMode || 'Onsite',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      salaryCurrency: job.salaryCurrency || 'INR',
      experienceMin: job.experienceMin || '',
      experienceMax: job.experienceMax || '',
      education: job.education || '',
      skills: job.skills || '',
      openings: job.openings || 1,
      employmentLevel: job.employmentLevel || 'Mid',
      status: job.status,
      assignedUserId: job.assignedUserId || '',
      applicationDeadline: job.applicationDeadline || '',
      expectedJoiningDate: job.expectedJoiningDate || ''
    });
    setErrors({});
    setSubmitError('');
    setSubmitting(false);
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
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        workMode: formData.workMode,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        salaryCurrency: formData.salaryCurrency,
        experienceMin: formData.experienceMin,
        experienceMax: formData.experienceMax,
        education: formData.education,
        skills: formData.skills,
        openings: formData.openings,
        employmentLevel: formData.employmentLevel,
        status: formData.status,
        assignedUserId: formData.assignedUserId,
        applicationDeadline: formData.applicationDeadline,
        expectedJoiningDate: formData.expectedJoiningDate
      };

      let updatedList = [];
      if (isEditMode) {
        const updatedJob = await updateJobPosting(editingId, payload);
        updatedList = jobs.map(j => j.id === editingId ? updatedJob : j);
        addActivityLog(`Modified job posting details for: "${formData.title}"`);
      } else {
        const newJob = await createJobPosting(payload);
        updatedList = [newJob, ...jobs];
        addActivityLog(`Posted new job opening: "${formData.title}"`);
      }

      onUpdateJobs(updatedList);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || err.message || 'Failed to save job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Job posting handlers
  const verifyBulkList = (parsed) => {
    if (!Array.isArray(parsed)) {
      setBulkValidationErrors([{ index: 0, jobTitle: 'Format Error', errors: ['Input must be a JSON array of job objects.'] }]);
      setBulkStatus('error');
      return;
    }

    const validatedJobs = [];
    const errors = [];

    parsed.forEach((job, index) => {
      const jobErrors = [];

      if (!job.title || !String(job.title).trim()) {
        jobErrors.push('Job title is required.');
      }
      let resolvedDept = '';
      if (!job.department) {
        jobErrors.push('Department is required.');
      } else {
        const matchedDept = departments.find(d => d.name.toLowerCase() === String(job.department).trim().toLowerCase());
        if (!matchedDept) {
          jobErrors.push(`Department "${job.department}" does not exist in the database.`);
        } else {
          resolvedDept = matchedDept.name; // Use exact database casing
        }
      }
      if (!job.location || !String(job.location).trim()) {
        jobErrors.push('Location is required.');
      }
      if (!job.description || !String(job.description).trim()) {
        jobErrors.push('Description is required.');
      }

      let assignedId = '';
      const rawAssignedVal = job.assignedUserId ? String(job.assignedUserId).trim() : '';

      if (rawAssignedVal) {
        // Strip trailing parentheses containing role information (e.g. " (Recruiter)" or " (Manager)")
        const cleanName = rawAssignedVal.replace(/\s*\([^)]*\)\s*$/, '').trim();

        // Resolve recruiter/manager user ID from company accounts by looking up:
        // 1. By exact userId (UUID)
        let matchedAccount = companyAccounts.find(acc => acc.userId === rawAssignedVal);
        // 2. By email (case-insensitive)
        if (!matchedAccount) {
          matchedAccount = companyAccounts.find(acc => acc.email && acc.email.toLowerCase() === rawAssignedVal.toLowerCase());
        }
        // 3. By full name (case-insensitive)
        if (!matchedAccount) {
          matchedAccount = companyAccounts.find(acc => acc.fullName && acc.fullName.toLowerCase() === rawAssignedVal.toLowerCase());
        }
        // 4. By cleaned full name (case-insensitive, strips suffixes like "(Recruiter)")
        if (!matchedAccount) {
          matchedAccount = companyAccounts.find(acc => acc.fullName && acc.fullName.toLowerCase() === cleanName.toLowerCase());
        }

        if (matchedAccount) {
          assignedId = matchedAccount.userId;
        } else {
          assignedId = rawAssignedVal; // Fallback to raw value for validation check
        }
      }

      if (!assignedId) {
        jobErrors.push('Assigned Recruiter/Manager user ID is required.');
      } else {
        const userExists = companyAccounts.some(acc => acc.userId === assignedId);
        if (!userExists) {
          jobErrors.push(`Assigned user "${rawAssignedVal}" is not a valid recruiter/manager.`);
        }
      }

      if (jobErrors.length > 0) {
        errors.push({ index, jobTitle: job.title || `Job #${index + 1}`, errors: jobErrors });
      } else {
        validatedJobs.push({
          title: String(job.title).trim(),
          department: resolvedDept,
          location: String(job.location).trim(),
          type: job.type ? String(job.type).trim() : 'Full-time',
          description: String(job.description).trim(),
          requirements: job.requirements ? String(job.requirements).trim() : '',
          responsibilities: job.responsibilities ? String(job.responsibilities).trim() : '',
          workMode: job.workMode ? String(job.workMode).trim() : 'Onsite',
          salaryMin: job.salaryMin || '',
          salaryMax: job.salaryMax || '',
          salaryCurrency: job.salaryCurrency ? String(job.salaryCurrency).trim() : 'INR',
          experienceMin: job.experienceMin || '',
          experienceMax: job.experienceMax || '',
          education: job.education ? String(job.education).trim() : '',
          skills: job.skills ? String(job.skills).trim() : '',
          openings: job.openings || 1,
          employmentLevel: job.employmentLevel ? String(job.employmentLevel).trim() : 'Mid',
          status: job.status ? String(job.status).trim() : 'Active',
          assignedUserId: assignedId,
          applicationDeadline: job.applicationDeadline || '',
          expectedJoiningDate: job.expectedJoiningDate || ''
        });
      }
    });

    setBulkJobs(validatedJobs);
    setBulkValidationErrors(errors);
    if (errors.length > 0) {
      setBulkStatus('error');
    } else {
      setBulkStatus('validated');
    }
  };

  const handleVerifyBulkData = () => {
    setBulkValidationErrors([]);
    setBulkJobs([]);
    try {
      const parsed = JSON.parse(bulkInputText);
      verifyBulkList(parsed);
    } catch (e) {
      setBulkValidationErrors([{ index: 0, jobTitle: 'Parsing Error', errors: [`Invalid JSON format: ${e.message}`] }]);
      setBulkStatus('error');
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkValidationErrors([]);
    setBulkJobs([]);
    setBulkStatus('validating');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsed = XLSX.utils.sheet_to_json(sheet);

        if (!Array.isArray(parsed) || parsed.length === 0) {
          setBulkValidationErrors([{ index: 0, jobTitle: 'Format Error', errors: ['Excel sheet is empty or invalid.'] }]);
          setBulkStatus('error');
          return;
        }

        const formatted = parsed.map(row => {
          const findVal = (keys) => {
            for (const key of keys) {
              const cleanedSearchKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              const matchedKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanedSearchKey);
              if (matchedKey !== undefined) return row[matchedKey];
            }
            return undefined;
          };

          return {
            title: findVal(['title', 'jobtitle', 'job_title', 'position', 'role']),
            department: findVal(['department', 'dept', 'departmentname', 'department_name']),
            location: findVal(['location', 'joblocation', 'job_location', 'city']),
            type: findVal(['type', 'jobtype', 'job_type', 'employmenttype']),
            description: findVal(['description', 'jobdescription', 'job_description', 'about']),
            requirements: findVal(['requirements', 'jobrequirements', 'job_requirements', 'requiredskills']),
            responsibilities: findVal(['responsibilities', 'jobresponsibilities', 'job_responsibilities']),
            workMode: findVal(['workmode', 'work_mode']),
            salaryMin: findVal(['salarymin', 'salary_min', 'minsalary', 'salaryminimum']),
            salaryMax: findVal(['salarymax', 'salary_max', 'maxsalary', 'salarymaximum']),
            salaryCurrency: findVal(['salarycurrency', 'salary_currency', 'currency']),
            experienceMin: findVal(['experiencemin', 'experience_min', 'minexperience']),
            experienceMax: findVal(['experiencemax', 'experience_max', 'maxexperience']),
            education: findVal(['education', 'requirededucation']),
            skills: findVal(['skills', 'requiredskills', 'skillset']),
            openings: findVal(['openings', 'totalopenings', 'vacancy']),
            employmentLevel: findVal(['employmentlevel', 'employment_level', 'level']),
            status: findVal(['status', 'jobstatus', 'activestatus']),
            assignedUserId: findVal([
              'assigneduserid',
              'assigned_user_id',
              'recruiterid',
              'managerid',
              'assignedrecruiter',
              'assignedrecruitermanager',
              'assignedrecruitermanageruserid',
              'recruiter',
              'manager',
              'assigneduser',
              'assignedrecruiter/manager',
              'assignedrecruiter/manageruserid',
              'recruiter/manager'
            ]),
            applicationDeadline: findVal(['applicationdeadline', 'application_deadline', 'deadline']),
            expectedJoiningDate: findVal(['expectedjoiningdate', 'expected_joining_date', 'joiningdate'])
          };
        });

        setBulkInputText(JSON.stringify(formatted, null, 2));
        verifyBulkList(formatted);
      } catch (err) {
        console.error(err);
        setBulkValidationErrors([{ index: 0, jobTitle: 'Excel Error', errors: [`Failed to parse Excel file: ${err.message}`] }]);
        setBulkStatus('error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleUploadBulkJobs = async () => {
    if (bulkJobs.length === 0) return;
    setBulkStatus('uploading');
    setBulkProgress(0);

    const uploadedList = [...jobs];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < bulkJobs.length; i++) {
      try {
        const jobToUpload = bulkJobs[i];
        const newJob = await createJobPosting(jobToUpload);
        uploadedList.unshift(newJob);
        successCount++;
        addActivityLog(`Posted new job opening (Bulk): "${jobToUpload.title}"`);
      } catch (err) {
        console.error(`Failed to upload job #${i + 1}`, err);
        failCount++;
      }
      setBulkProgress(Math.round(((i + 1) / bulkJobs.length) * 100));
    }

    onUpdateJobs(uploadedList);
    setBulkStatus('completed');
    alert(`Bulk job posting complete! Success: ${successCount}, Failed: ${failCount}`);
    
    if (failCount === 0) {
      setIsBulkModalOpen(false);
      setBulkInputText('');
      setBulkJobs([]);
      setBulkValidationErrors([]);
      setBulkStatus('');
    }
  };

  const handleGenerateTemplate = () => {
    const template = [
      {
        title: "Senior Node.js Developer",
        department: departments.length > 0 ? departments[0].name : "Engineering",
        location: "Mumbai, India",
        type: "Full-time",
        workMode: "Hybrid",
        salaryMin: 800000,
        salaryMax: 1500000,
        salaryCurrency: "INR",
        experienceMin: 4,
        experienceMax: 8,
        education: "B.Tech/MCA",
        skills: "Node.js, Express, PostgreSQL, Redis",
        openings: 2,
        employmentLevel: "Senior",
        assignedUserId: companyAccounts.length > 0 ? companyAccounts[0].userId : "ENTER-USER-UUID-HERE",
        applicationDeadline: "2026-08-31",
        expectedJoiningDate: "2026-09-15",
        description: "We are looking for a Senior Node.js developer to join our team...",
        requirements: "Strong background in REST APIs, PostgreSQL and AWS deployment.",
        responsibilities: "Write clean, testable code, optimize database queries, mentor juniors."
      }
    ];
    setBulkInputText(JSON.stringify(template, null, 2));
    setBulkStatus('');
    setBulkValidationErrors([]);
  };

  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        "Title": "Senior Node.js Developer",
        "Department": departments.length > 0 ? departments[0].name : "Engineering",
        "Location": "Mumbai, India",
        "Type": "Full-time",
        "Work Mode": "Hybrid",
        "Salary Min": 800000,
        "Salary Max": 1500000,
        "Salary Currency": "INR",
        "Experience Min": 4,
        "Experience Max": 8,
        "Education": "B.Tech/MCA",
        "Skills": "Node.js, Express, PostgreSQL, Redis",
        "Openings": 2,
        "Employment Level": "Senior",
        "Assigned User Id": companyAccounts.length > 0 ? companyAccounts[0].userId : "ENTER-USER-UUID-HERE",
        "Application Deadline": "2026-08-31",
        "Expected Joining Date": "2026-09-15",
        "Description": "We are looking for a Senior Node.js developer to join our team...",
        "Requirements": "Strong background in REST APIs, PostgreSQL and AWS deployment.",
        "Responsibilities": "Write clean, testable code, optimize database queries, mentor juniors."
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "job_posting_template.xlsx");
  };

  // Delete
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete the job posting for "${title}"?`)) {
      try {
        await deleteJobPosting(id);
        const updatedList = jobs.filter(j => j.id !== id);
        onUpdateJobs(updatedList);
        addActivityLog(`Deleted job opening: "${title}"`);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || err.message || 'Failed to delete job posting.');
      }
    }
  };

  // Toggle Close/Open Status
  const handleToggleStatus = async (id, currentStatus, title) => {
    const nextStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    try {
      const updatedJob = await updateJobPosting(id, { status: nextStatus });
      const updatedList = jobs.map(j => j.id === id ? updatedJob : j);
      onUpdateJobs(updatedList);
      addActivityLog(`Changed job "${title}" status to: ${nextStatus}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to toggle status.');
    }
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-base hover:bg-neutral-muted border border-neutral-border text-neutral-text font-bold text-xs rounded-theme-lg shadow-theme-sm transition-all focus:outline-none"
          >
            <Layers className="w-4.5 h-4.5" />
            <span>Bulk Post</span>
          </button>
          
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold text-xs rounded-theme-lg shadow-theme-md transition-all focus:outline-none"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Post New Job</span>
          </button>
        </div>
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
                  <th className="py-3 px-6">Assignee</th>
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

                    {/* Assignee */}
                    <td className="py-3.5 px-6 font-semibold text-neutral-text">
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-text font-bold">
                          {getAssigneeName(job.assignedUserId)}
                        </span>
                        {job.assignedUserId && (
                          <span className="text-[10px] text-neutral-text-muted mt-0.5">
                            {companyAccounts?.find(acc => acc.userId === job.assignedUserId)?.role || ''}
                          </span>
                        )}
                      </div>
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
                  {viewingJob.workMode && (
                    <span className="px-2.5 py-0.5 bg-neutral-base text-neutral-text border border-neutral-border rounded-full font-bold">{viewingJob.workMode}</span>
                  )}
                  {viewingJob.employmentLevel && (
                    <span className="px-2.5 py-0.5 bg-neutral-base text-neutral-text border border-neutral-border rounded-full font-semibold">{viewingJob.employmentLevel} Level</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-neutral-border pb-4">
                {viewingJob.salary && (
                  <div>
                    <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-0.5">Salary Range</h4>
                    <p className="font-semibold text-neutral-text">{viewingJob.salary}</p>
                  </div>
                )}
                {(viewingJob.experienceMin || viewingJob.experienceMax) && (
                  <div>
                    <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-0.5">Experience Required</h4>
                    <p className="font-semibold text-neutral-text">
                      {viewingJob.experienceMin && viewingJob.experienceMax 
                        ? `${viewingJob.experienceMin} - ${viewingJob.experienceMax} years`
                        : viewingJob.experienceMin 
                          ? `${viewingJob.experienceMin}+ years`
                          : `Up to ${viewingJob.experienceMax} years`
                      }
                    </p>
                  </div>
                )}
                {viewingJob.education && (
                  <div>
                    <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-0.5">Education</h4>
                    <p className="font-semibold text-neutral-text">{viewingJob.education}</p>
                  </div>
                )}
                {viewingJob.openings && (
                  <div>
                    <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-0.5">Total Openings</h4>
                    <p className="font-semibold text-neutral-text">{viewingJob.openings} positions</p>
                  </div>
                )}
                {viewingJob.applicationDeadline && (
                  <div>
                    <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-0.5">Application Deadline</h4>
                    <p className="font-semibold text-neutral-text">{viewingJob.applicationDeadline}</p>
                  </div>
                )}
                {viewingJob.expectedJoiningDate && (
                  <div>
                    <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-0.5">Expected Joining Date</h4>
                    <p className="font-semibold text-neutral-text">{viewingJob.expectedJoiningDate}</p>
                  </div>
                )}
              </div>

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

              {viewingJob.responsibilities && (
                <div>
                  <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-1">Key Responsibilities</h4>
                  <p className="leading-relaxed whitespace-pre-wrap font-medium">{viewingJob.responsibilities}</p>
                </div>
              )}

              {viewingJob.skills && (
                <div>
                  <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-1">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {viewingJob.skills.split(',').map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 bg-neutral-base border border-neutral-border rounded text-[10px] font-semibold">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingJob.assignedUserId && (
                <div className="border-t border-neutral-border pt-4">
                  <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider mb-1">Assigned Recruiter/Manager</h4>
                  <p className="font-semibold text-neutral-text">
                    {getAssigneeName(viewingJob.assignedUserId)} ({companyAccounts?.find(acc => acc.userId === viewingJob.assignedUserId)?.role || 'Staff'})
                  </p>
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
                  <label className="block text-xs font-bold text-neutral-text mb-1">Work Mode</label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
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
                  <label className="block text-xs font-bold text-neutral-text mb-1">Employment Level</label>
                  <select
                    name="employmentLevel"
                    value={formData.employmentLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Total Openings</label>
                  <input
                    type="number"
                    name="openings"
                    value={formData.openings}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Min Salary</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Max Salary</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    placeholder="e.g. 800000"
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Salary Currency</label>
                  <select
                    name="salaryCurrency"
                    value={formData.salaryCurrency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    name="experienceMin"
                    value={formData.experienceMin}
                    onChange={handleInputChange}
                    placeholder="e.g. 2"
                    min="0"
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Max Experience (Years)</label>
                  <input
                    type="number"
                    name="experienceMax"
                    value={formData.experienceMax}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                    min="0"
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Required Education</label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="e.g. B.Tech in Computer Science"
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-text mb-1">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Node.js, PostgreSQL"
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Application Deadline</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Expected Joining Date</label>
                  <input
                    type="date"
                    name="expectedJoiningDate"
                    value={formData.expectedJoiningDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-text mb-1">Assigned Recruiter/Manager *</label>
                  <select
                    name="assignedUserId"
                    value={formData.assignedUserId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-neutral-base border rounded-theme-lg text-xs text-neutral-text focus:outline-none ${
                      errors.assignedUserId ? 'border-danger' : 'border-neutral-border'
                    }`}
                  >
                    <option value="">Select an Assignee...</option>
                    {companyAccounts.map(acc => (
                      <option key={acc.id} value={acc.userId}>
                        {acc.fullName} ({acc.role})
                      </option>
                    ))}
                  </select>
                  {errors.assignedUserId && <p className="text-[9px] text-danger mt-1 font-semibold">{errors.assignedUserId}</p>}
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

              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Key Responsibilities</label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g. Develop APIs, participate in code reviews, optimize database queries..."
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

              {submitError && (
                <div className="p-3 bg-danger-light border border-danger/10 text-danger text-[11px] rounded-theme-lg font-bold animate-in fade-in">
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
                  {submitting && (
                    <span className="w-3.5 h-3.5 border-2 border-neutral-textInverse/30 border-t-neutral-textInverse rounded-full animate-spin" />
                  )}
                  <span>{isEditMode ? 'Update Details' : 'Post Opening'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {/* BULK JOB POSTING MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm" onClick={() => { if (bulkStatus !== 'uploading') setIsBulkModalOpen(false); }} />

          <div className="relative w-full max-w-2xl bg-neutral-surface rounded-theme-xl shadow-theme-xl border border-neutral-border z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-neutral-text">Bulk Post Job Openings</h3>
              </div>
              <button 
                onClick={() => { if (bulkStatus !== 'uploading') setIsBulkModalOpen(false); }} 
                className="p-1 text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text rounded-theme-md"
                disabled={bulkStatus === 'uploading'}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 space-y-4 text-xs">
              <div className="bg-info-light border border-info/10 p-3.5 rounded-theme-lg text-info flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-wide">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>Bulk Upload Instructions</span>
                </div>
                <p className="leading-relaxed font-medium">
                  Paste a JSON array containing job objects OR upload an Excel sheet. Valid fields include: <code>title</code> (req), <code>department</code> (req), <code>location</code> (req), <code>description</code> (req), <code>assignedUserId</code> (req), <code>workMode</code>, <code>openings</code>, <code>salaryMin</code>, <code>salaryMax</code>, <code>salaryCurrency</code>, <code>skills</code>, <code>education</code>, and dates.
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <button
                    type="button"
                    onClick={handleGenerateTemplate}
                    disabled={bulkStatus === 'uploading'}
                    className="px-3 py-1.5 bg-info hover:bg-info/95 text-neutral-textInverse font-bold rounded text-[10px] transition-colors"
                  >
                    Generate JSON Template
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadExcelTemplate}
                    disabled={bulkStatus === 'uploading'}
                    className="px-3 py-1.5 bg-neutral-text hover:bg-neutral-text/90 text-neutral-textInverse font-bold rounded text-[10px] transition-colors"
                  >
                    Download Excel Template
                  </button>
                </div>
              </div>

              {/* Excel Upload Area */}
              <div className="flex flex-col gap-1.5 p-4 border border-dashed border-neutral-border rounded-theme-lg bg-neutral-base/10 items-center justify-center text-center">
                <p className="font-bold text-neutral-text">Upload Excel Sheet (.xlsx / .xls)</p>
                <p className="text-[10px] text-neutral-text-muted">Upload an Excel sheet populated with job openings. Column names will be matched automatically.</p>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  disabled={bulkStatus === 'uploading'}
                  className="mt-2 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-neutral-textInverse hover:file:bg-primary-hover file:cursor-pointer"
                />
              </div>

              {/* Textarea */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-neutral-text">JSON Data Array</label>
                <textarea
                  value={bulkInputText}
                  onChange={(e) => {
                    setBulkInputText(e.target.value);
                    if (bulkStatus === 'validated' || bulkStatus === 'error') setBulkStatus('');
                  }}
                  rows={8}
                  disabled={bulkStatus === 'uploading'}
                  placeholder="Paste JSON array here..."
                  className="w-full p-3 font-mono text-[10.5px] bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Validation Status / Error Log */}
              {bulkValidationErrors.length > 0 && (
                <div className="bg-danger-light border border-danger/10 p-3.5 rounded-theme-lg text-danger space-y-2">
                  <h4 className="font-bold text-[11px] uppercase tracking-wide">Validation Failures</h4>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-2">
                    {bulkValidationErrors.map((err, i) => (
                      <div key={i} className="font-medium">
                        <span className="font-bold">{err.jobTitle}:</span>
                        <ul className="list-disc list-inside ml-2.5 space-y-0.5 text-[11px]">
                          {err.errors.map((msg, j) => (
                            <li key={j}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bulkStatus === 'validated' && bulkJobs.length > 0 && (
                <div className="bg-success-light border border-success/10 p-3.5 rounded-theme-lg text-success flex items-center gap-2 font-bold">
                  <Check className="w-4.5 h-4.5" />
                  <span>Success! {bulkJobs.length} job(s) parsed and validated. Ready to post.</span>
                </div>
              )}

              {/* Progress bar */}
              {bulkStatus === 'uploading' && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between font-bold text-[11px] text-neutral-text-muted">
                    <span>Uploading postings to database...</span>
                    <span>{bulkProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-base border border-neutral-border rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-neutral-border flex justify-end gap-2.5 bg-neutral-base/10">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                disabled={bulkStatus === 'uploading'}
                className="px-4 py-2 border border-neutral-border hover:bg-neutral-muted text-neutral-text font-semibold rounded-theme-lg disabled:opacity-50"
              >
                Cancel
              </button>
              
              {bulkStatus !== 'validated' ? (
                <button
                  type="button"
                  onClick={handleVerifyBulkData}
                  disabled={!bulkInputText.trim() || bulkStatus === 'uploading'}
                  className="px-4 py-2 bg-neutral-text hover:bg-neutral-text/90 text-neutral-textInverse font-bold rounded-theme-lg disabled:opacity-40"
                >
                  Verify Data
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadBulkJobs}
                  disabled={bulkStatus === 'uploading' || bulkJobs.length === 0}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold rounded-theme-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {bulkStatus === 'uploading' && (
                    <span className="w-3.5 h-3.5 border-2 border-neutral-textInverse/30 border-t-neutral-textInverse rounded-full animate-spin" />
                  )}
                  <span>Post {bulkJobs.length} Jobs</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Close modal wrapper */}

    </div>
  );
};

export default JobPostsTab;
