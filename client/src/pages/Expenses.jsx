import React, { useState, useEffect } from 'react';
import { defaultData } from '../utils/defaultData';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, ArrowUpRight, ArrowDownRight, Activity, Calendar } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import GlassModal from '../components/GlassModal';
import { useData } from '../context/DataContext';

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

const AnimatedFloat = ({ value, duration = 1400 }) => {
  const [count, setCount] = useState('0.00');
  useEffect(() => {
    let start = null, raf;
    const go = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount((e * value).toFixed(2));
      if (p < 1) raf = requestAnimationFrame(go);
    };
    raf = requestAnimationFrame(go);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{count}</>;
};

/* ── Animated Donut ───────────────────────────────────────── */
const AnimatedDonut = ({ segments }) => {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 300); return () => clearTimeout(t); }, []);

  const cx = 50, cy = 50, r = 40, sw = 10;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      <defs>
        {segments.map((s, i) => (
          <linearGradient key={i} id={`exp-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={s.color1} />
            <stop offset="100%" stopColor={s.color2} />
          </linearGradient>
        ))}
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const gap  = circ - dash;
        const off  = -cumPct / 100 * circ;
        cumPct += seg.pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={`url(#exp-grad-${i})`} strokeWidth={sw}
            strokeDasharray={`${drawn ? dash : 0} ${gap}`} strokeDashoffset={off} strokeLinecap="round"
            style={{ transition: `stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i * 150}ms`, filter: `drop-shadow(0 0 4px ${seg.color1}88)` }}
          />
        );
      })}
    </svg>
  );
};

