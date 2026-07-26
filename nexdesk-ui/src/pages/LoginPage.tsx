import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/browse';

  /* ── Form state ── */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  /* ── Status & inline errors ── */
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  /* ── Forgot Password state ── */
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  /* ── Validate before submitting ── */
  const validateForm = () => {
    let valid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required.');
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }

    return valid;
  };

  /* ── Submit POST /auth/login (form-data per OAuth2 spec: username & password) ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    try {
      // Build form-urlencoded payload per OAuth2PasswordRequestForm spec
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await res.json();

      if (res.ok) {
        // Store session in AuthContext
        login({
          email: email.trim(),
          role: data.role || 'employee',
          access_token: data.access_token,
        });
        // Redirect user
        navigate(data.role === 'admin' ? '/admin' : redirectUrl);
      } else {
        // Surface backend error inline near relevant field
        const errorMsg = data?.detail || 'Invalid email or password.';
        if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('user')) {
          setEmailError(errorMsg);
        } else if (errorMsg.toLowerCase().includes('password')) {
          setPasswordError(errorMsg);
        } else {
          setEmailError(errorMsg);
        }
      }
    } catch (err: any) {
      setGeneralError('Unable to connect to NexDesk authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setGeneralError('No ID token received from Google.');
      return;
    }
    
    setLoading(true);
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        // Decode JWT payload partially to get email for context (or let backend return it, but since backend doesn't return email, we'll just set it to 'Google User' or decode it client-side)
        const payloadStr = atob(credentialResponse.credential.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        
        login({
          email: payload.email || 'Google User',
          role: data.role || 'employee',
          access_token: data.access_token,
        });
        navigate(data.role === 'admin' ? '/admin' : redirectUrl);
      } else {
        setGeneralError(data?.detail || 'Google authentication failed.');
      }
    } catch (err: any) {
      setGeneralError('Unable to connect to NexDesk authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotStatus(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      setForgotStatus(data.message || 'If an account exists with this email, a reset link has been sent.');
    } catch (err) {
      setForgotStatus('An error occurred. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 bg-[#f8fafc]">
      {/* ── NexDesk Logo Above Card ── */}
      <Link to="/" className="flex items-center gap-2.5 mb-6 group">
        <div className="w-10 h-10 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center shadow-md group-hover:bg-[#2563eb] transition-colors">
          <Building2 size={22} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Nex<span className="text-[#3b82f6]">Desk</span>
        </span>
      </Link>

      {/* ── Centered Card Layout (max-width ~420px) ── */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-[#e2e8f0] shadow-lg p-8">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-[#0f172a]">Welcome back</h1>
          <p className="text-[#64748b] mt-1.5 text-sm">
            Sign in to access your bookings & smart workspaces
          </p>
        </div>

        {generalError && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] text-xs font-medium flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Email field (submitted as "username") */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className={[
                  'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2',
                  emailError
                    ? 'border-[#ef4444] text-[#991b1b] focus:border-[#ef4444] focus:ring-[#fee2e2] bg-[#fef2f2]'
                    : 'border-[#cbd5e1] text-[#0f172a] focus:border-[#3b82f6] focus:ring-[#eff6ff] bg-white'
                ].join(' ')}
              />
            </div>
            {emailError && (
              <p className="text-xs text-[#dc2626] font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs font-medium text-[#3b82f6] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className={[
                  'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2',
                  passwordError
                    ? 'border-[#ef4444] text-[#991b1b] focus:border-[#ef4444] focus:ring-[#fee2e2] bg-[#fef2f2]'
                    : 'border-[#cbd5e1] text-[#0f172a] focus:border-[#3b82f6] focus:ring-[#eff6ff] bg-white'
                ].join(' ')}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] cursor-pointer"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-[#dc2626] font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          <Button
            id="login-submit"
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            className="mt-4"
          >
            Log in
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e8f0]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[#94a3b8] font-semibold tracking-wider">or</span>
          </div>
        </div>

        <div className="flex justify-center mb-6 w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setGeneralError('Google Login was cancelled or failed.')}
            useOneTap
            shape="rectangular"
            theme="outline"
            size="large"
            width="356" // approximately full width
            text="continue_with"
          />
        </div>

        {/* Link to Signup */}
        <div className="text-center text-sm text-[#64748b]">
          Don't have a NexDesk account?{' '}
          <Link
            to={`/signup${redirectUrl !== '/browse' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-[#3b82f6] font-semibold hover:underline inline-flex items-center gap-1"
          >
            Create account <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Forgot Password Helper Modal ── */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#e2e8f0]">
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Reset your password</h3>
            {forgotStatus ? (
              <div className="mb-4">
                <p className="text-sm text-[#059669] font-medium p-3 bg-[#ecfdf5] rounded-xl border border-[#a7f3d0]">
                  {forgotStatus}
                </p>
                <div className="mt-4">
                  <Button
                    fullWidth
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotStatus(null);
                      setForgotEmail('');
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#64748b] mb-5">
                  Enter your corporate email address to receive a password reset link.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-sm mb-4 focus:outline-none focus:border-[#3b82f6]"
                />
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    disabled={forgotLoading}
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotEmail('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    loading={forgotLoading}
                    onClick={handleForgotPassword}
                  >
                    Send Reset Link
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
