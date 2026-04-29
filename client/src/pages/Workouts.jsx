import React, { useState, useEffect } from 'react';
import { defaultData } from '../utils/defaultData';
import { Dumbbell, Flame, Timer, Activity, Plus, Trophy, Zap, TrendingUp, Target, Calendar, Trash2 } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import GlassModal from '../components/GlassModal';
import { useData } from '../context/DataContext';
import { PageSkeleton } from '../components/SkeletonLoader';

/* ─── Helpers ─────────────────────────────────────────────── */
const AnimatedCounter = ({ value, duration = 1500 }) => {
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

const AnimatedFloat = ({ value, decimals = 1, duration = 1500 }) => {
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

/* ── Ring SVG ─────────────────────────────────────────────── */
const Ring = ({ pct, size = 140, stroke = 12, color1 = '#8b5cf6', color2 = '#6366f1', id = 'ring', mounted }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (mounted ? pct / 100 : 0) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={`url(#${id})`} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </svg>
  );
};

/* ─── Type Config ─────────────────────────────────────────── */
const typeConfig = {
  Running:  { color: '#22d3ee', bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-300',    icon: Activity },
  Gym:      { color: '#8b5cf6', bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-300',  icon: Dumbbell },
  Yoga:     { color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-300', icon: Target   },
  Cycling:  { color: '#fbbf24', bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-300',   icon: Zap      },
};
const getConfig = (type) => typeConfig[type] || typeConfig['Gym'];

/* ─── Main Page ───────────────────────────────────────────── */
export default function Workouts() {
  useTilt();
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r2 = useReveal(200);
  const r3 = useReveal(300);
  const r4 = useReveal(400);

  const { workouts, addWorkout, deleteWorkout, loading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'Gym', date: new Date().toISOString().split('T')[0], duration: '', calories: '', intensity: 3, notes: '' });
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t); }, []);

  if (loading) return <PageSkeleton />;

  /* ── Computed Stats ──────────────────────────────────────── */
  const totalWorkouts  = workouts.length;
  const totalMinutes   = workouts.reduce((a, w) => a + w.duration, 0);
  const totalCalories  = workouts.reduce((a, w) => a + w.calories, 0);
  const avgIntensity   = (workouts.reduce((a, w) => a + w.intensity, 0) / workouts.length);
  const weeklyGoal     = 5; // sessions/week
  const weeklyDone     = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }).length;
  const weeklyPct = Math.min(Math.round((weeklyDone / weeklyGoal) * 100), 100);

  /* ── Workout Type Split ──────────────────────────────────── */
  const typeSplit = workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});

  /* ── Activity Grid ───────────────────────────────────────── */
  const today = new Date();
  const activityData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayWorkouts = workouts.filter(w => w.date === dateStr);
    const active = dayWorkouts.length > 0;
    const maxIntensity = active ? Math.max(...dayWorkouts.map(w => w.intensity)) : 0;
    return { date: dateStr, active, intensity: maxIntensity, count: dayWorkouts.length };
  });
  const activeDays     = activityData.filter(d => d.active).length;
  const consistencyPct = Math.round((activeDays / 30) * 100);

  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div ref={r0} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Dumbbell className="text-violet-400" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">Workouts</h1>
          </div>
          <p className="text-secondary text-sm max-w-md leading-relaxed mt-3">
            Monitor your physical conditioning, training load, and personal records.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} /> Log Workout
        </button>
      </div>

      {/* ── Hero: Weekly Goal Ring + Quick Stats ───────────── */}
      <div ref={r1} className="reveal glass-card p-6 md:p-8 flex flex-col md:flex-row gap-8 border border-violet-500/10"
           style={{ boxShadow: '0 0 30px rgba(139,92,246,0.06)' }}>

        {/* Ring */}
        <div className="flex flex-col items-center justify-center gap-4 md:w-52 shrink-0">
          <div className="relative flex items-center justify-center">
            <Ring pct={weeklyPct} id="weekly-ring" mounted={mounted} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono text-white leading-none">
                <AnimatedCounter value={weeklyDone} />
              </span>
              <span className="text-[10px] text-secondary font-mono uppercase tracking-widest mt-1">
                / {weeklyGoal} goal
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-white">Weekly Target</p>
            <p className="text-[10px] text-secondary font-mono mt-0.5"><AnimatedCounter value={weeklyPct} />% complete</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/5 self-stretch" />
        <div className="block md:hidden h-px bg-white/5 w-full" />

        {/* Stats grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 gap-4 content-center">
          {[
            { label: 'Total Sessions', value: <AnimatedCounter value={totalWorkouts} />, unit: 'this month', color: 'text-violet-300', icon: Activity, glow: 'rgba(139,92,246,0.3)', border: 'border-violet-500/20', bg: 'rgba(139,92,246,0.15)' },
            { label: 'Active Time',    value: <AnimatedCounter value={totalMinutes} />,  unit: 'minutes',    color: 'text-cyan-300',   icon: Timer,    glow: 'rgba(34,211,238,0.3)',  border: 'border-cyan-500/20',   bg: 'rgba(34,211,238,0.15)'  },
            { label: 'Calories Burned',value: <AnimatedCounter value={totalCalories} />, unit: 'kcal',       color: 'text-amber-300',  icon: Flame,    glow: 'rgba(251,191,36,0.3)',  border: 'border-amber-500/20',  bg: 'rgba(251,191,36,0.15)'  },
            { label: 'Avg Intensity',  value: <AnimatedFloat value={avgIntensity} />,    unit: '/ 5.0',      color: 'text-rose-300',   icon: TrendingUp,glow: 'rgba(244,63,94,0.3)', border: 'border-rose-500/20',   bg: 'rgba(244,63,94,0.15)'   },
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
                <Icon className="text-white/10 group-hover:text-white/30 transition-colors shrink-0" size={28} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Activity Grid + Type Split ─────────────────────── */}
      <div ref={r2} className="reveal grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Map */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white text-sm tracking-wide">30-Day Activity Map</h3>
            <span className="chip text-violet-300 border-violet-400/20 text-xs shadow-[0_0_8px_rgba(139,92,246,0.15)]">
              Consistency: <AnimatedCounter value={consistencyPct} />%
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-10 gap-1.5 md:gap-2">
              {activityData.map((day, idx) => {
                const getBg = () => {
                  if (!day.active) return 'bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10';
                  if (day.intensity >= 4) return 'bg-violet-500 border border-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)] hover:brightness-125';
                  if (day.intensity >= 2) return 'bg-violet-500/55 border border-violet-500/40 hover:brightness-125';
                  return 'bg-violet-500/25 border border-violet-500/20 hover:brightness-125';
                };
                const label = day.active
                  ? `${day.date} · ${day.count} session${day.count > 1 ? 's' : ''} · Intensity ${day.intensity}/5`
                  : `${day.date} · Rest`;
                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 md:w-9 md:h-9 rounded-md transition-all duration-500 cursor-help ${getBg()}`}
                    title={label}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-6 text-xs text-secondary font-mono">
              <span>Rest</span>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/5" />
                <div className="w-3 h-3 rounded-sm bg-violet-500/25 border border-violet-500/20" />
                <div className="w-3 h-3 rounded-sm bg-violet-500/55 border border-violet-500/40" />
                <div className="w-3 h-3 rounded-sm bg-violet-500 border border-violet-400 shadow-[0_0_5px_rgba(139,92,246,0.5)]" />
              </div>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Workout Type Split */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-semibold text-white text-sm tracking-wide mb-6">Training Split</h3>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {Object.entries(typeSplit).map(([type, count]) => {
              const cfg = getConfig(type);
              const pct = Math.round((count / totalWorkouts) * 100);
              const Icon = cfg.icon;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon size={12} style={{ color: cfg.color }} />
                      <span className="text-xs text-secondary font-mono">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono" style={{ color: cfg.color }}>{pct}%</span>
                      <span className="text-[10px] text-secondary/50 font-mono">{count}x</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: mounted ? `${pct}%` : '0%',
                        background: `linear-gradient(to right, ${cfg.color}99, ${cfg.color})`,
                        boxShadow: `0 0 6px ${cfg.color}55`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Weekly breakdown mini-stats */}
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-[10px] text-secondary font-mono uppercase tracking-widest mb-1">Active Days</p>
                <p className="text-xl font-bold text-violet-300 font-mono drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                  <AnimatedCounter value={activeDays} /> <span className="text-xs font-normal text-secondary">/ 30</span>
                </p>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-[10px] text-secondary font-mono uppercase tracking-widest mb-1">Avg / Week</p>
                <p className="text-xl font-bold text-cyan-300 font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  <AnimatedFloat value={totalWorkouts / 4} /> <span className="text-xs font-normal text-secondary">sessions</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal Records ───────────────────────────────── */}
      <div ref={r3} className="reveal glass-card p-6 border border-emerald-500/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm tracking-wide">
            <Trophy size={16} className="text-emerald-400" /> Personal Records
          </h3>
          <span className="chip text-emerald-300 border-emerald-400/20 text-xs">All Time</span>
        </div>

        {workouts.length === 0 ? (
          <p className="text-sm text-secondary text-center py-6 font-mono">
            Log your first workout to start tracking personal records.
          </p>
        ) : (() => {
          // Longest single session (duration)
          const longest = workouts.reduce((best, w) => w.duration > (best?.duration ?? 0) ? w : best, null);
          // Most calories in a session
          const maxCal  = workouts.reduce((best, w) => w.calories > (best?.calories ?? 0) ? w : best, null);
          // Most sessions in a single week (streak proxy)
          const weekCounts = {};
          workouts.forEach(w => {
            const d = new Date(w.date);
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay());
            const key = weekStart.toISOString().split('T')[0];
            weekCounts[key] = (weekCounts[key] || 0) + 1;
          });
          const bestWeek = Math.max(...Object.values(weekCounts), 0);

          const records = [
            {
              label: 'Longest Session',
              value: <AnimatedCounter value={longest?.duration ?? 0} />,
              unit: 'min',
              icon: Activity,
              date: longest ? new Date(longest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
            },
            {
              label: 'Most Calories',
              value: <AnimatedCounter value={maxCal?.calories ?? 0} />,
              unit: 'kcal',
              icon: Flame,
              date: maxCal ? new Date(maxCal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
            },
            {
              label: 'Best Week',
              value: <AnimatedCounter value={bestWeek} />,
              unit: 'sessions',
              icon: Dumbbell,
              date: 'Personal best',
            },
          ];

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {records.map((pr) => {
                const Icon = pr.icon;
                return (
                  <div key={pr.label} className="bg-white/[0.02] border border-white/5 hover:border-emerald-500/25 group transition-all duration-300 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden"
                       style={{ boxShadow: '0 0 6px rgba(52,211,153,0.04)' }}>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                         style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)' }} />
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform relative z-10">
                      <Icon size={18} />
                    </div>
                    <div className="relative z-10 min-w-0">
                      <p className="text-[10px] text-secondary font-mono uppercase tracking-widest mb-0.5">{pr.label}</p>
                      <p className="text-2xl font-bold text-emerald-300 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] flex items-baseline gap-1.5">
                        {pr.value} <span className="text-sm font-normal text-emerald-400/60">{pr.unit}</span>
                      </p>
                      <p className="text-[10px] text-secondary/50 font-mono mt-0.5">{pr.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── Training Log ───────────────────────────────────── */}
      <div className="glass-card p-6 reveal" ref={r4}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm tracking-wide">
            <Activity size={15} className="text-violet-400" /> Training Log
          </h3>
          <span className="chip text-secondary border-white/10 text-xs">{workouts.length} sessions</span>
        </div>

        <div className="flex flex-col gap-3">
          {workouts.map((workout, i) => {
            const cfg = getConfig(workout.type);
            const Icon = cfg.icon;
            const intensityPct = (workout.intensity / 5) * 100;
            const calPct = Math.min((workout.calories / 800) * 100, 100);
            return (
              <div key={workout._id}
                className={`group relative overflow-hidden bg-white/[0.02] border border-white/5 hover:border-opacity-40 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04] ${deletingId === workout._id ? 'opacity-0 -translate-x-4' : ''}`}
                style={{ '--hover-border': cfg.color }}
                onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color + '55'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
              >
                {/* bottom intensity line */}
                <div className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-1000 ease-out"
                     style={{ width: mounted ? `${intensityPct}%` : '0%', background: `linear-gradient(to right, ${cfg.color}66, ${cfg.color})` }} />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center group-hover:scale-110 transition-transform`}
                         style={{ color: cfg.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold flex items-center gap-2 mb-1">
                        {workout.type}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                              style={{ color: cfg.color, backgroundColor: cfg.color + '15', borderColor: cfg.color + '40' }}>
                          {workout.duration} MIN
                        </span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                        <span>{new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-amber-400/80">{workout.calories} kcal</span>
                        {workout.notes && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="truncate max-w-[140px]">{workout.notes}</span>
                          </>
                        )}
                      </div>
                      {/* calorie mini-bar */}
                      <div className="mt-2 h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000"
                             style={{ width: mounted ? `${calPct}%` : '0%', background: `linear-gradient(to right, #fbbf2466, #fbbf24)` }} />
                      </div>
                    </div>
                  </div>
                  {/* Intensity dots */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-secondary font-mono uppercase tracking-widest hidden sm:block">Intensity</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className={`w-1.5 h-4 rounded-sm transition-all`}
                             style={j < workout.intensity ? {
                               backgroundColor: cfg.color + 'cc',
                               boxShadow: `0 0 4px ${cfg.color}88`
                             } : { backgroundColor: 'rgba(255,255,255,0.08)' }} />
                      ))}
                    </div>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={() => { setDeletingId(workout._id); setTimeout(() => deleteWorkout(workout._id), 300); }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-rose-500/15 text-secondary hover:text-rose-400 transition-all duration-200 shrink-0 ml-2"
                    title="Delete workout"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Workout">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const newWorkout = {
            date: form.date,
            type: form.type,
            duration: Number(form.duration) || 0,
            calories: Number(form.calories) || 0,
            intensity: Number(form.intensity),
            notes: form.notes,
          };
          addWorkout(newWorkout);
          setForm({ type: 'Gym', date: new Date().toISOString().split('T')[0], duration: '', calories: '', intensity: 3, notes: '' });
          setIsModalOpen(false);
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Workout Type</label>
              <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/40 transition-all appearance-none cursor-pointer">
                <option value="Gym">Gym</option>
                <option value="Running">Running</option>
                <option value="Yoga">Yoga</option>
                <option value="Cycling">Cycling</option>
                <option value="Swimming">Swimming</option>
                <option value="Hiking">Hiking</option>
                <option value="Pilates">Pilates</option>
                <option value="Boxing">Boxing</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Calendar size={12}/> Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/40 transition-all cursor-pointer [color-scheme:dark]" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Duration (min)</label>
              <input type="number" value={form.duration} onChange={e => setForm(p => ({...p, duration: e.target.value}))} placeholder="45" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/40 transition-all placeholder:text-white/20" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Calories</label>
              <input type="number" value={form.calories} onChange={e => setForm(p => ({...p, calories: e.target.value}))} placeholder="300" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/40 transition-all placeholder:text-white/20" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex justify-between">
              <span>Intensity</span>
              <span className="text-violet-400">1 - 5</span>
            </label>
            <input type="range" min="1" max="5" value={form.intensity} onChange={e => setForm(p => ({...p, intensity: e.target.value}))} className="w-full accent-violet-500 cursor-pointer" />
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Notes</label>
            <input type="text" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="e.g. Leg day, felt strong" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/40 transition-all placeholder:text-white/20" />
          </div>

          <button type="submit" className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-violet-500 hover:bg-violet-400 text-white transition-colors">
            Save Workout
          </button>
        </form>
      </GlassModal>

    </div>
  );
}
