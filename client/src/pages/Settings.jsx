import React, { useState, useRef, useEffect } from 'react';
import {
  User, Target, Moon, Dumbbell, Apple, Wallet, Shield,
  Trash2, ChevronRight, Check, Flame, Clock, Calendar,
  LogOut, Eye, EyeOff, X, AlertTriangle, KeyRound, Loader2,
} from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ────────────────────────────────────────────────────────────── */
/*  Reusable UI primitives                                        */
/* ────────────────────────────────────────────────────────────── */

const Section = ({ title, icon: Icon, color, children }) => (
  <div className="glass-card p-6 md:p-8 space-y-6">
    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15', border: `1px solid ${color}30` }}>
        <Icon size={17} style={{ color }} />
      </div>
      <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">{label}</label>
    {children}
  </div>
);

const Input = React.forwardRef(({ ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/40 transition-all placeholder:text-white/20"
  />
));

/* Password field with show/hide toggle */
const PasswordInput = ({ value, onChange, placeholder, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 pr-11 text-white text-sm outline-none focus:border-violet-500/40 transition-all placeholder:text-white/20"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
};

/* Goal input with local state */
const GoalInput = ({ label, icon: Icon, color, unit, value, onChange }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-all">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '15', border: `1px solid ${color}30` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <span className="text-sm text-white font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-20 bg-[#0a0c10]/60 border border-white/5 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-violet-500/40 text-right font-mono transition-all"
      />
      <span className="text-xs text-secondary font-mono w-8">{unit}</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────── */
/*  Modal wrapper                                                 */
/* ────────────────────────────────────────────────────────────── */

const Modal = ({ open, onClose, children }) => {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-card w-full max-w-md p-6 md:p-8 space-y-6"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {children}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────── */
/*  Change Password Modal                                         */
/* ────────────────────────────────────────────────────────────── */

const ChangePasswordModal = ({ open, onClose }) => {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset = () => { setCurrent(''); setNext(''); setConfirm(''); setError(''); setSuccess(false); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (next !== confirm) { setError("New passwords don't match."); return; }
    if (next.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await changePassword(current, next);
      setSuccess(true);
      setTimeout(() => { handleClose(); }, 1800);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <KeyRound size={16} className="text-violet-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Change Password</h3>
        </div>
        <button onClick={handleClose} className="text-white/30 hover:text-white/60 transition-colors">
          <X size={18} />
        </button>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Check size={22} className="text-emerald-400" />
          </div>
          <p className="text-sm text-emerald-300 font-medium">Password updated successfully!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current Password">
            <PasswordInput
              id="current-password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder="Enter current password"
            />
          </Field>
          <Field label="New Password">
            <PasswordInput
              id="new-password"
              value={next}
              onChange={e => setNext(e.target.value)}
              placeholder="At least 6 characters"
            />
          </Field>
          <Field label="Confirm New Password">
            <PasswordInput
              id="confirm-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat new password"
            />
          </Field>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <AlertTriangle size={13} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/[0.04] border border-white/10 text-white/60 hover:bg-white/[0.07] hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
              {loading ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

/* ────────────────────────────────────────────────────────────── */
/*  Delete Account Modal                                          */
/* ────────────────────────────────────────────────────────────── */

const DeleteAccountModal = ({ open, onClose, onDeleted }) => {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setPassword(''); setError(''); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password) { setError('Please enter your password to confirm.'); return; }
    setLoading(true);
    try {
      await deleteAccount(password);
      onDeleted();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Trash2 size={16} className="text-rose-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Delete Account</h3>
        </div>
        <button onClick={handleClose} className="text-white/30 hover:text-white/60 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex gap-3 p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl">
        <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
        <p className="text-xs text-rose-300/80 leading-relaxed">
          This action is <strong className="text-rose-300">permanent and irreversible</strong>. All your data —
          workouts, habits, nutrition logs, expenses, and sleep records — will be deleted forever.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Confirm with your password">
          <PasswordInput
            id="delete-confirm-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </Field>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            <AlertTriangle size={13} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/[0.04] border border-white/10 text-white/60 hover:bg-white/[0.07] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 hover:text-rose-200 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {loading ? 'Deleting…' : 'Delete Forever'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ────────────────────────────────────────────────────────────── */
/*  Main Settings Page                                            */
/* ────────────────────────────────────────────────────────────── */

export default function Settings() {
  useTilt();
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r2 = useReveal(200);
  const r3 = useReveal(300);

  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  /* ── Profile form state ────────────────────────────────────── */
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');

  /* ── Goals state ───────────────────────────────────────────── */
  const [goals, setGoals] = useState({
    calories:  user?.goals?.calories  ?? 2500,
    sleep:     user?.goals?.sleep     ?? 8,
    workouts:  user?.goals?.workouts  ?? 4,
    workHours: user?.goals?.workHours ?? 8,
    protein:   user?.goals?.protein   ?? 180,
    savings:   user?.goals?.savings   ?? 1000,
  });

  /* ── Save state ────────────────────────────────────────────── */
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  /* ── Modal state ───────────────────────────────────────────── */
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ── Sync user changes (e.g. after profile update) ─────────── */
  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
      setBio(user.bio ?? '');
      setGoals({
        calories:  user.goals?.calories  ?? 2500,
        sleep:     user.goals?.sleep     ?? 8,
        workouts:  user.goals?.workouts  ?? 4,
        workHours: user.goals?.workHours ?? 8,
        protein:   user.goals?.protein   ?? 180,
        savings:   user.goals?.savings   ?? 1000,
      });
    }
  }, [user]);

  /* ── Handlers ──────────────────────────────────────────────── */
  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), bio: bio.trim(), goals });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth');
  };

  const handleAccountDeleted = () => {
    navigate('/auth');
  };

  const goalMeta = [
    { key: 'calories',  label: 'Daily Calories',     icon: Flame,    color: '#f59e0b', unit: 'kcal' },
    { key: 'sleep',     label: 'Sleep Target',        icon: Moon,     color: '#818cf8', unit: 'hrs'  },
    { key: 'workouts',  label: 'Workouts / Week',     icon: Dumbbell, color: '#e879f9', unit: '/wk'  },
    { key: 'workHours', label: 'Work Hours / Day',    icon: Clock,    color: '#38bdf8', unit: 'hrs'  },
    { key: 'protein',   label: 'Protein Goal',        icon: Apple,    color: '#34d399', unit: 'g'    },
    { key: 'savings',   label: 'Savings Target',      icon: Wallet,   color: '#10b981', unit: '$/mo' },
  ];

  return (
    <>
      <div className="max-w-3xl mx-auto pb-28 space-y-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div ref={r0} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <User className="text-violet-400" size={20} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">
                Settings
              </h1>
            </div>
            <p className="text-secondary text-sm max-w-md leading-relaxed mt-3">
              Manage your profile, personalise your goals, and configure your Flowstate experience.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 self-start md:self-auto">
            <button
              id="save-changes-btn"
              onClick={handleSave}
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 disabled:opacity-70 ${
                saved
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'btn-primary'
              }`}
            >
              {saving
                ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                : saved
                  ? <><Check size={16} /> Saved!</>
                  : 'Save Changes'
              }
            </button>
            {saveError && (
              <p className="text-xs text-rose-300 font-mono">{saveError}</p>
            )}
          </div>
        </div>

        {/* ── Profile ────────────────────────────────────────── */}
        <div ref={r1} className="reveal">
          <Section title="Profile" icon={User} color="#8b5cf6">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl font-bold text-violet-300 font-mono shrink-0">
                {user?.avatar || name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm text-white font-medium mb-1">Profile Photo</p>
                <p className="text-xs text-secondary mb-2">Avatar initials are used until a photo is uploaded.</p>
                <button className="text-xs text-violet-400 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg transition-all font-mono tracking-wide">
                  Upload Photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name">
                <Input
                  id="profile-name"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </Field>
              <Field label="Email">
                <Input
                  id="profile-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  title="Email cannot be changed"
                />
              </Field>
            </div>

            <Field label="Bio">
              <textarea
                id="profile-bio"
                placeholder="Tell Flowstate a bit about yourself…"
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/40 transition-all placeholder:text-white/20 resize-none"
              />
            </Field>

            <Field label="Member Since">
              <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-secondary text-sm font-mono">
                <Calendar size={14} className="text-violet-400" />
                {user?.joinDate
                  ? new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </div>
            </Field>
          </Section>
        </div>

        {/* ── Goals ──────────────────────────────────────────── */}
        <div ref={r2} className="reveal">
          <Section title="Daily Goals" icon={Target} color="#34d399">
            <p className="text-xs text-secondary leading-relaxed -mt-2">
              These targets are used by the AI Insights engine to calculate your performance score and generate personalised recommendations.
            </p>
            <div className="flex flex-col gap-3">
              {goalMeta.map(({ key, label, icon, color, unit }) => (
                <GoalInput
                  key={key}
                  label={label}
                  icon={icon}
                  color={color}
                  unit={unit}
                  value={goals[key]}
                  onChange={val => setGoals(g => ({ ...g, [key]: val }))}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* ── Account & Security ─────────────────────────────── */}
        <div ref={r3} className="reveal space-y-6">
          <Section title="Account & Security" icon={Shield} color="#fb7185">
            <div className="space-y-3">
              <button
                id="change-password-btn"
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <KeyRound size={15} className="text-secondary group-hover:text-white transition-colors" />
                  <span className="text-sm text-white">Change Password</span>
                </div>
                <ChevronRight size={15} className="text-secondary group-hover:text-white transition-colors" />
              </button>

              <button
                id="sign-out-btn"
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={15} className="text-secondary group-hover:text-white transition-colors" />
                  <span className="text-sm text-white">Sign Out</span>
                </div>
                <ChevronRight size={15} className="text-secondary group-hover:text-white transition-colors" />
              </button>

              <button
                id="delete-account-btn"
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl hover:border-rose-500/30 hover:bg-rose-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={15} className="text-rose-400/60 group-hover:text-rose-400 transition-colors" />
                  <span className="text-sm text-rose-400/70 group-hover:text-rose-400 transition-colors">Delete Account</span>
                </div>
                <ChevronRight size={15} className="text-rose-400/40 group-hover:text-rose-400 transition-colors" />
              </button>
            </div>
          </Section>
        </div>

      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={handleAccountDeleted}
      />
    </>
  );
}
