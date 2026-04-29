import React, { useState, useEffect } from 'react';
import { defaultData } from '../utils/defaultData';
import { CheckCircle2, Circle, Flame, Target, Plus, TrendingUp, Droplets, Brain, BookOpen, Calendar } from 'lucide-react';

const iconMap = {
  "Droplets": Droplets,
  "Brain": Brain,
  "BookOpen": BookOpen
};
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import GlassModal from '../components/GlassModal';
import { useData } from '../context/DataContext';

/* ─── Helpers ─────────────────────────────────────────────── */
const AnimatedCounter = ({ value, duration = 1200 }) => {
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

/* ── Ring SVG ─────────────────────────────────────────────── */
const Ring = ({ pct, size = 160, stroke = 14, color1 = '#34d399', color2 = '#10b981', id = 'habits-ring', mounted }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (mounted ? pct / 100 : 0) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color1} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={`url(#${id})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${color1}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono text-emerald-400 leading-none drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
          <AnimatedCounter value={pct} />%
        </span>
        <span className="text-[10px] text-secondary font-mono uppercase tracking-widest mt-1">score</span>
      </div>
    </div>
  );
};

/* ── Main Component ───────────────────────────────────────── */
export default function Habits() {
  useTilt();
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r2 = useReveal(200);

  const { habits, toggleHabit } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t); }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  /* Stats calculation */
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const consistencyScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const maxStreak = Math.max(...habits.map(h => h.streak), 0);

  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8">
      
      {/* ── Header ───────────────────────────────────────── */}
      <div ref={r0} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Target className="text-emerald-400" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">
              Habits
            </h1>
          </div>
          <p className="text-secondary text-sm max-w-md leading-relaxed mt-3">
            Build consistency and execute routines. Success is the sum of small efforts repeated day in and day out.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* ── Hero Stats ─────────────────────────────────── */}
      <div ref={r1} className="reveal glass-card p-6 md:p-8 flex flex-col md:flex-row gap-8 border border-emerald-500/10"
           style={{ boxShadow: '0 0 30px rgba(52,211,153,0.05)' }}>
        
        {/* Daily Score Ring */}
        <div className="flex flex-col items-center justify-center gap-4 md:w-56 shrink-0">
          <Ring pct={consistencyScore} mounted={mounted} />
          <div className="text-center">
            <p className="text-xs font-semibold text-white">Daily Consistency</p>
            <p className="text-[10px] text-secondary font-mono mt-0.5">{completedToday} of {totalHabits} habits done</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/5 self-stretch" />
        <div className="block md:hidden h-px bg-white/5 w-full" />

        {/* Top Habits / Stats */}
        <div className="flex-1 grid grid-cols-2 gap-4 content-center">
          <div className="bg-white/[0.02] border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: `radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)` }} />
            <div className="relative z-10">
              <p className="text-[10px] text-secondary uppercase tracking-widest font-mono mb-1">Max Streak</p>
              <p className="text-3xl font-bold font-mono text-emerald-300 leading-none drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                <AnimatedCounter value={maxStreak} /> <span className="text-xs font-normal text-secondary">days</span>
              </p>
            </div>
            <Flame className="text-emerald-500/20 group-hover:text-emerald-400 transition-colors shrink-0" size={28} />
          </div>

          <div className="bg-white/[0.02] border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: `radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)` }} />
            <div className="relative z-10">
              <p className="text-[10px] text-secondary uppercase tracking-widest font-mono mb-1">Total Active</p>
              <p className="text-3xl font-bold font-mono text-cyan-300 leading-none drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                <AnimatedCounter value={totalHabits} /> <span className="text-xs font-normal text-secondary">habits</span>
              </p>
            </div>
            <TrendingUp className="text-cyan-500/20 group-hover:text-cyan-400 transition-colors shrink-0" size={28} />
          </div>
        </div>
      </div>

      {/* ── Habits List ────────────────────────────────── */}
      <div ref={r2} className="reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {habits.map((habit) => {
          const doneToday = habit.completedDates.includes(todayStr);
          const IconComponent = iconMap[habit.icon] || Target;
          return (
            <div 
              key={habit.id} 
              className={`group relative overflow-hidden glass-card p-6 flex flex-col gap-6 cursor-pointer transition-all duration-300 bg-white/[0.02]`}
              style={{
                borderColor: doneToday ? habit.color + '55' : 'rgba(255,255,255,0.05)',
                boxShadow: doneToday ? `0 0 20px ${habit.color}15` : 'none',
              }}
              onClick={() => toggleHabit(habit.id)}
            >
              {/* Radial glow background */}
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                   style={{ background: `radial-gradient(circle, ${habit.color}15 0%, transparent 70%)` }} />
                   
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" 
                       style={{ color: habit.color, backgroundColor: `${habit.color}15`, border: `1px solid ${habit.color}40`, boxShadow: `0 0 10px ${habit.color}20` }}>
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{habit.name}</h3>
                    <p className="text-[10px] font-mono flex items-center gap-1.5 uppercase tracking-widest"
                       style={{ color: habit.streak > 0 ? habit.color : '#9ca3af' }}>
                      <Flame size={12} />
                      {habit.streak} Day Streak
                    </p>
                  </div>
                </div>
                <div className={`transition-all duration-300 mt-2 ${doneToday ? 'scale-110' : 'text-white/20'}`}
                     style={{ color: doneToday ? habit.color : undefined, filter: doneToday ? `drop-shadow(0 0 6px ${habit.color}88)` : 'none' }}>
                  {doneToday ? <CheckCircle2 size={30} className="fill-white/10" /> : <Circle size={30} />}
                </div>
              </div>
              
              <div className="flex gap-2 relative z-10">
                {/* Current week (M T W T F S S) */}
                {Array.from({ length: 7 }).map((_, i) => {
                  const todayObj = new Date();
                  const dayOfWeek = todayObj.getDay();
                  // Calculate distance to Monday (0 for Monday, -1 for Tuesday, ..., -6 for Sunday if we go backwards)
                  // Wait, if today is Tuesday (2), diff to Monday is -1.
                  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                  const d = new Date(todayObj);
                  d.setDate(todayObj.getDate() + diffToMonday + i);
                  
                  const dateStr = d.toISOString().split('T')[0];
                  const done = habit.completedDates.includes(dateStr);
                  // Ensure label is strictly M, T, W, T, F, S, S regardless of locale
                  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full h-1.5 rounded-full transition-all duration-500"
                           style={{ 
                             backgroundColor: done ? habit.color : 'rgba(255,255,255,0.05)',
                             boxShadow: done ? `0 0 5px ${habit.color}aa` : 'none'
                           }} />
                      <span className="text-[10px] text-secondary font-mono">
                        {labels[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Habit">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Habit Name</label>
              <input type="text" placeholder="e.g. Read 10 Pages" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/40 transition-all placeholder:text-white/20" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Calendar size={12}/> Start Date</label>
              <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/40 transition-all cursor-pointer [color-scheme:dark]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Frequency</label>
              <select className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/40 transition-all appearance-none cursor-pointer">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="weekdays">Weekdays Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Color Theme</label>
              <div className="flex gap-2 mt-2">
                {['#34d399', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'].map(c => (
                   <div key={c} className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}40` }} />
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white transition-colors">
            Create Habit
          </button>
        </form>
      </GlassModal>
    </div>
  );
}
