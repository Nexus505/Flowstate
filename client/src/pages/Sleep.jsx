import React, { useState, useEffect, useRef } from 'react';
import { defaultData } from '../utils/defaultData';
import { Moon, Star, Clock, AlertCircle, Plus, Info, ChevronRight, Calendar } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import GlassModal from '../components/GlassModal';
import { useData } from '../context/DataContext';

const AnimatedFloatCounter = ({ value, duration = 1500, decimals = 1 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / duration, 1);
      const easePercent = percent === 1 ? 1 : 1 - Math.pow(2, -10 * percent);
      setCount((easePercent * value).toFixed(decimals));

      if (percent < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, decimals]);

  return <>{count}</>;
};

/* ─── Main Sleep Page ────────────────────────────────────── */
export default function Sleep() {
  useTilt();
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r2 = useReveal(200);
  const r3 = useReveal(300);

  const { sleepData, addSleep } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], hours: '', quality: 4, notes: '' });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Compute Stats
  const avgSleep = (sleepData.reduce((acc, curr) => acc + curr.hours, 0) / sleepData.length).toFixed(1);
  const avgQuality = (sleepData.reduce((acc, curr) => acc + curr.quality, 0) / sleepData.length).toFixed(1);
  const totalDebt = sleepData.reduce((acc, curr) => acc + (8 - curr.hours), 0).toFixed(1);

  const past7 = sleepData.slice(0, 7).reverse();
  const past7Hours = past7.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);
  const past7Quality = (past7.reduce((acc, curr) => acc + curr.quality, 0) / past7.length).toFixed(1);



  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8">
      
      {/* ── Header ───────────────────────────────────────── */}
      <div ref={r0} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Moon className="text-cyan-400" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">
              Sleep Analytics
            </h1>
          </div>
          <p className="text-secondary text-sm max-w-md leading-relaxed mt-3">
            Track your circadian rhythms and optimise recovery phases. Consistent rest is the foundation of peak performance.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} /> Log Sleep
        </button>
      </div>

      {/* ── Stats Row ────────────────────────────────────── */}
      <div ref={r1} className="reveal grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 flex flex-col justify-center border border-cyan-500/20 group hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden"
             style={{ boxShadow: '0 0 6px rgba(34,211,238,0.15)' }}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)' }} />
          
          <div className="flex items-center gap-2 text-[10px] text-secondary uppercase tracking-widest font-mono mb-2 relative z-10">
            <Clock size={12} className="text-cyan-400" /> Avg Duration
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-4xl font-mono font-bold text-cyan-300 leading-none drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
               <AnimatedFloatCounter value={avgSleep} />
            </span>
            <span className="text-sm font-normal text-secondary font-mono">hrs/night</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center border border-violet-500/20 group hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden"
             style={{ boxShadow: '0 0 6px rgba(139,92,246,0.15)' }}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
          
          <div className="flex items-center gap-2 text-[10px] text-secondary uppercase tracking-widest font-mono mb-2 relative z-10">
            <Star size={12} className="text-violet-400" /> Avg Quality
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-4xl font-mono font-bold text-violet-300 leading-none drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
               <AnimatedFloatCounter value={avgQuality} />
            </span>
            <span className="text-sm font-normal text-secondary font-mono">/ 5.0</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center border border-rose-500/20 group hover:border-rose-500/30 transition-all duration-300 relative overflow-hidden"
             style={{ boxShadow: '0 0 6px rgba(244,63,94,0.15)' }}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)' }} />
          
          <div className="flex items-center gap-2 text-[10px] text-secondary uppercase tracking-widest font-mono mb-2 relative z-10">
            <AlertCircle size={12} className="text-rose-400" /> Sleep Debt
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-4xl font-mono font-bold text-rose-300 leading-none drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">
               <AnimatedFloatCounter value={totalDebt} />
            </span>
            <span className="text-sm font-normal text-secondary font-mono">hrs total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Main Chart Area ────────────────────────────── */}
        <div ref={r2} className="reveal glass-card p-6 lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm tracking-wide">
              Sleep History
            </h3>
            <span className="chip text-cyan-400 border-cyan-400/20 text-xs shadow-[0_0_10px_rgba(34,211,238,0.15)]">Past 7 Days</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-white/[0.08] transition-colors">
               <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-mono mb-1">Total Hours</p>
                  <p className="text-xl font-bold text-cyan-300 font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                     <AnimatedFloatCounter value={past7Hours} /> <span className="text-xs font-normal text-secondary">hrs</span>
                  </p>
               </div>
               <Clock className="text-cyan-500/50 group-hover:text-cyan-400 transition-colors" size={24} />
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-white/[0.08] transition-colors">
               <div>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-mono mb-1">Weekly Avg Quality</p>
                  <p className="text-xl font-bold text-violet-300 font-mono drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                     <AnimatedFloatCounter value={past7Quality} /> <span className="text-xs font-normal text-secondary">/ 5.0</span>
                  </p>
               </div>
               <Star className="text-violet-500/50 group-hover:text-violet-400 transition-colors" size={24} />
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 mt-auto">
            {past7.map((entry, idx) => {
              const maxVal = 10;
              const pct = (entry.hours / maxVal) * 100;
              const isGood = entry.quality >= 4;
              const isOk = entry.quality === 3;
              
              let colors = isGood ? ['#8b5cf6', '#6366f1'] : isOk ? ['#fbbf24', '#f59e0b'] : ['#fb7185', '#e11d48'];

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group relative cursor-help">
                  {/* Tooltip */}
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 pointer-events-none z-10 flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    <span className="text-white font-mono font-bold text-sm leading-none mb-1">{entry.hours}h</span>
                    <span className="text-[10px] font-mono whitespace-nowrap" style={{ color: colors[0] }}>Quality: {entry.quality}/5</span>
                  </div>

                  <div className="w-full relative rounded-t-xl overflow-hidden bg-white/5 h-[180px] flex items-end">
                    <div 
                      className="w-full rounded-t-xl transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative group-hover:brightness-125"
                      style={{ 
                        height: mounted ? `${pct}%` : '0%',
                        background: `linear-gradient(to top, ${colors[1]}, ${colors[0]})`,
                        transitionDelay: `${idx * 100}ms`
                      }}
                    >
                      {/* Glow element */}
                      <div className="absolute top-0 left-0 right-0 h-4 bg-white/30 blur-[4px] rounded-t-xl mix-blend-overlay"></div>
                    </div>
                  </div>
                  <span className="text-xs text-secondary font-mono">
                    {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Logs List ──────────────────────────────── */}
        <div ref={r3} className="reveal glass-card p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm tracking-wide">
              Recent Entries
            </h3>
          </div>
          
          <div className="divide-y divide-white/5 flex-1 overflow-y-auto pr-2 scrollbar-hide">
            {sleepData.slice(0, 5).map((entry, i) => (
              <div key={i} className="py-4 flex items-center justify-between group hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-secondary shrink-0">
                    {new Date(entry.date).getDate()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      {entry.hours} Hours
                      <span className="flex text-amber-400">
                        {Array.from({length: entry.quality}).map((_, j) => <Star key={j} size={10} className="fill-amber-400" />)}
                      </span>
                    </p>
                    {entry.notes && <p className="text-xs text-secondary mt-0.5 truncate">{entry.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Sleep">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          addSleep({ date: form.date, hours: Number(form.hours) || 0, quality: Number(form.quality), notes: form.notes });
          setForm({ date: new Date().toISOString().split('T')[0], hours: '', quality: 4, notes: '' });
          setIsModalOpen(false);
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Calendar size={12}/> Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/40 transition-all cursor-pointer [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={12}/> Hours Slept</label>
              <input type="number" step="0.1" value={form.hours} onChange={e => setForm(p => ({...p, hours: e.target.value}))} placeholder="7.5" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/40 transition-all placeholder:text-white/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex justify-between">
              <span>Quality</span>
              <span className="text-violet-400">1 - 5</span>
            </label>
            <input type="range" min="1" max="5" value={form.quality} onChange={e => setForm(p => ({...p, quality: e.target.value}))} className="w-full accent-violet-500 cursor-pointer mt-3" />
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Notes</label>
            <input type="text" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="e.g. Woke up feeling refreshed" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/40 transition-all placeholder:text-white/20" />
          </div>

          <button type="submit" className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-white transition-colors">
            Save Sleep
          </button>
        </form>
      </GlassModal>

    </div>
  );
}
