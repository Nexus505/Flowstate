import React, { useState, useEffect } from 'react';
import { defaultData } from '../utils/defaultData';
import { Briefcase, CheckCircle, BarChart3, Plus, Clock, Zap, TrendingUp, Star, Coffee, Calendar, Trash2 } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import GlassModal from '../components/GlassModal';
import { useData } from '../context/DataContext';
import { PageSkeleton } from '../components/SkeletonLoader';

/* ─── Helpers ─────────────────────────────────────────────── */
const AnimatedCounter = ({ value, duration = 1400 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null, raf;
    const go = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.floor(e * value));
      if (p < 1) raf = requestAnimationFrame(go);
    };
    raf = requestAnimationFrame(go);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{count}</>;
};

const AnimatedFloat = ({ value, decimals = 1, duration = 1400 }) => {
  const [count, setCount] = useState('0.0');
  useEffect(() => {
    let start = null, raf;
    const go = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount((e * value).toFixed(decimals));
      if (p < 1) raf = requestAnimationFrame(go);
    };
    raf = requestAnimationFrame(go);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, decimals]);
  return <>{count}</>;
};

/* ── Productivity Score Ring ──────────────────────────────── */
const ScoreRing = ({ score, mounted }) => {
  const size = 148, stroke = 13;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (mounted ? score / 100 : 0) * circ;
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#fb7185';
  const glow  = score >= 75 ? 'rgba(52,211,153,0.35)' : score >= 50 ? 'rgba(251,191,36,0.35)' : 'rgba(251,113,133,0.35)';

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="url(#score-grad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 6px ${glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono leading-none" style={{ color, textShadow: `0 0 16px ${glow}` }}>
          <AnimatedCounter value={score} />
        </span>
        <span className="text-[10px] text-secondary font-mono uppercase tracking-widest mt-1">score</span>
      </div>
    </div>
  );
};

/* ── Mood emoji map ───────────────────────────────────────── */
const moodEmoji = ['', '😩', '😞', '😐', '🙂', '😄'];
const moodColor = ['', '#fb7185', '#f97316', '#fbbf24', '#34d399', '#22d3ee'];
const moodLabel = ['', 'Burnout', 'Low',    'Neutral', 'Good',   'Excellent'];

