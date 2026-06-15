import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from '../../../api/axios';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  ChevronDown, 
  User, 
  Shield, 
  HelpCircle,
  Briefcase,
  FileText,
  Layers,
  BarChart,
  Settings as SettingsIcon,
  RefreshCw,
  MoreVertical,
  Check
} from 'lucide-react';

// Sub-components
import DashboardOverview from './DashboardOverview';
import CompanyProfileTab from './CompanyProfileTab';
import DepartmentsTab from './DepartmentsTab';
import JobPostsTab from './JobPostsTab';
import JobApplicationsTab from './JobApplicationsTab';
import EmployeesTab from './EmployeesTab';
import CompanyAdminsTab from './CompanyAdminsTab';
import ReportsTab from './ReportsTab';
import SettingsTab from './SettingsTab';

// DEFAULT SEED DATA (For local storage fallback database simulation)
const DEFAULT_DEPARTMENTS = [
  { id: 'd-1', name: 'Engineering', code: 'ENG', manager: 'Alex Rivera', headcount: 12, createdAt: '2026-01-10' },
  { id: 'd-2', name: 'Human Resources', code: 'HR', manager: 'Sarah Jenkins', headcount: 3, createdAt: '2026-02-15' },
  { id: 'd-3', name: 'Sales & Marketing', code: 'MKT', manager: 'David Kim', headcount: 5, createdAt: '2026-03-20' },
  { id: 'd-4', name: 'Customer Success', code: 'CS', manager: 'Jessica Taylor', headcount: 4, createdAt: '2026-04-05' }
];

const DEFAULT_JOBS = [
  { id: 'j-1', title: 'Senior Software Engineer', department: 'Engineering', location: 'Remote / HQ', type: 'Full-time', status: 'Active', salary: '₹18,00,000 - ₹26,00,000 P.A.', description: 'Responsible for platform backends and scalable microservice architectures.', requirements: '5+ years Node.js experience, React, PostgreSQL, AWS.', applicationsCount: 2, createdAt: '2026-06-01' },
  { id: 'j-2', title: 'HR Specialist', department: 'Human Resources', location: 'HQ Office', type: 'Full-time', status: 'Active', salary: '₹6,00,000 - ₹9,00,000 P.A.', description: 'Coordinate end-to-end recruitment sourcing, onboarding, and operations.', requirements: 'MBA in HR, excellent negotiation skills, 2+ years recruiter experience.', applicationsCount: 1, createdAt: '2026-06-05' },
  { id: 'j-3', title: 'Product Designer', department: 'Engineering', location: 'Remote', type: 'Contract', status: 'Active', salary: '₹8,00,000 - ₹12,00,000 P.A.', description: 'Draft user flows, figma interactive prototypes, and design systems.', requirements: 'Portfolio showcasing B2B app designs, Figma proficiency.', applicationsCount: 1, createdAt: '2026-06-10' },
  { id: 'j-4', title: 'Sales Executive', department: 'Sales & Marketing', location: 'HQ Office', type: 'Full-time', status: 'Closed', salary: '₹5,00,000 - ₹8,00,000 P.A.', description: 'Drive client acquisition and pitch B2B SaaS solutions.', requirements: 'Previous sales track record, high communication skills.', applicationsCount: 1, createdAt: '2026-05-15' }
];

