import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, Building2,
  CheckCircle2, ArrowRight, User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/browse';

  /* ── Form state ── */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  /* ── Status & inline errors ── */
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  /* ── Password strength evaluation ── */
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-[#e2e8f0]' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-[#ef4444]' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-[#f59e0b]' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-[#3b82f6]' };
    if (score >= 4) return { score: 4, label: 'Strong', color: 'bg-[#10b981]' };
    return { score: 0, label: '', color: 'bg-[#e2e8f0]' };
  }, [password]);

  /* ── Validate form ── */
  const validateForm = () => {
    let valid = true;
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setGeneralError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      setNameError('Full name is required.');
      valid = false;
    }
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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      valid = false;
    }
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      valid = false;
    }
    return valid;
  };

  /* ── Submit POST /auth/signup (expects email, password, role as QUERY PARAMS) ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setGeneralError(null);

    try {
      // Build request with query parameters as expected by POST /auth/signup
      const queryParams = new URLSearchParams({
        email: email.trim(),
        password: password,
        role: 'employee',
      });

      const res = await fetch(`http://127.0.0.1:8000/auth/signup?${queryParams.toString()}`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.status === 201 || res.ok) {
        // Automatically log user in via POST /auth/login
        const loginData = new URLSearchParams();
        loginData.append('username', email.trim());
        loginData.append('password', password);

        const loginRes = await fetch('http://127.0.0.1:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: loginData.toString(),
        });

        if (loginRes.ok) {
          const tokenData = await loginRes.json();
          login({
            email: email.trim(),
            role: tokenData.role || 'employee',
            access_token: tokenData.access_token,
          });
          navigate(redirectUrl);
        } else {
          // If auto login fails, redirect to login page
          navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
      } else {
        // Surface error inline near the email field if it's already registered
        const errorMsg = data?.detail || 'Unable to register account.';
        if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('already')) {
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
          <h1 className="text-2xl font-bold text-[#0f172a]">Create account</h1>
          <p className="text-[#64748b] mt-1.5 text-sm">
            Start booking workspaces across 50+ verified hubs
          </p>
        </div>

        {generalError && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] text-xs font-medium flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Full Name (Client-side) */}
          <div>
            <label htmlFor="signup-name" className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="Rudra Patel"
                required
                autoComplete="name"
                className={[
                  'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2',
                  nameError
                    ? 'border-[#ef4444] text-[#991b1b] focus:border-[#ef4444] focus:ring-[#fee2e2] bg-[#fef2f2]'
                    : 'border-[#cbd5e1] text-[#0f172a] focus:border-[#3b82f6] focus:ring-[#eff6ff] bg-white'
                ].join(' ')}
              />
            </div>
            {nameError && (
              <p className="text-xs text-[#dc2626] font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          {/* Email address */}
          <div>
            <label htmlFor="signup-email" className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                id="signup-email"
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

          {/* Password */}
          <div>
            <label htmlFor="signup-password" className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Min. 6 characters"
                required
                autoComplete="new-password"
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

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748b] mb-1">
                  <span>Password strength:</span>
                  <span className="text-[#0f172a]">{passwordStrength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map(step => (
                    <div
                      key={step}
                      className={[
                        'h-1.5 rounded-full transition-all',
                        step <= passwordStrength.score ? passwordStrength.color : 'bg-[#e2e8f0]'
                      ].join(' ')}
                    />
                  ))}
                </div>
              </div>
            )}

            {passwordError && (
              <p className="text-xs text-[#dc2626] font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="signup-confirm" className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                id="signup-confirm"
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  if (confirmError) setConfirmError(null);
                }}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
                className={[
                  'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2',
                  confirmError
                    ? 'border-[#ef4444] text-[#991b1b] focus:border-[#ef4444] focus:ring-[#fee2e2] bg-[#fef2f2]'
                    : 'border-[#cbd5e1] text-[#0f172a] focus:border-[#3b82f6] focus:ring-[#eff6ff] bg-white'
                ].join(' ')}
              />
            </div>
            {confirmError && (
              <p className="text-xs text-[#dc2626] font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{confirmError}</span>
              </p>
            )}
          </div>

          <Button
            id="signup-submit"
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            className="mt-4"
          >
            Create account
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

        {/* Link to Login */}
        <div className="text-center text-sm text-[#64748b]">
          Already have a NexDesk account?{' '}
          <Link
            to={`/login${redirectUrl !== '/browse' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-[#3b82f6] font-semibold hover:underline inline-flex items-center gap-1"
          >
            Sign in <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
