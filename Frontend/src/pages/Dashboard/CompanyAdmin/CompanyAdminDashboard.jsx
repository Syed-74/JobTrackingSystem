import React from 'react';
import CompanyDashboardShell from './CompanyDashboardShell';

const CompanyAdminDashboard = () => {
  return (
    <CompanyDashboardShell 
      allowedTabs={['overview', 'admins', 'departments', 'jobs', 'applications', 'employees', 'reports', 'settings']} 
      roleTitle="COMPANY ADMIN"
    />
  );
};

export default CompanyAdminDashboard;