import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  CreditCard, 
  MapPin, 
  Heart, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Calendar
} from 'lucide-react';

const Register = () => {
  const { createEmployee } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    employeeCode: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    dob: '',
    maritalStatus: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    emergencyContactName: '',
    emergencyContactNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.firstName) return 'First name is required.';
      if (!formData.email) return 'Email is required.';
      if (!formData.phone) return 'Phone number is required.';
      if (!formData.password) return 'Password is required.';
      if (formData.password.length < 6) return 'Password must be at least 6 characters.';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    }
    return null;
  };

  const handleNext = () => {
    const stepError = validateStep(currentStep);
    if (stepError) {
      setError(stepError);
      return;
    }
    setError('');
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const stepError = validateStep(currentStep);
    if (stepError) {
      setError(stepError);
      return;
    }

    setIsLoading(true);
    try {
      // Prepare payload - only send non-empty values
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        phone: formData.phone
      };

      if (formData.lastName) payload.lastName = formData.lastName;
      if (formData.employeeCode) payload.employeeCode = formData.employeeCode;
      if (formData.gender) payload.gender = formData.gender;
      if (formData.dob) payload.dob = formData.dob;
      if (formData.maritalStatus) payload.maritalStatus = formData.maritalStatus;
      if (formData.address) payload.address = formData.address;
      if (formData.city) payload.city = formData.city;
      if (formData.state) payload.state = formData.state;
      if (formData.country) payload.country = formData.country;
      if (formData.pincode) payload.pincode = formData.pincode;
      if (formData.emergencyContactName) payload.emergencyContactName = formData.emergencyContactName;
      if (formData.emergencyContactNumber) payload.emergencyContactNumber = formData.emergencyContactNumber;

      const result = await createEmployee(payload);
      
      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-base flex items-center justify-center font-sans antialiased py-8">
      {/* Outer Browser/Device Mockup Container */}
      <div className="w-full max-w-[1100px] min-h-[680px] bg-neutral-surface rounded-theme-3xl shadow-theme-xl overflow-hidden flex flex-col md:flex-row m-4 border border-neutral-border/50">
        
        {/* Left Side: Form Container */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between bg-neutral-surface">
          <div className="max-w-[440px] mx-auto w-full my-auto">
            {/* Heading */}
            <h2 className="text-3xl font-bold text-neutral-text tracking-tight">Create Account</h2>
            <p className="text-sm text-neutral-text-muted mt-1.5">Join us today! Please fill in your employee details.</p>

            {/* Stepper Status Bar */}
            <div className="mt-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${currentStep >= 1 ? 'bg-primary text-neutral-text-inverse font-bold scale-110 shadow-theme-md' : 'bg-neutral-base text-neutral-text-muted'}`}>
                    {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                  </div>
                  <span className="text-[10px] mt-1.5 font-semibold uppercase tracking-wider text-neutral-text-muted">Account</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${currentStep >= 2 ? 'bg-primary' : 'bg-neutral-border'}`} />
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${currentStep >= 2 ? 'bg-primary text-neutral-text-inverse font-bold scale-110 shadow-theme-md' : 'bg-neutral-base text-neutral-text-muted'}`}>
                    {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
                  </div>
                  <span className="text-[10px] mt-1.5 font-semibold uppercase tracking-wider text-neutral-text-muted">Profile</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${currentStep >= 3 ? 'bg-primary' : 'bg-neutral-border'}`} />
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${currentStep >= 3 ? 'bg-primary text-neutral-text-inverse font-bold scale-110 shadow-theme-md' : 'bg-neutral-base text-neutral-text-muted'}`}>
                    3
                  </div>
                  <span className="text-[10px] mt-1.5 font-semibold uppercase tracking-wider text-neutral-text-muted">Emergency</span>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-danger-light border border-danger/10 rounded-theme-lg text-xs text-danger font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-theme-lg text-xs text-success font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* STEP 1: Account Info */}
              {currentStep === 1 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">First Name *</label>
                      <div className="relative mt-1">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="John"
                          className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Last Name</label>
                      <div className="relative mt-1">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
                          className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Email Address *</label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@example.com"
                        className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Phone Number *</label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="1234567890"
                          className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Employee Code</label>
                      <div className="relative mt-1">
                        <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                        <input
                          type="text"
                          name="employeeCode"
                          value={formData.employeeCode}
                          onChange={handleChange}
                          placeholder="EMP102"
                          className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Password *</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Confirm Password *</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Profile & Location */}
              {currentStep === 2 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Date of Birth</label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Residential Address</label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main St"
                        className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="San Francisco"
                        className="mt-1 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="California"
                        className="mt-1 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="USA"
                        className="mt-1 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Pincode / Zip Code</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="94107"
                        className="mt-1 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Emergency Contacts */}
              {currentStep === 3 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Emergency Contact Name</label>
                    <div className="relative mt-1">
                      <Heart className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Emergency Contact Phone</label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-text-muted/60" />
                      <input
                        type="tel"
                        name="emergencyContactNumber"
                        value={formData.emergencyContactNumber}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className="pl-10 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons Actions Navigation */}
              <div className="flex items-center gap-3 pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 bg-neutral-surface border border-neutral-border hover:bg-neutral-base text-neutral-text font-semibold rounded-theme-xl text-sm transition-all duration-200 focus:outline-none disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 bg-primary hover:bg-primary-hover text-neutral-text-inverse font-semibold rounded-theme-xl text-sm transition-all duration-200 shadow-theme-md hover:shadow-theme-lg focus:outline-none"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 bg-primary hover:bg-primary-hover text-neutral-text-inverse font-semibold rounded-theme-xl text-sm transition-all duration-200 shadow-theme-md hover:shadow-theme-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-neutral-text-inverse" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      'Register Profile'
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-neutral-text-muted font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-hover hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Showcase Panel (Hidden on small screens) */}
        <div className="hidden md:flex w-1/2 bg-primary p-12 lg:p-16 flex-col justify-between items-center text-neutral-text-inverse relative rounded-l-[40px] shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-hover to-primary opacity-90 z-0"></div>

          {/* Logo / Title Area */}
          <div className="w-full flex justify-end z-10">
            <span className="text-xl font-bold tracking-tight select-none">BearPlex</span>
          </div>

          {/* Quote Block */}
          <div className="max-w-[420px] text-center my-auto flex flex-col items-center justify-center z-10">
            <blockquote className="text-lg lg:text-xl font-medium leading-relaxed tracking-wide italic">
              "Vertex360 has been a game-changer for my career. It's made tracking my work hours, managing assignments, and checking payouts so much easier."
            </blockquote>

            {/* Testimonial Author */}
            <div className="mt-8 flex flex-col items-center animate-fadeIn">
              <img
                src="/jane_avatar.png"
                alt="Employee Portrait"
                className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-theme-md"
              />
              <span className="mt-3 font-semibold text-sm">Marcus Vance</span>
              <span className="text-xs text-neutral-text-inverse/70 mt-0.5">Software Engineer</span>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center space-x-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>

          <div className="h-4 z-10"></div>
        </div>

      </div>
    </div>
  );
};

export default Register;