import React from 'react';
import CompanyDashboardShell from '../CompanyAdmin/CompanyDashboardShell';

const TechnicalManagerDashboard = () => {
  const technicalManagerTabs = ['overview', 'jobs', 'applications', 'reports', 'settings'];

  return (
    <CompanyDashboardShell 
      allowedTabs={technicalManagerTabs} 
      roleTitle="TECHNICAL MANAGER" 
    />
  );
};

export default TechnicalManagerDashboard;