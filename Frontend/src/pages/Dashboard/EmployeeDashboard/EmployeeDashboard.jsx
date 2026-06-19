import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../../api/axios';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  User,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  ChevronRight,
  Shield,
  HelpCircle,
  Eye,
  Globe,
  Sun,
  Moon,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
  Paperclip,
  CheckCircle,
  ChevronDown
} from 'lucide-react';

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Github = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Data States
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    applied: 0,
    saved: 0,
    completion: 0,
    newMatches: 0
  });

  // Redesigned Filter States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filterExperienceLevels, setFilterExperienceLevels] = useState([]);
  const [filterJobTypes, setFilterJobTypes] = useState([]);
  const [filterWorkModes, setFilterWorkModes] = useState([]);
  const [filterSalaryMin, setFilterSalaryMin] = useState(0);
  const [filterSalaryMax, setFilterSalaryMax] = useState(2500000);
  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterPostedDate, setFilterPostedDate] = useState('any');
  const [sortBy, setSortBy] = useState('mostRelevant');
  const [onlyProfileMatches, setOnlyProfileMatches] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Form States
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    dob: '',
    maritalStatus: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    emergencyContactName: '',
    emergencyContactNumber: ''
  });
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    portfolio: ''
  });

  // LinkedIn Easy Apply States
  const [applyJobData, setApplyJobData] = useState(null);
  const [submittedAppId, setSubmittedAppId] = useState(null);
  const [appliedJobName, setAppliedJobName] = useState('');
  const [appliedCompanyName, setAppliedCompanyName] = useState('');
  const [applyForm, setApplyForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    coverLetter: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    totalExperience: '',
    currentCompany: '',
    currentDesignation: '',
    currentCtc: '',
    expectedCtc: '',
    noticePeriod: 'Immediate',
    currentLocation: '',
    preferredLocation: '',
    willingToRelocate: false,
    willingToWorkRemote: true
  });

  // Settings states
  const [securityForm, setSecurityForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsPrefs, setSettingsPrefs] = useState({
    emailAlerts: true,
    privacyMode: false,
    twoFactor: false
  });

  // File Upload states
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  // Modal / Detail States
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  // Loading States
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Refs
  const notificationsRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchProfile();
    fetchJobs();
    fetchSavedJobs();
    fetchAppliedJobs();
    fetchNotifications();

    const fetchDepts = async () => {
      try {
        const response = await axios.get('/departments');
        if (response.data.success) {
          setDepartments(response.data.data || []);
        }
      } catch (e) {
        console.error('Failed to load departments:', e);
      }
    };
    fetchDepts();
  }, []);

  // Recalculate Stats whenever related state variables change
  useEffect(() => {
    if (profile) {
      calculateStats();
    }
  }, [profile, jobs, savedJobs, appliedJobs]);

  // Sync URL routes with activeTab and selectedJob
  useEffect(() => {
    if (location.pathname.startsWith('/jobs')) {
      setActiveTab('browse');
      if (jobId) {
        const foundJob = jobs.find(j => j.id === jobId);
        if (foundJob) {
          if (selectedJob?.id !== jobId) {
            setSelectedJob(foundJob);
          }
        } else {
          const fetchSpecificJob = async () => {
            try {
              const res = await axios.get(`/jobs/${jobId}`);
              if (res.data.success) {
                const fetched = res.data.data;
                setJobs(prev => prev.some(j => j.id === jobId) ? prev : [fetched, ...prev]);
                setSelectedJob(fetched);
              }
            } catch (err) {
              console.error('Failed to fetch job details from URL:', err);
              setSelectedJob(null);
            }
          };
          fetchSpecificJob();
        }
      } else {
        setSelectedJob(null);
      }
    }
  }, [location.pathname, jobId, jobs.length]);

  // Auto-initialize applyForm when entering apply page
  useEffect(() => {
    if (location.pathname.endsWith('/apply') && selectedJob && profile) {
      setApplyForm(prev => ({
        ...prev,
        fullName: prev.fullName || (personalInfo.firstName ? `${personalInfo.firstName} ${personalInfo.lastName || ''}`.trim() : ''),
        email: prev.email || profile?.email || '',
        phoneNumber: prev.phoneNumber || personalInfo.phone || '',
        coverLetter: prev.coverLetter || '',
        portfolioUrl: prev.portfolioUrl || socialLinks.portfolio || '',
        linkedinUrl: prev.linkedinUrl || socialLinks.linkedin || '',
        githubUrl: prev.githubUrl || socialLinks.github || '',
        totalExperience: prev.totalExperience || (experienceList.length > 0 ? '2' : '0'),
        currentCompany: prev.currentCompany || experienceList[0]?.company || '',
        currentDesignation: prev.currentDesignation || experienceList[0]?.title || '',
        currentCtc: prev.currentCtc || '',
        expectedCtc: prev.expectedCtc || '',
        noticePeriod: prev.noticePeriod || 'Immediate',
        currentLocation: prev.currentLocation || personalInfo.city || '',
        preferredLocation: prev.preferredLocation || '',
        willingToRelocate: prev.willingToRelocate || false,
        willingToWorkRemote: prev.willingToWorkRemote || true
      }));
    }
  }, [location.pathname, selectedJob, profile, personalInfo]);

  const triggerAlert = (type, message) => {
    setAlertMsg({ type, message });
    setTimeout(() => {
      setAlertMsg(null);
    }, 5000);
  };

  const calculateStats = () => {
    // 1. Completion Percentage logic
    let completedFields = 0;
    const fieldsToVerify = [
      profile.firstName,
      profile.phone,
      profile.address,
      profile.city,
      profile.resumeUrl,
      profile.profilePicture
    ];
    fieldsToVerify.forEach(field => {
      if (field && field !== '') completedFields++;
    });

    if (skillsList.length > 0) completedFields++;
    if (educationList.length > 0) completedFields++;
    if (experienceList.length > 0) completedFields++;

    const totalFields = fieldsToVerify.length + 3;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    // 2. Count matches based on skills overlap
    let matchesCount = 0;
    if (skillsList.length > 0) {
      jobs.forEach(job => {
        if (job.skills) {
          const jobSkills = job.skills.toLowerCase().split(',').map(s => s.trim());
          const hasOverlap = skillsList.some(skill => jobSkills.includes(skill.toLowerCase()));
          if (hasOverlap) matchesCount++;
        }
      });
    }

    setStats({
      totalJobs: jobs.length,
      applied: appliedJobs.length,
      saved: savedJobs.length,
      completion: completionPercentage,
      newMatches: matchesCount
    });
  };

  // API Call - Fetch Profile
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await axios.get('/employee/profile');
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        
        // Populate form states
        setPersonalInfo({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          gender: data.gender || '',
          dob: data.dob ? data.dob.split('T')[0] : '',
          maritalStatus: data.maritalStatus || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          pincode: data.pincode || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactNumber: data.emergencyContactNumber || ''
        });

        setEducationList(Array.isArray(data.education) ? data.education : []);
        setExperienceList(Array.isArray(data.experience) ? data.experience : []);
        setSocialLinks({
          linkedin: data.socialLinks?.linkedin || '',
          github: data.socialLinks?.github || '',
          portfolio: data.socialLinks?.portfolio || ''
        });

        if (data.skills) {
          setSkillsList(data.skills.split(',').map(s => s.trim()).filter(s => s !== ''));
        } else {
          setSkillsList([]);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      triggerAlert('error', 'Failed to load profile details.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // API Call - Fetch Jobs
  const fetchJobs = async (customKeyword = '', customLocation = '') => {
    setLoadingJobs(true);
    try {
      const kw = typeof customKeyword === 'string' ? customKeyword : searchKeyword;
      const loc = typeof customLocation === 'string' ? customLocation : searchLocation;
      
      const response = await axios.get('/jobs', {
        params: {
          keyword: kw || undefined,
          location: loc || undefined,
          experienceLevels: filterExperienceLevels.length > 0 ? filterExperienceLevels.join(',') : undefined,
          jobTypes: filterJobTypes.length > 0 ? filterJobTypes.join(',') : undefined,
          workModes: filterWorkModes.length > 0 ? filterWorkModes.join(',') : undefined,
          salaryMin: filterSalaryMin > 0 ? filterSalaryMin : undefined,
          salaryMax: filterSalaryMax < 2500000 ? filterSalaryMax : undefined,
          departmentId: filterDepartmentId || undefined,
          industry: filterIndustry || undefined,
          postedDate: filterPostedDate !== 'any' ? filterPostedDate : undefined,
          sortBy: onlyProfileMatches ? 'bestMatch' : sortBy
        }
      });
      if (response.data.success) {
        const data = response.data.data || [];
        setJobs(data);
        
        // Auto-select the first job on desktop if results exist and no active selection is present in the URL
        if (data.length > 0) {
          const exists = data.some(j => j.id === jobId);
          if (exists) {
            const found = data.find(j => j.id === jobId);
            setSelectedJob(found);
          } else {
            if (location.pathname === '/jobs' && window.innerWidth >= 1024) {
              navigate(`/jobs/${data[0].id}`, { replace: true });
            } else if (!jobId) {
              setSelectedJob(data[0]);
            }
          }
        } else {
          setSelectedJob(null);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      triggerAlert('error', 'Failed to search jobs.');
    } finally {
      setLoadingJobs(false);
    }
  };

  // Reset filter controls
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSearchLocation('');
    setFilterExperienceLevels([]);
    setFilterJobTypes([]);
    setFilterWorkModes([]);
    setFilterSalaryMin(0);
    setFilterSalaryMax(2500000);
    setFilterDepartmentId('');
    setFilterIndustry('');
    setFilterPostedDate('any');
    setSortBy('mostRelevant');
    setOnlyProfileMatches(false);
    
    setTimeout(() => {
      // Re-fetch jobs without parameters
      axios.get('/jobs').then(response => {
        if (response.data.success) {
          const data = response.data.data || [];
          setJobs(data);
          if (data.length > 0) {
            if (window.innerWidth >= 1024) {
              navigate(`/jobs/${data[0].id}`, { replace: true });
            } else {
              setSelectedJob(data[0]);
              navigate(`/jobs/${data[0].id}`);
            }
          } else {
            setSelectedJob(null);
            navigate('/jobs');
          }
        }
      }).catch(err => {
        console.error('Failed to reset jobs:', err);
      });
    }, 50);
  };

  // API Call - Save / Bookmark Job
  const handleToggleSaveJob = async (jobIdToSave) => {
    setLoadingAction(true);
    try {
      const response = await axios.post(`/employee/jobs/${jobIdToSave}/save`);
      if (response.data.success) {
        triggerAlert('success', response.data.message);
        fetchSavedJobs();
        fetchJobs();
      }
    } catch (error) {
      console.error('Error toggling job bookmark:', error);
      triggerAlert('error', 'Failed to update bookmarked job.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Open Easy Apply Modal (inspired by LinkedIn)
  const handleApplyJob = (job) => {
    if (!profile?.resumeUrl) {
      triggerAlert('warning', 'Please upload your resume in the Resume tab before applying.');
      navigate('/employee');
      setActiveTab('resume');
      return;
    }

    setApplyForm({
      fullName: personalInfo.firstName ? `${personalInfo.firstName} ${personalInfo.lastName || ''}`.trim() : '',
      email: profile?.email || '',
      phoneNumber: personalInfo.phone || '',
      coverLetter: '',
      portfolioUrl: socialLinks.portfolio || '',
      linkedinUrl: socialLinks.linkedin || '',
      githubUrl: socialLinks.github || '',
      totalExperience: experienceList.length > 0 ? '2' : '0',
      currentCompany: experienceList[0]?.company || '',
      currentDesignation: experienceList[0]?.title || '',
      currentCtc: '',
      expectedCtc: '',
      noticePeriod: 'Immediate',
      currentLocation: personalInfo.city || '',
      preferredLocation: '',
      willingToRelocate: false,
      willingToWorkRemote: true
    });
    
    navigate(`/jobs/${job.id}/apply`);
  };

  // Submit LinkedIn-style Application
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const targetJobId = selectedJob?.id || jobId;
      const response = await axios.post(`/jobs/${targetJobId}/apply`, applyForm);
      if (response.data.success) {
        const appId = response.data.data?.applicationId || response.data.data?.id;

        fetchAppliedJobs();
        fetchJobs();
        fetchNotifications();
        
        navigate(`/jobs/${targetJobId}/application-success`, {
          state: {
            appId,
            jobTitle: selectedJob?.title || '',
            companyName: selectedJob?.companyName || ''
          }
        });
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      triggerAlert('error', error.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoadingAction(false);
    }
  };

  // API Call - Get Saved Jobs
  const fetchSavedJobs = async () => {
    try {
      const response = await axios.get('/employee/saved-jobs');
      if (response.data.success) {
        setSavedJobs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  // API Call - Get Applied Jobs
  const fetchAppliedJobs = async () => {
    try {
      const response = await axios.get('/employee/applied-jobs');
      if (response.data.success) {
        setAppliedJobs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  // API Call - Get Notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/employee/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      const response = await axios.put(`/employee/notifications/${id}/read`);
      if (response.data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const response = await axios.put('/employee/notifications/read-all');
      if (response.data.success) {
        fetchNotifications();
        triggerAlert('success', 'All notifications marked as read.');
      }
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  };

  // API Call - Update Profile Settings
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const payload = {
        ...personalInfo,
        education: educationList,
        experience: experienceList,
        skills: skillsList.join(','),
        socialLinks
      };

      const response = await axios.put('/employee/profile', payload);
      if (response.data.success) {
        triggerAlert('success', 'Profile configuration saved successfully.');
        fetchProfile();
      }
    } catch (error) {
      console.error('Error saving profile changes:', error);
      triggerAlert('error', 'Failed to save profile changes.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Upload Avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoadingAction(true);
    setUploadProgress(40);
    try {
      const response = await axios.post('/employee/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setUploadProgress(100);
        triggerAlert('success', 'Profile picture updated successfully.');
        fetchProfile();
        setTimeout(() => setUploadProgress(null), 1500);
      }
    } catch (error) {
      console.error('Error uploading avatar image:', error);
      triggerAlert('error', error.response?.data?.message || 'Failed to upload image.');
      setUploadProgress(null);
    } finally {
      setLoadingAction(false);
    }
  };

  // Upload Resume
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setLoadingAction(true);
    setUploadProgress(30);
    try {
      const response = await axios.post('/employee/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setUploadProgress(100);
        triggerAlert('success', 'Resume PDF uploaded successfully.');
        fetchProfile();
        setTimeout(() => setUploadProgress(null), 1500);
      }
    } catch (error) {
      console.error('Error uploading resume file:', error);
      triggerAlert('error', error.response?.data?.message || 'Failed to upload document.');
      setUploadProgress(null);
    } finally {
      setLoadingAction(false);
    }
  };

  // Update Password Settings
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      triggerAlert('warning', 'New passwords do not match.');
      return;
    }

    setLoadingAction(true);
    try {
      const response = await axios.put('/employee/settings', {
        oldPassword: securityForm.oldPassword,
        newPassword: securityForm.newPassword
      });
      if (response.data.success) {
        triggerAlert('success', 'Your password has been changed successfully.');
        setSecurityForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Error changing security password:', error);
      triggerAlert('error', error.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: Are you absolutely sure you want to delete your profile account? This action is irreversible.')) {
      setLoadingAction(true);
      try {
        const response = await axios.delete('/employee/account');
        if (response.data.success) {
          alert('Your account has been deleted.');
          logout();
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        triggerAlert('error', 'Failed to delete account.');
      } finally {
        setLoadingAction(false);
      }
    }
  };

  // Dynamic search trigger from header
  const handleHeaderSearch = (e) => {
    e.preventDefault();
    navigate('/jobs');
    setActiveTab('browse');
    fetchJobs();
  };

  // Helper lists logic for profile forms
  const addEducation = () => {
    setEducationList([...educationList, { degree: '', school: '', startYear: '', endYear: '' }]);
  };

  const removeEducation = (index) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };

  const addExperience = () => {
    setExperienceList([...experienceList, { title: '', company: '', duration: '', description: '' }]);
  };

  const removeExperience = (index) => {
    setExperienceList(experienceList.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experienceList];
    updated[index][field] = value;
    setExperienceList(updated);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      setSkillsList([...skillsList, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter(s => s !== skillToRemove));
  };

  // Helper classes for Light/Dark mode
  const bgClass = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardClass = isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800';
  const textMutedClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDarkMode ? 'border-slate-800' : 'border-slate-200/80';
  const inputClass = isDarkMode 
    ? 'bg-slate-800/80 border-slate-700 text-slate-200 focus:border-indigo-500' 
    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600';

  return (
    <div className={`min-h-screen ${bgClass} font-sans flex flex-col transition-colors duration-300 relative`}>
      {/* Background Graphic Accents */}
      <div className={`absolute top-0 right-0 w-[400px] h-[400px] ${isDarkMode ? 'bg-indigo-900/10' : 'bg-indigo-100/40'} rounded-full blur-[120px] pointer-events-none z-0`} />
      <div className={`absolute bottom-0 left-0 w-[300px] h-[300px] ${isDarkMode ? 'bg-sky-900/10' : 'bg-sky-100/30'} rounded-full blur-[100px] pointer-events-none z-0`} />

      {/* ALERT TOAST */}
      {alertMsg && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm w-full shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-theme-xl border flex items-start gap-3 ${
            alertMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            alertMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
            'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            {alertMsg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <div className="flex-1 text-sm font-medium">{alertMsg.message}</div>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className={`h-[72px] px-4 md:px-6 sticky top-0 z-40 backdrop-blur-md border-b ${borderClass} flex items-center justify-between shadow-theme-sm transition-colors duration-200 ${isDarkMode ? 'bg-slate-950/80' : 'bg-white/80'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2 rounded-theme-md lg:hidden hover:bg-slate-100 focus:outline-none ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-theme-xl bg-indigo-600 flex items-center justify-center text-white shadow-theme-glow">
              <Briefcase className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">JobPortal</h1>
              <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-500/10">
                Candidate
              </span>
            </div>
          </div>
        </div>

        {/* Global Job Search in Header */}
        <form onSubmit={handleHeaderSearch} className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search jobs by title, skills or keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-sm rounded-full border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${inputClass}`}
          />
        </form>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Light/Dark mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-theme-xl transition-colors hover:bg-slate-100 ${isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-600'}`}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileDropdownOpen(false);
              }}
              className={`p-2 rounded-theme-xl relative transition-colors ${
                isNotificationsOpen 
                  ? (isDarkMode ? 'bg-slate-800' : 'bg-slate-100') 
                  : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600')
              }`}
            >
              <Bell className="w-5.5 h-5.5" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className={`absolute right-0 mt-3 w-80 rounded-theme-xl border shadow-theme-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 ${cardClass}`}>
                <div className="px-4 py-2 border-b border-inherit flex items-center justify-between">
                  <span className="font-bold text-sm">Recent Alerts</span>
                  <button onClick={handleMarkAllNotificationsRead} className="text-xs text-indigo-500 hover:underline font-semibold">
                    Read All
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          handleMarkNotificationRead(n.id);
                          setIsNotificationsOpen(false);
                          setActiveTab('notifications');
                        }}
                        className={`px-4 py-3 border-b border-inherit hover:bg-slate-100/50 dark:hover:bg-slate-800/50 cursor-pointer flex flex-col gap-1 ${
                          !n.isRead ? 'bg-indigo-500/5 dark:bg-indigo-500/5' : ''
                        }`}
                      >
                        <p className="text-xs font-semibold">{n.title}</p>
                        <p className={`text-[11px] leading-normal ${textMutedClass}`}>{n.message}</p>
                        <span className="text-[9px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-1.5 border-t border-inherit text-center">
                  <button onClick={() => { setActiveTab('notifications'); setIsNotificationsOpen(false); }} className="text-xs text-indigo-500 font-semibold hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {profile?.profilePicture ? (
                <img
                  src={`http://localhost:5000${profile.profilePicture}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {personalInfo.firstName ? personalInfo.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileDropdownOpen && (
              <div className={`absolute right-0 mt-3 w-52 rounded-theme-xl border shadow-theme-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 ${cardClass}`}>
                <div className="px-4 py-2.5 border-b border-inherit">
                  <p className="text-xs text-slate-400">Logged in as</p>
                  <p className="text-xs font-semibold truncate mt-0.5">{profile?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/employee'); setActiveTab('profile'); setIsProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => { navigate('/employee'); setActiveTab('settings'); setIsProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Account Settings</span>
                  </button>
                </div>
                <div className="border-t border-inherit mt-1 pt-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-500 font-semibold hover:bg-rose-500/5 flex items-center gap-2"
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

      {/* WORKSPACE CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* MOBILE SIDEBAR DRAWEROVERLAY */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR PANEL */}
        <aside className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 border-r ${borderClass} flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 bg-slate-900 lg:bg-transparent text-white' : '-translate-x-full'
        } ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
          <div className="h-[72px] px-6 border-b border-inherit flex items-center justify-between lg:hidden">
            <span className="font-bold text-base">Menu</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'browse', label: 'Browse Jobs', icon: Briefcase },
              { id: 'saved', label: 'Saved Jobs', icon: Bookmark },
              { id: 'applied', label: 'Applied Jobs', icon: FileText },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'resume', label: 'Resume', icon: Upload },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'settings', label: 'Settings', icon: SettingsIcon }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'browse') {
                      navigate(selectedJob ? `/jobs/${selectedJob.id}` : '/jobs');
                    } else {
                      navigate('/employee');
                      setActiveTab(tab.id);
                    }
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-theme-lg font-medium text-sm transition-all duration-200 group relative ${
                    active
                      ? 'bg-indigo-600 text-white shadow-theme-md'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'notifications' && notifications.some(n => !n.isRead) && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar profile summary */}
          <div className="p-4 border-t border-inherit bg-slate-50/40 dark:bg-slate-900/40 m-2 rounded-theme-xl">
            <div className="flex items-center gap-3">
              {profile?.profilePicture ? (
                <img
                  src={`http://localhost:5000${profile.profilePicture}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {personalInfo.firstName ? personalInfo.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">
                  {personalInfo.firstName ? `${personalInfo.firstName} ${personalInfo.lastName || ''}` : 'Candidate Profile'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN DISPLAY SCROLLABLE WINDOW */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 z-10">
          {loadingProfile ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-slate-400 animate-pulse">Loading dashboard...</span>
              </div>
            </div>
          ) : (
            <>
              {/* SUB TAB: OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Dashboard Welcome Header */}
                  <div className={`p-6 md:p-8 rounded-theme-2xl border ${cardClass} relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-theme-md`}>
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-2 text-indigo-500 font-semibold text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>Welcome Back</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        Hi, {personalInfo.firstName || 'Candidate'}!
                      </h2>
                      <p className={`text-sm max-w-lg leading-relaxed ${textMutedClass}`}>
                        Explore new opportunities matched to your profile skills, track application progress, and manage documents.
                      </p>
                    </div>
                    {/* Completion rate circle indicator */}
                    <div className="relative flex items-center gap-4 bg-indigo-500/5 dark:bg-indigo-500/10 px-5 py-4 rounded-theme-xl border border-indigo-500/10 max-w-sm">
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeWidth="3" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#4f46e5" strokeWidth="3" 
                            strokeDasharray="100" strokeDashoffset={100 - stats.completion} strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-[11px] font-bold">{stats.completion}%</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold">Profile Completion</p>
                        <p className={`text-[10px] leading-snug ${textMutedClass} mt-0.5`}>
                          Add details to increase visibility.
                        </p>
                        <button onClick={() => setActiveTab('profile')} className="text-[10px] text-indigo-500 font-bold hover:underline flex items-center gap-0.5 mt-1.5">
                          Complete Profile <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY CARDS GRID */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { label: 'Jobs Available', val: stats.totalJobs, color: 'indigo', icon: Briefcase, tab: 'browse' },
                      { label: 'Applied Jobs', val: stats.applied, color: 'emerald', icon: FileText, tab: 'applied' },
                      { label: 'Saved Jobs', val: stats.saved, color: 'amber', icon: Bookmark, tab: 'saved' },
                      { label: 'Job Matches', val: stats.newMatches, color: 'pink', icon: Sparkles, tab: 'browse' },
                      { label: 'Profile Score', val: `${stats.completion}%`, color: 'sky', icon: User, tab: 'profile' }
                    ].map((stat, i) => {
                      const StatIcon = stat.icon;
                      return (
                        <div
                          key={i}
                          onClick={() => setActiveTab(stat.tab)}
                          className={`p-5 rounded-theme-xl border ${cardClass} hover:border-indigo-500/30 hover:shadow-theme-md transition-all duration-200 cursor-pointer relative overflow-hidden group`}
                        >
                          <div className={`w-10 h-10 rounded-theme-lg flex items-center justify-center mb-3 bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform duration-300`}>
                            <StatIcon className="w-5.5 h-5.5" />
                          </div>
                          <p className={`text-[11px] font-semibold tracking-wide uppercase ${textMutedClass}`}>{stat.label}</p>
                          <p className="text-xl md:text-2xl font-extrabold mt-1 tracking-tight">{stat.val}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* DOUBLE COLUMN: RECOMMENDED JOBS & ACTIVITY TIMELINE */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Recommended Jobs */}
                    <div className={`lg:col-span-2 p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                      <div className="flex items-center justify-between border-b border-inherit pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          <h3 className="font-extrabold text-base">Recommended Job Matches</h3>
                        </div>
                        <button onClick={() => setActiveTab('browse')} className="text-xs text-indigo-500 font-bold hover:underline flex items-center gap-0.5">
                          Explore All <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {jobs.slice(0, 3).map((job) => (
                          <div
                            key={job.id}
                            className={`p-4 rounded-theme-xl border ${borderClass} hover:border-indigo-500/30 hover:bg-slate-500/5 transition-all duration-200 flex gap-3`}
                          >
                            <div className="w-12 h-12 rounded-theme-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-base flex-shrink-0">
                              {job.companyName ? job.companyName.substring(0, 2).toUpperCase() : 'CO'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm truncate hover:text-indigo-500 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                                {job.title}
                              </h4>
                              <p className="text-xs font-semibold text-slate-400 mt-0.5">{job.companyName}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location || 'Remote'}</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {job.salaryMin ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax ? job.salaryMax.toLocaleString() : ''}` : 'Competitive'}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleSaveJob(job.id)}
                              className={`p-2 rounded-full border border-slate-200 flex-shrink-0 self-center ${
                                job.isSaved ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'hover:bg-slate-100 text-slate-400'
                              }`}
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        ))}
                        {jobs.length === 0 && (
                          <div className="py-12 text-center text-xs text-slate-400">
                            No recommended jobs found. Check back later or complete your skills profile.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Activity and Status Tracker */}
                    <div className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                      <div className="flex items-center gap-2 border-b border-inherit pb-3">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-extrabold text-base">Application Progress</h3>
                      </div>

                      <div className="space-y-4">
                        {appliedJobs.slice(0, 3).map((app, index) => (
                          <div key={index} className="flex gap-3 relative last:after:hidden after:absolute after:top-8 after:bottom-0 after:left-4.5 after:w-0.5 after:bg-slate-200">
                            <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs flex-shrink-0 z-10">
                              {app.companyName ? app.companyName.charAt(0).toUpperCase() : 'CO'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{app.title}</p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{app.companyName}</p>
                              <div className="mt-1.5 flex items-center justify-between">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  app.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-500' :
                                  app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                                  app.status === 'Interview' ? 'bg-indigo-500/10 text-indigo-500' :
                                  'bg-sky-500/10 text-sky-500'
                                }`}>
                                  {app.status}
                                </span>
                                <span className="text-[9px] text-slate-400">{new Date(app.appliedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {appliedJobs.length === 0 && (
                          <div className="py-12 text-center text-xs text-slate-400">
                            No applications submitted yet. Browse jobs to apply.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: BROWSE JOBS */}
              {activeTab === 'browse' && (
                <div className="space-y-6 animate-in fade-in duration-300 relative">
                  {/* Click-away overlay for dropdowns */}
                  {openDropdown && (
                    <div 
                      className="fixed inset-0 z-20 cursor-default" 
                      onClick={() => setOpenDropdown(null)} 
                    />
                  )}

                  {location.pathname.endsWith('/apply') ? (
                    /* STAGE 2: DEDICATED APPLY VIEW */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Job Summary Card */}
                      {selectedJob ? (
                        <div className={`col-span-12 lg:col-span-4 p-5 rounded-theme-xl border ${cardClass} shadow-theme-sm space-y-4`}>
                          <button
                            onClick={() => navigate(`/jobs/${selectedJob.id}`)}
                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:underline mb-2"
                          >
                            &larr; Back to Job Details
                          </button>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-theme-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {selectedJob.companyName ? selectedJob.companyName.substring(0, 2).toUpperCase() : 'CO'}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm leading-snug">{selectedJob.title}</h4>
                              <p className="text-xs font-semibold text-slate-400 mt-0.5">{selectedJob.companyName}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-100/5 dark:border-slate-800/5">
                            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {selectedJob.location || 'Remote'} ({selectedJob.workMode})</p>
                            <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {selectedJob.type}</p>
                            <p className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {selectedJob.salaryMin ? `₹${(selectedJob.salaryMin/100000).toFixed(1)}L - ₹${(selectedJob.salaryMax/100000).toFixed(1)}L P.A.` : 'Competitive'}</p>
                            <p className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-amber-500" /> {selectedJob.experienceMin !== null ? `${selectedJob.experienceMin}-${selectedJob.experienceMax || ''} Yrs Exp` : 'Fresher'}</p>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-slate-100/5 dark:border-slate-800/5">
                            <h5 className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Required Skills</h5>
                            <div className="flex flex-wrap gap-1">
                              {selectedJob.skills ? selectedJob.skills.split(',').map((s, i) => (
                                <span key={i} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                  {s.trim()}
                                </span>
                              )) : <span className="text-[10px] text-slate-400">No specific skills listed</span>}
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-slate-100/5 dark:border-slate-800/5">
                            <h5 className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Job Description</h5>
                            <p className="text-[11px] text-slate-400 line-clamp-6 leading-relaxed">
                              {selectedJob.description}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="col-span-12 lg:col-span-4 p-5 rounded-theme-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-theme-sm text-center">
                          <p className="text-xs text-slate-400">Loading job details...</p>
                        </div>
                      )}

                      {/* Right: Apply Form Card */}
                      <div className={`col-span-12 lg:col-span-8 p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-6`}>
                        <div>
                          <h3 className="font-extrabold text-base flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500 fill-current" />
                            <span>LinkedIn Easy Apply Form</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Your application snapshot will be generated. Please review and complete your application details below.
                          </p>
                        </div>

                        <form onSubmit={handleApplySubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold">Full Name <span className="text-rose-500">*</span></label>
                              <input
                                type="text"
                                required
                                value={applyForm.fullName}
                                onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                                className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                              />
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold">Email Address <span className="text-rose-500">*</span></label>
                              <input
                                type="email"
                                required
                                value={applyForm.email}
                                onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                                className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Phone */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold">Phone Number</label>
                              <input
                                type="text"
                                value={applyForm.phoneNumber}
                                onChange={(e) => setApplyForm({ ...applyForm, phoneNumber: e.target.value })}
                                className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                              />
                            </div>

                            {/* Total Experience */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold">Total Experience (Years)</label>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={applyForm.totalExperience}
                                onChange={(e) => setApplyForm({ ...applyForm, totalExperience: e.target.value })}
                                className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Current Company */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold">Current Company</label>
                              <input
                                type="text"
                                value={applyForm.currentCompany}
                                onChange={(e) => setApplyForm({ ...applyForm, currentCompany: e.target.value })}
                                className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                              />
                            </div>

                            {/* Current Designation */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold">Current Designation</label>
                              <input
                                type="text"
                                value={applyForm.currentDesignation}
                                onChange={(e) => setApplyForm({ ...applyForm, currentDesignation: e.target.value })}
                                className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                              />
                            </div>

                            {/* Notice Period */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold">Notice Period</label>
                              <select
                                value={applyForm.noticePeriod}
                                onChange={(e) => setApplyForm({ ...applyForm, noticePeriod: e.target.value })}
                                className={`w-full px-3 py-2.5 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                              >
                                <option value="Immediate">Immediate</option>
                                <option value="15 Days">15 Days</option>
                                <option value="30 Days">30 Days</option>
                                <option value="60 Days">60 Days</option>
                                <option value="90 Days">90 Days</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* LinkedIn URL */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold">LinkedIn URL</label>
                              <input
                                type="url"
                                placeholder="https://linkedin.com/in/username"
                                value={applyForm.linkedinUrl}
                                onChange={(e) => setApplyForm({ ...applyForm, linkedinUrl: e.target.value })}
                                className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                              />
                            </div>

                            {/* Portfolio URL */}
                            <div className="space-y-1">
                              <label className="text-xs font-bold">Portfolio / GitHub URL</label>
                              <input
                                type="url"
                                placeholder="https://github.com/username"
                                value={applyForm.portfolioUrl}
                                onChange={(e) => setApplyForm({ ...applyForm, portfolioUrl: e.target.value })}
                                className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                              />
                            </div>
                          </div>

                          {/* Cover Letter */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold">Cover Letter / Pitch</label>
                            <textarea
                              rows="3"
                              placeholder="Write a brief cover letter or introduction to the recruiter..."
                              value={applyForm.coverLetter}
                              onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                              className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:outline-none ${inputClass}`}
                            />
                          </div>

                          {/* Resume Upload Component */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold">Resume Upload <span className="text-rose-500">*</span></label>
                            <div className="flex flex-col gap-2">
                              {profile?.resumeUrl ? (
                                <div className="p-3 rounded-theme-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span className="text-xs font-bold truncate">
                                      {profile.resumeUrl.split(/[/\\]/).pop()}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setProfile({ ...profile, resumeUrl: null })}
                                    className="text-[10px] font-bold text-rose-500 hover:underline"
                                  >
                                    Change
                                  </button>
                                </div>
                              ) : (
                                <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-theme-lg p-4 text-center hover:bg-slate-500/5 transition-all">
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      setLoadingAction(true);
                                      const formData = new FormData();
                                      formData.append('resume', file);
                                      try {
                                        const res = await axios.post('/employee/upload-resume', formData);
                                        if (res.data.success) {
                                          const uploadedUrl = res.data.data.resumeUrl;
                                          setProfile({ ...profile, resumeUrl: uploadedUrl });
                                          triggerAlert('success', 'Resume uploaded successfully.');
                                        }
                                      } catch (err) {
                                        console.error('Upload failed:', err);
                                        triggerAlert('error', 'Failed to upload resume.');
                                      } finally {
                                        setLoadingAction(false);
                                      }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                  <span className="text-xs font-semibold text-slate-400">Click to upload new resume (.pdf, .doc, .docx)</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-3 border-t border-inherit">
                            <button
                              type="button"
                              onClick={() => navigate(`/jobs/${selectedJob?.id}`)}
                              className={`px-5 py-2 text-xs font-bold rounded-theme-lg border transition-colors ${
                                isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={loadingAction}
                              className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors flex items-center justify-center gap-1.5"
                            >
                              {loadingAction ? 'Submitting...' : 'Submit Application'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : location.pathname.endsWith('/application-success') ? (
                    /* STAGE 3: APPLICATION SUCCESS VIEW */
                    <div className="max-w-md mx-auto p-8 text-center rounded-theme-2xl border bg-white dark:bg-slate-900 shadow-theme-xl space-y-6 my-10 animate-in zoom-in-95 duration-200">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-theme-sm">
                        <Check className="w-8 h-8" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-base">Application Received!</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Your job application has been successfully submitted directly to the recruiter's portal.
                        </p>
                      </div>

                      {/* Display job name and company */}
                      {location.state?.jobTitle && (
                        <div className="bg-slate-500/5 py-3 px-4 rounded-theme-xl border border-dashed border-inherit text-left space-y-1.5">
                          <p className="text-xs font-bold">{location.state.jobTitle}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{location.state.companyName}</p>
                        </div>
                      )}

                      <div className="bg-indigo-500/5 py-3.5 px-4 rounded-theme-xl border border-dashed border-indigo-500/20">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1">LinkedIn Reference ID</span>
                        <span className="text-sm font-extrabold text-indigo-500 font-mono tracking-tight text-center">
                          #{location.state?.appId || 'xxxxxxxx-xxxx-xxxx'}
                        </span>
                      </div>

                      <button
                        onClick={() => navigate('/jobs')}
                        className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors"
                      >
                        Back to Job Search
                      </button>
                    </div>
                  ) : (
                    /* STAGE 1: SEARCH & SPLIT PANE VIEW */
                    <>
                      {/* Horizontal Search & Advanced Filters Panel */}
                      <div className={`p-4 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4 relative z-30`}>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Keyword Search */}
                          <div className="md:col-span-5 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              placeholder="Search job titles, skills, keywords, company..."
                              value={searchKeyword}
                              onChange={(e) => setSearchKeyword(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                              className={`w-full pl-9 pr-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                            />
                          </div>

                          {/* Location Filter */}
                          <div className="md:col-span-4 relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              placeholder="Work location, city, state, country..."
                              value={searchLocation}
                              onChange={(e) => setSearchLocation(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                              className={`w-full pl-9 pr-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                            />
                          </div>

                          {/* Search Actions */}
                          <div className="md:col-span-3 flex gap-2">
                            <button
                              onClick={() => fetchJobs()}
                              className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors"
                            >
                              Search
                            </button>
                            <button
                              onClick={handleResetFilters}
                              className={`px-3 py-2 text-xs font-bold rounded-theme-lg border transition-colors ${
                                isDarkMode 
                                  ? 'border-slate-800 text-slate-400 hover:bg-slate-800' 
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {/* Quick Filters Pill bar */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 relative">
                          {/* Experience Level */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === 'experience' ? null : 'experience')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                                filterExperienceLevels.length > 0
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500'
                                  : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200/80 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span>Experience Level {filterExperienceLevels.length > 0 && `(${filterExperienceLevels.length})`}</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {openDropdown === 'experience' && (
                              <div className={`absolute left-0 mt-2 w-56 rounded-theme-xl border shadow-theme-xl p-3 z-30 space-y-2 animate-in fade-in duration-100 ${cardClass}`}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Experience Level</p>
                                {['Junior', 'Mid', 'Senior', 'Lead'].map(lvl => (
                                  <label key={lvl} className="flex items-center gap-2 text-xs font-medium cursor-pointer py-0.5 hover:text-indigo-500">
                                    <input
                                      type="checkbox"
                                      checked={filterExperienceLevels.includes(lvl)}
                                      onChange={() => setFilterExperienceLevels(prev => 
                                        prev.includes(lvl) ? prev.filter(x => x !== lvl) : [...prev, lvl]
                                      )}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                    />
                                    <span>{lvl}</span>
                                  </label>
                                ))}
                                <div className="flex justify-end pt-2 border-t border-inherit">
                                  <button onClick={() => { setOpenDropdown(null); fetchJobs(); }} className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700">Apply</button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Job Type */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === 'jobType' ? null : 'jobType')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                                filterJobTypes.length > 0
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500'
                                  : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200/80 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span>Job Type {filterJobTypes.length > 0 && `(${filterJobTypes.length})`}</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {openDropdown === 'jobType' && (
                              <div className={`absolute left-0 mt-2 w-56 rounded-theme-xl border shadow-theme-xl p-3 z-30 space-y-2 animate-in fade-in duration-100 ${cardClass}`}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Job Type</p>
                                {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => (
                                  <label key={t} className="flex items-center gap-2 text-xs font-medium cursor-pointer py-0.5 hover:text-indigo-500">
                                    <input
                                      type="checkbox"
                                      checked={filterJobTypes.includes(t)}
                                      onChange={() => setFilterJobTypes(prev => 
                                        prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                                      )}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                    />
                                    <span>{t}</span>
                                  </label>
                                ))}
                                <div className="flex justify-end pt-2 border-t border-inherit">
                                  <button onClick={() => { setOpenDropdown(null); fetchJobs(); }} className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700">Apply</button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Work Mode */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === 'workMode' ? null : 'workMode')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                                filterWorkModes.length > 0
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500'
                                  : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200/80 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span>Work Mode {filterWorkModes.length > 0 && `(${filterWorkModes.length})`}</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {openDropdown === 'workMode' && (
                              <div className={`absolute left-0 mt-2 w-56 rounded-theme-xl border shadow-theme-xl p-3 z-30 space-y-2 animate-in fade-in duration-100 ${cardClass}`}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Work Mode</p>
                                {['Onsite', 'Hybrid', 'Remote'].map(m => (
                                  <label key={m} className="flex items-center gap-2 text-xs font-medium cursor-pointer py-0.5 hover:text-indigo-500">
                                    <input
                                      type="checkbox"
                                      checked={filterWorkModes.includes(m)}
                                      onChange={() => setFilterWorkModes(prev => 
                                        prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                                      )}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                    />
                                    <span>{m}</span>
                                  </label>
                                ))}
                                <div className="flex justify-end pt-2 border-t border-inherit">
                                  <button onClick={() => { setOpenDropdown(null); fetchJobs(); }} className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700">Apply</button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Salary Range */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === 'salary' ? null : 'salary')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                                filterSalaryMin > 0 || filterSalaryMax < 2500000
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500'
                                  : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200/80 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span>Salary Range</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {openDropdown === 'salary' && (
                              <div className={`absolute left-0 mt-2 w-72 rounded-theme-xl border shadow-theme-xl p-4 z-30 space-y-3 animate-in fade-in duration-100 ${cardClass}`}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary (INR per annum)</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                    <span>Min Salary</span>
                                    <span className="text-indigo-500">₹{filterSalaryMin.toLocaleString()}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="2000000"
                                    step="50000"
                                    value={filterSalaryMin}
                                    onChange={(e) => setFilterSalaryMin(parseInt(e.target.value))}
                                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                    <span>Max Salary</span>
                                    <span className="text-indigo-500">₹{filterSalaryMax.toLocaleString()}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="50000"
                                    max="2500000"
                                    step="50000"
                                    value={filterSalaryMax}
                                    onChange={(e) => setFilterSalaryMax(parseInt(e.target.value))}
                                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div className="flex justify-end pt-2 border-t border-inherit gap-2">
                                  <button onClick={() => { setFilterSalaryMin(0); setFilterSalaryMax(2500000); }} className="px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200">Reset</button>
                                  <button onClick={() => { setOpenDropdown(null); fetchJobs(); }} className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700">Apply</button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* More Filters */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === 'more' ? null : 'more')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                                filterDepartmentId || filterIndustry || filterPostedDate !== 'any'
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500'
                                  : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200/80 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span>More Filters</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {openDropdown === 'more' && (
                              <div className={`absolute left-0 mt-2 w-72 rounded-theme-xl border shadow-theme-xl p-4 z-30 space-y-3 animate-in fade-in duration-100 ${cardClass}`}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Additional Filters</p>
                                
                                {/* Department */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400">Department</label>
                                  <select
                                    value={filterDepartmentId}
                                    onChange={(e) => setFilterDepartmentId(e.target.value)}
                                    className={`w-full px-2 py-1.5 text-xs rounded border focus:outline-none ${inputClass}`}
                                  >
                                    <option value="">All Departments</option>
                                    {departments.map(d => (
                                      <option key={d.id} value={d.id}>{d.department_name}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Industry */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400">Industry</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. IT, Finance..."
                                    value={filterIndustry}
                                    onChange={(e) => setFilterIndustry(e.target.value)}
                                    className={`w-full px-2 py-1.5 text-xs rounded border focus:outline-none ${inputClass}`}
                                  />
                                </div>

                                {/* Posted Date */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400">Posted Date</label>
                                  <select
                                    value={filterPostedDate}
                                    onChange={(e) => setFilterPostedDate(e.target.value)}
                                    className={`w-full px-2 py-1.5 text-xs rounded border focus:outline-none ${inputClass}`}
                                  >
                                    <option value="any">Any Time</option>
                                    <option value="24h">Past 24 hours</option>
                                    <option value="7d">Past 7 days</option>
                                    <option value="30d">Past 30 days</option>
                                  </select>
                                </div>

                                <div className="flex justify-end pt-2 border-t border-inherit gap-2">
                                  <button onClick={() => { setFilterDepartmentId(''); setFilterIndustry(''); setFilterPostedDate('any'); }} className="px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200">Reset</button>
                                  <button onClick={() => { setOpenDropdown(null); fetchJobs(); }} className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700">Apply</button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Sparkles Profile Match Recommendations */}
                          <button
                            onClick={() => {
                              const val = !onlyProfileMatches;
                              setOnlyProfileMatches(val);
                              setTimeout(() => fetchJobs(), 10);
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                              onlyProfileMatches
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200/80 hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Jobs matching profile</span>
                          </button>

                          {/* Sort Selector */}
                          <div className="ml-auto flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
                            <select
                              value={sortBy}
                              onChange={(e) => {
                                setSortBy(e.target.value);
                                setTimeout(() => fetchJobs(), 10);
                              }}
                              className={`px-2 py-1 text-xs rounded-theme-lg border focus:outline-none cursor-pointer ${inputClass}`}
                            >
                              <option value="mostRelevant">Most Relevant</option>
                              <option value="mostRecent">Most Recent</option>
                              <option value="highestSalary">Highest Salary</option>
                              <option value="bestMatch">Best Match</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* LinkedIn-Style Split Pane Panel */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
                        
                        {/* LEFT PANEL: Job Cards Listing */}
                        <div className={`col-span-12 lg:col-span-5 flex flex-col space-y-4 ${
                          selectedJob ? 'hidden lg:flex' : 'flex'
                        }`}>
                          <div className="flex items-center justify-between px-1">
                            <span className={`text-xs font-bold ${textMutedClass}`}>
                              {jobs.length} jobs matching your profile & criteria
                            </span>
                          </div>

                          {loadingJobs ? (
                            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
                              {[1, 2, 3, 4].map(idx => (
                                <div key={idx} className={`p-4 rounded-theme-xl border ${cardClass} shadow-theme-sm space-y-3 animate-pulse`}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-theme-lg" />
                                    <div className="flex-1 space-y-1.5">
                                      <div className="h-3.5 bg-slate-300 dark:bg-slate-700 rounded w-2/3" />
                                      <div className="h-2.5 bg-slate-300 dark:bg-slate-700 rounded w-1/3" />
                                    </div>
                                  </div>
                                  <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-full" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1 scrollbar-thin">
                              {jobs.map((job) => {
                                const isSelected = selectedJob?.id === job.id;
                                const skillsOverlap = job.skills && profile?.skills 
                                  ? job.skills.split(',').map(s => s.trim().toLowerCase()).filter(s => profile.skills.toLowerCase().includes(s))
                                  : [];
                                const openingsCount = job.openings || 1;
                                const isActivelyHiring = openingsCount > 1 || job.matchScore > 2;

                                return (
                                  <div
                                    key={job.id}
                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                    className={`p-4 rounded-theme-xl border cursor-pointer transition-all duration-300 relative group flex gap-3 ${
                                      isSelected
                                        ? 'border-indigo-500 bg-indigo-50/15 dark:bg-indigo-900/10'
                                        : `${cardClass} hover:border-slate-400/30 hover:shadow-theme-md`
                                    }`}
                                  >
                                    {/* Active Outline Accent */}
                                    {isSelected && (
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l-theme-xl" />
                                    )}

                                    {/* Left: Company Logo Placeholder */}
                                    <div className="w-10 h-10 rounded-theme-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                                      {job.companyName ? job.companyName.substring(0, 2).toUpperCase() : 'CO'}
                                    </div>

                                    {/* Right: Job Summary Information */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-extrabold text-sm truncate group-hover:text-indigo-500 transition-colors leading-tight">
                                          {job.title}
                                        </h4>
                                        
                                        {/* Bookmark trigger on card */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleSaveJob(job.id);
                                          }}
                                          className={`p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors flex-shrink-0 ${
                                            job.isSaved ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                          }`}
                                        >
                                          <Bookmark className={`w-3.5 h-3.5 ${job.isSaved ? 'fill-current' : ''}`} />
                                        </button>
                                      </div>

                                      <p className="text-xs font-semibold text-slate-400">{job.companyName}</p>
                                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{job.location || 'Remote'} ({job.workMode || 'Remote'})</span>
                                      </p>

                                      {/* Actively Hiring and Applicant Info Badge */}
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                                        {isActivelyHiring && (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Actively hiring
                                          </span>
                                        )}
                                        {job.totalApplications > 0 && (
                                          <span className="text-[10px] text-slate-400 font-medium">
                                            {job.totalApplications} applicant{job.totalApplications > 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </div>

                                      {/* Relative Match/Date Footer */}
                                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1.5 border-t border-slate-100/5 dark:border-slate-800/5">
                                        <span>
                                          Posted {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                        {skillsOverlap.length > 0 && (
                                          <span className="text-indigo-500 font-bold flex items-center gap-0.5">
                                            <Sparkles className="w-2.5 h-2.5 fill-current" />
                                            {skillsOverlap.length} skill match{skillsOverlap.length > 1 ? 'es' : ''}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {jobs.length === 0 && (
                                <div className={`p-12 text-center rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-3`}>
                                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                                  <h4 className="font-bold text-sm">No Jobs Found</h4>
                                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    We couldn't find any jobs matching your selections. Adjust your filters or query text to try again.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* RIGHT PANEL: Job Details Summary (LinkedIn Style sticky panel) */}
                        <div className={`col-span-12 lg:col-span-7 border ${borderClass} rounded-theme-2xl bg-white dark:bg-slate-900 shadow-theme-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] lg:h-[calc(100vh-220px)] sticky top-24 ${
                          selectedJob ? 'flex' : 'hidden lg:flex'
                        }`}>
                          {selectedJob ? (
                            <div className="flex flex-col h-full">
                              
                              {/* Details Header Banner with back button for mobile */}
                              <div className="p-4 border-b border-inherit flex flex-col space-y-3 bg-gradient-to-r from-indigo-500/5 to-sky-500/5 relative">
                                {/* Mobile Back Button */}
                                <button
                                  onClick={() => setSelectedJob(null)}
                                  className="lg:hidden flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-600 self-start"
                                >
                                  &larr; Back to job search listings
                                </button>

                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-theme-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                      {selectedJob.companyName ? selectedJob.companyName.substring(0, 2).toUpperCase() : 'CO'}
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="font-extrabold text-base leading-snug truncate">
                                        {selectedJob.title}
                                      </h3>
                                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                        {selectedJob.companyName}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Info bar */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 pt-1">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                    {selectedJob.location || 'Remote'} ({selectedJob.workMode})
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                    {selectedJob.salaryMin ? `₹${(selectedJob.salaryMin/100000).toFixed(1)}L - ₹${(selectedJob.salaryMax/100000).toFixed(1)}L P.A.` : 'Competitive'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                                    {selectedJob.experienceMin !== null ? `${selectedJob.experienceMin}-${selectedJob.experienceMax || ''} Yrs Exp` : 'Fresher'}
                                  </span>
                                </div>

                                {/* Job Telemetry Metrics */}
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold bg-slate-500/5 px-3 py-1.5 rounded-theme-lg">
                                  <span>Posted {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span>{selectedJob.totalApplications || 0} applicant{selectedJob.totalApplications !== 1 ? 's' : ''}</span>
                                  {selectedJob.openings > 1 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-500 font-extrabold">{selectedJob.openings} open positions</span>
                                    </>
                                  )}
                                </div>

                                {/* Call to action row */}
                                <div className="flex items-center gap-3 pt-2">
                                  {selectedJob.isApplied ? (
                                    <button className="px-6 py-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-theme-lg cursor-default flex items-center justify-center gap-1.5">
                                      <Check className="w-4 h-4" />
                                      <span>Applied ({selectedJob.applicationStatus || 'Applied'})</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleApplyJob(selectedJob)}
                                      className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors flex items-center gap-1"
                                    >
                                      <span>Easy Apply</span>
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleToggleSaveJob(selectedJob.id)}
                                    className={`px-4 py-2 text-xs font-bold rounded-theme-lg border transition-colors flex items-center gap-1.5 ${
                                      selectedJob.isSaved
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                        : 'border-slate-200 hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    <Bookmark className={`w-4 h-4 ${selectedJob.isSaved ? 'fill-current' : ''}`} />
                                    <span>{selectedJob.isSaved ? 'Saved' : 'Save'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Details Scrollable Body Content */}
                              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                                {/* Candidate Profile Skills Alignment telemetry */}
                                <div className="p-4 rounded-theme-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Sparkles className="w-4 h-4 text-indigo-500 fill-current" />
                                      <span className="font-extrabold text-xs">How you match this job</span>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
                                      {profile?.skills && selectedJob.skills
                                        ? `${selectedJob.skills.split(',').map(s => s.trim().toLowerCase()).filter(s => profile.skills.toLowerCase().includes(s)).length} / ${selectedJob.skills.split(',').length} requirements`
                                        : '0 matches'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400">
                                    Match score is computed by comparing skills declared on your resume and candidate profile with the job qualifications.
                                  </p>
                                  
                                  {selectedJob.skills && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {selectedJob.skills.split(',').map((skill, idx) => {
                                        const trimmed = skill.trim();
                                        const hasSkill = profile?.skills?.toLowerCase().includes(trimmed.toLowerCase());
                                        return (
                                          <span
                                            key={idx}
                                            className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                              hasSkill
                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200/40'
                                            }`}
                                          >
                                            {hasSkill && <Check className="w-2.5 h-2.5" />}
                                            <span>{trimmed}</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Recruiter Activity Alert Box */}
                                <div className="p-4 rounded-theme-xl border border-slate-200/60 dark:border-slate-800 bg-slate-500/5 flex items-start gap-3">
                                  <Bell className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                  <div className="space-y-1">
                                    <h5 className="text-xs font-bold">Recruiter Activity Alert</h5>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                      This job was posted recently and applications are actively being reviewed. Applying within the first 48 hours increases your interview chance.
                                    </p>
                                  </div>
                                </div>

                                {/* Job Description Text block */}
                                <div className="space-y-2">
                                  <h4 className="font-extrabold text-xs text-indigo-500 uppercase tracking-wider">Job Description</h4>
                                  <p className="text-xs leading-relaxed whitespace-pre-line text-slate-400">
                                    {selectedJob.description}
                                  </p>
                                </div>

                                {/* Job Requirements Text block */}
                                {selectedJob.requirements && (
                                  <div className="space-y-2">
                                    <h4 className="font-extrabold text-xs text-indigo-500 uppercase tracking-wider">Requirements & Qualifications</h4>
                                    <p className="text-xs leading-relaxed whitespace-pre-line text-slate-400">
                                      {selectedJob.requirements}
                                    </p>
                                  </div>
                                )}

                                {/* About Company block */}
                                {selectedJob.companyDescription && (
                                  <div className="space-y-2 pt-4 border-t border-slate-100/5 dark:border-slate-800/5">
                                    <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider">About the Company</h4>
                                    <p className="text-xs leading-relaxed text-slate-400">
                                      {selectedJob.companyDescription}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                              <div className="w-16 h-16 rounded-full bg-indigo-500/5 text-indigo-500 flex items-center justify-center">
                                <Briefcase className="w-8 h-8" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-base">Select a Job Listing</h4>
                                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1.5 leading-relaxed">
                                  Choose a job from the listing on the left to see full descriptions, requirements, candidate profile matching statistics, and submit an application.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SUB TAB: SAVED JOBS */}
              {activeTab === 'saved' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 px-1">
                    <Bookmark className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-extrabold text-base">Your Bookmarked Jobs</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedJobs.map((job) => (
                      <div
                        key={job.id}
                        className={`p-5 rounded-theme-xl border ${cardClass} shadow-theme-sm flex flex-col justify-between`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-theme-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-base flex-shrink-0">
                                {job.companyName ? job.companyName.substring(0, 2).toUpperCase() : 'CO'}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm hover:text-indigo-500 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                                  {job.title}
                                </h4>
                                <p className="text-xs font-semibold text-slate-400 mt-0.5">{job.companyName}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
                              {job.type}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location || 'Remote'}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {job.salaryMin ? `₹${(job.salaryMin/100000).toFixed(1)}L - ₹${(job.salaryMax/100000).toFixed(1)}L` : 'Competitive'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-inherit">
                          <button
                            onClick={() => handleToggleSaveJob(job.id)}
                            className="flex-1 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/5 rounded-theme-lg border border-transparent hover:border-rose-500/20 transition-all duration-200"
                          >
                            Unsave Job
                          </button>
                          
                          {job.isApplied ? (
                            <button className="flex-1 py-2 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-theme-lg cursor-default">
                              Applied
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApplyJob(job)}
                              className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors"
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {savedJobs.length === 0 && (
                      <div className={`col-span-2 p-12 text-center rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-3`}>
                        <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-sm">No Saved Jobs</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          You haven't bookmarked any jobs yet. Browse jobs to save opportunities you're interested in.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB TAB: APPLIED JOBS */}
              {activeTab === 'applied' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 px-1">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-extrabold text-base">Your Job Applications</h3>
                  </div>

                  <div className={`border ${borderClass} rounded-theme-xl overflow-hidden ${cardClass} shadow-theme-sm`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-inherit font-bold text-slate-400">
                            <th className="p-4">Job Title</th>
                            <th className="p-4">Company</th>
                            <th className="p-4">Applied Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appliedJobs.map((app) => (
                            <tr key={app.applicationId} className="border-b border-inherit hover:bg-slate-100/30 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="p-4 font-bold">{app.title}</td>
                              <td className="p-4 font-semibold text-slate-400">{app.companyName}</td>
                              <td className="p-4 text-slate-400">{new Date(app.appliedAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  app.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-500' :
                                  app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                                  app.status === 'Interview' ? 'bg-indigo-500/10 text-indigo-500' :
                                  app.status === 'Under Review' ? 'bg-amber-500/10 text-amber-500' :
                                  'bg-sky-500/10 text-sky-500'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => setSelectedApplication(app)}
                                  className="text-xs font-bold text-indigo-500 hover:underline"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}

                          {appliedJobs.length === 0 && (
                            <tr>
                              <td colSpan="5" className="p-8 text-center text-slate-400">
                                You haven't applied for any jobs yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: PROFILE FORM */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-extrabold text-base">Candidate Profile Builder</h3>
                    </div>
                    {/* Completion score indicator bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{stats.completion}% Complete</span>
                      <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${stats.completion}%` }} />
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Profile Avatar Widget */}
                    <div className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm flex flex-col md:flex-row items-center gap-6`}>
                      <div className="relative group">
                        {profile?.profilePicture ? (
                          <img
                            src={`http://localhost:5000${profile.profilePicture}`}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-3xl">
                            {personalInfo.firstName ? personalInfo.firstName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <label className="absolute inset-0 bg-slate-900/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold cursor-pointer">
                          Change
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                      </div>
                      
                      <div className="text-center md:text-left space-y-1">
                        <h4 className="font-bold text-sm">Profile Avatar Image</h4>
                        <p className={`text-xs ${textMutedClass}`}>
                          Supported formats: JPEG, PNG, JPG, GIF, WEBP. Max size: 2MB.
                        </p>
                        {uploadProgress !== null && (
                          <div className="w-full max-w-[200px] h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-indigo-600 animate-pulse" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 1: Personal Info */}
                    <div className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                      <h4 className="font-bold text-sm border-b border-inherit pb-2 text-indigo-500">Personal Information</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold">First Name *</label>
                          <input
                            type="text"
                            required
                            value={personalInfo.firstName}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">Last Name</label>
                          <input
                            type="text"
                            value={personalInfo.lastName}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">Phone Number *</label>
                          <input
                            type="text"
                            required
                            value={personalInfo.phone}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">Gender</label>
                          <select
                            value={personalInfo.gender}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">Date of Birth</label>
                          <input
                            type="date"
                            value={personalInfo.dob}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">Marital Status</label>
                          <select
                            value={personalInfo.maritalStatus}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, maritalStatus: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold">Address</label>
                        <input
                          type="text"
                          value={personalInfo.address}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                          className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold">City</label>
                          <input
                            type="text"
                            value={personalInfo.city}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">State</label>
                          <input
                            type="text"
                            value={personalInfo.state}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">Country</label>
                          <input
                            type="text"
                            value={personalInfo.country}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">Pincode</label>
                          <input
                            type="text"
                            value={personalInfo.pincode}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, pincode: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold">Emergency Contact Name</label>
                          <input
                            type="text"
                            value={personalInfo.emergencyContactName}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactName: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">Emergency Contact Phone</label>
                          <input
                            type="text"
                            value={personalInfo.emergencyContactNumber}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactNumber: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Skills Editor */}
                    <div className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                      <h4 className="font-bold text-sm border-b border-inherit pb-2 text-indigo-500">Skills</h4>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type a skill (e.g. JavaScript, AWS, React) and press Add"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className={`flex-1 px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {skillsList.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                          >
                            {skill}
                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                        {skillsList.length === 0 && (
                          <p className="text-xs text-slate-400">No skills added yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Section 3: Education */}
                    <div className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                      <div className="flex items-center justify-between border-b border-inherit pb-2">
                        <h4 className="font-bold text-sm text-indigo-500">Education Details</h4>
                        <button
                          type="button"
                          onClick={addEducation}
                          className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-4 h-4" /> Add Education
                        </button>
                      </div>

                      <div className="space-y-4">
                        {educationList.map((edu, idx) => (
                          <div key={idx} className="p-4 rounded-theme-xl border border-dashed border-inherit space-y-3 relative">
                            <button
                              type="button"
                              onClick={() => removeEducation(idx)}
                              className="absolute top-4 right-4 p-1.5 rounded-theme-md text-rose-500 hover:bg-rose-500/5 hover:border hover:border-rose-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-bold">Degree / Certification *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. B.Tech Computer Science"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold">School / University *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. IIT Delhi"
                                  value={edu.school}
                                  onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold">Start Year</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 2020"
                                  value={edu.startYear}
                                  onChange={(e) => updateEducation(idx, 'startYear', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold">End Year (or Expected)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 2024"
                                  value={edu.endYear}
                                  onChange={(e) => updateEducation(idx, 'endYear', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {educationList.length === 0 && (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No education records configured. Click Add Education to add your credentials.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 4: Experience */}
                    <div className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                      <div className="flex items-center justify-between border-b border-inherit pb-2">
                        <h4 className="font-bold text-sm text-indigo-500">Work Experience</h4>
                        <button
                          type="button"
                          onClick={addExperience}
                          className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-4 h-4" /> Add Experience
                        </button>
                      </div>

                      <div className="space-y-4">
                        {experienceList.map((exp, idx) => (
                          <div key={idx} className="p-4 rounded-theme-xl border border-dashed border-inherit space-y-3 relative">
                            <button
                              type="button"
                              onClick={() => removeExperience(idx)}
                              className="absolute top-4 right-4 p-1.5 rounded-theme-md text-rose-500 hover:bg-rose-500/5 hover:border hover:border-rose-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-bold">Job Title *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Software Engineer"
                                  value={exp.title}
                                  onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold">Company *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Google"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                                />
                              </div>

                              <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold">Duration *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Jan 2022 - Present or 2 Years"
                                  value={exp.duration}
                                  onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                                />
                              </div>

                              <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold">Role Description</label>
                                <textarea
                                  placeholder="Describe your responsibilities, technologies used, achievements..."
                                  value={exp.description}
                                  onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none h-20 ${inputClass}`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {experienceList.length === 0 && (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No work experience records. Add experience if you are a professional.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 5: Social Profiles */}
                    <div className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                      <h4 className="font-bold text-sm border-b border-inherit pb-2 text-indigo-500">Social Profiles</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold flex items-center gap-1.5"><Linkedin className="w-4 h-4 text-sky-600" /> LinkedIn URL</label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            value={socialLinks.linkedin}
                            onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold flex items-center gap-1.5"><Github className="w-4 h-4" /> GitHub Profile</label>
                          <input
                            type="url"
                            placeholder="https://github.com/username"
                            value={socialLinks.github}
                            onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold flex items-center gap-1.5"><Globe className="w-4 h-4 text-emerald-500" /> Personal Portfolio</label>
                          <input
                            type="url"
                            placeholder="https://portfolio.com"
                            value={socialLinks.portfolio}
                            onChange={(e) => setSocialLinks({ ...socialLinks, portfolio: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form submit buttons */}
                    <div className="flex justify-end gap-3">
                      <button
                        type="submit"
                        disabled={loadingAction}
                        className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors disabled:opacity-50"
                      >
                        {loadingAction ? 'Saving Profiles...' : 'Save All Configuration'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SUB TAB: RESUME UPLOAD */}
              {activeTab === 'resume' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 px-1">
                    <Upload className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-extrabold text-base">Resume / CV Document</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Drag and Drop Area */}
                    <div className="lg:col-span-2 space-y-4">
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleResumeUpload(e);
                        }}
                        className={`p-10 border-2 border-dashed rounded-theme-2xl text-center shadow-theme-sm flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-500/5 transition-all duration-300 ${borderClass} ${cardClass}`}
                      >
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Drag and drop your Resume CV file here</h4>
                          <p className={`text-xs ${textMutedClass} mt-1.5 max-w-sm mx-auto leading-relaxed`}>
                            Upload your professional background profile as a PDF, DOC, or DOCX document file. Max file size limit: 5MB.
                          </p>
                        </div>
                        <label className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md cursor-pointer transition-colors">
                          Browse Files
                          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                        </label>

                        {uploadProgress !== null && (
                          <div className="w-full max-w-xs space-y-1">
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-400">Uploading: {uploadProgress}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Active Document Details */}
                    <div className="space-y-4">
                      <div className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                        <h4 className="font-bold text-sm border-b border-inherit pb-2 text-indigo-500">Active Resume</h4>
                        {profile?.resumeUrl ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-theme-xl bg-slate-500/5 border">
                              <Paperclip className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold truncate">My_Resume.pdf</p>
                                <span className="text-[9px] text-slate-400">Uploaded Resume Document</span>
                              </div>
                            </div>
                            
                            <a
                              href={`http://localhost:5000${profile.resumeUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-4 h-4" /> Download / View Resume
                            </a>
                          </div>
                        ) : (
                          <div className="py-8 text-center space-y-2">
                            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                            <p className="text-xs font-semibold">No Resume Configured</p>
                            <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                              Please upload your CV document to apply to active jobs.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-inherit pb-3 px-1">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-extrabold text-base">Your System Alerts</h3>
                    </div>
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-xs text-indigo-500 font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkNotificationRead(n.id)}
                        className={`p-4 rounded-theme-xl border ${cardClass} shadow-theme-sm hover:border-indigo-500/30 flex items-start gap-4 transition-all ${
                          !n.isRead ? 'border-indigo-500/20 bg-indigo-500/5' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500/10 text-indigo-500`}>
                          <Info className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-bold text-xs">{n.title}</h4>
                            <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed mt-1 ${textMutedClass}`}>{n.message}</p>
                        </div>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <div className={`p-12 text-center rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-2`}>
                        <Bell className="w-12 h-12 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-sm">All caught up!</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          You do not have any new notifications or matching recruiter alerts.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB TAB: SETTINGS & ACCOUNT PREFS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 px-1">
                    <SettingsIcon className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-extrabold text-base">Security & Preferences Panel</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Password Reset Form */}
                    <div className="lg:col-span-2 space-y-6">
                      <form onSubmit={handleChangePassword} className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                        <h4 className="font-bold text-sm border-b border-inherit pb-2 text-indigo-500">Change Password</h4>
                        
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold">Current Password *</label>
                            <input
                              type="password"
                              required
                              value={securityForm.oldPassword}
                              onChange={(e) => setSecurityForm({ ...securityForm, oldPassword: e.target.value })}
                              className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold">New Password *</label>
                            <input
                              type="password"
                              required
                              value={securityForm.newPassword}
                              onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                              className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold">Confirm New Password *</label>
                            <input
                              type="password"
                              required
                              value={securityForm.confirmPassword}
                              onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                              className={`w-full px-3 py-2 text-xs rounded-theme-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${inputClass}`}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors"
                          >
                            Update Password
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Right: Notification Config & Dangerous Actions */}
                    <div className="space-y-6">
                      {/* Sub-card: Communication & Privacy toggles */}
                      <div className={`p-6 rounded-theme-2xl border ${cardClass} shadow-theme-sm space-y-4`}>
                        <h4 className="font-bold text-sm border-b border-inherit pb-2 text-indigo-500">System Preferences</h4>
                        
                        <div className="space-y-4 text-xs font-medium">
                          {/* Toggle 1: Email Alerts */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">Email Notifications</p>
                              <span className="text-[10px] text-slate-400">Receive matched job recommendations</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={settingsPrefs.emailAlerts}
                              onChange={(e) => setSettingsPrefs({ ...settingsPrefs, emailAlerts: e.target.checked })}
                              className="w-4 h-4 accent-indigo-600 rounded"
                            />
                          </div>

                          {/* Toggle 2: Privacy Mode */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">Privacy Profile Mode</p>
                              <span className="text-[10px] text-slate-400">Hide resume from third-party recruiters</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={settingsPrefs.privacyMode}
                              onChange={(e) => setSettingsPrefs({ ...settingsPrefs, privacyMode: e.target.checked })}
                              className="w-4 h-4 accent-indigo-600 rounded"
                            />
                          </div>

                          {/* Toggle 3: 2FA */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">Two-Factor Authentication</p>
                              <span className="text-[10px] text-slate-400">Secure log in credentials verification</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={settingsPrefs.twoFactor}
                              onChange={(e) => setSettingsPrefs({ ...settingsPrefs, twoFactor: e.target.checked })}
                              className="w-4 h-4 accent-indigo-600 rounded"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sub-card: Red Zone */}
                      <div className={`p-6 rounded-theme-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500 shadow-theme-sm space-y-3`}>
                        <h4 className="font-extrabold text-sm border-b border-rose-500/10 pb-2 flex items-center gap-1.5">
                          <AlertCircle className="w-5 h-5" /> Dangerous Actions
                        </h4>
                        <p className="text-xs leading-relaxed opacity-80">
                          Deactivating or deleting your profile will wipe out your saved jobs, application status logs, notifications feeds, and resume records.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="w-full py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-theme-lg shadow-theme-md transition-colors"
                        >
                          Delete Account Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* OVERLAY POPUPS: JOB DETAILS MODAL */}
      {selectedJob && activeTab !== 'browse' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-theme-2xl border shadow-theme-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ${cardClass}`}>
            <div className="p-6 border-b border-inherit flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-theme-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-lg">
                  {selectedJob.companyName ? selectedJob.companyName.substring(0, 2).toUpperCase() : 'CO'}
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-snug">{selectedJob.title}</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{selectedJob.companyName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 bg-slate-500/5 p-4 rounded-theme-xl">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-indigo-500" /> {selectedJob.location || 'Remote'}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-emerald-500" /> {selectedJob.salaryMin ? `₹${selectedJob.salaryMin.toLocaleString()} - ₹${selectedJob.salaryMax ? selectedJob.salaryMax.toLocaleString() : ''} P.A.` : 'Competitive'}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-amber-500" /> {selectedJob.experienceMin !== null ? `${selectedJob.experienceMin}-${selectedJob.experienceMax || ''} Years` : 'Any Experience'}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-sky-500" /> {selectedJob.type} / {selectedJob.workMode}</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-indigo-500 uppercase tracking-wider">Job Description</h4>
                <p className="text-xs leading-relaxed whitespace-pre-line text-slate-400">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-indigo-500 uppercase tracking-wider">Requirements & Skills</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-slate-400">{selectedJob.requirements}</p>
                </div>
              )}

              {selectedJob.skills && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-indigo-500 uppercase tracking-wider">Skills Required</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedJob.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-inherit flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  handleToggleSaveJob(selectedJob.id);
                  setSelectedJob(null);
                }}
                className={`px-5 py-2 text-xs font-bold rounded-theme-lg border transition-colors ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                {selectedJob.isSaved ? 'Bookmarked' : 'Save Job'}
              </button>

              {selectedJob.isApplied ? (
                <button className="px-6 py-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 rounded-theme-lg cursor-default">
                  Applied
                </button>
              ) : (
                <button
                  onClick={() => handleApplyJob(selectedJob)}
                  className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY POPUPS: APPLICATION DETAILS MODAL */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-theme-2xl border shadow-theme-2xl animate-in fade-in zoom-in-95 duration-200 ${cardClass}`}>
            <div className="p-6 border-b border-inherit flex items-center justify-between">
              <h3 className="font-extrabold text-base">Application Progress</h3>
              <button onClick={() => setSelectedApplication(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Applied Position</p>
                <h4 className="font-bold text-sm">{selectedApplication.title}</h4>
                <p className="text-xs font-semibold text-slate-400">{selectedApplication.companyName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Applied Date</span>
                  <span className="font-semibold">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Current Status</span>
                  <span className={`inline-block font-bold px-2 py-0.5 rounded-full ${
                    selectedApplication.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-500' :
                    selectedApplication.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                    selectedApplication.status === 'Interview' ? 'bg-indigo-500/10 text-indigo-500' :
                    'bg-sky-500/10 text-sky-500'
                  }`}>
                    {selectedApplication.status}
                  </span>
                </div>
              </div>

              {/* Status Timeline illustration */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-slate-400 font-bold block">Progress Timeline</span>
                <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
                  {[
                    { label: 'Applied Successfully', desc: 'Application was submitted and sent to recruiters.', active: true },
                    { label: 'Recruiter Screening', desc: 'Recruiters are scanning details and resume.', active: ['Under Review', 'Interview', 'Selected'].includes(selectedApplication.status) },
                    { label: 'Interview Invitation', desc: 'Recruiters schedule a video/F2F interview.', active: ['Interview', 'Selected'].includes(selectedApplication.status) },
                    { label: 'Hiring Decision', desc: 'Final application decision is updated.', active: ['Selected', 'Rejected'].includes(selectedApplication.status), rejected: selectedApplication.status === 'Rejected' }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 relative">
                      <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center z-10 ${
                        step.rejected ? 'bg-rose-500 border-rose-500 text-white' :
                        step.active ? 'bg-indigo-600 border-indigo-600 text-white' : 
                        'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-300'
                      }`}>
                        {step.active && !step.rejected ? <Check className="w-3.5 h-3.5" /> : null}
                        {step.rejected ? <X className="w-3.5 h-3.5" /> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${step.active ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{step.label}</p>
                        <p className={`text-[10px] leading-relaxed mt-0.5 ${textMutedClass}`}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-inherit flex justify-end">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY POPUPS: LINKEDIN EASY APPLY MODAL */}
      {applyJobData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleApplySubmit}
            className={`w-full max-w-xl rounded-theme-2xl border shadow-theme-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${cardClass}`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-inherit flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-theme-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-theme-sm">
                  In
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-snug">Easy Apply</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Applying for <strong className="text-slate-600 dark:text-slate-300">{applyJobData.title}</strong> at <strong>{applyJobData.companyName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApplyJobData(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Profile Snapshot Info Alert */}
              <div className="flex items-start gap-2.5 bg-indigo-500/5 p-3.5 rounded-theme-xl border border-indigo-500/10 text-indigo-500">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed text-[11px]">
                  Your profile details have been pre-filled below. Please review and update them for this application snapshot.
                </p>
              </div>

              {/* 1. Contact Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-[11px] text-indigo-500 uppercase tracking-wider">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={applyForm.fullName}
                      onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={applyForm.phoneNumber}
                      onChange={(e) => setApplyForm({ ...applyForm, phoneNumber: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Professional Details */}
              <div className="space-y-3 pt-2 border-t border-inherit">
                <h4 className="font-bold text-[11px] text-indigo-500 uppercase tracking-wider">Professional Snapshot</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold">Total Experience (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={applyForm.totalExperience}
                      onChange={(e) => setApplyForm({ ...applyForm, totalExperience: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Notice Period</label>
                    <select
                      value={applyForm.noticePeriod}
                      onChange={(e) => setApplyForm({ ...applyForm, noticePeriod: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    >
                      <option value="Immediate">Immediate / Serving Notice</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="60 Days">60 Days</option>
                      <option value="90 Days">90 Days</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Current Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={applyForm.currentCompany}
                      onChange={(e) => setApplyForm({ ...applyForm, currentCompany: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Current Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={applyForm.currentDesignation}
                      onChange={(e) => setApplyForm({ ...applyForm, currentDesignation: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Current CTC (INR / P.A.)</label>
                    <input
                      type="number"
                      placeholder="e.g. 600000"
                      value={applyForm.currentCtc}
                      onChange={(e) => setApplyForm({ ...applyForm, currentCtc: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Expected CTC (INR / P.A.)</label>
                    <input
                      type="number"
                      placeholder="e.g. 900000"
                      value={applyForm.expectedCtc}
                      onChange={(e) => setApplyForm({ ...applyForm, expectedCtc: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Location Details & Travel Preferences */}
              <div className="space-y-3 pt-2 border-t border-inherit">
                <h4 className="font-bold text-[11px] text-indigo-500 uppercase tracking-wider">Locations & Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold">Current Location</label>
                    <input
                      type="text"
                      value={applyForm.currentLocation}
                      onChange={(e) => setApplyForm({ ...applyForm, currentLocation: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Preferred Job Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore, Remote"
                      value={applyForm.preferredLocation}
                      onChange={(e) => setApplyForm({ ...applyForm, preferredLocation: e.target.value })}
                      className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="relocateCheck"
                      checked={applyForm.willingToRelocate}
                      onChange={(e) => setApplyForm({ ...applyForm, willingToRelocate: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    <label htmlFor="relocateCheck" className="font-bold cursor-pointer">Willing to relocate</label>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="remoteCheck"
                      checked={applyForm.willingToWorkRemote}
                      onChange={(e) => setApplyForm({ ...applyForm, willingToWorkRemote: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    <label htmlFor="remoteCheck" className="font-bold cursor-pointer">Willing to work remote</label>
                  </div>
                </div>
              </div>

              {/* 4. Cover Letter & Resume Review */}
              <div className="space-y-3 pt-2 border-t border-inherit">
                <h4 className="font-bold text-[11px] text-indigo-500 uppercase tracking-wider">Resume & Cover Letter</h4>
                
                <div className="flex items-center gap-3 p-3 rounded-theme-lg bg-slate-500/5 border">
                  <Paperclip className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">Submitted_Resume.pdf</p>
                    <span className="text-[10px] text-slate-400">Linked Profile Resume document</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Cover Letter (Optional)</label>
                  <textarea
                    placeholder="Write a brief cover letter or pitch to the recruiter..."
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    className={`w-full px-3 py-2 rounded-theme-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24 ${inputClass}`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-inherit flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setApplyJobData(null)}
                className={`px-5 py-2 text-xs font-bold rounded-theme-lg border transition-colors ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingAction}
                className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors disabled:opacity-50"
              >
                {loadingAction ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OVERLAY POPUPS: LINKEDIN SUCCESS CONFIRMATION MODAL */}
      {submittedAppId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-theme-2xl border shadow-theme-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200 ${cardClass}`}>
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            
            <h3 className="font-extrabold text-base">Application Sent Successfully!</h3>
            <p className="text-xs text-slate-400 mt-2">
              Your application for <strong className="text-slate-700 dark:text-slate-300">{appliedJobName}</strong> at <strong>{appliedCompanyName}</strong> was submitted successfully.
            </p>

            <div className="bg-slate-500/5 py-3.5 px-4 rounded-theme-xl border border-dashed border-inherit my-5">
              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">LinkedIn Application ID</span>
              <span className="text-sm font-extrabold text-indigo-500 font-mono tracking-tight">#{submittedAppId}</span>
            </div>

            <button
              onClick={() => setSubmittedAppId(null)}
              className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-theme-lg shadow-theme-md transition-colors"
            >
              Back to Job Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;