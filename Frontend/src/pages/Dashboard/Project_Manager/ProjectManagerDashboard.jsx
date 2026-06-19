import React from 'react';
import CompanyDashboardShell from '../CompanyAdmin/CompanyDashboardShell';

const ProjectManagerDashboard = () => {
  const projectManagerTabs = ['overview', 'departments', 'employees', 'settings'];

  return (
    <CompanyDashboardShell 
      allowedTabs={projectManagerTabs} 
      roleTitle="PROJECT MANAGER" 
    />
  );
};

export default ProjectManagerDashboard;