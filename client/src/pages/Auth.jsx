import React, { useState, useRef } from 'react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, Check, AlertTriangle, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StarField from '../components/StarField';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import api from '../utils/api';

/* ──────────────────────────────────────────────────────────── */
/* Forgot Password panel (inline, animated)                     */
/* ──────────────────────────────────────────────────────────── */

function ForgotPasswordPanel({ onBack }) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}>
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-secondary hover:text-white transition-colors mb-7 group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to sign in
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <KeyRound size={16} className="text-cyan-400" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">Forgot password?</h2>
      </div>
      <p className="text-secondary text-xs leading-relaxed mb-7 ml-12">
        Enter your account email and we'll send you a secure reset link — expires in 1 hour.
      </p>

      {sent ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <Check size={26} className="text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm mb-1">Check your inbox</p>
            <p className="text-secondary text-xs leading-relaxed max-w-[260px] mx-auto">
              If <span className="text-cyan-400 font-mono">{email}</span> is registered, a reset link is on its way.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="mt-2 text-xs text-secondary hover:text-white transition-colors underline underline-offset-4"
          >
            Return to sign in
          </button>
        </div>
      ) : (
        /* ── Form ── */
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary group-focus-within:text-cyan-400 transition-colors">
              <Mail size={17} />
            </div>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your account email"
              autoFocus
              className="w-full h-[50px] bg-[#0a0c10]/60 border border-white/5 rounded-xl pl-11 pr-4 text-white text-sm outline-none focus:border-cyan-500/40 focus:bg-[#0a0c10] transition-all placeholder:text-secondary/50"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
              <AlertTriangle size={13} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] mt-1 rounded-xl flex items-center justify-center gap-2 group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_280deg,#22d3ee_320deg,#8b5cf6_360deg)] animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-[2px] bg-[#050608] rounded-[10px] z-0 transition-colors duration-300 group-hover:bg-[#0a0c10]" />
            <span className="text-white/90 group-hover:text-white relative z-10 font-semibold text-sm tracking-wide">
              {loading
                ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Sending…</span>
                : 'Send Reset Link'
              }
            </span>
            {!loading && <ArrowRight size={17} className="text-cyan-400 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />}
          </button>
        </form>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/* Main Auth Page                                               */
/* ──────────────────────────────────────────────────────────── */

export default function Auth() {
  const [isLogin,       setIsLogin]       = useState(true);
  const [showForgot,    setShowForgot]    = useState(false);
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { refreshAll } = useData();

  const nameRef     = useRef();
  const emailRef    = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(emailRef.current.value, passwordRef.current.value);
      } else {
        await register(nameRef.current.value, emailRef.current.value, passwordRef.current.value);
      }
      await refreshAll();
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (login) => {
    setIsLogin(login);
    setError('');
    setShowForgot(false);
  };

  return (
    <div className="relative min-h-screen bg-[#050608] flex items-center justify-center p-6 overflow-hidden selection:bg-cyan-500/30">
      <StarField />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center justify-center p-2 text-secondary hover:text-white hover:-translate-x-1 transition-all duration-300 z-50"
        aria-label="Back to Home"
      >
        <ArrowLeft size={24} />
      </Link>

      <div className="liquid-glass w-full max-w-md p-8 md:p-10 rounded-[2.5rem] relative z-10 border border-white/5 shadow-2xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-[1rem] bg-white/5 border border-white/10 shadow-inner">
            <span className="font-sans font-bold text-white text-lg tracking-tight pr-[1px] mt-[1px]">Fs.</span>
          </div>
          <span className="font-sans font-bold text-3xl tracking-tight text-white">Flowstate.</span>
        </div>

        {/* ── Forgot password panel (slides in, replaces form) ── */}
        {showForgot ? (
          <ForgotPasswordPanel onBack={() => setShowForgot(false)} />
        ) : (
          <>
            {/* Toggle */}
            <div className="flex bg-[#0a0c10]/80 p-1 rounded-2xl mb-8 border border-white/5 backdrop-blur-md">
              <button
                type="button"
                id="tab-signin"
                onClick={() => switchTab(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isLogin ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' : 'text-secondary hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-signup"
                onClick={() => switchTab(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${!isLogin ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' : 'text-secondary hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className={`flex flex-col gap-4 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isLogin ? 'max-h-[120px]' : 'max-h-[200px]'}`}>

                {/* Name (sign up only) */}
                <div className={`transition-all duration-500 transform ${isLogin ? '-translate-y-4 opacity-0 pointer-events-none h-0 mb-0' : 'translate-y-0 opacity-100 h-[50px]'}`}>
                  <div className="relative group h-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary group-focus-within:text-cyan-400 transition-colors">
                      <User size={18} />
                    </div>
                    <input ref={nameRef} id="signup-name" type="text" placeholder="Full Name" required={!isLogin}
                      className="w-full h-full bg-[#0a0c10]/60 border border-white/5 rounded-xl pl-11 pr-4 text-white text-sm outline-none focus:border-cyan-500/40 focus:bg-[#0a0c10] transition-all placeholder:text-secondary/50" />
                  </div>
                </div>

                {/* Email */}
                <div className="relative group h-[50px] shrink-0">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary group-focus-within:text-cyan-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input ref={emailRef} id="auth-email" type="email" placeholder="Email Address" required
                    className="w-full h-full bg-[#0a0c10]/60 border border-white/5 rounded-xl pl-11 pr-4 text-white text-sm outline-none focus:border-cyan-500/40 focus:bg-[#0a0c10] transition-all placeholder:text-secondary/50" />
                </div>

                {/* Password */}
                <div className="relative group h-[50px] shrink-0">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary group-focus-within:text-cyan-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input ref={passwordRef} id="auth-password" type="password" placeholder="Password" required
                    className="w-full h-full bg-[#0a0c10]/60 border border-white/5 rounded-xl pl-11 pr-4 text-white text-sm outline-none focus:border-cyan-500/40 focus:bg-[#0a0c10] transition-all placeholder:text-secondary/50" />
                </div>
              </div>

              {/* Forgot password link */}
              <div className={`flex justify-end transition-all duration-300 ${isLogin ? 'opacity-100 h-auto -mt-1' : 'opacity-0 h-0 overflow-hidden mt-0'}`}>
                <button
                  type="button"
                  id="forgot-password-link"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-secondary hover:text-cyan-400 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-rose-400 text-center font-mono bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                id="auth-submit"
                disabled={loading}
                className="w-full h-[54px] mt-2 rounded-xl flex items-center justify-center gap-2 group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_280deg,#22d3ee_320deg,#8b5cf6_360deg)] animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-[2px] bg-[#050608] rounded-[10px] z-0 transition-colors duration-300 group-hover:bg-[#0a0c10]" />
                <span className="text-white/90 group-hover:text-white relative z-10 font-sans font-semibold text-sm tracking-wide transition-colors duration-300">
                  {loading ? 'Please wait…' : isLogin ? 'Enter Flowstate' : 'Create Account'}
                </span>
                {!loading && <ArrowRight size={18} className="text-cyan-400 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
