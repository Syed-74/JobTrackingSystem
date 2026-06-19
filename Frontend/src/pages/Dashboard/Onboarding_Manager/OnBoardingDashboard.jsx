import React from 'react';
import CompanyDashboardShell from '../CompanyAdmin/CompanyDashboardShell';

const OnBoardingDashboard = () => {
  const onboardingManagerTabs = ['overview', 'employees', 'settings'];

  return (
    <CompanyDashboardShell 
      allowedTabs={onboardingManagerTabs} 
      roleTitle="ONBOARDING MANAGER" 
    />
  );
};

export default OnBoardingDashboard;