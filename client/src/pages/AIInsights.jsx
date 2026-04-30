import React, { useState, useEffect } from 'react';
import {
  Sparkles, BrainCircuit, Activity, Moon, Target,
  AlertTriangle, Zap, CheckCircle2, TrendingUp, RefreshCw,
  Dumbbell, Apple, Wallet, ListChecks, MonitorCheck, BedDouble,
} from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { useTilt } from '../hooks/useTilt';
import api from '../utils/api';

/* ─── Module icon map ─────────────────────────────────────── */
const moduleIcon = {
  Workouts:  Dumbbell,
  Sleep:     BedDouble,
  Nutrition: Apple,
  Expenses:  Wallet,
  Habits:    ListChecks,
  Work:      MonitorCheck,
};

/* ─── Score Ring ─────────────────────────────────────────── */
const ScoreRing = ({ score, label, mounted }) => {
  const size  = 160, stroke = 14;
  const r     = (size - stroke) / 2;
  const circ  = 2 * Math.PI * r;
  const safeScore = isFinite(score) ? Math.max(0, Math.min(100, score)) : 50;
  const offset = circ - (mounted ? safeScore / 100 : 0) * circ;
  const color  = safeScore >= 80 ? '#34d399' : safeScore >= 60 ? '#fbbf24' : '#fb7185';
  const glow   = safeScore >= 80 ? 'rgba(52,211,153,0.3)' : safeScore >= 60 ? 'rgba(251,191,36,0.3)' : 'rgba(251,113,133,0.3)';
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="score-ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="url(#score-ring-grad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${glow})` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono leading-none" style={{ color, textShadow: `0 0 20px ${glow}` }}>
          {safeScore}
        </span>
        <span className="text-xs text-secondary font-mono uppercase tracking-widest mt-1">{label}</span>
      </div>
    </div>
  );
};

/* ─── Insight Card ───────────────────────────────────────── */
const typeStyle = {
  warning:  { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    color: '#fb7185', icon: AlertTriangle },
  positive: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', color: '#34d399', icon: CheckCircle2  },
  neutral:  { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   color: '#fbbf24', icon: Zap           },
};

