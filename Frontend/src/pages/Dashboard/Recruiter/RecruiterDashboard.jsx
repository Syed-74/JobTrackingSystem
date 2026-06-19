import React from 'react';
import CompanyDashboardShell from '../CompanyAdmin/CompanyDashboardShell';

const RecruiterDashboard = () => {
  const recruiterTabs = ['overview', 'jobs', 'applications', 'reports', 'settings'];

  return (
    <CompanyDashboardShell 
      allowedTabs={recruiterTabs} 
      roleTitle="RECRUITER" 
    />
  );
};

export default RecruiterDashboard;