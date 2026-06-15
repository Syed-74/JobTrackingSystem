import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  AlertTriangle, 
  Save, 
  CheckCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const Settings = () => {
  // Tabs State
  const [activeSubTab, setActiveSubTab] = useState('system'); // 'system', 'profile', 'security', 'backups'

  // Settings State
  const [systemSettings, setSystemSettings] = useState({
    appName: 'JobTracker System',
    supportEmail: 'support@jobtracker.com',
    allowRegistrations: true,
    maintenanceMode: false,
    sessionTimeout: '60',
    logRetention: '30'
  });

  const [profileSettings, setProfileSettings] = useState({
    name: 'Super Admin',
    email: 'admin@jobtracker.com',
    role: 'SUPER_ADMIN',
    notifyOnNewCompany: true,
    notifyOnErrors: true
  });

  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'Daily',
    backupRetention: '7',
    s3Bucket: 'jobtracker-db-backups-production'
  });

  // Action feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Input Handlers
  const handleSystemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings({
      ...systemSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileSettings({
      ...profileSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordState({
      ...passwordState,
      [name]: value
    });
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: '' });
    }
  };

  const handleBackupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBackupSettings({
      ...backupSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Mock Save Actions
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate network save
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordState.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordState.newPassword) errors.newPassword = 'New password is required';
    if (passwordState.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Configuration Panel</h3>
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-text tracking-tight mt-0.5">
            System & Profile Settings
          </h1>
          <p className="text-neutral-text-muted text-sm mt-1">
            Global system overrides, admin authentication profiling, database triggers, and security controls.
          </p>
        </div>

        {/* Global Save Indicator Alert */}
        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-success-light border border-success/20 text-success rounded-theme-lg text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Settings Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Navigation Links */}
        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-3 shadow-theme-sm h-fit">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSubTab('system')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-theme-lg text-xs font-semibold transition-all duration-150 ${
                activeSubTab === 'system' 
                  ? 'bg-primary text-neutral-textInverse shadow-theme-sm' 
                  : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>System Settings</span>
            </button>

            <button
              onClick={() => setActiveSubTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-theme-lg text-xs font-semibold transition-all duration-150 ${
                activeSubTab === 'profile' 
                  ? 'bg-primary text-neutral-textInverse shadow-theme-sm' 
                  : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Admin Profile</span>
            </button>

            <button
              onClick={() => setActiveSubTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-theme-lg text-xs font-semibold transition-all duration-150 ${
                activeSubTab === 'security' 
                  ? 'bg-primary text-neutral-textInverse shadow-theme-sm' 
                  : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Login Security</span>
            </button>

            <button
              onClick={() => setActiveSubTab('backups')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-theme-lg text-xs font-semibold transition-all duration-150 ${
                activeSubTab === 'backups' 
                  ? 'bg-primary text-neutral-textInverse shadow-theme-sm' 
                  : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database & Backups</span>
            </button>
          </nav>
        </div>

        {/* Right Side: Tab Form Panel */}
        <div className="lg:col-span-3 bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 md:p-6 shadow-theme-sm">
          
          {/* TAB 1: SYSTEM SETTINGS */}
          {activeSubTab === 'system' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-text">System Configuration</h2>
                <p className="text-neutral-text-muted text-xs mt-0.5">Control site variables, session times, and client registration access.</p>
              </div>

              {systemSettings.maintenanceMode && (
                <div className="p-4 bg-danger-light border border-danger/10 rounded-theme-lg flex gap-3 text-danger">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">Maintenance Mode is ENABLED</p>
                    <p className="mt-0.5 leading-normal opacity-90">All non-admin users will be blocked from logging in. Live operations will show a service window downtime splash.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">Application Title</label>
                  <input
                    type="text"
                    name="appName"
                    value={systemSettings.appName}
                    onChange={handleSystemChange}
                    className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">Support Desk Email</label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={systemSettings.supportEmail}
                    onChange={handleSystemChange}
                    className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">Session Timeout (Minutes)</label>
                  <select
                    name="sessionTimeout"
                    value={systemSettings.sessionTimeout}
                    onChange={handleSystemChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">System Logs Retention (Days)</label>
                  <select
                    name="logRetention"
                    value={systemSettings.logRetention}
                    onChange={handleSystemChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-2 border-t border-neutral-border">
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-text">Allow New Client Registrations</span>
                    <span className="text-[11px] text-neutral-text-muted mt-0.5">Allow public sign-up paths for companies or suspend onboarding portals.</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSystemSettings({...systemSettings, allowRegistrations: !systemSettings.allowRegistrations})}
                    className="text-neutral-text-muted hover:text-neutral-text transition-colors"
                  >
                    {systemSettings.allowRegistrations ? (
                      <ToggleRight className="w-12 h-8 text-primary" />
                    ) : (
                      <ToggleLeft className="w-12 h-8 text-neutral-text-muted" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-neutral-border/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-text text-danger">Trigger Maintenance Lockdown</span>
                    <span className="text-[11px] text-neutral-text-muted mt-0.5">Locks out client portals during live migrations or API maintenance upgrades.</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSystemSettings({...systemSettings, maintenanceMode: !systemSettings.maintenanceMode})}
                    className="text-neutral-text-muted hover:text-neutral-text transition-colors"
                  >
                    {systemSettings.maintenanceMode ? (
                      <ToggleRight className="w-12 h-8 text-danger" />
                    ) : (
                      <ToggleLeft className="w-12 h-8 text-neutral-text-muted" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-neutral-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-neutral-textInverse font-bold text-sm rounded-theme-lg shadow-theme-sm transition-all focus:outline-none"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving changes...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PROFILE SETTINGS */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-text">Admin Profile</h2>
                <p className="text-neutral-text-muted text-xs mt-0.5">Manage your super admin credentials, email address, and notifications.</p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-theme-xl bg-neutral-base border border-neutral-border">
                <div className="w-14 h-14 rounded-full bg-primary text-neutral-textInverse flex items-center justify-center text-xl font-bold border border-neutral-border shadow-theme-md">
                  SA
                </div>
                <div>
                  <p className="font-bold text-neutral-text">{profileSettings.name}</p>
                  <p className="text-xs text-neutral-text-muted mt-0.5">Primary Director ID: {profileSettings.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">User Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileSettings.name}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">Registered Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileSettings.email}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-4 pt-2 border-t border-neutral-border">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Email Dispatch Diagnostics</h3>
                
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-text">Onboard Alerts</span>
                    <span className="text-[11px] text-neutral-text-muted mt-0.5">Email alert when a new company workspace is registered.</span>
                  </div>
                  <input
                    type="checkbox"
                    name="notifyOnNewCompany"
                    checked={profileSettings.notifyOnNewCompany}
                    onChange={handleProfileChange}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-border cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1 border-t border-neutral-border/30">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-text">Critical Server Exceptions</span>
                    <span className="text-[11px] text-neutral-text-muted mt-0.5">Immediate alert on database connections errors, hardware logs.</span>
                  </div>
                  <input
                    type="checkbox"
                    name="notifyOnErrors"
                    checked={profileSettings.notifyOnErrors}
                    onChange={handleProfileChange}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-border cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-neutral-textInverse font-bold text-sm rounded-theme-lg shadow-theme-sm transition-all focus:outline-none"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving profile...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: LOGIN SECURITY */}
          {activeSubTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-text">Update Password</h2>
                <p className="text-neutral-text-muted text-xs mt-0.5">Maintain root database security by changing the superadmin credentials periodically.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordState.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      passwordErrors.currentPassword ? 'border-danger' : 'border-neutral-border'
                    }`}
                  />
                  {passwordErrors.currentPassword && <p className="text-[11px] text-danger mt-1 font-medium">{passwordErrors.currentPassword}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordState.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      passwordErrors.newPassword ? 'border-danger' : 'border-neutral-border'
                    }`}
                  />
                  {passwordErrors.newPassword && <p className="text-[11px] text-danger mt-1 font-medium">{passwordErrors.newPassword}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordState.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3.5 py-2 bg-neutral-base border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      passwordErrors.confirmPassword ? 'border-danger' : 'border-neutral-border'
                    }`}
                  />
                  {passwordErrors.confirmPassword && <p className="text-[11px] text-danger mt-1 font-medium">{passwordErrors.confirmPassword}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-neutral-textInverse font-bold text-sm rounded-theme-lg shadow-theme-sm transition-all focus:outline-none"
                >
                  <Shield className="w-4 h-4" />
                  <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: DATABASE & BACKUPS */}
          {activeSubTab === 'backups' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-text">Database Backup Settings</h2>
                <p className="text-neutral-text-muted text-xs mt-0.5">Manage automated cron backing scripts and cloud object storage.</p>
              </div>

              <div className="p-4 bg-info-light border border-info/10 rounded-theme-lg flex gap-3 text-info">
                <Database className="w-5 h-5 shrink-0" />
                <div className="text-xs leading-normal">
                  <p className="font-bold">Automated Daily Backups</p>
                  <p className="mt-0.5 opacity-90">All databases (including isolated tenant schemas) are compiled, compressed (.sql.gz), and uploaded to secure cloud storage daily at 04:00:00 UTC.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">Backup Frequency</label>
                  <select
                    name="backupFrequency"
                    value={backupSettings.backupFrequency}
                    onChange={handleBackupChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">Retention Period (Backups)</label>
                  <select
                    name="backupRetention"
                    value={backupSettings.backupRetention}
                    onChange={handleBackupChange}
                    className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="7">Last 7 backups</option>
                    <option value="30">Last 30 backups</option>
                    <option value="90">Last 90 backups</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-text mb-1.5">Cloud Storage Bucket Name</label>
                  <input
                    type="text"
                    name="s3Bucket"
                    value={backupSettings.s3Bucket}
                    onChange={handleBackupChange}
                    className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm font-mono text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-2 border-t border-neutral-border">
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-text">Automated Cloud Backups</span>
                    <span className="text-[11px] text-neutral-text-muted mt-0.5">Toggle backup uploads to cloud storage bucket.</span>
                  </div>
                  <input
                    type="checkbox"
                    name="autoBackup"
                    checked={backupSettings.autoBackup}
                    onChange={handleBackupChange}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-border cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-border flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-neutral-border hover:bg-neutral-muted text-neutral-text text-sm font-semibold rounded-theme-lg transition-colors focus:outline-none"
                >
                  Backup Now
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-neutral-textInverse font-bold text-sm rounded-theme-lg shadow-theme-sm transition-all focus:outline-none"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default Settings;
