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
        
        // Dynamic redirection based on structural security type
        if (user.user_type === "SUPER_ADMIN") navigate("/superadmin");
        else if (user.user_type === "COMPANY_USER") navigate("/company");
        else navigate("/employee");

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
    deleteCompanyAdminDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
