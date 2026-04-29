import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Flame, BedDouble, ListChecks, Dumbbell,
  Wallet, BrainCircuit, Radio, ArrowUpRight,
  CalendarDays, Droplets, Plus, Minus,
} from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import { useData } from '../context/DataContext';
import { DashboardSkeleton } from '../components/SkeletonLoader';

/* ─── Animated SVG Ring (multi-colour gradient stroke) ── */
const GradientRing = ({ value, max, gradId, colors, label, icon: Icon, unit = '' }) => {
  const [progress, setProgress] = useState(0);
  const size = 110;
  const sw = 13;
  const r = (size - sw) / 2;
  const circ = r * 2 * Math.PI;

  useEffect(() => {
    const t = setTimeout(() => setProgress((value / max) * 100), 120);
    return () => clearTimeout(t);
  }, [value, max]);

  const offset = circ - (progress / 100) * circ;
  const pct = Math.round((value / max) * 100);
  // evenly distribute stops
  const stops = colors.map((c, i) => ({
    offset: `${Math.round((i / (colors.length - 1)) * 100)}%`,
    color: c,
  }));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Gradient def */}
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              {stops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
            <filter id={`${gradId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
            </filter>
          </defs>
        </svg>

        {/* Background track */}
        <svg className="-rotate-90 absolute inset-0" width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r}
            stroke="rgba(255,255,255,0.06)" strokeWidth={sw} fill="none" />
        </svg>

        {/* Glow ring */}

        {/* Main ring */}
        <svg className="-rotate-90 absolute inset-0" width={size} height={size} style={{ overflow: 'visible' }}>
          <circle cx={size/2} cy={size/2} r={r}
            stroke={`url(#${gradId})`} strokeWidth={sw} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </svg>

        {/* Centre content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-1.5">
          <Icon size={16} style={{ color: colors[0] }} />
          <span className="font-mono font-bold text-base leading-none text-white">
            {value}{unit}
          </span>
        </div>
      </div>
      <span className="text-xs text-secondary font-medium tracking-widest uppercase text-center">
        {label}
      </span>
    </div>
  );
};

/* ─── Sleep bar chart with animated bars ─────────────── */
const SleepBars = ({ data }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 300); return () => clearTimeout(t); }, []);
  const maxVal = 10;
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <div className="flex items-end justify-between h-28 gap-1.5 mt-4">
      {data.map((d, i) => {
        const pct = (d.hours / maxVal) * 100;
        const color = d.hours >= 7 ? '#34d399' : d.hours >= 5 ? '#fbbf24' : '#fb7185';
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
            <div className="relative w-full rounded-xl overflow-hidden bg-white/5" style={{ height: '80px' }}>
              <div
                className="absolute bottom-0 w-full rounded-xl transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  height: mounted ? `${pct}%` : '0%',
                  background: `linear-gradient(to top, ${color}cc, ${color}55)`,
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            </div>
            <span className="text-[10px] text-secondary font-mono">
              {days[i % 7]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Animated donut (expense) ───────────────────────── */
const AnimatedDonut = ({ segments }) => {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 400); return () => clearTimeout(t); }, []);

  const cx = 50, cy = 50, r = 38, sw = 10;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <defs>
        {segments.map((s, i) => (
          <linearGradient key={i} id={`donut-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={s.color1} />
            <stop offset="100%" stopColor={s.color2} />
          </linearGradient>
        ))}
      </defs>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
      {/* Segments */}
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const gap  = circ - dash;
        const off  = -cumPct / 100 * circ;
        cumPct += seg.pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none"
            stroke={`url(#donut-grad-${i})`}
            strokeWidth={sw}
            strokeDasharray={`${drawn ? dash : 0} ${gap}`}
            strokeDashoffset={off}
            strokeLinecap="round"
            style={{ transition: `stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i * 200}ms` }}
          />
        );
      })}
    </svg>
  );
};

/* ─── Heatmap cell ───────────────────────────────────── */
const HeatCell = ({ active, delay }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className="w-[18px] h-[18px] rounded-[5px] transition-all duration-500"
      style={{
        background: active
          ? 'linear-gradient(135deg, rgba(52,211,153,0.6), rgba(34,211,238,0.4))'
          : 'rgba(255,255,255,0.04)',
        border: active ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.06)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.5)',
        boxShadow: 'none',
        transitionDelay: `${delay}ms`,
      }}
    />
  );
};

