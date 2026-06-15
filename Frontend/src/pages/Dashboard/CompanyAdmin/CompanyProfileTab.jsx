import React from 'react';
import { 
  Building2, 
  Upload, 
  Check, 
  RefreshCw, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Info 
} from 'lucide-react';

const CompanyProfileTab = ({ 
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      
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
  );
};

export default CompanyProfileTab;
