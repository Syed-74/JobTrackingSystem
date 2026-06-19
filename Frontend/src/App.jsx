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

// Role Dashboards
import RecruiterDashboard from './pages/Dashboard/Recruiter/RecruiterDashboard';
import HrManagerDashboard from './pages/Dashboard/HR_Manager/HrManagerDashboard';
import HiringManagerDashboard from './pages/Dashboard/Hiring_Manager/HiringManagerDashboard';
import ProjectManagerDashboard from './pages/Dashboard/Project_Manager/ProjectManagerDashboard';
import TechnicalManagerDashboard from './pages/Dashboard/Technical_Manager/TechnicalManagerDashboard';
import OnBoardingDashboard from './pages/Dashboard/Onboarding_Manager/OnBoardingDashboard';

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
              <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}>
                <CompanyAdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/recruiter" 
            element={
              <ProtectedRoute allowedRoles={['Recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/hrmanager" 
            element={
              <ProtectedRoute allowedRoles={['HR Manager']}>
                <HrManagerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/hiringmanager" 
            element={
              <ProtectedRoute allowedRoles={['Hiring Manager']}>
                <HiringManagerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/projectmanager" 
            element={
              <ProtectedRoute allowedRoles={['Project Manager']}>
                <ProjectManagerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/technicalmanager" 
            element={
              <ProtectedRoute allowedRoles={['Technical Manager']}>
                <TechnicalManagerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/onboardingmanager" 
            element={
              <ProtectedRoute allowedRoles={['Onboarding Manager']}>
                <OnBoardingDashboard />
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

          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/jobs/:jobId" 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/jobs/:jobId/apply" 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/jobs/:jobId/application-success" 
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
