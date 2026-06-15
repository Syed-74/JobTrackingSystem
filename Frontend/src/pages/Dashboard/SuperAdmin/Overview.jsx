import React from 'react';
import { 
  Building2, 
  Briefcase, 
  Users, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Server
} from 'lucide-react';

const Overview = () => {
  // Stat Card Data
  const stats = [
    {
      title: 'Total Companies',
      value: '42',
      change: '+14% this month',
      trend: 'up',
      icon: Building2,
      color: 'primary',
      bgColor: 'bg-primary-light',
      textColor: 'text-primary'
    },
    {
      title: 'Active Jobs',
      value: '1,284',
      change: '+28% this week',
      trend: 'up',
      icon: Briefcase,
      color: 'secondary',
      bgColor: 'bg-secondary-light',
      textColor: 'text-secondary'
    },
    {
      title: 'Active Employees',
      value: '8,492',
      change: '+5.2% vs last week',
      trend: 'up',
      icon: Users,
      color: 'info',
      bgColor: 'bg-info-light',
      textColor: 'text-info'
    },
    {
      title: 'System Health',
      value: '99.98%',
      change: 'All services operational',
      trend: 'neutral',
      icon: Activity,
      color: 'success',
      bgColor: 'bg-success-light',
      textColor: 'text-success'
    }
  ];

  // Recent Company Data
  const recentCompanies = [
    {
      id: 1,
      name: 'TechFlow Solutions',
      admin: 'sarah.k@techflow.com',
      date: 'June 4, 2026',
      jobs: 148,
      status: 'Active',
      plan: 'Enterprise'
    },
    {
      id: 2,
      name: 'Apex Global Logistics',
      admin: 'marcus.d@apexglobal.com',
      date: 'June 3, 2026',
      jobs: 85,
      status: 'Active',
      plan: 'Professional'
    },
    {
      id: 3,
      name: 'Zenith Labs Inc',
      admin: 'hr@zenithlabs.com',
      date: 'June 1, 2026',
      jobs: 24,
      status: 'Pending',
      plan: 'Growth Starter'
    },
    {
      id: 4,
      name: 'Vanguard Creative',
      admin: 'billing@vanguard.co',
      date: 'May 28, 2026',
      jobs: 12,
      status: 'Suspended',
      plan: 'Growth Starter'
    }
  ];

  // System Logs Data
  const logs = [
    { id: 1, type: 'info', msg: 'Cron sync completed: 254 jobs processed', time: '17:04:12' },
    { id: 2, type: 'success', msg: 'New workspace "Zenith Labs" database created', time: '16:45:30' },
    { id: 3, type: 'warning', msg: 'High load detected on worker pool #3', time: '16:12:05' },
    { id: 4, type: 'info', msg: 'Automatic daily database backup verified', time: '04:00:00' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Dashboard Overview</h3>
        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-text tracking-tight mt-0.5">
          System Overview & Metrics
        </h1>
        <p className="text-neutral-text-muted text-sm mt-1">
          Real-time metrics, system operations monitoring, and workspace oversight.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 shadow-theme-sm hover:shadow-theme-glow hover:border-primary/20 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Highlight accent on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-neutral-text-muted uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-neutral-text mt-2 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-theme-lg ${stat.bgColor} ${stat.textColor} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-neutral-text-muted font-medium">
                  {stat.change}
                </span>
                {stat.trend === 'up' && (
                  <span className="flex items-center gap-0.5 text-success font-semibold bg-success-light px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Up</span>
                  </span>
                )}
                {stat.trend === 'neutral' && (
                  <span className="flex items-center gap-0.5 text-info font-semibold bg-info-light px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Companies and Live Systems */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Company Registrations Table (2/3 width) */}
        <div className="xl:col-span-2 bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 md:p-6 shadow-theme-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-text">Recent Workspace Registrations</h2>
              <p className="text-neutral-text-muted text-xs mt-0.5">List of last 4 companies onboarded to the system.</p>
            </div>
            <button className="text-xs font-bold text-primary hover:text-primary-hover bg-primary-light px-3 py-1.5 rounded-theme-md transition-colors">
              Manage All
            </button>
          </div>

          {/* Responsive Table Wrapper */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-border text-[11px] font-bold text-neutral-text-muted uppercase tracking-wider">
                  <th className="pb-3 pr-4">Company</th>
                  <th className="pb-3 pr-4">Admin Email</th>
                  <th className="pb-3 pr-4">Onboarded</th>
                  <th className="pb-3 pr-4">Tier Plan</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border text-sm">
                {recentCompanies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-neutral-base/50 transition-colors group">
                    <td className="py-3.5 pr-4 font-semibold text-neutral-text flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-neutral-muted flex items-center justify-center text-xs font-bold text-neutral-text border border-neutral-border group-hover:bg-neutral-surface transition-colors">
                        {comp.name.charAt(0)}
                      </div>
                      <span>{comp.name}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-neutral-text-muted font-medium">{comp.admin}</td>
                    <td className="py-3.5 pr-4 text-neutral-text-muted">{comp.date}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        comp.plan === 'Enterprise' 
                          ? 'bg-primary-light text-primary border border-primary/10' 
                          : comp.plan === 'Professional' 
                          ? 'bg-secondary-light text-secondary border border-secondary/10'
                          : 'bg-neutral-muted text-neutral-text-muted border border-neutral-border'
                      }`}>
                        {comp.plan}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        comp.status === 'Active' 
                          ? 'bg-success-light text-success border border-success/10' 
                          : comp.status === 'Pending'
                          ? 'bg-warning-light text-warning border border-warning/10'
                          : 'bg-danger-light text-danger border border-danger/10'
                      }`}>
                        {comp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Infrastructure Monitoring Panel (1/3 width) */}
        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 md:p-6 shadow-theme-sm flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-neutral-text flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              <span>Infra Monitoring</span>
            </h2>
            <p className="text-neutral-text-muted text-xs mt-0.5">Server node diagnostics and runtime logs.</p>
          </div>

          {/* Infrastructure Metrics */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-text-muted mb-1.5">
                <span>CPU Utilization</span>
                <span className="text-neutral-text font-bold">24.5%</span>
              </div>
              <div className="h-2 w-full bg-neutral-muted rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: '24.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-text-muted mb-1.5">
                <span>RAM Usage</span>
                <span className="text-neutral-text font-bold">62.1%</span>
              </div>
              <div className="h-2 w-full bg-neutral-muted rounded-full overflow-hidden">
                <div className="h-full bg-warning rounded-full" style={{ width: '62.1%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-text-muted mb-1.5">
                <span>Active Connection Sockets</span>
                <span className="text-neutral-text font-bold">8,492 / 10K</span>
              </div>
              <div className="h-2 w-full bg-neutral-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '84.9%' }} />
              </div>
            </div>
          </div>

          {/* Small Log Snippet console */}
          <div className="flex-1 flex flex-col min-h-[160px] bg-neutral-text text-[11px] font-mono p-3 rounded-theme-lg border border-neutral-border shadow-inner text-neutral-border/80">
            <span className="text-neutral-text-muted border-b border-neutral-border/10 pb-1.5 mb-2 flex items-center justify-between">
              <span>SYSTEM EVENT CONSOLE</span>
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
            </span>
            <div className="space-y-1.5 overflow-y-auto max-h-[130px] flex-1">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2 leading-relaxed">
                  <span className="text-neutral-text-muted">[{log.time}]</span>
                  <span className={`${
                    log.type === 'success' ? 'text-success' : log.type === 'warning' ? 'text-warning' : 'text-neutral-border'
                  }`}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Overview;
