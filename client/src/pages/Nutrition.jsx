import React, { useState, useEffect } from 'react';
import { defaultData } from '../utils/defaultData';
import { Apple, Beef, Flame, Zap, Droplet, Plus, Calendar } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import GlassModal from '../components/GlassModal';
import { useData } from '../context/DataContext';

/* ── Small animated radial arc ────────────────────────────── */
const Arc = ({ pct, color1, color2, id, mounted }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="22" cy="22" r={r}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={mounted ? circ * (1 - pct / 100) : circ}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </svg>
  );
};

/* ── Animated fill bar ─────────────────────────────────────── */
const FillBar = ({ pct, gradient, mounted, delay = 0 }) => (
  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      style={{
        width: mounted ? `${pct}%` : '0%',
        background: gradient,
        transitionDelay: `${delay}ms`,
        boxShadow: `0 0 8px ${gradient.includes('fbbf24') ? 'rgba(251,191,36,0.4)' : gradient.includes('60a5fa') ? 'rgba(96,165,250,0.4)' : gradient.includes('34d399') ? 'rgba(52,211,153,0.4)' : 'rgba(251,113,133,0.4)'}`,
      }}
    />
  </div>
);

export default function Nutrition() {
  useTilt();
  const r0 = useReveal(0);
  const r1 = useReveal(80);
  const r2 = useReveal(160);
  const r3 = useReveal(240);

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', date: new Date().toISOString().split('T')[0], calories: '', protein: '', carbs: '', fat: '' });
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const { nutrition: nutritionData, addMeal } = useData();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = nutritionData.find(d => d.date === todayStr) || nutritionData[0] || { meals: [] };

  const dailyCalories = todayEntry.meals.reduce((a, m) => a + m.calories, 0);
  const dailyProtein  = todayEntry.meals.reduce((a, m) => a + m.protein,  0);
  const dailyCarbs    = todayEntry.meals.reduce((a, m) => a + m.carbs,    0);
  const dailyFat      = todayEntry.meals.reduce((a, m) => a + m.fat,      0);

  const goals = { calories: 2500, protein: 180, carbs: 250, fat: 80 };

  const pct = (v, max) => Math.min(Math.round((v / max) * 100), 100);

  const calPct     = pct(dailyCalories, goals.calories);
  const proteinPct = pct(dailyProtein,  goals.protein);
  const carbsPct   = pct(dailyCarbs,    goals.carbs);
  const fatPct     = pct(dailyFat,      goals.fat);

  const macros = [
    {
      label: 'Protein',
      value: dailyProtein,
      goal: goals.protein,
      unit: 'g',
      pct: proteinPct,
      icon: Beef,
      color1: '#60a5fa',
      color2: '#818cf8',
      glow: 'rgba(96,165,250,0.25)',
      text: 'text-blue-300',
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/5',
      gradient: 'linear-gradient(90deg,#60a5fa,#818cf8)',
      id: 'arc-protein',
    },
    {
      label: 'Carbs',
      value: dailyCarbs,
      goal: goals.carbs,
      unit: 'g',
      pct: carbsPct,
      icon: Zap,
      color1: '#34d399',
      color2: '#22d3ee',
      glow: 'rgba(52,211,153,0.25)',
      text: 'text-emerald-300',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      gradient: 'linear-gradient(90deg,#34d399,#22d3ee)',
      id: 'arc-carbs',
    },
    {
      label: 'Fats',
      value: dailyFat,
      goal: goals.fat,
      unit: 'g',
      pct: fatPct,
      icon: Droplet,
      color1: '#fb7185',
      color2: '#f97316',
      glow: 'rgba(251,113,133,0.25)',
      text: 'text-rose-300',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/5',
      gradient: 'linear-gradient(90deg,#fb7185,#f97316)',
      id: 'arc-fat',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div ref={r0} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Apple className="text-amber-400" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">
              Nutrition
            </h1>
          </div>
          <p className="text-secondary text-sm max-w-md leading-relaxed mt-3">
            Track your daily food intake and hit your macro targets.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} /> Log Meal
        </button>
      </div>

      {/* ── Calorie Hero ─────────────────────────────────────── */}
      <div ref={r1} className="reveal glass-card p-6 md:p-8 flex flex-col sm:flex-row items-center gap-8 md:gap-12">
        {/* Big Ring */}
        <div className="relative flex-shrink-0 w-44 h-44">

          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 relative z-10">
            <defs>
              <linearGradient id="cal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
            {/* Fill */}
            <circle cx="50" cy="50" r="44" fill="none"
              stroke="url(#cal-grad)" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={mounted ? (2 * Math.PI * 44) * (1 - calPct / 100) : 2 * Math.PI * 44}
              style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 z-20">
            <Flame size={18} className="text-amber-400" />
            <span className="font-mono font-bold text-3xl text-white leading-none">{dailyCalories}</span>
            <span className="text-[10px] text-secondary font-mono">/ {goals.calories} kcal</span>
            <span
              className="text-xs font-bold mt-1 font-mono"
              style={{ color: calPct >= 80 ? '#34d399' : '#fbbf24' }}
            >
              {calPct}%
            </span>
          </div>
        </div>

        {/* Right side summary */}
        <div className="flex-1 w-full space-y-5">
          <div>
            <div className="flex items-end justify-between mb-1">
              <p className="text-sm font-semibold text-white">Today's Progress</p>
              <span className="text-xs text-secondary font-mono">{goals.calories - dailyCalories} kcal remaining</span>
            </div>
            <FillBar pct={calPct} gradient="linear-gradient(90deg,#fbbf24,#fb7185)" mounted={mounted} />
          </div>

          {macros.map((m, i) => (
            <div key={m.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border border-white/8 bg-white/5 flex items-center justify-center flex-shrink-0">
                <m.icon size={15} className="text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold uppercase tracking-widest font-mono ${m.text}`}>{m.label}</span>
                  <span className="text-xs text-secondary font-mono">{m.value}g / {m.goal}g</span>
                </div>
                <FillBar pct={m.pct} gradient={m.gradient} mounted={mounted} delay={i * 100} />
              </div>
              <span className="text-xs font-bold font-mono w-8 text-right text-secondary">{m.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Macro Tiles ──────────────────────────────────────── */}
      <div ref={r2} className="reveal grid grid-cols-1 sm:grid-cols-3 gap-4">
        {macros.map((m) => (
          <div
            key={m.label}
            className={`glass-card p-5 flex items-center gap-5 border ${m.border} group hover:brightness-110 transition-all duration-300 relative overflow-hidden`}
            style={{ boxShadow: `0 0 6px ${m.glow}` }}
          >
            {/* Background glow blob */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle, ${m.glow} 0%, transparent 70%)` }} />

            {/* Arc */}
            <div className="w-14 h-14 flex-shrink-0 relative">
              <Arc pct={m.pct} color1={m.color1} color2={m.color2} id={`tile-${m.id}`} mounted={mounted} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[10px] font-bold font-mono ${m.text}`}>{m.pct}%</span>
              </div>
            </div>

            <div className="min-w-0 relative z-10">
              <p className="text-[10px] text-secondary uppercase tracking-widest font-mono mb-1 flex items-center gap-1.5">
                <m.icon size={10} className={m.text} /> {m.label}
              </p>
              <p className={`text-3xl font-bold font-mono leading-none ${m.text}`} style={{ textShadow: `0 0 16px ${m.glow}` }}>
                {m.value}<span className="text-base font-normal text-secondary/60 ml-0.5">g</span>
              </p>
              <p className="text-xs text-secondary font-mono mt-1">of {m.goal}g goal</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Today's Meal Log ─────────────────────────────────── */}
      <div ref={r3} className="reveal glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white text-sm tracking-wide flex items-center gap-2">
            Today's Meals
            <span className="chip text-amber-300 border-amber-400/20 text-[10px]">{todayEntry.meals.length} logged</span>
          </h3>
        </div>

        <div className="space-y-4">
          {todayEntry.meals.map((meal, i) => {
            const mealTotal = meal.protein + meal.carbs + meal.fat;
            return (
              <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 hover:border-white/10 hover:bg-white/[0.035] transition-all duration-200 group">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                      <Apple size={16} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{meal.name}</p>
                      <p className="text-[11px] text-secondary font-mono mt-0.5">{meal.calories} kcal total</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 font-mono bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg flex-shrink-0">
                    {meal.calories} kcal
                  </span>
                </div>

                {/* Macro breakdown bars */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Protein', value: meal.protein, pct: mealTotal > 0 ? Math.round((meal.protein/mealTotal)*100) : 0, grad: 'linear-gradient(90deg,#60a5fa,#818cf8)', text: 'text-blue-300' },
                    { label: 'Carbs',   value: meal.carbs,   pct: mealTotal > 0 ? Math.round((meal.carbs/mealTotal)*100)   : 0, grad: 'linear-gradient(90deg,#34d399,#22d3ee)', text: 'text-emerald-300' },
                    { label: 'Fats',    value: meal.fat,     pct: mealTotal > 0 ? Math.round((meal.fat/mealTotal)*100)     : 0, grad: 'linear-gradient(90deg,#fb7185,#f97316)', text: 'text-rose-300' },
                  ].map((macro) => (
                    <div key={macro.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${macro.text}`}>{macro.label}</span>
                        <span className="text-[10px] text-secondary font-mono">{macro.value}g</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: mounted ? `${macro.pct}%` : '0%',
                            background: macro.grad,
                            transitionDelay: `${i * 200 + 400}ms`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Meal">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          addMeal({ name: form.name, calories: Number(form.calories)||0, protein: Number(form.protein)||0, carbs: Number(form.carbs)||0, fat: Number(form.fat)||0 });
          setForm({ name: '', date: new Date().toISOString().split('T')[0], calories: '', protein: '', carbs: '', fat: '' });
          setIsModalOpen(false);
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Meal Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Chicken & Rice" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/40 transition-all placeholder:text-white/20" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Calendar size={12}/> Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/40 transition-all cursor-pointer [color-scheme:dark]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Flame size={12}/> Calories</label>
              <input type="number" value={form.calories} onChange={e => setForm(p=>({...p,calories:e.target.value}))} placeholder="500" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/40 transition-all placeholder:text-white/20" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Beef size={12}/> Protein (g)</label>
              <input type="number" value={form.protein} onChange={e => setForm(p=>({...p,protein:e.target.value}))} placeholder="45" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/40 transition-all placeholder:text-white/20" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Zap size={12}/> Carbs (g)</label>
              <input type="number" value={form.carbs} onChange={e => setForm(p=>({...p,carbs:e.target.value}))} placeholder="50" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/40 transition-all placeholder:text-white/20" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Droplet size={12}/> Fats (g)</label>
              <input type="number" value={form.fat} onChange={e => setForm(p=>({...p,fat:e.target.value}))} placeholder="15" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-rose-500/40 transition-all placeholder:text-white/20" />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-white transition-colors">
            Save Meal
          </button>
        </form>
      </GlassModal>

    </div>
  );
}
