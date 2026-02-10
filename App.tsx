import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { AppView, BusinessProfile } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  const handleStartOnboarding = () => {
    setCurrentView(AppView.ONBOARDING);
  };

  const handleOnboardingComplete = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setBusinessProfile(null);
    setCurrentView(AppView.LANDING);
  };

  return (
    <>
      {currentView === AppView.LANDING && (
        <LandingPage onGetStarted={handleStartOnboarding} />
      )}
      
      {currentView === AppView.ONBOARDING && (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          onCancel={() => setCurrentView(AppView.LANDING)}
        />
      )}
      
      {currentView === AppView.DASHBOARD && businessProfile && (
        <Dashboard 
          profile={businessProfile} 
          onLogout={handleLogout}
          onUpdateProfile={(p) => setBusinessProfile(p)}
        />
      )}
    </>
  );
};

export default App;