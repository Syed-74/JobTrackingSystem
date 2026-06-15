import React, { useState } from 'react';
import { 
  Lock, 
  Bell, 
  Building2, 
  Check, 
  RefreshCw, 
  Shield, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';

const SettingsTab = ({ addActivityLog }) => {
  const [subTab, setSubTab] = useState('security'); // 'security', 'notifications', 'general'
  
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
          onClick={() => setSubTab('security')}
          className={`w-full text-left px-4 py-2.5 rounded-theme-lg font-bold text-xs flex items-center gap-2.5 transition-colors ${
            subTab === 'security'
              ? 'bg-primary text-neutral-textInverse shadow-theme-sm'
              : 'text-neutral-text-muted hover:bg-neutral-base hover:text-neutral-text'
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
              : 'text-neutral-text-muted hover:bg-neutral-base hover:text-neutral-text'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Settings</span>
        </button>
      </div>

      {/* Right Content panel (3/4 width) */}
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

    </div>
  );
};

export default SettingsTab;