/* ─── Main Page ───────────────────────────────────────────── */
export default function Work() {
  useTilt();
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r2 = useReveal(200);
  const r3 = useReveal(300);

  const { workData, addWork, deleteWork, loading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], hoursWorked: '', tasksCompleted: '', focusSessions: '', mood: 4, notes: '' });
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t); }, []);

  if (loading) return <PageSkeleton />;

  /* ── Computed Stats ──────────────────────────────────────── */
  const count       = workData.length || 1; // prevent division by zero
  const avgHours    = workData.reduce((a, w) => a + (w.hoursWorked || 0), 0) / count;
  const totalTasks  = workData.reduce((a, w) => a + (w.tasksCompleted || 0), 0);
  const totalFocus  = workData.reduce((a, w) => a + (w.focusSessions || 0), 0);
  const avgMood     = workData.reduce((a, w) => a + (w.mood || 0), 0) / count;
  const todayData   = workData[0];

  /* Productivity score: weighted average of hours (40%), tasks (40%), mood (20%) */
  const productivityScore = workData.length === 0 ? 0 : Math.min(100, Math.round(
    ((avgHours / 10) * 40) + ((avgMood / 5) * 20) + ((totalTasks / (count * 10)) * 40)
  ));

  /* Max hours for chart scaling */
  const maxHours = workData.length > 0 ? Math.max(...workData.map(w => w.hoursWorked || 0)) : 1;

  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div ref={r0} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Briefcase className="text-blue-400" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">
              Work
            </h1>
          </div>
          <p className="text-secondary text-sm max-w-md leading-relaxed mt-3">
            Track work hours, task completion, and productivity metrics to optimise your deep work sessions.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} /> Log Session
        </button>
      </div>

      {/* ── Hero: Score Ring + Stats Grid ──────────────────── */}
      <div ref={r1} className="reveal glass-card p-6 md:p-8 flex flex-col md:flex-row gap-8 border border-blue-500/10"
           style={{ boxShadow: '0 0 30px rgba(59,130,246,0.05)' }}>

        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center gap-3 md:w-52 shrink-0">
          <ScoreRing score={productivityScore} mounted={mounted} />
          <div className="text-center">
            <p className="text-xs font-semibold text-white">Productivity Score</p>
            <p className="text-[10px] text-secondary font-mono mt-0.5">5-day rolling average</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/5 self-stretch" />
        <div className="block md:hidden h-px bg-white/5 w-full" />

        {/* 4-stat grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 content-center">
          {[
            { label: 'Avg Hours / Day',    value: <AnimatedFloat value={avgHours} />,   unit: 'hrs',     color: 'text-blue-300',    glow: 'rgba(59,130,246,0.3)',   border: 'border-blue-500/20',    bg: 'rgba(59,130,246,0.12)',   icon: Clock       },
            { label: 'Tasks Completed',    value: <AnimatedCounter value={totalTasks} />, unit: 'total',   color: 'text-emerald-300', glow: 'rgba(52,211,153,0.3)',   border: 'border-emerald-500/20', bg: 'rgba(52,211,153,0.12)',   icon: CheckCircle },
            { label: 'Focus Sessions',     value: <AnimatedCounter value={totalFocus} />, unit: '5-day',   color: 'text-violet-300',  glow: 'rgba(139,92,246,0.3)',   border: 'border-violet-500/20',  bg: 'rgba(139,92,246,0.12)',   icon: Zap         },
            { label: 'Avg Mood',           value: <AnimatedFloat value={avgMood} />,    unit: '/ 5.0',   color: 'text-amber-300',   glow: 'rgba(251,191,36,0.3)',   border: 'border-amber-500/20',   bg: 'rgba(251,191,36,0.12)',   icon: Star        },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`bg-white/[0.02] border ${s.border} rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden`}>
                <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ background: `radial-gradient(circle, ${s.bg} 0%, transparent 70%)` }} />
                <div className="relative z-10">
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-mono mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold font-mono ${s.color} leading-none`} style={{ textShadow: `0 0 12px ${s.glow}` }}>
                    {s.value} <span className="text-xs font-normal text-secondary">{s.unit}</span>
                  </p>
                </div>
                <Icon className="text-white/10 group-hover:text-white/30 transition-colors shrink-0" size={26} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Hours Bar Chart + Mood Trend ───────────────────── */}
      <div ref={r2} className="reveal grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Hours Chart */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white text-sm tracking-wide flex items-center gap-2">
              <BarChart3 size={15} className="text-blue-400" /> Daily Hours
            </h3>
            <span className="chip text-blue-300 border-blue-400/20 text-xs">Past 5 Days</span>
          </div>

          {/* Mini summary stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:bg-white/[0.05] transition-colors">
              <div>
                <p className="text-[10px] text-secondary font-mono uppercase tracking-widest mb-0.5">Today's Hours</p>
                <p className="text-xl font-bold text-blue-300 font-mono drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                  <AnimatedFloat value={todayData?.hoursWorked ?? 0} /> <span className="text-xs font-normal text-secondary">hrs</span>
                </p>
              </div>
              <Clock className="text-blue-500/40 group-hover:text-blue-400 transition-colors" size={22} />
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:bg-white/[0.05] transition-colors">
              <div>
                <p className="text-[10px] text-secondary font-mono uppercase tracking-widest mb-0.5">Today's Tasks</p>
                <p className="text-xl font-bold text-emerald-300 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                  <AnimatedCounter value={todayData?.tasksCompleted ?? 0} /> <span className="text-xs font-normal text-secondary">done</span>
                </p>
              </div>
              <CheckCircle className="text-emerald-500/40 group-hover:text-emerald-400 transition-colors" size={22} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-3 mt-auto">
            {[...workData].reverse().map((day, idx) => {
              const pct = (day.hoursWorked / maxHours) * 100;
              const isMoodGood = day.mood >= 4;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-help relative">
                  {/* Tooltip */}
                  <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10
                                  bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.4)] whitespace-nowrap">
                    <span className="text-white font-mono font-bold text-sm">{day.hoursWorked}h</span>
                    <span className="text-[10px] font-mono" style={{ color: moodColor[day.mood] }}>{moodLabel[day.mood]}</span>
                  </div>

                  <div className="w-full bg-white/5 rounded-t-xl h-[160px] flex items-end relative overflow-hidden">
                    <div
                      className="w-full rounded-t-xl transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:brightness-125 relative"
                      style={{
                        height: mounted ? `${pct}%` : '0%',
                        background: isMoodGood
                          ? 'linear-gradient(to top, #1d4ed8, #38bdf8)'
                          : 'linear-gradient(to top, #1e3a5f, #3b82f6)',
                        transitionDelay: `${idx * 80}ms`,
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-3 bg-white/20 blur-sm rounded-t-xl mix-blend-overlay" />
                    </div>
                  </div>

                  {/* Focus dots */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className={`w-1 h-1 rounded-full transition-all`}
                           style={j < day.focusSessions ? { backgroundColor: '#8b5cf6', boxShadow: '0 0 3px rgba(139,92,246,0.6)' } : { backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>

                  <span className="text-[10px] text-secondary font-mono">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-secondary/40 font-mono text-center mt-3">Dots = focus sessions</p>
        </div>

        {/* Mood Trend */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-semibold text-white text-sm tracking-wide flex items-center gap-2 mb-6">
            <Star size={15} className="text-amber-400" /> Mood Trend
          </h3>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {workData.length === 0 ? (
              <p className="text-xs text-secondary text-center font-mono py-4">No sessions yet. Log your first session.</p>
            ) : workData.map((day, i) => {
              const moodPct = (day.mood / 5) * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-secondary font-mono">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono" style={{ color: moodColor[day.mood] }}>
                      {moodLabel[day.mood]}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: mounted ? `${moodPct}%` : '0%',
                        backgroundColor: moodColor[day.mood],
                        boxShadow: `0 0 6px ${moodColor[day.mood]}55`,
                        transitionDelay: `${i * 100}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Focus session total */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="bg-white/[0.02] rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-secondary font-mono uppercase tracking-widest mb-0.5">Total Focus Sessions</p>
                <p className="text-xl font-bold text-violet-300 font-mono drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                  <AnimatedCounter value={totalFocus} /> <span className="text-xs font-normal text-secondary">sessions</span>
                </p>
              </div>
              <Zap className="text-violet-500/50" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Session Log ────────────────────────────────────── */}
      <div ref={r3} className="reveal glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm tracking-wide">
            <Coffee size={15} className="text-blue-400" /> Session Log
          </h3>
          <span className="chip text-secondary border-white/10 text-xs">{workData.length} entries</span>
        </div>

        <div className="flex flex-col gap-3">
          {workData.length === 0 ? (
            <p className="text-sm text-secondary text-center py-8 font-mono">No sessions logged yet. Hit "Log Session" to get started.</p>
          ) : workData.map((log) => {
            const hoursPct = Math.min((log.hoursWorked / 10) * 100, 100);
            return (
              <div key={log._id}
                className={`group relative overflow-hidden bg-white/[0.02] border border-white/5 hover:border-blue-500/25 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04] ${deletingId === log._id ? 'opacity-0 -translate-x-4' : ''}`}
              >
                {/* hours fill bar at bottom */}
                <div className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-1000 ease-out"
                     style={{ width: mounted ? `${hoursPct}%` : '0%', background: 'linear-gradient(to right, #1d4ed866, #38bdf8)' }} />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-[10px] text-blue-400 font-mono uppercase">
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-white font-mono leading-none">
                        {new Date(log.date).getDate()}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white text-sm font-semibold">{log.hoursWorked} hrs logged</span>
                        <span className="text-[10px] text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          {log.focusSessions} FOCUS
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                              style={{ color: moodColor[log.mood], backgroundColor: moodColor[log.mood] + '15', borderColor: moodColor[log.mood] + '40' }}>
                          {moodLabel[log.mood]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                        <span className="text-emerald-400/80">{log.tasksCompleted} tasks done</span>
                        {log.notes && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="truncate max-w-[180px]">{log.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task completion mini-bar */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                    <span className="text-[10px] text-secondary font-mono uppercase tracking-widest hidden sm:block">Tasks</span>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(log.tasksCompleted, 8) }).map((_, j) => (
                        <div key={j} className="w-1.5 h-4 rounded-sm bg-emerald-400/70 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
                      ))}
                      {log.tasksCompleted > 8 && (
                        <span className="text-[10px] text-secondary font-mono self-center ml-0.5">+{log.tasksCompleted - 8}</span>
                      )}
                    </div>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={() => { setDeletingId(log._id); setTimeout(() => deleteWork(log._id), 300); }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-rose-500/15 text-secondary hover:text-rose-400 transition-all duration-200 shrink-0 ml-2"
                    title="Delete session"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Session">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          addWork({ date: form.date, hoursWorked: Number(form.hoursWorked)||0, tasksCompleted: Number(form.tasksCompleted)||0, focusSessions: Number(form.focusSessions)||0, mood: Number(form.mood), notes: form.notes });
          setForm({ date: new Date().toISOString().split('T')[0], hoursWorked: '', tasksCompleted: '', focusSessions: '', mood: 4, notes: '' });
          setIsModalOpen(false);
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Calendar size={12}/> Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/40 transition-all cursor-pointer [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={12}/> Hours Worked</label>
              <input type="number" step="0.1" value={form.hoursWorked} onChange={e => setForm(p=>({...p,hoursWorked:e.target.value}))} placeholder="8.5" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/40 transition-all placeholder:text-white/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CheckCircle size={12}/> Tasks Done</label>
              <input type="number" value={form.tasksCompleted} onChange={e => setForm(p=>({...p,tasksCompleted:e.target.value}))} placeholder="5" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/40 transition-all placeholder:text-white/20" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Zap size={12}/> Focus Sessions</label>
              <input type="number" value={form.focusSessions} onChange={e => setForm(p=>({...p,focusSessions:e.target.value}))} placeholder="3" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/40 transition-all placeholder:text-white/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex justify-between">
              <span>Mood</span>
              <span className="text-blue-400">1 - 5</span>
            </label>
            <input type="range" min="1" max="5" value={form.mood} onChange={e => setForm(p=>({...p,mood:e.target.value}))} className="w-full accent-blue-500 cursor-pointer mt-3" />
          </div>
          <div>
            <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Notes</label>
            <input type="text" value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} placeholder="e.g. Deep work on frontend" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/40 transition-all placeholder:text-white/20" />
          </div>
          <button type="submit" className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-transparent text-white hover:text-white/60 transition-all">
            Save Session
          </button>
        </form>
      </GlassModal>

    </div>
  );
}
