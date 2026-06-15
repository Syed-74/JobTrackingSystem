import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  X, 
  Check, 
  Calendar, 
  Mail, 
  Phone,
  Clock,
  User,
  ShieldAlert,
  Briefcase,
  ExternalLink,
  ChevronRight,
  FolderOpen
} from 'lucide-react';

const JobApplicationsTab = ({ applications, jobs, onUpdateApplications, addActivityLog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Detailed Resume Slide-over Panel
  const [viewingCandidate, setViewingCandidate] = useState(null);

  // Interview Modal states
  const [schedulingAppId, setSchedulingAppId] = useState(null);
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    type: 'Virtual Technical'
  });
  const [interviewError, setInterviewError] = useState('');

  // Status Change Helpers
  const handleUpdateStatus = (appId, nextStatus, candidateName, posTitle) => {
    const updatedList = applications.map(app => {
      if (app.id === appId) {
        return { ...app, status: nextStatus };
      }
      return app;
    });
    onUpdateApplications(updatedList);
    addActivityLog(`Updated candidate "${candidateName}" status to "${nextStatus}" for ${posTitle}`);
    
    // Update active candidate panel if open
    if (viewingCandidate && viewingCandidate.id === appId) {
      setViewingCandidate(prev => ({ ...prev, status: nextStatus }));
    }
  };

  // Open Interview Scheduler Modal
  const handleOpenScheduler = (appId) => {
    setSchedulingAppId(appId);
    setInterviewData({
      date: '',
      time: '',
      type: 'Virtual Technical'
    });
    setInterviewError('');
  };

  // Save Scheduled Interview
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!interviewData.date || !interviewData.time) {
      setInterviewError('Please configure interview date and time.');
      return;
    }

    const appObj = applications.find(a => a.id === schedulingAppId);
    if (appObj) {
      const interviewDateString = `${interviewData.date}T${interviewData.time}`;
      const updatedList = applications.map(app => {
        if (app.id === schedulingAppId) {
          return { 
            ...app, 
            status: 'Interview Scheduled', 
            interviewDate: interviewDateString,
            interviewType: interviewData.type
          };
        }
        return app;
      });
      onUpdateApplications(updatedList);
      addActivityLog(`Scheduled a ${interviewData.type} interview for "${appObj.name}" on ${interviewData.date} at ${interviewData.time}`);
      
      if (viewingCandidate && viewingCandidate.id === schedulingAppId) {
        setViewingCandidate(prev => ({ 
          ...prev, 
          status: 'Interview Scheduled', 
          interviewDate: interviewDateString,
          interviewType: interviewData.type
        }));
      }
    }
    
    setSchedulingAppId(null);
  };

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-neutral-text tracking-tight">
          Candidate Applications
        </h1>
        <p className="text-neutral-text-muted text-xs mt-0.5">
          Review talent resumes, schedule interviews, and track recruitment progression.
        </p>
      </div>

      {/* Control bar */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-4 shadow-theme-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter buttons */}
        <div className="flex bg-neutral-base p-1 border border-neutral-border rounded-theme-lg overflow-x-auto max-w-full">
          {['All', 'Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-theme-md text-[10px] font-bold transition-all duration-150 whitespace-nowrap focus:outline-none ${
                statusFilter === status 
                  ? 'bg-neutral-surface text-primary shadow-theme-sm' 
                  : 'text-neutral-text-muted hover:text-neutral-text'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted" />
          <input
            type="text"
            placeholder="Search candidate or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg text-xs text-neutral-text placeholder-neutral-text-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Applications list */}
      <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl shadow-theme-sm overflow-hidden">
        {filteredApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-border text-[11px] font-bold text-neutral-text-muted uppercase tracking-wider bg-neutral-base/40">
                  <th className="py-3 px-6">Candidate</th>
                  <th className="py-3 px-6">Applied Position</th>
                  <th className="py-3 px-6">Applied Date</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border text-xs">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-neutral-base/20 transition-colors">
                    
                    {/* Name & Contact */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-muted text-neutral-text font-black flex items-center justify-center border border-neutral-border uppercase shrink-0">
                          {app.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-neutral-text text-xs leading-snug truncate">
                            {app.name}
                          </span>
                          <span className="text-[10px] text-neutral-text-muted truncate mt-0.5">
                            {app.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3.5 px-6 font-semibold text-neutral-text">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-neutral-text-muted" />
                        <span>{app.jobTitle}</span>
                      </div>
                    </td>

                    {/* Applied Date */}
                    <td className="py-3.5 px-6 text-neutral-text-muted font-medium">
                      <span>{app.appliedDate}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        app.status === 'Selected'
                          ? 'bg-success-light text-success border-success/20'
                          : app.status === 'Rejected'
                          ? 'bg-danger-light text-danger border-danger/20'
                          : app.status === 'Shortlisted'
                          ? 'bg-secondary-light text-secondary border-secondary/20'
                          : app.status === 'Interview Scheduled'
                          ? 'bg-info-light text-info border-info/20'
                          : 'bg-neutral-muted text-neutral-text-muted border-neutral-border'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingCandidate(app)}
                          className="px-2.5 py-1.5 bg-neutral-base hover:bg-primary text-neutral-text-muted hover:text-neutral-textInverse font-bold text-[10px] border border-neutral-border hover:border-transparent rounded-theme-md transition-all flex items-center gap-1 focus:outline-none"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Profile</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <FolderOpen className="w-10 h-10 text-neutral-text-muted" />
            <p className="text-sm text-neutral-text-muted font-medium">No candidate applications found.</p>
          </div>
        )}
      </div>

      {/* CANDIDATE PROFILE SLIDE-OVER (Resume viewer) */}
      {viewingCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div 
            className="absolute inset-0 bg-neutral-text/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setViewingCandidate(null)}
          />

          <div className="relative w-full max-w-md bg-neutral-surface border-l border-neutral-border shadow-theme-xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-neutral-text">Candidate Resume Portfolio</h3>
              </div>
              <button 
                onClick={() => setViewingCandidate(null)}
                className="p-1 text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text rounded-theme-md"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-neutral-text">
              {/* Identity Details */}
              <div className="flex items-center gap-4 border-b border-neutral-border pb-5">
                <div className="w-14 h-14 rounded-full bg-primary-light text-primary font-black text-lg flex items-center justify-center border border-primary/20 uppercase shrink-0">
                  {viewingCandidate.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-extrabold leading-tight text-neutral-text truncate">{viewingCandidate.name}</h2>
                  <p className="font-semibold text-primary mt-1 text-xs">{viewingCandidate.jobTitle}</p>
                  <p className="text-[10px] text-neutral-text-muted mt-0.5">Applied: {viewingCandidate.appliedDate}</p>
                </div>
              </div>

              {/* Status Section */}
              <div className="p-3 bg-neutral-base border border-neutral-border rounded-theme-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-text-muted font-bold block uppercase">Current Hiring Phase</span>
                  <span className="text-xs font-black text-neutral-text mt-1 inline-block">{viewingCandidate.status}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  viewingCandidate.status === 'Selected'
                    ? 'bg-success-light text-success border-success/20'
                    : viewingCandidate.status === 'Rejected'
                    ? 'bg-danger-light text-danger border-danger/20'
                    : viewingCandidate.status === 'Shortlisted'
                    ? 'bg-secondary-light text-secondary border-secondary/20'
                    : viewingCandidate.status === 'Interview Scheduled'
                    ? 'bg-info-light text-info border-info/20'
                    : 'bg-neutral-muted text-neutral-text-muted border-neutral-border'
                }`}>
                  {viewingCandidate.status}
                </span>
              </div>

              {/* Contact info */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider border-b border-neutral-border pb-1">Contact Details</h4>
                <div className="flex items-center gap-2.5 text-neutral-text">
                  <Mail className="w-4 h-4 text-neutral-text-muted" />
                  <span className="font-medium">{viewingCandidate.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-text">
                  <Phone className="w-4 h-4 text-neutral-text-muted" />
                  <span className="font-medium">{viewingCandidate.phone}</span>
                </div>
              </div>

              {/* Resume summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider border-b border-neutral-border pb-1">Resume / Pitch Profile</h4>
                <p className="leading-relaxed whitespace-pre-wrap font-medium font-sans bg-neutral-base p-3 border border-neutral-border rounded-theme-lg">
                  {viewingCandidate.resumeText || 'No resume data details provided.'}
                </p>
              </div>

              {/* Interview info if scheduled */}
              {viewingCandidate.status === 'Interview Scheduled' && viewingCandidate.interviewDate && (
                <div className="p-3 bg-info-light border border-info/20 text-info rounded-theme-xl">
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Interview Scheduled</span>
                  </h4>
                  <p className="mt-1 font-semibold text-[10px]">
                    Date/Time: {viewingCandidate.interviewDate.replace('T', ' at ')}
                  </p>
                  {viewingCandidate.interviewType && (
                    <p className="mt-0.5 text-[10px] text-neutral-text-muted">
                      Type: {viewingCandidate.interviewType}
                    </p>
                  )}
                </div>
              )}

              {/* Action buttons drawer */}
              <div className="space-y-2.5 pt-4 border-t border-neutral-border">
                <h4 className="font-bold text-neutral-text-muted uppercase tracking-wider">Hiring Decisions</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(viewingCandidate.id, 'Shortlisted', viewingCandidate.name, viewingCandidate.jobTitle)}
                    disabled={viewingCandidate.status === 'Shortlisted'}
                    className="py-2 bg-neutral-base hover:bg-secondary-light text-neutral-text hover:text-secondary border border-neutral-border font-bold rounded-theme-lg transition-colors focus:outline-none"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleOpenScheduler(viewingCandidate.id)}
                    className="py-2 bg-neutral-base hover:bg-info-light text-neutral-text hover:text-info border border-neutral-border font-bold rounded-theme-lg transition-colors focus:outline-none"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(viewingCandidate.id, 'Selected', viewingCandidate.name, viewingCandidate.jobTitle)}
                    disabled={viewingCandidate.status === 'Selected'}
                    className="py-2 bg-success hover:bg-success/90 text-neutral-textInverse font-bold rounded-theme-lg transition-colors focus:outline-none"
                  >
                    Hire Candidate
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(viewingCandidate.id, 'Rejected', viewingCandidate.name, viewingCandidate.jobTitle)}
                    disabled={viewingCandidate.status === 'Rejected'}
                    className="py-2 bg-danger hover:bg-danger/90 text-neutral-textInverse font-bold rounded-theme-lg transition-colors focus:outline-none"
                  >
                    Reject Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {schedulingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-neutral-text/50 backdrop-blur-sm" onClick={() => setSchedulingAppId(null)} />

          <div className="relative w-full max-w-sm bg-neutral-surface rounded-theme-xl shadow-theme-xl border border-neutral-border z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-neutral-base/15">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-neutral-text">Schedule Candidate Interview</h3>
              </div>
              <button onClick={() => setSchedulingAppId(null)} className="p-1 text-neutral-text-muted hover:bg-neutral-muted hover:text-neutral-text rounded-theme-md">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSchedule} className="p-5 space-y-4 text-xs">
              {interviewError && (
                <div className="p-2.5 bg-danger-light border border-danger/20 text-danger rounded-theme-lg font-semibold">
                  {interviewError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Interview Date *</label>
                <input
                  type="date"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Interview Time *</label>
                <input
                  type="time"
                  value={interviewData.time}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, time: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Interview Type</label>
                <select
                  value={interviewData.type}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-base border border-neutral-border rounded-theme-lg focus:outline-none"
                >
                  <option value="Virtual Technical">Virtual Technical (Code Share)</option>
                  <option value="Virtual HR">Virtual HR Screening</option>
                  <option value="In-person Technical">In-person Technical (Boardroom)</option>
                  <option value="Management Round">Executive Director Interview</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-border">
                <button
                  type="button"
                  onClick={() => setSchedulingAppId(null)}
                  className="px-4 py-2 border border-neutral-border hover:bg-neutral-muted text-neutral-text font-semibold rounded-theme-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold rounded-theme-lg shadow-theme-sm"
                >
                  Save Schedule
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default JobApplicationsTab;
