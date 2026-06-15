import React from 'react';
import { 
  BarChart, 
  FileSpreadsheet, 
  FileText, 
  TrendingUp, 
  Building2, 
  Users, 
  Briefcase,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';

const ReportsTab = ({ stats, departments, jobs, applications, employees }) => {

  // CSV Generator Helper
  const downloadCSV = (filename, dataHeaders, dataRows) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += dataHeaders.join(",") + "\r\n";
    
    // Add rows
    dataRows.forEach(row => {
      const escapedRow = row.map(val => {
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      });
      csvContent += escapedRow.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Recruitment Report
  const handleExportRecruitmentCSV = () => {
    const headers = ["Candidate Name", "Applied Position", "Email Address", "Phone Number", "Application Date", "Status"];
    const rows = applications.map(app => [
      app.name,
      app.jobTitle,
      app.email,
      app.phone,
      app.appliedDate,
      app.status
    ]);
    downloadCSV("Recruitment_Report.csv", headers, rows);
  };

  // Export Job Report
  const handleExportJobCSV = () => {
    const headers = ["Job Title", "Department", "Location", "Job Type", "Status", "Applications Count", "Date Posted"];
    const rows = jobs.map(job => [
      job.title,
      job.department,
      job.location,
      job.type,
      job.status,
      job.applicationsCount,
      job.createdAt
    ]);
    downloadCSV("Job_Posts_Report.csv", headers, rows);
  };

  // Export Department Report
  const handleExportDepartmentCSV = () => {
    const headers = ["Department Code", "Department Name", "Manager Name", "Staff Headcount", "Created Date"];
    const rows = departments.map(dept => [
      dept.code,
      dept.name,
      dept.manager,
      dept.headcount,
      dept.createdAt
    ]);
    downloadCSV("Departments_Report.csv", headers, rows);
  };

  // Trigger Print for PDF Export
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 print:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-neutral-text tracking-tight">
            Recruitment Analytics & Reports
          </h1>
          <p className="text-neutral-text-muted text-xs mt-0.5">
            Evaluate hiring velocity, export corporate spreadsheets, and print PDF dossiers.
          </p>
        </div>

        <button
          onClick={handlePrintPDF}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-neutral-textInverse font-bold text-xs rounded-theme-lg shadow-theme-md transition-all focus:outline-none"
        >
          <FileText className="w-4 h-4" />
          <span>Print PDF Dossier</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 shadow-theme-sm">
          <p className="text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider">Hiring Ratio</p>
          <p className="text-xl font-black text-neutral-text mt-2">
            {stats.applications > 0 ? ((stats.selected / stats.applications) * 100).toFixed(1) : 0}%
          </p>
          <span className="text-[9px] text-success font-bold mt-1 inline-block">Application conversion rate</span>
        </div>

        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 shadow-theme-sm">
          <p className="text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider">Active Openings</p>
          <p className="text-xl font-black text-neutral-text mt-2">{stats.activeJobs} positions</p>
          <span className="text-[9px] text-neutral-text-muted font-bold mt-1 inline-block">Currently sourcing</span>
        </div>

        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 shadow-theme-sm">
          <p className="text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider">Hiring Pipeline</p>
          <p className="text-xl font-black text-neutral-text mt-2">
            {applications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Shortlisted').length} candidates
          </p>
          <span className="text-[9px] text-secondary font-bold mt-1 inline-block">In active review stages</span>
        </div>

        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-5 shadow-theme-sm">
          <p className="text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider">Staff Count</p>
          <p className="text-xl font-black text-neutral-text mt-2">{employees.length} employees</p>
          <span className="text-[9px] text-neutral-text-muted font-bold mt-1 inline-block">Full headcount roster</span>
        </div>
      </div>

      {/* Reports Export Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        
        {/* Recruitment Card */}
        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-6 shadow-theme-sm flex flex-col items-start gap-4">
          <div className="w-10 h-10 rounded-theme-lg bg-primary-light text-primary flex items-center justify-center">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-text">Recruitment Report</h3>
            <p className="text-neutral-text-muted text-[10px] leading-relaxed mt-1">
              Tracks all candidates, their applied positions, contact emails, and current hiring outcomes.
            </p>
          </div>
          <button
            onClick={handleExportRecruitmentCSV}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-neutral-base hover:bg-neutral-muted text-neutral-text border border-neutral-border rounded-theme-lg text-xs font-bold transition-colors focus:outline-none"
          >
            <FileSpreadsheet className="w-4 h-4 text-neutral-text-muted" />
            <span>Export Roster CSV</span>
          </button>
        </div>

        {/* Job Posts Card */}
        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-6 shadow-theme-sm flex flex-col items-start gap-4">
          <div className="w-10 h-10 rounded-theme-lg bg-secondary-light text-secondary flex items-center justify-center">
            <Briefcase className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-text">Job Posts Report</h3>
            <p className="text-neutral-text-muted text-[10px] leading-relaxed mt-1">
              Provides metrics on open roles, locations, type categories, active statuses, and application counts.
            </p>
          </div>
          <button
            onClick={handleExportJobCSV}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-neutral-base hover:bg-neutral-muted text-neutral-text border border-neutral-border rounded-theme-lg text-xs font-bold transition-colors focus:outline-none"
          >
            <FileSpreadsheet className="w-4 h-4 text-neutral-text-muted" />
            <span>Export Jobs CSV</span>
          </button>
        </div>

        {/* Department Card */}
        <div className="bg-neutral-surface border border-neutral-border rounded-theme-xl p-6 shadow-theme-sm flex flex-col items-start gap-4">
          <div className="w-10 h-10 rounded-theme-lg bg-success-light text-success flex items-center justify-center">
            <Building2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-text">Department Report</h3>
            <p className="text-neutral-text-muted text-[10px] leading-relaxed mt-1">
              Summarizes organizational structures, assigned managers, department codes, and staff count.
            </p>
          </div>
          <button
            onClick={handleExportDepartmentCSV}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-neutral-base hover:bg-neutral-muted text-neutral-text border border-neutral-border rounded-theme-lg text-xs font-bold transition-colors focus:outline-none"
          >
            <FileSpreadsheet className="w-4 h-4 text-neutral-text-muted" />
            <span>Export Department CSV</span>
          </button>
        </div>

      </div>

      {/* Printable Report Summary (Visible during printing or preview) */}
      <div className="hidden print:block bg-neutral-surface border border-neutral-border rounded-theme-xl p-6 space-y-6 text-xs">
        <div className="text-center pb-4 border-b border-neutral-border">
          <h2 className="text-base font-black uppercase text-neutral-text">Corporate Status Dossier</h2>
          <p className="text-[10px] text-neutral-text-muted mt-1">System timestamp: {new Date().toLocaleString()}</p>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm border-b border-neutral-border pb-1">Department Structure</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-border font-bold text-neutral-text-muted">
                <th>Code</th>
                <th>Department Name</th>
                <th>Manager</th>
                <th>Headcount</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id} className="border-b border-neutral-border py-2">
                  <td>{d.code}</td>
                  <td>{d.name}</td>
                  <td>{d.manager}</td>
                  <td>{d.headcount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ReportsTab;
