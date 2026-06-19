// client/src/context/AuthContext.js
import React, { useState, useEffect, createContext, useContext } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper: set axios default Authorization header when token is available
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Sync token changes with Axios headers and LocalStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setAuthHeader(token);
      // Optional: If you want to fetch current user profile details on page refresh
      fetchCurrentUser();
    } else {
      localStorage.removeItem("token");
      setAuthHeader(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Fetch the logged-in user profile using the active token
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/auth/me"); // Create this endpoint down the line
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error("Failed to authenticate session token:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Authentication Action: Handle User Login Session
  const login = async (email, password) => {
    try {
      // Matches your Express endpoint layout: /api/v1/auth/login
      const response = await axios.post("/auth/login", { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        setToken(token);
        setUser(user);
        
        // Dynamic redirection based on structural security type and specific role
        if (user.user_type === "SUPER_ADMIN") {
          navigate("/superadmin");
        } else if (user.user_type === "COMPANY_USER") {
          if (user.role === "COMPANY_ADMIN") navigate("/company");
          else if (user.role === "Recruiter") navigate("/recruiter");
          else if (user.role === "HR Manager") navigate("/hrmanager");
          else if (user.role === "Hiring Manager") navigate("/hiringmanager");
          else if (user.role === "Project Manager") navigate("/projectmanager");
          else if (user.role === "Technical Manager") navigate("/technicalmanager");
          else if (user.role === "Onboarding Manager") navigate("/onboardingmanager");
          else navigate("/company");
        } else {
          navigate("/employee");
        }

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Authentication failed."
      };
    }
  };

  // Authentication Action: Terminate Session Footprint
  const logout = () => {
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // 1. Fetch all companies (Super Admin function)
  const getAllCompanies = async () => {
    try {
      const response = await axios.get("/companies");
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch companies.");
    } catch (error) {
      console.error("Error in getAllCompanies:", error);
      throw error;
    }
  };

  // 2. Fetch company details by ID
  const getCompanyDetails = async (companyId) => {
    try {
      const response = await axios.get(`/company/${companyId}/details`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch company details.");
    } catch (error) {
      console.error("Error in getCompanyDetails:", error);
      throw error;
    }
  };

  // 3. Register a new company workspace
  const registerCompanyWorkspace = async (payload) => {
    try {
      const response = await axios.post("/company/register", payload);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to register company.");
    } catch (error) {
      console.error("Error in registerCompanyWorkspace:", error);
      throw error;
    }
  };

  // 4. Update company details
  const updateCompanyDetails = async (companyId, updateData) => {
    try {
      const response = await axios.put(`/company/${companyId}`, updateData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update company.");
    } catch (error) {
      console.error("Error in updateCompanyDetails:", error);
      throw error;
    }
  };

  // 5. Delete company
  const deleteCompanyDetails = async (companyId) => {
    try {
      const response = await axios.delete(`/company/${companyId}`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete company.");
    } catch (error) {
      console.error("Error in deleteCompanyDetails:", error);
      throw error;
    }
  };

  // 6. Register a new company admin
  const registerCompanyAdmin = async (companyId, payload) => {
    try {
      const response = await axios.post(`/companies/${companyId}/admins`, payload);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to register company admin.");
    } catch (error) {
      console.error("Error in registerCompanyAdmin:", error);
      throw error;
    }
  };

  // 7. Fetch all admins for a specific company
  const getCompanyAdmins = async (companyId) => {
    try {
      const response = await axios.get(`/companies/${companyId}/admins`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch company admins.");
    } catch (error) {
      console.error("Error in getCompanyAdmins:", error);
      throw error;
    }
  };

  // 8. Fetch all admins across all companies
  const getAllCompanyAdmins = async () => {
    try {
      const response = await axios.get("/company-admins");
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch company admins.");
    } catch (error) {
      console.error("Error in getAllCompanyAdmins:", error);
      throw error;
    }
  };

  // 9. Update company admin details
  const updateCompanyAdminDetails = async (adminId, data) => {
    try {
      const response = await axios.put(`/company-admins/${adminId}`, data);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to update company admin.");
    } catch (error) {
      console.error("Error in updateCompanyAdminDetails:", error);
      throw error;
    }
  };

  // 10. Delete company admin details
  const deleteCompanyAdminDetails = async (adminId) => {
    try {
      const response = await axios.delete(`/company-admins/${adminId}`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete company admin.");
    } catch (error) {
      console.error("Error in deleteCompanyAdminDetails:", error);
      throw error;
    }
  };

  // 11. Register a new department
  const registerDepartment = async (departmentData) => {
    try {
      const response = await axios.post("/departments", departmentData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to register department.");
    } catch (error) {
      console.error("Error in registerDepartment:", error);
      throw error;
    }
  };

  // 12. Fetch all departments
  const getAllDepartments = async (companyId) => {
    try {
      const url = companyId ? `/departments?company_id=${companyId}` : "/departments";
      const response = await axios.get(url);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch departments.");
    } catch (error) {
      console.error("Error in getAllDepartments:", error);
      throw error;
    }
  };

  // 13. Fetch department by ID
  const getDepartmentById = async (departmentId) => {
    try {
      const response = await axios.get(`/departments/${departmentId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch department details.");
    } catch (error) {
      console.error("Error in getDepartmentById:", error);
      throw error;
    }
  };

  // 14. Update department details
  const updateDepartmentDetails = async (departmentId, updateData) => {
    try {
      const response = await axios.put(`/departments/${departmentId}`, updateData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update department.");
    } catch (error) {
      console.error("Error in updateDepartmentDetails:", error);
      throw error;
    }
  };

  // 15. Delete department
  const deleteDepartmentDetails = async (departmentId) => {
    try {
      const response = await axios.delete(`/departments/${departmentId}`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete department.");
    } catch (error) {
      console.error("Error in deleteDepartmentDetails:", error);
      throw error;
    }
  };

  const registerCompanyAccountManage = async (payload) => {
    try {
      const response = await axios.post("/company-account-manage", payload);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to register company account manage.");
    } catch (error) {
      console.error("Error in registerCompanyAccountManage:", error);
      throw error;
    }
  }

  const getAllCompanyAccountManage = async (companyId) => {
    try {
      const url = companyId ? `/company-account-manage?company_id=${companyId}` : "/company-account-manage";
      const response = await axios.get(url);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch company account manage.");
    } catch (error) {
      console.error("Error in getAllCompanyAccountManage:", error);
      throw error;
    }
  }

  const getCompanyAccountManageById = async (companyAccountManageId) => {
    try {
      const response = await axios.get(`/company-account-manage/${companyAccountManageId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch company account manage.");
    } catch (error) {
      console.error("Error in getCompanyAccountManageById:", error);
      throw error;
    }
  }

  const updateCompanyAccountManage = async (companyAccountManageId, updateData) => {
    try {
      const response = await axios.put(`/company-account-manage/${companyAccountManageId}`, updateData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update company account manage.");
    } catch (error) {
      console.error("Error in updateCompanyAccountManage:", error);
      throw error;
    }
  }

  const deleteCompanyAccountManage = async (companyAccountManageId) => {
    try {
      const response = await axios.delete(`/company-account-manage/${companyAccountManageId}`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete company account manage.");
    } catch (error) {
      console.error("Error in deleteCompanyAccountManage:", error);
      throw error;
    }
  }

  // Mapping helpers between Frontend representation (JobPostsTab.jsx) and Backend Schema representation
  const mapFrontendToBackendJob = (jobData, departments) => {
    let departmentId = null;
    if (jobData.department) {
      const dept = departments?.find(d => d.name === jobData.department);
      if (dept) {
        departmentId = dept.id;
      }
    }

    let salaryMin = null;
    let salaryMax = null;
    let salaryCurrency = 'INR';
    if (jobData.salary) {
      const cleanSalary = jobData.salary.replace(/[^\d\-]/g, '');
      const parts = cleanSalary.split('-');
      if (parts.length > 0 && parts[0]) {
        salaryMin = parseFloat(parts[0]) || null;
      }
      if (parts.length > 1 && parts[1]) {
        salaryMax = parseFloat(parts[1]) || null;
      }
      if (jobData.salary.includes('$')) {
        salaryCurrency = 'USD';
      } else if (jobData.salary.includes('€')) {
        salaryCurrency = 'EUR';
      }
    }

    let status = 'OPEN';
    if (jobData.status) {
      if (jobData.status.toUpperCase() === 'CLOSED') {
        status = 'CLOSED';
      } else if (jobData.status.toUpperCase() === 'DRAFT') {
        status = 'DRAFT';
      } else if (jobData.status.toUpperCase() === 'ACTIVE' || jobData.status.toUpperCase() === 'OPEN') {
        status = 'OPEN';
      } else {
        status = jobData.status;
      }
    }

    return {
      jobTitle: jobData.title,
      departmentId: departmentId,
      location: jobData.location,
      jobType: jobData.type,
      jobDescription: jobData.description,
      jobRequirements: jobData.requirements,
      salaryMin,
      salaryMax,
      salaryCurrency,
      status: status,
      assignedRecruiter: jobData.assignedUserId || null,
      companyId: user?.company_id || null
    };
  };

  const mapBackendToFrontendJob = (backendJob, departments) => {
    if (!backendJob) return null;

    let departmentName = '';
    if (backendJob.departmentId) {
      const dept = departments?.find(d => d.id === backendJob.departmentId);
      departmentName = dept ? dept.name : '';
    }

    let salaryStr = '';
    if (backendJob.salaryMin !== null && backendJob.salaryMin !== undefined) {
      const currencySym = backendJob.salaryCurrency === 'USD' ? '$' : (backendJob.salaryCurrency === 'EUR' ? '€' : '₹');
      const minStr = Math.round(backendJob.salaryMin).toLocaleString();
      if (backendJob.salaryMax !== null && backendJob.salaryMax !== undefined) {
        const maxStr = Math.round(backendJob.salaryMax).toLocaleString();
        salaryStr = `${currencySym}${minStr} - ${currencySym}${maxStr} P.A.`;
      } else {
        salaryStr = `${currencySym}${minStr} P.A.`;
      }
    }

    let status = 'Active';
    if (backendJob.status) {
      if (backendJob.status.toUpperCase() === 'CLOSED') {
        status = 'Closed';
      } else if (backendJob.status.toUpperCase() === 'DRAFT') {
        status = 'Draft';
      } else {
        status = 'Active';
      }
    }

    return {
      id: backendJob.jobId,
      title: backendJob.jobTitle,
      department: departmentName,
      location: backendJob.location,
      type: backendJob.jobType,
      description: backendJob.jobDescription,
      requirements: backendJob.jobRequirements,
      salary: salaryStr,
      status: status,
      applicationsCount: backendJob.totalApplications || 0,
      createdAt: backendJob.createdAt ? new Date(backendJob.createdAt).toISOString().split('T')[0] : '',
      assignedUserId: backendJob.assignedRecruiter || '',
      isFeatured: backendJob.isFeatured || false
    };
  };

  const createJobPosting = async (jobData) => {
    try {
      let departments = [];
      try {
        const url = user?.company_id ? `/departments?companyId=${user.company_id}` : '/departments';
        const responseDepts = await axios.get(url);
        if (responseDepts.data.success) {
          departments = responseDepts.data.data || [];
        }
      } catch (e) {
        console.error("Failed to load departments during jobs mapping", e);
      }

      const payload = mapFrontendToBackendJob(jobData, departments);
      const response = await axios.post("/job-posting", payload);
      if (response.data.success) {
        return mapBackendToFrontendJob(response.data.data, departments);
      }
      throw new Error(response.data.message || "Failed to create job posting.");
    } catch (error) {
      console.error("Error in createJobPosting:", error);
      throw error;
    }
  }

  const updateJobPosting = async (jobId, updateData) => {
    try {
      let departments = [];
      try {
        const url = user?.company_id ? `/departments?companyId=${user.company_id}` : '/departments';
        const responseDepts = await axios.get(url);
        if (responseDepts.data.success) {
          departments = responseDepts.data.data || [];
        }
      } catch (e) {
        console.error("Failed to load departments during jobs mapping", e);
      }

      const payload = mapFrontendToBackendJob(updateData, departments);
      const response = await axios.put(`/job-posting/${jobId}`, payload);
      if (response.data.success) {
        return mapBackendToFrontendJob(response.data.data, departments);
      }
      throw new Error(response.data.message || "Failed to update job posting.");
    } catch (error) {
      console.error("Error in updateJobPosting:", error);
      throw error;
    }
  }

  const deleteJobPosting = async (jobId) => {
    try {
      const response = await axios.delete(`/job-posting/${jobId}`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete job posting.");
    } catch (error) {
      console.error("Error in deleteJobPosting:", error);
      throw error;
    }
  }

  const getJobPostingById = async (jobId) => {
    try {
      let departments = [];
      try {
        const url = user?.company_id ? `/departments?companyId=${user.company_id}` : '/departments';
        const responseDepts = await axios.get(url);
        if (responseDepts.data.success) {
          departments = responseDepts.data.data || [];
        }
      } catch (e) {
        console.error("Failed to load departments during jobs mapping", e);
      }

      const response = await axios.get(`/job-posting/${jobId}`);
      if (response.data.success) {
        return mapBackendToFrontendJob(response.data.data, departments);
      }
      throw new Error(response.data.message || "Failed to fetch job posting.");
    } catch (error) {
      console.error("Error in getJobPostingById:", error);
      throw error;
    }
  }

  const getAllJobPostings = async () => {
    try {
      let departments = [];
      try {
        const url = user?.company_id ? `/departments?companyId=${user.company_id}` : '/departments';
        const responseDepts = await axios.get(url);
        if (responseDepts.data.success) {
          departments = responseDepts.data.data || [];
        }
      } catch (e) {
        console.error("Failed to load departments during jobs mapping", e);
      }

      const response = await axios.get("/job-posting");
      if (response.data.success) {
        const backendJobs = response.data.data || [];
        return backendJobs.map(job => mapBackendToFrontendJob(job, departments));
      }
      throw new Error(response.data.message || "Failed to fetch job postings.");
    } catch (error) {
      console.error("Error in getAllJobPostings:", error);
      throw error;
    }
  }

  const toggleFeaturedJob = async (jobId) => {
    try {
      let departments = [];
      try {
        const url = user?.company_id ? `/departments?companyId=${user.company_id}` : '/departments';
        const responseDepts = await axios.get(url);
        if (responseDepts.data.success) {
          departments = responseDepts.data.data || [];
        }
      } catch (e) {
        console.error("Failed to load departments during jobs mapping", e);
      }

      const response = await axios.put(`/job-posting/${jobId}/featured`);
      if (response.data.success) {
        return mapBackendToFrontendJob(response.data.data, departments);
      }
      throw new Error(response.data.message || "Failed to toggle featured job.");
    } catch (error) {
      console.error("Error in toggleFeaturedJob:", error);
      throw error;
    }
  }

  const countJobPostings = async () => {
    try {
      const response = await axios.get("/job-posting/count");
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to count job postings.");
    } catch (error) {
      console.error("Error in countJobPostings:", error);
      throw error;
    }
  }

  const createEmployee = async (payload) => {
    try {
      const response = await axios.post("/employee/register", payload);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create employee.");
    } catch (error) {
      console.error("Error in createEmployee:", error);
      throw error;
    }
  }

  const getAllEmployees = async () => {
    try {
      const response = await axios.get("/employees");
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch employees.");
    } catch (error) {
      console.error("Error in getAllEmployees:", error);
      throw error;
    }
  }

  const getEmployeeById = async (employeeId) => {
    try {
      const response = await axios.get(`/employees/${employeeId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch employee details.");
    } catch (error) {
      console.error("Error in getEmployeeById:", error);
      throw error;
    }
  }

  const updateEmployeeDetails = async (employeeId, updateData) => {
    try {
      const response = await axios.put(`/employees/${employeeId}`, updateData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update employee details.");
    } catch (error) {
      console.error("Error in updateEmployeeDetails:", error);
      throw error;
    }
  }

  const deleteEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.delete(`/employees/${employeeId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to delete employee details.");
    } catch (error) {
      console.error("Error in deleteEmployeeDetails:", error);
      throw error;
    }
  }

  // Provide state data globally across child components
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    getAllCompanies,
    getCompanyDetails,
    registerCompanyWorkspace,
    updateCompanyDetails,
    deleteCompanyDetails,
    registerCompanyAdmin,
    getCompanyAdmins,
    getAllCompanyAdmins,
    updateCompanyAdminDetails,
    deleteCompanyAdminDetails,
    registerDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartmentDetails,
    deleteDepartmentDetails,
    registerCompanyAccountManage,
    getAllCompanyAccountManage,
    getCompanyAccountManageById,
    updateCompanyAccountManage,
    deleteCompanyAccountManage,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    getJobPostingById,
    getAllJobPostings,
    toggleFeaturedJob,
    countJobPostings,
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployeeDetails,
    deleteEmployeeDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
