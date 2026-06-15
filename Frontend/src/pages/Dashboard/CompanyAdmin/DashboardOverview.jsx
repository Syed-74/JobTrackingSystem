import React from 'react';
import { 
  Building2, 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock
} from 'lucide-react';

const DashboardOverview = ({ stats, activities }) => {
  // Stat Card Config
  const cardConfigs = [
    {
      title: 'Total Departments',
      value: stats.departments,
      icon: Building2,
      color: 'bg-primary-light text-primary',
      borderColor: 'hover:border-primary/30'
    },
    {
      title: 'Total Employees',
      value: stats.employees,
      icon: Users,
      color: 'bg-secondary-light text-secondary',
      borderColor: 'hover:border-secondary/30'
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: Briefcase,
      color: 'bg-info-light text-info',
      borderColor: 'hover:border-info/30'
    },
    {
      title: 'Total Applications',
      value: stats.applications,
      icon: FileText,
      color: 'bg-warning-light text-warning',
      borderColor: 'hover:border-warning/30'
    },
    {
      title: 'Selected Candidates',
      value: stats.selected,
      icon: CheckCircle,
      color: 'bg-success-light text-success',
      borderColor: 'hover:border-success/30'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {cardConfigs.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className={`bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 shadow-theme-sm transition-all duration-300 relative group overflow-hidden ${card.borderColor}`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-2xl font-black text-neutral-text mt-2 tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-theme-lg ${card.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Pure SVG Applications Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 md:p-6 shadow-theme-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-neutral-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Job Applications Trend</span>
              </h3>
              <p className="text-neutral-text-muted text-xs mt-0.5">Application logs tracked over the last 6 months.</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-light text-primary text-[10px] font-bold">
              <span>Hiring Growth</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* Pure SVG Line Chart with CSS Grid and SVG pathing */}
          <div className="flex-1 min-h-[200px] w-full relative pt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="180" x2="500" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Data path line */}
              <path
                d="M 10 160 Q 100 120 190 140 T 370 70 T 490 50"
                fill="none"
                stroke="url(#chart-gradient)"
                strokeWidth="4.5"
                strokeLinecap="round"
                className="animate-in fade-in slide-in-from-left duration-1000"
              />

              {/* Gradient def */}
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Data points */}
              <circle cx="10" cy="160" r="4.5" className="fill-primary stroke-neutral-surface stroke-2 cursor-pointer hover:r-6" />
              <circle cx="100" cy="120" r="4.5" className="fill-primary stroke-neutral-surface stroke-2 cursor-pointer hover:r-6" />
              <circle cx="190" cy="140" r="4.5" className="fill-secondary stroke-neutral-surface stroke-2 cursor-pointer hover:r-6" />
              <circle cx="370" cy="70" r="4.5" className="fill-secondary stroke-neutral-surface stroke-2 cursor-pointer hover:r-6" />
              <circle cx="490" cy="50" r="4.5" className="fill-success stroke-neutral-surface stroke-2 cursor-pointer hover:r-6" />
            </svg>
            
            {/* Axis labels */}
            <div className="flex justify-between text-[10px] font-bold text-neutral-text-muted pt-2 border-t border-neutral-border mt-1">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>

        {/* Right Side: Recent activity logs (1/3 width) */}
        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 md:p-6 shadow-theme-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-base text-neutral-text flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Workspace Logs</span>
            </h3>
            <p className="text-neutral-text-muted text-xs mt-0.5">Real-time alerts and activity details.</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="flex gap-3 items-start border-b border-neutral-border pb-3 last:border-0 last:pb-0">
                  <div className="w-7 h-7 rounded-full bg-neutral-base border border-neutral-border flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-text-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-text font-medium leading-relaxed">{act.text}</p>
                    <span className="text-[10px] text-neutral-text-muted block mt-0.5">{act.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-neutral-text-muted">
                No recent workspace operations recorded.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;
