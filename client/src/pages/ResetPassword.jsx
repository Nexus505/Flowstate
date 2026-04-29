import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight, Check, AlertTriangle, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import StarField from '../components/StarField';
import api from '../utils/api';

/* ──────────────────────────────────────────────────────────── */
/* Password input with show/hide toggle                         */
/* ──────────────────────────────────────────────────────────── */

function PasswordInput({ id, value, onChange, placeholder, autoFocus }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary group-focus-within:text-cyan-400 transition-colors">
        <Lock size={17} />
      </div>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-[50px] bg-[#0a0c10]/60 border border-white/5 rounded-xl pl-11 pr-11 text-white text-sm outline-none focus:border-cyan-500/40 focus:bg-[#0a0c10] transition-all placeholder:text-secondary/50"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/* Reset Password Page                                          */
/* ──────────────────────────────────────────────────────────── */

export default function ResetPassword() {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const token            = searchParams.get('token');

  const [newPassword,    setNewPassword]    = useState('');
  const [confirmPass,    setConfirmPass]    = useState('');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState(false);

  /* No token in URL */
  const invalidToken = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPass) { setError("Passwords don't match."); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050608] flex items-center justify-center p-6 overflow-hidden selection:bg-cyan-500/30">
      <StarField />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 blur-[100px] rounded-full pointer-events-none" />

      <Link
        to="/auth"
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center justify-center p-2 text-secondary hover:text-white hover:-translate-x-1 transition-all duration-300 z-50"
        aria-label="Back to Sign In"
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

        {/* ── Invalid / missing token ── */}
        {invalidToken ? (
          <div className="flex flex-col items-center gap-5 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle size={24} className="text-rose-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg mb-1">Invalid reset link</h2>
              <p className="text-secondary text-sm leading-relaxed max-w-[260px] mx-auto">
                This link is missing a reset token. Please request a new one from the sign in page.
              </p>
            </div>
            <Link
              to="/auth"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium underline underline-offset-4"
            >
              Go to Sign In
            </Link>
          </div>
        ) : success ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-5 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Check size={26} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg mb-1">Password reset!</h2>
              <p className="text-secondary text-sm leading-relaxed">
                Your password has been updated. Redirecting you to sign in…
              </p>
            </div>
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── Reset form ── */
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <KeyRound size={16} className="text-violet-400" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Set new password</h2>
            </div>
            <p className="text-secondary text-xs leading-relaxed mb-7 ml-12">
              Choose a strong password for your Flowstate account. At least 6 characters.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <PasswordInput
                id="reset-new-password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                autoFocus
              />
              <PasswordInput
                id="reset-confirm-password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Confirm new password"
              />

              {/* Password strength hint */}
              {newPassword.length > 0 && (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          newPassword.length < 6 ? (level <= 1 ? '#ef4444' : '#ffffff10') :
                          newPassword.length < 10 ? (level <= 2 ? '#f59e0b' : '#ffffff10') :
                          newPassword.length < 14 ? (level <= 3 ? '#34d399' : '#ffffff10') :
                          '#10b981',
                      }}
                    />
                  ))}
                  <span className="text-xs font-mono text-secondary whitespace-nowrap">
                    {newPassword.length < 6 ? 'Weak' : newPassword.length < 10 ? 'Fair' : newPassword.length < 14 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
                  <AlertTriangle size={13} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="reset-password-submit"
                disabled={loading}
                className="w-full h-[54px] mt-2 rounded-xl flex items-center justify-center gap-2 group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_280deg,#22d3ee_320deg,#8b5cf6_360deg)] animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-[2px] bg-[#050608] rounded-[10px] z-0 transition-colors duration-300 group-hover:bg-[#0a0c10]" />
                <span className="text-white/90 group-hover:text-white relative z-10 font-semibold text-sm tracking-wide">
                  {loading
                    ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Resetting…</span>
                    : 'Reset Password'
                  }
                </span>
                {!loading && <ArrowRight size={18} className="text-cyan-400 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
