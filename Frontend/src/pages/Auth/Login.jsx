import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-base flex items-center justify-center font-sans antialiased">
      {/* Outer Browser/Device Mockup Container */}
      <div className="w-full max-w-[1100px] min-h-[650px] bg-neutral-surface rounded-theme-3xl shadow-theme-xl overflow-hidden flex flex-col md:flex-row m-4 border border-neutral-border/50">
        
        {/* Left Side: Form Container */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-neutral-surface">
          <div className="max-w-[360px] mx-auto w-full">
            {/* Heading */}
            <h2 className="text-3xl font-bold text-neutral-text tracking-tight">Welcome back</h2>
            <p className="text-sm text-neutral-text-muted mt-2">Welcome back! Please enter your details.</p>

            {/* Error Banner */}
            {error && (
              <div className="mt-4 p-3 bg-danger-light border border-danger/10 rounded-theme-lg text-xs text-danger font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-text-muted tracking-wide uppercase">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 block w-full px-4 py-3 bg-neutral-surface border border-neutral-border rounded-theme-xl text-sm placeholder-neutral-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center text-neutral-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="ml-2 font-medium">Remember me</span>
                </label>
                <Link to="/forgot-password" className="font-semibold text-primary hover:text-primary-hover hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover active:bg-primary-active text-neutral-text-inverse font-semibold py-3 px-4 rounded-theme-xl text-sm transition-all duration-200 shadow-theme-md hover:shadow-theme-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-neutral-text-inverse" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-neutral-text-muted font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-hover hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Quote/Testimonial (Hidden on small screens) */}
        <div className="hidden md:flex w-1/2 bg-primary p-12 lg:p-16 flex-col justify-between items-center text-neutral-text-inverse relative rounded-l-[40px] shadow-inner overflow-hidden">
          {/* Subtle abstract background details for premium depth */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-hover to-primary opacity-90 z-0"></div>

          {/* Logo / Title Area */}
          <div className="w-full flex justify-end z-10">
            <span className="text-xl font-bold tracking-tight select-none">BearPlex</span>
          </div>

          {/* Quote Block */}
          <div className="max-w-[420px] text-center my-auto flex flex-col items-center justify-center z-10">
            <blockquote className="text-lg lg:text-xl font-medium leading-relaxed tracking-wide italic">
              "Vertex360 has been a game-changer for my business. As a provider, it's made managing my clients' NDIS plans so much easier."
            </blockquote>

            {/* Testimonial Author */}
            <div className="mt-8 flex flex-col items-center">
              <img
                src="/jane_avatar.png"
                alt="Jane Portrait"
                className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-theme-md"
              />
              <span className="mt-3 font-semibold text-sm">Jane</span>
              <span className="text-xs text-neutral-text-inverse/70 mt-0.5">CEO Founder</span>
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

          {/* Bottom spacer for alignment symmetry */}
          <div className="h-4 z-10"></div>
        </div>

      </div>
    </div>
  );
};

export default Login;