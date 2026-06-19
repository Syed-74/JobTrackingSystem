import React, { useState } from 'react';
import { 
  Lock, 
  Bell, 
  Building2, 
  Check, 
  RefreshCw, 
  Shield, 
  ToggleLeft, 
  ToggleRight,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Info
} from 'lucide-react';

const SettingsTab = ({ 
  addActivityLog,
  subTab,
  setSubTab,
  profileFormData, 
  profileSubmitting, 
  profileSuccess, 
  profileError, 
  uploadingLogo, 
  logoPreview, 
  companyLogo,
  handleProfileInputChange, 
  handleUpdateProfile, 
  handleLogoFileChange, 
  handleUploadLogo,
  logoFile,
  getLogoUrl
}) => {
  // Security Password State
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passSubmitting, setPassSubmitting] = useState(false);

  // Notifications toggles
  const [notifConfig, setNotifConfig] = useState({
    newApplication: true,
    interviewSchedule: true,
    hiringDecision: true,
    digestEmail: false
  });
  const [notifSuccess, setNotifSuccess] = useState('');

  // Password Input Change
  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassData(prev => ({ ...prev, [name]: value }));
    setPassError('');
    setPassSuccess('');
  };

  // Save Password Change
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passData.currentPassword || !passData.newPassword || !passData.confirmPassword) {
      setPassError('All password fields are required.');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New password and confirm password fields do not match.');
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('New password must consist of at least 6 characters.');
      return;
    }

    setPassSubmitting(true);
    setTimeout(() => {
      setPassSuccess('Account password credentials modified successfully!');
      addActivityLog('Updated workspace admin account password.');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassSubmitting(false);
    }, 1200);
  };

  // Toggle Notification setting
  const handleToggleNotif = (key) => {
    setNotifConfig(prev => {
      const next = { ...prev, [key]: !prev[key] };
      addActivityLog(`Toggled notification: ${key} to ${next[key]}`);
      return next;
    });
    setNotifSuccess('Notification channels updated.');
    setTimeout(() => setNotifSuccess(''), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
      
      {/* Left Menu (1/4 width) */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-4 shadow-theme-sm space-y-1 h-fit">
        <button
          onClick={() => setSubTab('profile')}
          className={`w-full text-left px-4 py-2.5 rounded-theme-lg font-bold text-xs flex items-center gap-2.5 transition-colors ${
            subTab === 'profile'
              ? 'bg-primary text-neutral-textInverse shadow-theme-sm'
              : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile</span>
        </button>

        <button
          onClick={() => setSubTab('security')}
          className={`w-full text-left px-4 py-2.5 rounded-theme-lg font-bold text-xs flex items-center gap-2.5 transition-colors ${
            subTab === 'security'
              ? 'bg-primary text-neutral-textInverse shadow-theme-sm'
              : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Change Password</span>
        </button>

        <button
          onClick={() => setSubTab('notifications')}
          className={`w-full text-left px-4 py-2.5 rounded-theme-lg font-bold text-xs flex items-center gap-2.5 transition-colors ${
            subTab === 'notifications'
              ? 'bg-primary text-neutral-textInverse shadow-theme-sm'
              : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Settings</span>
        </button>
      </div>

      {/* Right Content panel (3/4 width) */}
      {subTab === 'profile' ? (
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Left Column: Logo uploading */}
          <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-6 shadow-theme-sm flex flex-col items-center justify-start text-center h-fit">
            <h3 className="font-bold text-base text-neutral-text border-b border-neutral-border pb-4 mb-6 w-full text-left">
              Workspace Branding
            </h3>

            <div className="w-32 h-32 rounded-theme-2xl bg-neutral-base border border-neutral-border p-4 flex items-center justify-center shadow-theme-sm relative overflow-hidden group mb-4">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="max-w-full max-h-full object-contain rounded-theme-lg" />
              ) : companyLogo ? (
                <img src={getLogoUrl(companyLogo)} alt="Company Logo" className="max-w-full max-h-full object-contain rounded-theme-lg" />
              ) : (
                <Building2 className="w-12 h-12 text-neutral-text-muted" />
              )}
            </div>

            <p className="text-xs text-neutral-text-muted max-w-[200px] mb-4">
              Upload your corporate branding logo (PNG, JPG, max 2MB).
            </p>

            <div className="w-full space-y-3">
              <label className="block w-full py-2.5 px-4 bg-neutral-base hover:bg-neutral-muted text-neutral-text border border-neutral-border rounded-theme-lg text-xs font-bold cursor-pointer transition-colors">
                <Upload className="w-4 h-4 inline-block mr-2 text-neutral-text-muted" />
                <span>Select Logo File</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoFileChange}
                  className="hidden" 
                />
              </label>

              {logoFile && (
                <button
                  onClick={handleUploadLogo}
                  disabled={uploadingLogo}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-neutral-textInverse rounded-theme-lg text-xs font-bold shadow-theme-sm flex items-center justify-center gap-2 transition-all"
                >
                  {uploadingLogo ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Upload Selected Logo</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Profile details form */}
          <div className="lg:col-span-2 bg-neutral-surface border border-neutral-border rounded-theme-xl p-6 shadow-theme-sm">
            <h3 className="font-bold text-base text-neutral-text border-b border-neutral-border pb-4 mb-6">
              Corporate Identity Parameters
            </h3>

            {profileSuccess && (
              <div className="mb-4 p-3.5 bg-success-light border border-success/20 text-success text-xs font-semibold rounded-theme-lg flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3.5 bg-danger-light border border-danger/20 text-danger text-xs font-semibold rounded-theme-lg">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Section 1: Brand details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                  Corporate Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={profileFormData.companyName}
                      onChange={handleProfileInputChange}
                      required
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">Company Website</label>
                    <input
                      type="text"
                      name="companyWebsite"
                      value={profileFormData.companyWebsite}
                      onChange={handleProfileInputChange}
                      placeholder="e.g. www.company.com"
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">Industry Type</label>
                    <input
                      type="text"
                      name="industryType"
                      value={profileFormData.industryType}
                      onChange={handleProfileInputChange}
                      placeholder="e.g. Information Technology"
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">Company Size</label>
                    <input
                      type="text"
                      name="companySize"
                      value={profileFormData.companySize}
                      onChange={handleProfileInputChange}
                      placeholder="e.g. 50-100 Employees"
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">Corporate Email Address</label>
                    <input
                      type="email"
                      name="companyEmail"
                      value={profileFormData.companyEmail}
                      onChange={handleProfileInputChange}
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">Corporate Phone</label>
                    <input
                      type="text"
                      name="companyPhone"
                      value={profileFormData.companyPhone}
                      onChange={handleProfileInputChange}
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-text mb-1">Corporate Profile Bio / Description</label>
                    <textarea
                      name="companyDescription"
                      value={profileFormData.companyDescription}
                      onChange={handleProfileInputChange}
                      rows={3}
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-neutral-border pb-1">
                  Headquarters Address Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-text mb-1">HQ Address *</label>
                    <input
                      type="text"
                      name="companyAddress"
                      value={profileFormData.companyAddress}
                      onChange={handleProfileInputChange}
                      required
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">City *</label>
                    <input
                      type="text"
                      name="companyCity"
                      value={profileFormData.companyCity}
                      onChange={handleProfileInputChange}
                      required
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">State *</label>
                    <input
                      type="text"
                      name="companyState"
                      value={profileFormData.companyState}
                      onChange={handleProfileInputChange}
                      required
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">Pincode / Zip *</label>
                    <input
                      type="text"
                      name="companyPincode"
                      value={profileFormData.companyPincode}
                      onChange={handleProfileInputChange}
                      required
                      className="w-full px-3.5 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-sm text-neutral-text focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-neutral-border">
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold text-sm rounded-theme-lg shadow-theme-md hover:shadow-theme-glow transition-all duration-200 focus:outline-none"
                >
                  {profileSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>Save Company Settings</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      ) : (
        <div className="lg:col-span-3 bg-neutral-surface border border-neutral-border rounded-theme-xl p-6 shadow-theme-sm">
          
          {/* Security Password component */}
          {subTab === 'security' && (
            <div className="space-y-6">
              <h3 className="font-bold text-base text-neutral-text border-b border-neutral-border pb-4 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Modify Admin Password Credentials</span>
              </h3>

              {passSuccess && (
                <div className="p-3.5 bg-success-light border border-success/20 text-success text-xs font-semibold rounded-theme-lg flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="p-3.5 bg-danger-light border border-danger/20 text-danger text-xs font-semibold rounded-theme-lg animate-in fade-in">
                  {passError}
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-4 max-w-sm text-xs">
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Current Password *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passData.currentPassword}
                    onChange={handlePassChange}
                    required
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">New Password *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passData.newPassword}
                    onChange={handlePassChange}
                    required
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-3.5 py-2.5 bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passData.confirmPassword}
                    onChange={handlePassChange}
                    required
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passSubmitting}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold rounded-theme-lg shadow-theme-sm transition-all focus:outline-none"
                  >
                    {passSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Change Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications toggles panel */}
          {subTab === 'notifications' && (
            <div className="space-y-6 text-xs text-neutral-text">
              <h3 className="font-bold text-base text-neutral-text border-b border-neutral-border pb-4 mb-2 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <span>Email Notification Channels</span>
              </h3>

              {notifSuccess && (
                <div className="p-3 bg-success-light border border-success/20 text-success font-semibold rounded-theme-lg flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{notifSuccess}</span>
                </div>
              )}

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-bold text-neutral-text">Candidate Job Applications</h4>
                    <p className="text-neutral-text-muted text-[10px] mt-0.5">Send a real-time email alert when a new resume is submitted.</p>
                  </div>
                  <button onClick={() => handleToggleNotif('newApplication')} className="focus:outline-none">
                    {notifConfig.newApplication ? (
                      <ToggleRight className="w-9 h-9 text-primary cursor-pointer" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-neutral-text-muted cursor-pointer" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-bold text-neutral-text">Interview Calendars</h4>
                    <p className="text-neutral-text-muted text-[10px] mt-0.5">Alert and invite candidate profiles to scheduled technical boards.</p>
                  </div>
                  <button onClick={() => handleToggleNotif('interviewSchedule')} className="focus:outline-none">
                    {notifConfig.interviewSchedule ? (
                      <ToggleRight className="w-9 h-9 text-primary cursor-pointer" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-neutral-text-muted cursor-pointer" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-bold text-neutral-text">Hiring decisions</h4>
                    <p className="text-neutral-text-muted text-[10px] mt-0.5">Email candidates immediately when status is updated to Select/Reject.</p>
                  </div>
                  <button onClick={() => handleToggleNotif('hiringDecision')} className="focus:outline-none">
                    {notifConfig.hiringDecision ? (
                      <ToggleRight className="w-9 h-9 text-primary cursor-pointer" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-neutral-text-muted cursor-pointer" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-bold text-neutral-text">Weekly digest logs</h4>
                    <p className="text-neutral-text-muted text-[10px] mt-0.5">Send a consolidated hiring report email summary every Friday.</p>
                  </div>
                  <button onClick={() => handleToggleNotif('digestEmail')} className="focus:outline-none">
                    {notifConfig.digestEmail ? (
                      <ToggleRight className="w-9 h-9 text-primary cursor-pointer" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-neutral-text-muted cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default SettingsTab;