/* ── Main Page ────────────────────────────────────────────── */
export default function Expenses() {
  useTilt();
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r2 = useReveal(200);
  const r3 = useReveal(300);

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'expense', amount: '', date: new Date().toISOString().split('T')[0], category: 'Food', description: '' });
  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t); }, []);

  const { expenses: expensesData, addExpense } = useData();
  
  const totalIncome  = expensesData.filter(e => e.type === 'income').reduce((a, c) => a + c.amount, 0);
  const totalExpense = expensesData.filter(e => e.type === 'expense').reduce((a, c) => a + c.amount, 0);
  const netCashflow  = totalIncome - totalExpense;

  // Aggregate expenses by category for Donut
  const expList = expensesData.filter(e => e.type === 'expense');
  const catSums = expList.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  
  const colors = [
    { c1: '#22d3ee', c2: '#3b82f6', glow: 'rgba(34,211,238,0.3)' }, // Cyan/Blue
    { c1: '#8b5cf6', c2: '#d946ef', glow: 'rgba(139,92,246,0.3)' }, // Violet/Fuchsia
    { c1: '#f59e0b', c2: '#ef4444', glow: 'rgba(245,158,11,0.3)' }, // Amber/Red
    { c1: '#10b981', c2: '#059669', glow: 'rgba(16,185,129,0.3)' }, // Emerald
  ];

  const expenseSegs = Object.entries(catSums)
    .sort((a,b) => b[1] - a[1]) // Sort largest first
    .map(([cat, amt], i) => {
      const pct = (amt / totalExpense) * 100;
      const c = colors[i % colors.length];
      return { pct, color1: c.c1, color2: c.c2, glow: c.glow, label: cat, value: amt };
  });

  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8">
      
      {/* ── Header ───────────────────────────────────────── */}
      <div ref={r0} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Wallet className="text-indigo-400" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">
              Expenses
            </h1>
          </div>
          <p className="text-secondary text-sm max-w-md leading-relaxed mt-3">
            Track capital allocation and manage your cash flow to build sustainable financial systems.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* ── Top Stat Cards ───────────────────────────────── */}
      <div ref={r1} className="reveal grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Income',       value: totalIncome,  icon: TrendingUp,   color: 'text-emerald-300', glow: 'rgba(52,211,153,0.3)', border: 'border-emerald-500/20', bg: 'rgba(52,211,153,0.15)', sign: '+' },
          { label: 'Expenses',     value: totalExpense, icon: TrendingDown, color: 'text-rose-300',    glow: 'rgba(244,63,94,0.3)',  border: 'border-rose-500/20',    bg: 'rgba(244,63,94,0.15)',  sign: '-' },
          { label: 'Net Cashflow', value: netCashflow,  icon: DollarSign,   color: 'text-cyan-300',    glow: 'rgba(34,211,238,0.3)', border: 'border-cyan-500/20',    bg: 'rgba(34,211,238,0.15)', sign: netCashflow > 0 ? '+' : '' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`glass-card p-6 flex flex-col justify-center border ${s.border} group hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden`}
                 style={{ boxShadow: `0 0 6px ${s.bg}` }}>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ background: `radial-gradient(circle, ${s.bg} 0%, transparent 70%)` }} />
              
              <div className="flex items-center gap-2 text-[10px] text-secondary uppercase tracking-widest font-mono mb-2 relative z-10">
                <Icon size={14} className={s.color} /> {s.label}
              </div>
              <div className="flex items-baseline gap-1 relative z-10">
                <span className={`text-4xl font-mono font-bold ${s.color} leading-none`} style={{ textShadow: `0 0 10px ${s.glow}` }}>
                  {s.sign}$<AnimatedFloat value={Math.abs(s.value)} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Allocation Donut ───────────────────────────── */}
        <div ref={r2} className="reveal glass-card p-6 md:p-8 lg:col-span-1 flex flex-col items-center">
          <h3 className="font-semibold text-white w-full flex items-center justify-between gap-2 text-sm tracking-wide mb-6">
            <span className="flex items-center gap-2"><Activity size={16} className="text-indigo-400"/> Allocation</span>
            <span className="chip text-indigo-300 border-indigo-400/20 text-[10px]">This Month</span>
          </h3>

          <div className="relative w-48 h-48 mx-auto mb-8">
            <AnimatedDonut segments={expenseSegs} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                $<AnimatedFloat value={totalExpense} />
              </span>
              <span className="text-[10px] text-secondary font-mono uppercase tracking-widest mt-1">Total Spent</span>
            </div>
          </div>

          <div className="space-y-4 w-full">
            {expenseSegs.map((s, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: `linear-gradient(135deg, ${s.color1}, ${s.color2})`, boxShadow: `0 0 4px ${s.color1}aa` }} />
                    <span className="text-xs font-medium text-white">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-secondary font-mono">{s.pct.toFixed(1)}%</span>
                    <span className="font-mono font-medium text-white text-xs">${s.value.toFixed(2)}</span>
                  </div>
                </div>
                {/* Category bar */}
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                       style={{ width: mounted ? `${s.pct}%` : '0%', background: `linear-gradient(to right, ${s.color1}, ${s.color2})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Transaction List ───────────────────────────── */}
        <div className="glass-card p-6 reveal lg:col-span-2 flex flex-col" ref={r3}>
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm tracking-wide">
                Recent Transactions
              </h3>
              <span className="text-xs text-secondary font-mono bg-white/5 px-2 py-1 rounded-md border border-white/10">
                {expensesData.length} total
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {expensesData.map((txn, i) => {
                const isIncome = txn.type === 'income';
                
                // Find category color if it's an expense
                let bgGradient = 'linear-gradient(to right, #10b98166, #059669)'; // Emerald for income
                let iconColor = 'text-emerald-400';
                let accentColor = '#10b981';
                
                if (!isIncome) {
                  const seg = expenseSegs.find(s => s.label === txn.category);
                  if (seg) {
                    bgGradient = `linear-gradient(to right, ${seg.color1}44, ${seg.color2}aa)`;
                    iconColor = `text-white`;
                    accentColor = seg.color1;
                  } else {
                    bgGradient = 'linear-gradient(to right, #8b5cf644, #d946efaa)';
                    iconColor = 'text-white';
                    accentColor = '#8b5cf6';
                  }
                }

                return (
                  <div key={i} 
                       className="group relative overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04]">
                    
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                         style={{ background: bgGradient }} />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${isIncome ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-secondary'}`}
                             style={!isIncome ? { borderColor: accentColor + '40', backgroundColor: accentColor + '15', color: accentColor } : {}}>
                           {isIncome ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold mb-0.5">
                            {txn.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                            <span>{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-widest border"
                                  style={isIncome ? { color: '#34d399', borderColor: '#34d39940', backgroundColor: '#34d39910' } 
                                                  : { color: accentColor, borderColor: accentColor + '40', backgroundColor: accentColor + '10' }}>
                              {txn.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`font-mono font-bold text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]`}
                            style={{ color: isIncome ? '#34d399' : '#f3f4f6' }}>
                        {isIncome ? '+' : '-'}$<AnimatedFloat value={txn.amount} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </div>
      
      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          addExpense({ date: form.date, category: form.category, description: form.description, amount: Number(form.amount) || 0, type: form.type });
          setForm({ type: 'expense', amount: '', date: new Date().toISOString().split('T')[0], category: 'Food', description: '' });
          setIsModalOpen(false);
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Amount ($)</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} placeholder="45.00" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/40 transition-all placeholder:text-white/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Calendar size={12}/> Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/40 transition-all cursor-pointer [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer">
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Housing">Housing</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Software">Software</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary uppercase tracking-widest mb-1.5">Description</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="e.g. Groceries" className="w-full bg-[#0a0c10]/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/40 transition-all placeholder:text-white/20" />
          </div>

          <button type="submit" className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white transition-colors">
            Save Transaction
          </button>
        </form>
      </GlassModal>

    </div>
  );
}
