import React from 'react';

/* ── Base shimmer block ─────────────────────────────────────── */
export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`rounded-xl relative overflow-hidden ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        ...style,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          animation: 'skeleton-shimmer 1.6s infinite',
        }}
      />
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

/* ── Stat card skeleton (3-up row) ──────────────────────────── */
export function StatCardSkeleton() {
  return (
    <div className="glass-card p-6 flex flex-col gap-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

/* ── Full page skeleton for data pages ─────────────────────── */
export function PageSkeleton({ accentColor = 'rgba(139,92,246,0.15)' }) {
  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8 animate-pulse-gentle">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0, 1, 2].map(i => <StatCardSkeleton key={i} />)}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2 flex flex-col gap-4 min-h-[300px]">
          <Skeleton className="h-5 w-32" />
          <div className="flex-1 flex items-end gap-3 mt-4">
            {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
              <Skeleton key={i} className="flex-1 rounded-t-xl" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="glass-card p-6 flex flex-col gap-4">
          <Skeleton className="h-5 w-28" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard-specific skeleton ────────────────────────────── */
export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[80, 60, 100, 70].map((h, i) => (
          <Skeleton key={i} className="rounded-2xl" style={{ height: 120 }} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 rounded-2xl" style={{ height: 280 }} />
        <Skeleton className="rounded-2xl" style={{ height: 280 }} />
      </div>
    </div>
  );
}

/* ── Habits grid skeleton ───────────────────────────────────── */
export function HabitsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto pb-28 space-y-8">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="glass-card p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map(j => (
                <Skeleton key={j} className="flex-1 h-1.5 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