/* ─── Water counter card ─────────────────────────────────── */
const WaterCard = () => {
  const TODAY = new Date().toISOString().split('T')[0];

  const [glasses, setGlasses] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('fs_water'));
      if (stored?.date === TODAY) return stored.count;
    } catch {}
    return 0;
  });

  const goal = 8;
  const fillPct = Math.round((glasses / goal) * 100);

  const updateGlasses = (val) => {
    setGlasses(val);
    localStorage.setItem('fs_water', JSON.stringify({ date: TODAY, count: val }));
  };

  const add    = () => updateGlasses(Math.min(glasses + 1, goal));
  const remove = () => updateGlasses(Math.max(glasses - 1, 0));

  /* ── Canvas water animation ── */
  const canvasRef    = useRef(null);
  const animRef      = useRef(null);
  const phaseRef     = useRef(0);
  const fillRef      = useRef(glasses / goal);   // current animated fill (0-1)
  const targetRef    = useRef(glasses / goal);   // target fill

  /* Update target whenever glasses changes */
  useEffect(() => { targetRef.current = glasses / goal; }, [glasses]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawWave = (W, H, fillY, phase, amp, color) => {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 1) {
        const y = fillY
          + amp * Math.sin((x / W) * Math.PI * 4 + phase)
          + amp * 0.4 * Math.sin((x / W) * Math.PI * 7 + phase * 1.3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const tick = () => {
      /* Smooth lerp fill level */
      fillRef.current += (targetRef.current - fillRef.current) * 0.04;

      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      ctx.clearRect(0, 0, W, H);

      const fillY = H * (1 - fillRef.current);
      phaseRef.current += 0.007;

      /* Wave 2 — back, slower */
      drawWave(W, H, fillY + 6, phaseRef.current * 0.65, 9,
        'rgba(34,211,238,0.14)');

      /* Wave 1 — front */
      const grad = ctx.createLinearGradient(0, fillY, 0, H);
      grad.addColorStop(0,   'rgba(34,211,238,0.38)');
      grad.addColorStop(0.3, 'rgba(56,189,248,0.24)');
      grad.addColorStop(1,   'rgba(99,102,241,0.16)');

      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 1) {
        const y = fillY
          + 11 * Math.sin((x / W) * Math.PI * 4 + phaseRef.current)
          + 4  * Math.sin((x / W) * Math.PI * 9 + phaseRef.current * 1.7);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      animRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="glass-card card-cyan relative overflow-hidden" style={{ minHeight: '240px' }}>

      {/* Canvas water background */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Content overlay */}
      <div className="relative z-10 p-6 flex flex-col h-full gap-4" style={{ minHeight: '240px' }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={17} className="text-cyan" />
            <h3 className="font-semibold text-white text-sm tracking-wide">Water Intake</h3>
          </div>
          <span className="chip text-cyan border-cyan/20 text-[10px] font-mono">{fillPct}%</span>
        </div>

        {/* Count */}
        <div className="flex items-end gap-2 mt-auto">
          <span className="font-mono font-bold text-5xl text-white leading-none">{glasses}</span>
          <span className="font-mono text-secondary text-base mb-1">/ {goal}</span>
          <span className="text-secondary text-xs mb-1.5 ml-0.5">glasses</span>
        </div>

        {/* Segment bar */}
        <div className="flex gap-1.5">
          {Array.from({ length: goal }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: i < glasses
                  ? 'linear-gradient(90deg, #22d3ee, #6366f1)'
                  : 'rgba(255,255,255,0.1)',
                transitionDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={remove}
            disabled={glasses === 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 transition-colors cursor-pointer flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Minus size={15} />
          </button>
          <button
            onClick={add}
            disabled={glasses === goal}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 transition-colors cursor-pointer flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Plus size={15} />
          </button>
        </div>

      </div>
    </div>
  );
};

/* ─── Main Dashboard ─────────────────────────────────── */
export default function Dashboard() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  /* ── Card 3D tilt + cursor spotlight ─────────────────── */
  useTilt();

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());

  /* Reveal refs */
  const r0 = useReveal(0);
  const r1 = useReveal(80);
  const r2 = useReveal(160);
  const r3 = useReveal(220);
  const r4 = useReveal(280);
  const r5 = useReveal(340);
  const r6 = useReveal(400);

  const { sleepData, workouts, expenses, habits, loading } = useData();

  if (loading) return <DashboardSkeleton />;

  const todayStr = new Date().toISOString().split('T')[0];

  // Sleep: most recent entry
  const latestSleep = sleepData[0];
  const sleepHours  = latestSleep?.hours ?? 0;
  const sleepGoal   = 8;

  // Workouts this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const workoutsThisWeek = workouts.filter(w => new Date(w.date) >= startOfWeek).length;
  const workoutGoal = 5;

  // Expenses: today's spend
  const todaySpend = expenses
    .filter(e => {
      const d = new Date(e.date).toISOString().split('T')[0];
      return d === todayStr && e.type === 'expense';
    })
    .reduce((a, c) => a + c.amount, 0);
  const spendGoal = 200;

  // Habits: completed today
  const habitsToday = habits.filter(h => h.completedDates?.includes(todayStr)).length;
  const habitsTotal = Math.max(habits.length, 1);

  /* Donut segments */
  const catColors = {
    Food:          { c1: '#22d3ee', c2: '#6366f1' },
    Transport:     { c1: '#8b5cf6', c2: '#e879f9' },
    Housing:       { c1: '#34d399', c2: '#22d3ee' },
    Entertainment: { c1: '#fbbf24', c2: '#f97316' },
    Software:      { c1: '#f472b6', c2: '#fb7185' },
    Other:         { c1: '#94a3b8', c2: '#64748b' },
  };
  const expList = expenses.filter(e => e.type === 'expense');
  const catSumsRaw = expList.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const totalExp = Object.values(catSumsRaw).reduce((a, b) => a + b, 0) || 1;
  const expenseSegs = Object.entries(catSumsRaw).map(([cat, amt]) => ({
    pct:    Math.round((amt / totalExp) * 100),
    color1: (catColors[cat] || catColors.Other).c1,
    color2: (catColors[cat] || catColors.Other).c2,
    label:  cat,
    value:  `$${amt.toFixed(0)}`,
  }));

  const heatData = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    const ds = d.toISOString().split('T')[0];
    return { active: workouts.some(w => new Date(w.date).toISOString().split('T')[0] === ds), delay: i * 25 };
  });

  // Consistency map stats
  const bestStreak    = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  const todayDoneCount = habits.filter(h => h.completedDates?.includes(todayStr)).length;
  const completionPct  = habits.length > 0 ? Math.round((todayDoneCount / habits.length) * 100) : 0;
  const bestHabit      = habits.length > 0
    ? habits.reduce((best, h) => (h.streak || 0) > (best.streak || 0) ? h : best, habits[0])
    : null;

  // Total expense amount for donut center
  const totalExpenseAmt = expenses
    .filter(e => e.type === 'expense')
    .reduce((a, c) => a + c.amount, 0);

  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8">

      {/* ── Header ───────────────────────────────────────── */}
      <div ref={r0} className="reveal">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-secondary font-medium tracking-widest uppercase mb-2">{today}</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">
              {greeting}
            </h1>
            <p className="mt-3 text-secondary text-sm max-w-md leading-relaxed">
              {bestStreak > 0
                ? <>Your biometrics look solid. You're on a{' '}<span className="text-emerald font-semibold">{bestStreak}-day streak</span> — keep the momentum going.</>
                : 'Log your first entry to start building your streak.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Ring Stat Row ─────────────────────────────────── */}
      <div ref={r1} className="reveal grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="glass-card card-cyan p-6 flex flex-col items-center justify-center">
          <GradientRing value={sleepHours} max={sleepGoal}     gradId="g-sleep"   colors={['#22d3ee','#818cf8','#a78bfa']} label="Sleep"    icon={BedDouble}  unit="h" />
        </div>
        <div className="glass-card card-violet p-6 flex flex-col items-center justify-center">
          <GradientRing value={workoutsThisWeek} max={workoutGoal} gradId="g-workout" colors={['#c084fc','#f472b6','#fb7185']} label="Workouts" icon={Dumbbell}   unit="" />
        </div>
        <div className="glass-card card-amber p-6 flex flex-col items-center justify-center">
          <GradientRing value={Math.round(todaySpend)} max={spendGoal}  gradId="g-spend"   colors={['#fbbf24','#f97316','#fb7185']} label="Spend"    icon={Wallet}     unit="" />
        </div>
        <div className="glass-card card-emerald p-6 flex flex-col items-center justify-center">
          <GradientRing value={habitsToday} max={habitsTotal}   gradId="g-habits"  colors={['#34d399','#22d3ee','#818cf8']} label="Habits"   icon={ListChecks} unit="" />
        </div>
      </div>

      {/* ── Row 2: Sleep Trend · Consistency Map · Water ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Sleep Trend */}
        <div ref={r2} className="reveal glass-card card-cyan p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm tracking-wide">
              <BedDouble size={16} className="text-cyan" /> Sleep Trend
            </h3>
            <span className="chip text-cyan border-cyan/20 text-[10px]">
              Avg {sleepData.length > 0 ? (sleepData.slice(0,7).reduce((a,s) => a + s.hours, 0) / Math.min(sleepData.length,7)).toFixed(1) : 0}h
            </span>
          </div>
          <p className="text-xs text-secondary mb-1 font-mono">Last 7 Days</p>
          <SleepBars data={[...sleepData].slice(0, 7).reverse()} />
        </div>

        {/* Consistency Heatmap */}
        <div ref={r3} className="reveal glass-card card-emerald p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <CalendarDays size={16} className="text-emerald" /> Consistency Map
            </h3>
            <span className="chip text-emerald border-emerald/20 text-[10px]">Last 35 days</span>
          </div>
          <p className="text-xs text-secondary mb-4 font-mono">Activity vector</p>

          <div className="flex gap-3">
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }).map((_, col) => (
                <div key={col} className="flex flex-col gap-1.5">
                  {Array.from({ length: 5 }).map((_, row) => {
                    const idx = col * 5 + row;
                    const cell = heatData[idx] || { active: false, delay: 0 };
                    return <HeatCell key={row} active={cell.active} delay={cell.delay} />;
                  })}
                </div>
              ))}
            </div>
            <div className="ml-2 flex flex-col justify-between py-0.5">
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-widest font-mono mb-1">Streak</p>
                <p className="text-2xl font-bold text-white font-mono flex items-center gap-1.5 leading-none">
                  {bestStreak} <Flame size={16} className="text-amber icon-flicker" />
                </p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-widest font-mono mb-1">Done</p>
                <p className="text-2xl font-bold font-mono leading-none text-gradient-emerald">{completionPct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-widest font-mono mb-1">Best</p>
                <div className="flex items-center gap-1">
                  <Droplets size={12} className="text-cyan icon-bob" />
                  <p className="text-xs font-medium text-white">{bestHabit ? bestHabit.name : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Water Intake */}
        <div ref={r4} className="reveal">
          <WaterCard />
        </div>

      </div>

      {/* ── Row 3: Monthly Spend · AI Insight ────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Spend Donut */}
        <div ref={r5} className="reveal glass-card p-6"
          style={{ '--card-gradient': 'radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.10) 0%, rgba(139,92,246,0.04) 50%, transparent 70%)', '--card-border-hover': 'rgba(99,102,241,0.3)' }}>
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm tracking-wide mb-5">
            <Wallet size={16} className="text-indigo-400" /> Monthly Spend
          </h3>

          <div className="relative w-36 h-36 mx-auto mb-5">
            <AnimatedDonut segments={expenseSegs} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-xl text-white">
                {totalExpenseAmt >= 1000 ? `$${(totalExpenseAmt/1000).toFixed(1)}k` : `$${totalExpenseAmt.toFixed(0)}`}
              </span>
              <span className="text-[10px] text-secondary font-mono">this month</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {expenseSegs.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${s.color1}, ${s.color2})` }} />
                  <span className="text-secondary">{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white/60">{s.pct}%</span>
                  <span className="font-mono font-medium text-white">{s.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div ref={r6} className="reveal glass-card card-violet p-6 md:col-span-2 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}>
              <BrainCircuit className="text-violet icon-pulse" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">AI Synthesis</h3>
              <p className="text-[11px] text-secondary font-mono">Gemini-2.0-Flash · Just now</p>
            </div>
            <div className="ml-auto chip text-violet border-violet/20 text-[10px]">
              <Radio size={10} className="icon-pulse" style={{ animationDuration: '1s' }} /> Live
            </div>
          </div>

          {expenses.length === 0 && workouts.length === 0 ? (
            <p className="text-[15px] text-white/60 leading-[1.75] font-light mb-5 italic">
              "Log your first workout, sleep, and habits to unlock AI-powered insights personalised to your data."
            </p>
          ) : (
            <p className="text-[15px] text-white/80 leading[1.75] font-light mb-5 italic">
              "Head to <span className='text-cyan font-semibold not-italic'>AI Insights</span> to run a full cross-module analysis powered by Gemini."
            </p>
          )}

          <div className="flex items-center gap-3">
            <button className="btn-magnetic px-4 py-2 rounded-xl text-sm font-medium" onClick={() => window.location.href='/app/workouts'}>
              Log Workout
            </button>
            <button className="text-xs text-secondary hover:text-white transition-colors flex items-center gap-1 cursor-pointer" onClick={() => window.location.href='/app/ai'}>
              Full Analysis <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