const InsightCard = ({ insight }) => {
  const style = typeStyle[insight.type] || typeStyle.neutral;
  const Icon  = style.icon;
  return (
    <div className={`glass-card p-6 border ${style.border} ${style.bg} transition-all duration-300`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: style.color + '20', border: `1px solid ${style.color}40` }}>
          <Icon size={17} style={{ color: style.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-1.5 leading-tight">{insight.title}</h3>
          <p className="text-xs text-secondary leading-relaxed">{insight.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(insight.modules || []).map(mod => {
              const MIcon = moduleIcon[mod] || Sparkles;
              return (
                <span key={mod} className="chip text-[10px] flex items-center gap-1.5 border-white/10">
                  <MIcon size={9} /> {mod}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Recommendation Row ─────────────────────────────────── */
const RecRow = ({ rec, idx }) => {
  const [done, setDone] = useState(false);
  const Icon = moduleIcon[rec.module] || Target;
  return (
    <div
      onClick={() => setDone(d => !d)}
      className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300 group ${
        done ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${done ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
        {done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Icon size={16} className="text-secondary group-hover:text-white transition-colors" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold transition-colors ${done ? 'line-through text-secondary' : 'text-white'}`}>{rec.text}</p>
        <p className="text-xs text-secondary mt-0.5 leading-relaxed">{rec.subtext}</p>
      </div>
      <span className="text-[10px] font-mono text-secondary shrink-0">{String(idx + 1).padStart(2, '0')}</span>
    </div>
  );
};

/* ─── Skeleton loader ────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`bg-white/[0.04] rounded-2xl animate-pulse ${className}`} />
);

/* ─── Main Page ──────────────────────────────────────────── */
export default function AIInsights() {
  useTilt();
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r2 = useReveal(200);
  const r3 = useReveal(300);

  const [mounted,  setMounted]  = useState(false);
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [lastRun,  setLastRun]  = useState(null);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t); }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: result } = await api.post('/ai/insights');
      console.log('[AI Insights] Raw response:', result);
      // Normalize to guarantee shape so React can never crash
      const safe = {
        score:           typeof result?.score === 'number' ? result.score : Number(result?.score) || 50,
        scoreLabel:      result?.scoreLabel   || 'Fair',
        insights:        Array.isArray(result?.insights)        ? result.insights        : [],
        recommendations: Array.isArray(result?.recommendations) ? result.recommendations : [],
      };
      setData(safe);
      setLastRun(new Date());
    } catch (err) {
      console.error('[AI Insights] Error:', err);
      setError(err.response?.data?.message || 'AI analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = lastRun
    ? `${Math.floor((Date.now() - lastRun) / 60000)}m ago`
    : 'Not yet run';

  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8">

      {/* ── Header ──────────────────────────────────────────── */}
      <div ref={r0} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-500/20 animate-pulse" />
              <Sparkles className="text-cyan-400 relative z-10" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-none">AI Analysis</h1>
          </div>
          <p className="text-secondary text-sm max-w-md leading-relaxed mt-3">
            Cross-module synthesis powered by Gemini. Finds hidden correlations between your habits, sleep, output, and workouts.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          {lastRun && (
            <span className="text-[10px] font-mono text-secondary uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              Last run {timeAgo}
            </span>
          )}
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analysing…' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────── */}
      {error && (
        <div className="glass-card p-4 border border-rose-500/20 bg-rose-500/10">
          <p className="text-sm text-rose-400 text-center">{error}</p>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────── */}
      {!data && !loading && !error && (
        <div ref={r1} className="reveal glass-card p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <BrainCircuit size={28} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Ready for analysis</h2>
            <p className="text-sm text-secondary max-w-sm leading-relaxed">
              Click <span className="text-white font-medium">Run Analysis</span> to let Gemini synthesise your health, sleep, work, and habit data into actionable insights.
            </p>
          </div>
          <button onClick={runAnalysis} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold mt-2">
            Run Analysis Now
          </button>
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────── */}
      {loading && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="h-52" />
            <Skeleton className="h-52 md:col-span-2" />
          </div>
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────── */}
      {data && !loading && (
        <>
          {/* Score + summary */}
          <div ref={r1} className="reveal grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card card-cyan p-8 flex flex-col items-center justify-center gap-4">
              <ScoreRing score={data.score} label={data.scoreLabel || 'Score'} mounted={mounted} />
              <p className="text-xs text-secondary font-mono uppercase tracking-widest">Readiness Score</p>
            </div>
            <div className="glass-card p-6 md:col-span-2 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-cyan-400" />
                  <h2 className="text-sm font-semibold text-white uppercase tracking-widest font-mono">Weekly Synthesis</h2>
                </div>
                <p className="text-secondary text-sm leading-relaxed">
                  Gemini analysed your last 7 days across sleep, workouts, nutrition, work sessions, habits, and finances. The insights below are derived from cross-module correlations unique to your data.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Score',   value: `${data.score}/100`,        color: '#22d3ee' },
                  { label: 'Insights',value: `${data.insights?.length || 0} found`, color: '#a78bfa' },
                  { label: 'Actions', value: `${data.recommendations?.length || 0} tasks`, color: '#34d399' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-lg font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] text-secondary uppercase tracking-widest mt-1 font-mono">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div ref={r2} className="reveal space-y-4">
            <h2 className="text-xs font-mono text-secondary uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} className="text-cyan-400" /> Cross-Module Insights
            </h2>
            {(data.insights || []).map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </div>

          {/* Recommendations */}
          <div ref={r3} className="reveal glass-card p-6 space-y-3">
            <h2 className="text-xs font-mono text-secondary uppercase tracking-widest flex items-center gap-2 mb-4">
              <CheckCircle2 size={12} className="text-emerald-400" /> Today's Action Plan
            </h2>
            {(data.recommendations || []).map((rec, i) => (
              <RecRow key={i} rec={rec} idx={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
