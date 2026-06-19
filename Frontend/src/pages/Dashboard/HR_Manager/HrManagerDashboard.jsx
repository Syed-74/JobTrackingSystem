import React from 'react';
import CompanyDashboardShell from '../CompanyAdmin/CompanyDashboardShell';

const HrManagerDashboard = () => {
  const hrManagerTabs = ['overview', 'departments', 'jobs', 'applications', 'employees', 'reports', 'settings'];

  return (
    <CompanyDashboardShell 
      allowedTabs={hrManagerTabs} 
      roleTitle="HR MANAGER" 
    />
  );
};

export default HrManagerDashboard;