const DEFAULT_APPLICATIONS = [
  { id: 'a-1', name: 'Alice Vance', email: 'alice.vance@gmail.com', phone: '+91 98765-99991', jobTitle: 'Senior Software Engineer', appliedDate: '2026-06-08', status: 'Shortlisted', resumeText: '10+ years backend architect. Strong skills in React, Node.js, Express, Postgres, Docker, and Kubernetes. Led a team of 4 engineers at Apex.' },
  { id: 'a-2', name: 'Bob Miller', email: 'bob.miller@outlook.com', phone: '+91 98765-99992', jobTitle: 'Senior Software Engineer', appliedDate: '2026-06-09', status: 'Applied', resumeText: 'Fullstack developer with 4 years experience. Core stack is Node.js, Express, MongoDB, and React. Passionate about automated testing.' },
  { id: 'a-3', name: 'Charlie Zhang', email: 'charlie.zhang@yahoo.com', phone: '+91 98765-99993', jobTitle: 'HR Specialist', appliedDate: '2026-06-07', status: 'Interview Scheduled', interviewDate: '2026-06-18T10:00', interviewType: 'Virtual Technical', resumeText: 'HR management graduate. 3 years as a talent scout at TechFlow. Handled onboarding contracts, employee payroll checks, and offboarding exit interviews.' },
  { id: 'a-4', name: 'Diana Prince', email: 'diana.prince@wayne.co', phone: '+91 98765-99994', jobTitle: 'Product Designer', appliedDate: '2026-06-12', status: 'Selected', resumeText: 'Senior UI/UX Researcher. 8 years designing interactive dashboards, user journey maps, and high-fidelity wireframes in Figma.' },
  { id: 'a-5', name: 'Evan Wright', email: 'evan.w@gmail.com', phone: '+91 98765-99995', jobTitle: 'Sales Executive', appliedDate: '2026-05-18', status: 'Rejected', resumeText: 'Business developer. Experienced in phone cold calling and outbound email sourcing. 1 year SaaS sales experience.' }
];

const DEFAULT_EMPLOYEES = [
  { id: 'e-1', name: 'John Doe', department: 'Engineering', designation: 'Lead Architect', email: 'john.doe@company.com', phone: '+91 98765-11111', joinDate: '2025-01-15' },
  { id: 'e-2', name: 'Jane Smith', department: 'Human Resources', designation: 'HR Lead', email: 'jane.smith@company.com', phone: '+91 98765-22222', joinDate: '2025-03-10' },
  { id: 'e-3', name: 'Michael Brown', department: 'Engineering', designation: 'Frontend Engineer', email: 'michael.b@company.com', phone: '+91 98765-33333', joinDate: '2025-06-01' },
  { id: 'e-4', name: 'Emily Davis', department: 'Sales & Marketing', designation: 'Marketing Manager', email: 'emily.d@company.com', phone: '+91 98765-44444', joinDate: '2025-11-20' }
];

const DEFAULT_ACTIVITIES = [
  { id: 1, text: 'Hiring pipeline verified on system startup.', time: 'Just now' },
  { id: 2, text: 'Workspace configuration modules loaded.', time: '5 mins ago' },
  { id: 3, text: 'Database connectivity initialized successfully.', time: '1 hour ago' }
];

const CompanyAdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    user, 
    logout,
    getCompanyDetails,
    updateCompanyDetails
  } = useAuth();

  const companyId = user?.company_id;

  // Tabs / Navigation
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'profile', 'departments', 'jobs', 'applications', 'employees', 'reports', 'settings'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Corporate Profile states (integrated with actual backend API)
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local Storage Mock Databases States
  const [departments, setDepartments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activities, setActivities] = useState([]);

  // Profile Form states
  const [profileFormData, setProfileFormData] = useState({
    companyName: '',
    companyDescription: '',
    companyAddress: '',
    companyState: '',
    companyCity: '',
    companyPincode: '',
    companyWebsite: '',
    industryType: '',
    companySize: '',
    companyEmail: '',
    companyPhone: ''
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Logo upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch backend details & Seed Local Storage databases on mount
  const initDashboard = async () => {
    if (!companyId) {
      setLoading(false);
      setError("No company workspace reference found for this user account.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch backend details
      const companyDetails = await getCompanyDetails(companyId);
      setCompany(companyDetails);
      setProfileFormData({
        companyName: companyDetails.companyName || '',
        companyDescription: companyDetails.companyDescription || '',
        companyAddress: companyDetails.companyAddress || '',
        companyState: companyDetails.companyState || '',
        companyCity: companyDetails.companyCity || '',
        companyPincode: companyDetails.companyPincode || '',
        companyWebsite: companyDetails.companyWebsite || '',
        industryType: companyDetails.industryType || '',
        companySize: companyDetails.companySize || '',
        companyEmail: companyDetails.companyEmail || '',
        companyPhone: companyDetails.companyPhone || ''
      });

      // Local Storage seed databases fallback check
      const localDepts = localStorage.getItem('jt_departments');
      if (localDepts) {
        setDepartments(JSON.parse(localDepts));
      } else {
        localStorage.setItem('jt_departments', JSON.stringify(DEFAULT_DEPARTMENTS));
        setDepartments(DEFAULT_DEPARTMENTS);
      }

      const localJobs = localStorage.getItem('jt_jobs');
      if (localJobs) {
        setJobs(JSON.parse(localJobs));
      } else {
        localStorage.setItem('jt_jobs', JSON.stringify(DEFAULT_JOBS));
        setJobs(DEFAULT_JOBS);
      }

      const localApps = localStorage.getItem('jt_applications');
      if (localApps) {
        setApplications(JSON.parse(localApps));
      } else {
        localStorage.setItem('jt_applications', JSON.stringify(DEFAULT_APPLICATIONS));
        setApplications(DEFAULT_APPLICATIONS);
      }

      const localEmps = localStorage.getItem('jt_employees');
      if (localEmps) {
        setEmployees(JSON.parse(localEmps));
      } else {
        localStorage.setItem('jt_employees', JSON.stringify(DEFAULT_EMPLOYEES));
        setEmployees(DEFAULT_EMPLOYEES);
      }

      const localLogs = localStorage.getItem('jt_activity_log');
      if (localLogs) {
        setActivities(JSON.parse(localLogs));
      } else {
        localStorage.setItem('jt_activity_log', JSON.stringify(DEFAULT_ACTIVITIES));
        setActivities(DEFAULT_ACTIVITIES);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to initialize workspace components or retrieve profile logs from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDashboard();
  }, [companyId]);

  // Sync state helpers
  const handleUpdateDepartments = (list) => {
    localStorage.setItem('jt_departments', JSON.stringify(list));
    setDepartments(list);
  };

  const handleUpdateJobs = (list) => {
    localStorage.setItem('jt_jobs', JSON.stringify(list));
    setJobs(list);
  };

  const handleUpdateApplications = (list) => {
    localStorage.setItem('jt_applications', JSON.stringify(list));
    setApplications(list);
  };

  const handleUpdateEmployees = (list) => {
    localStorage.setItem('jt_employees', JSON.stringify(list));
    setEmployees(list);
  };

  const addActivityLog = (text) => {
    const newLog = {
      id: Date.now(),
      text,
      time: 'Just now'
    };
    const updated = [newLog, ...activities.slice(0, 14)];
    localStorage.setItem('jt_activity_log', JSON.stringify(updated));
    setActivities(updated);
  };

  // Logo URL parser helper
  const getLogoUrl = (path) => {
    if (!path) return null;
    const base = axios.defaults.baseURL.replace('/api/v1', '');
    return `${base}${path}`;
  };

  // Profile Form Handling (integrated with backend API)
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      await updateCompanyDetails(companyId, profileFormData);
      setProfileSuccess('Corporate workspace profile parameters updated successfully!');
      addActivityLog('Updated company details in postgres database.');
      const companyDetails = await getCompanyDetails(companyId);
      setCompany(companyDetails);
    } catch (err) {
      console.error(err);
      setProfileError(err.message || 'Failed to update company details.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Logo file change handler
  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Upload Logo
  const handleUploadLogo = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    const formDataObj = new FormData();
    formDataObj.append('logo', logoFile);

    try {
      const response = await axios.post('/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        const logoUrl = response.data.logoUrl;
        await updateCompanyDetails(companyId, { companyLogo: logoUrl });
        const companyDetails = await getCompanyDetails(companyId);
        setCompany(companyDetails);
        setProfileSuccess('Company logo uploaded and updated successfully!');
        addActivityLog('Uploaded and saved new company branding logo.');
        setLogoFile(null);
      }
    } catch (err) {
      console.error(err);
      setProfileError('Failed to upload logo: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingLogo(false);
    }
  };

  // Dynamically calculate stats based on state
  const dashboardStats = {
    departments: departments.length,
    employees: employees.length,
    activeJobs: jobs.filter(j => j.status === 'Active').length,
    applications: applications.length,
    selected: applications.filter(a => a.status === 'Selected').length
  };

  return (
    <div className="min-h-screen bg-neutral-base font-sans relative flex">
      {/* BACKGROUND ACCENTS (Premium blur effects) */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-light/30 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary-light/20 rounded-full blur-[80px] pointer-events-none z-0" />

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-text/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION (Collapsible and premium styled) */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-neutral-surface border-r border-neutral-border flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex print:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ boxShadow: isSidebarOpen ? 'var(--shadow-xl)' : 'none' }}
      >
        {/* Brand Header */}
        <div className="h-[70px] px-6 border-b border-neutral-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-theme-xl bg-primary flex items-center justify-center text-neutral-textInverse shadow-theme-glow shrink-0">
              <Building2 className="w-5.5 h-5.5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-neutral-text leading-tight truncate">
                {company?.companyName || 'Corporate Portal'}
              </h1>
              <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full border border-primary/20">
                COMPANY ADMIN
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-theme-md text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {/* Dashboard */}
          <button
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-bold text-xs transition-all duration-200 group relative ${
              activeTab === 'overview'
                ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
            }`}
          >
            {activeTab === 'overview' && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-neutral-textInverse rounded-r-full" />
            )}
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-bold text-xs transition-all duration-200 group relative ${
              activeTab === 'profile'
                ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
            }`}
          >
            {activeTab === 'profile' && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-neutral-textInverse rounded-r-full" />
            )}
            <Building2 className="w-5 h-5" />
            <span>Company Profile</span>
          </button>

          {/* Departments */}
          <button
            onClick={() => { setActiveTab('departments'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-bold text-xs transition-all duration-200 group relative ${
              activeTab === 'departments'
                ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
            }`}
          >
            {activeTab === 'departments' && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-neutral-textInverse rounded-r-full" />
            )}
            <Layers className="w-5 h-5" />
            <span>Departments</span>
          </button>

          {/* Job Posts */}
          <button
            onClick={() => { setActiveTab('jobs'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-bold text-xs transition-all duration-200 group relative ${
              activeTab === 'jobs'
                ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
            }`}
          >
            {activeTab === 'jobs' && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-neutral-textInverse rounded-r-full" />
            )}
            <Briefcase className="w-5 h-5" />
            <span>Job Posts</span>
          </button>

          {/* Job Applications */}
          <button
            onClick={() => { setActiveTab('applications'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-bold text-xs transition-all duration-200 group relative ${
              activeTab === 'applications'
                ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
            }`}
          >
            {activeTab === 'applications' && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-neutral-textInverse rounded-r-full" />
            )}
            <FileText className="w-5 h-5" />
            <span>Job Applications</span>
          </button>

          {/* Employees */}
          <button
            onClick={() => { setActiveTab('employees'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-bold text-xs transition-all duration-200 group relative ${
              activeTab === 'employees'
                ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
            }`}
          >
            {activeTab === 'employees' && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-neutral-textInverse rounded-r-full" />
            )}
            <Users className="w-5 h-5" />
            <span>Employees</span>
          </button>

          {/* Admin Accounts / Roles */}
          <button
            onClick={() => { setActiveTab('admins'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-bold text-xs transition-all duration-200 group relative ${
              activeTab === 'admins'
                ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
            }`}
          >
            {activeTab === 'admins' && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-neutral-textInverse rounded-r-full" />
            )}
            <Shield className="w-5 h-5" />
            <span>Admin Accounts</span>
          </button>

          {/* Reports */}
          <button
            onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-bold text-xs transition-all duration-200 group relative ${
              activeTab === 'reports'
                ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
            }`}
          >
            {activeTab === 'reports' && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-neutral-textInverse rounded-r-full" />
            )}
            <BarChart className="w-5 h-5" />
            <span>Reports</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-bold text-xs transition-all duration-200 group relative ${
              activeTab === 'settings'
                ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
            }`}
          >
            {activeTab === 'settings' && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-neutral-textInverse rounded-r-full" />
            )}
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-border bg-neutral-base/40">
          <div className="flex items-center gap-3 p-2 rounded-theme-lg bg-neutral-surface border border-neutral-border shadow-theme-sm mb-3">
            <div className="w-10 h-10 rounded-theme-md bg-secondary-light text-secondary flex items-center justify-center font-bold uppercase shrink-0">
              {user?.admin_name ? user.admin_name.charAt(0) : (user?.email ? user.email.charAt(0) : 'A')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-text truncate">
                {user?.admin_name || 'Admin Accounts'}
              </p>
              <p className="text-[10px] text-neutral-text-muted truncate">
                {user?.email || 'admin@company.com'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-theme-lg font-medium text-sm text-danger hover:bg-danger-light transition-all duration-200 border border-transparent hover:border-danger/10"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        
        {/* TOP BAR */}
        <header className="h-[70px] px-4 md:px-6 bg-neutral-surface/85 backdrop-blur-md border-b border-neutral-border flex items-center justify-between sticky top-0 z-30 shadow-theme-sm print:hidden">
          {/* Left Area: Toggle Menu and title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-theme-md text-neutral-text hover:bg-neutral-muted lg:hidden transition-colors focus:outline-none"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="font-bold text-lg md:text-xl text-neutral-text capitalize">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'profile' && 'Company Profile'}
                {activeTab === 'departments' && 'Departments'}
                {activeTab === 'jobs' && 'Job Posts'}
                {activeTab === 'applications' && 'Job Applications'}
                {activeTab === 'employees' && 'Employees'}
                {activeTab === 'admins' && 'Admin Accounts'}
                {activeTab === 'reports' && 'Recruitment Reports'}
                {activeTab === 'settings' && 'Settings'}
              </h2>
            </div>
          </div>

          {/* Right Area: Status Indicator, Notification, and Profile dropdown */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-light border border-success/10 text-success text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Workspace Active</span>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2 rounded-theme-xl text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text relative transition-colors focus:outline-none"
                aria-label="View notifications"
              >
                <Bell className="w-5.5 h-5.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-neutral-surface" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-[320px] bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-lg py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-neutral-border flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-text">Notifications</span>
                    <button className="text-xs text-primary hover:underline font-semibold">Mark all read</button>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    <div className="px-4 py-3 border-b border-neutral-border hover:bg-neutral-base transition-colors flex flex-col gap-1 cursor-pointer">
                      <p className="text-xs text-neutral-text font-medium leading-normal">New application submitted for Senior Software Engineer</p>
                      <span className="text-[10px] text-neutral-text-muted">5 mins ago</span>
                    </div>
                    <div className="px-4 py-3 border-b border-neutral-border hover:bg-neutral-base transition-colors flex flex-col gap-1 cursor-pointer">
                      <p className="text-xs text-neutral-text font-medium leading-normal">Candidate Alice Vance shortlisted</p>
                      <span className="text-[10px] text-neutral-text-muted">1 hour ago</span>
                    </div>
                    <div className="px-4 py-3 border-b border-neutral-border hover:bg-neutral-base transition-colors flex flex-col gap-1 cursor-pointer">
                      <p className="text-xs text-neutral-text font-medium leading-normal">Database pool diagnostics completed successfully</p>
                      <span className="text-[10px] text-neutral-text-muted">3 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1 md:pr-3 rounded-full hover:bg-neutral-muted transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-neutral-textInverse flex items-center justify-center font-bold text-sm shadow-theme-sm border border-neutral-border uppercase">
                  {user?.admin_name ? user.admin_name.charAt(0) : (user?.email ? user.email.charAt(0) : 'A')}
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-semibold text-neutral-text leading-tight truncate max-w-[120px]">
                    {user?.admin_name || 'Admin'}
                  </span>
                  <span className="text-[10px] text-neutral-text-muted">
                    Workspace Owner
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-text-muted hidden md:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2.5 w-[220px] bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-lg py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-3 border-b border-neutral-border">
                    <p className="text-xs text-neutral-text-muted leading-tight">Logged in as</p>
                    <p className="text-sm font-semibold text-neutral-text truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      onClick={() => { setIsProfileOpen(false); setActiveTab('profile'); }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-text hover:bg-neutral-muted flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-neutral-text-muted" />
                      <span>Company Settings</span>
                    </button>
                    
                    <button 
                      onClick={() => { setIsProfileOpen(false); setActiveTab('settings'); }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-text hover:bg-neutral-muted flex items-center gap-2.5 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4 text-neutral-text-muted" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-neutral-border mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-xs text-danger hover:bg-danger-light flex items-center gap-2.5 font-semibold transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* VIEW BODY CONTENT */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto z-10 relative">
          
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
              <RefreshCw className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-neutral-text-muted font-medium">Booting dashboard module environment...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-danger-light border border-danger/20 rounded-theme-xl text-center text-danger font-semibold text-sm max-w-xl mx-auto mt-12">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Dynamic View Tab Routing */}
              {activeTab === 'overview' && (
                <DashboardOverview 
                  stats={dashboardStats} 
                  activities={activities} 
                />
              )}

              {activeTab === 'profile' && (
                <CompanyProfileTab
                  profileFormData={profileFormData}
                  profileSubmitting={profileSubmitting}
                  profileSuccess={profileSuccess}
                  profileError={profileError}
                  uploadingLogo={uploadingLogo}
                  logoPreview={logoPreview}
                  companyLogo={company?.companyLogo}
                  handleProfileInputChange={handleProfileInputChange}
                  handleUpdateProfile={handleUpdateProfile}
                  handleLogoFileChange={handleLogoFileChange}
                  handleUploadLogo={handleUploadLogo}
                  logoFile={logoFile}
                  getLogoUrl={getLogoUrl}
                />
              )}

              {activeTab === 'departments' && (
                <DepartmentsTab
                  departments={departments}
                  onUpdateDepartments={handleUpdateDepartments}
                  addActivityLog={addActivityLog}
                />
              )}

              {activeTab === 'jobs' && (
                <JobPostsTab
                  jobs={jobs}
                  departments={departments}
                  onUpdateJobs={handleUpdateJobs}
                  addActivityLog={addActivityLog}
                />
              )}

              {activeTab === 'applications' && (
                <JobApplicationsTab
                  applications={applications}
                  jobs={jobs}
                  onUpdateApplications={handleUpdateApplications}
                  addActivityLog={addActivityLog}
                />
              )}

              {activeTab === 'employees' && (
                <EmployeesTab
                  employees={employees}
                  departments={departments}
                  onUpdateEmployees={handleUpdateEmployees}
                  addActivityLog={addActivityLog}
                />
              )}

              {activeTab === 'admins' && (
                <CompanyAdminsTab
                  companyId={companyId}
                  addActivityLog={addActivityLog}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsTab
                  stats={dashboardStats}
                  departments={departments}
                  jobs={jobs}
                  applications={applications}
                  employees={employees}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab 
                  addActivityLog={addActivityLog} 
                />
              )}
            </>
          )}

        </main>
      </div>

    </div>
  );
};

export default CompanyAdminDashboard;