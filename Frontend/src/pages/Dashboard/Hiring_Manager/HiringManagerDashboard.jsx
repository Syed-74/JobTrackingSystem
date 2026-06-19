import React from 'react';
import CompanyDashboardShell from '../CompanyAdmin/CompanyDashboardShell';

const HiringManagerDashboard = () => {
  const hiringManagerTabs = ['overview', 'jobs', 'applications', 'reports', 'settings'];

  return (
    <CompanyDashboardShell 
      allowedTabs={hiringManagerTabs} 
      roleTitle="HIRING MANAGER" 
    />
  );
};

export default HiringManagerDashboard;