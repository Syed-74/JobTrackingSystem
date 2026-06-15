import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import SuperAdminDashboard from './pages/Dashboard/SuperAdmin/SuperAdminDashboard';
import Overview from './pages/Dashboard/SuperAdmin/Overview';
import CompanyAdmins from './pages/Dashboard/SuperAdmin/CompanyAdmins';
import Settings from './pages/Dashboard/SuperAdmin/Settings';
import CompanyAdminDashboard from './pages/Dashboard/CompanyAdmin/CompanyAdminDashboard';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CompanyManagement from './pages/Dashboard/SuperAdmin/CompanyManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Dashboards */}
          <Route 
            path="/superadmin" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="companies" element={<CompanyAdmins />} />
            <Route path="company-management" element={<CompanyManagement/>} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route 
            path="/company" 
            element={
              <ProtectedRoute allowedRoles={['COMPANY_USER']}>
                <CompanyAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee" 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirection Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
