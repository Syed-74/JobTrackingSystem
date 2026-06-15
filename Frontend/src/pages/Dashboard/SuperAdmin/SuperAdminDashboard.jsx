import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { theme } from '../../../theme/theme';
import { 
  LayoutDashboard, 
  Building2, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  ChevronDown, 
  User,
  Shield,
  HelpCircle
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      name: 'Overview',
      path: '/superadmin/overview',
      icon: LayoutDashboard,
    },
     {
      name: 'Company Management',
      path: '/superadmin/company-management',
      icon: Building2,
    },
    {
      name: 'Company Admins',
      path: '/superadmin/companies',
      icon: Building2,
    },
    {
      name: 'System Settings',
      path: '/superadmin/settings',
      icon: SettingsIcon,
    }
  ];

  // Helper to check active state
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Get dynamic header title based on active route
  const getHeaderTitle = () => {
    const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));
    return currentItem ? currentItem.name : 'Super Admin Dashboard';
  };

  const handleLogout = () => {
    logout();
  };

  // Dummy notifications
  const notifications = [
    { id: 1, text: 'New company "Acme Corp" registered', time: '5 mins ago', read: false },
    { id: 2, text: 'Database backup completed successfully', time: '1 hour ago', read: true },
    { id: 3, text: 'High CPU usage warning resolved', time: '3 hours ago', read: true }
  ];

  return (
    <div className="min-h-screen bg-neutral-base font-sans relative flex">
      {/* BACKGROUND GRAPHIC ACCENTS (Premium visual polish) */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-light/30 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary-light/20 rounded-full blur-[80px] pointer-events-none z-0" />

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-text/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-neutral-surface border-r border-neutral-border flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          boxShadow: isSidebarOpen ? 'var(--shadow-xl)' : 'none'
        }}
      >
        {/* Logo / Brand Header */}
        <div className="h-[70px] px-6 border-b border-neutral-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-theme-xl bg-primary flex items-center justify-center text-neutral-textInverse shadow-theme-glow">
              <Shield className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-neutral-text leading-tight">JobTracker</h1>
              <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full border border-primary/20">
                SUPER ADMIN
              </span>
            </div>
          </div>
          
          {/* Close button (mobile only) */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-theme-md text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-theme-lg font-medium text-sm transition-all duration-200 group relative ${
                  active 
                    ? 'bg-primary text-neutral-textInverse shadow-theme-md' 
                    : 'text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text'
                }`}
              >
                {/* Active Indicator Line (left border) */}
                {active && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-neutral-textInverse rounded-r-full" />
                )}
                
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  active ? 'text-neutral-textInverse' : 'text-neutral-text-muted group-hover:text-neutral-text'
                }`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Info */}
        <div className="p-4 border-t border-neutral-border bg-neutral-base/40">
          <div className="flex items-center gap-3 p-2 rounded-theme-lg bg-neutral-surface border border-neutral-border shadow-theme-sm mb-3">
            <div className="w-10 h-10 rounded-theme-md bg-secondary-light text-secondary flex items-center justify-center font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-text truncate">
                {user?.name || 'Super Admin'}
              </p>
              <p className="text-[10px] text-neutral-text-muted truncate">
                {user?.email || 'admin@jobtracker.com'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-theme-lg font-medium text-sm text-danger hover:bg-danger-light transition-all duration-200 border border-transparent hover:border-danger/10"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* TOP BAR */}
        <header className="h-[70px] px-4 md:px-6 bg-neutral-surface/85 backdrop-blur-md border-b border-neutral-border flex items-center justify-between sticky top-0 z-30 shadow-theme-sm">
          {/* Left Area: Hamburger and Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-theme-md text-neutral-text hover:bg-neutral-muted lg:hidden transition-colors focus:outline-none"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="font-bold text-lg md:text-xl text-neutral-text flex items-center gap-2">
                {getHeaderTitle()}
              </h2>
            </div>
          </div>

          {/* Right Area: System Health, Notifications, User Dropdown */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* System Status Dot (Dashboard-wide telemetry indicators) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-light border border-success/10 text-success text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>System Live</span>
            </div>

            {/* Notifications Panel */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2 rounded-theme-xl text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text relative transition-colors focus:outline-none"
                aria-label="View notifications"
              >
                <Bell className="w-5.5 h-5.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-neutral-surface" />
              </button>

              {/* Notifications Dropdown Card */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-[320px] bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-lg py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-neutral-border flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-text">Notifications</span>
                    <button className="text-xs text-primary hover:underline font-semibold">Mark all read</button>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {notifications.map((item) => (
                      <div 
                        key={item.id} 
                        className={`px-4 py-3 border-b border-neutral-border last:border-0 hover:bg-neutral-base transition-colors flex flex-col gap-1 cursor-pointer ${
                          !item.read ? 'bg-primary-light/20' : ''
                        }`}
                      >
                        <p className="text-xs text-neutral-text font-medium leading-normal">{item.text}</p>
                        <span className="text-[10px] text-neutral-text-muted">{item.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-neutral-border text-center">
                    <button className="text-xs text-neutral-text-muted hover:text-neutral-text font-medium">
                      View all activities
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Dropdown Popover */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1 md:pr-3 rounded-full hover:bg-neutral-muted transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-neutral-textInverse flex items-center justify-center font-bold text-sm shadow-theme-sm border border-neutral-border">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-semibold text-neutral-text leading-tight">
                    {user?.name || 'Super Admin'}
                  </span>
                  <span className="text-[10px] text-neutral-text-muted">
                    System Director
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-text-muted hidden md:block" />
              </button>

              {/* Profile Context Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2.5 w-[220px] bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-lg py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-3 border-b border-neutral-border">
                    <p className="text-xs text-neutral-text-muted leading-tight">Signed in as</p>
                    <p className="text-sm font-semibold text-neutral-text truncate mt-0.5">
                      {user?.email || 'admin@jobtracker.com'}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/superadmin/settings'); }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-text hover:bg-neutral-muted flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-neutral-text-muted" />
                      <span>Admin Account</span>
                    </button>
                    
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/superadmin/settings'); }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-text hover:bg-neutral-muted flex items-center gap-2.5 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4 text-neutral-text-muted" />
                      <span>System Settings</span>
                    </button>

                    <button 
                      onClick={() => { setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-text hover:bg-neutral-muted flex items-center gap-2.5 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-neutral-text-muted" />
                      <span>Support Center</span>
                    </button>
                  </div>

                  <div className="border-t border-neutral-border mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-danger hover:bg-danger-light flex items-center gap-2.5 font-semibold transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* VIEW BODY CONTENT */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto z-10 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;