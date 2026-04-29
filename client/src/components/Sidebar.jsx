import React, { useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BedDouble, Dumbbell, Salad,
  Wallet, MonitorCheck, ListChecks, Sparkles,
} from 'lucide-react';

const navGroups = [
  [
    { name: 'Dashboard',   path: '/app',            icon: LayoutDashboard, color: '#ffffff' },
  ],
  [
    { name: 'Workouts',    path: '/app/workouts',   icon: Dumbbell,        color: '#ef4444' }, // red
    { name: 'Nutrition',   path: '/app/nutrition',  icon: Salad,           color: '#10b981' }, // dark green
    { name: 'Sleep',       path: '/app/sleep',      icon: BedDouble,       color: '#818cf8' }, // indigo
  ],
  [
    { name: 'Work',        path: '/app/work',       icon: MonitorCheck,    color: '#f97316' }, // orange
    { name: 'Habits',      path: '/app/habits',     icon: ListChecks,      color: '#eab308' }, // yellow
  ],
  [
    { name: 'Expenses',    path: '/app/expenses',   icon: Wallet,          color: '#4ade80' }, // light green
  ],
  [
    { name: 'AI Insights', path: '/app/ai', icon: Sparkles, color: 'url(#ai-grad-sidebar)' },
  ],
];

// flat list for mobile tab bar
const navItems = navGroups.flat();

/* ── Ripple on click ──────────────────────────────────── */
function useRipple() {
  const createRipple = useCallback((e) => {
    const btn = e.currentTarget;
    const existing = btn.querySelector('.ripple');
    if (existing) existing.remove();

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    Object.assign(ripple.style, {
      position:     'absolute',
      width:        `${size}px`,
      height:       `${size}px`,
      left:         `${x}px`,
      top:          `${y}px`,
      borderRadius: '50%',
      background:   'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(192,132,252,0.2))',
      transform:    'scale(0)',
      animation:    'ripple-expand 0.55s cubic-bezier(0.4,0,0.2,1) forwards',
      pointerEvents:'none',
    });
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, []);

  return createRipple;
}

/* ── Single nav item ──────────────────────────────────── */
function NavItem({ item, onClick }) {
  const createRipple = useRipple();

  const handleClick = useCallback((e) => {
    createRipple(e);
    onClick?.();
  }, [createRipple, onClick]);

  return (
    <NavLink
      to={item.path}
      end={item.path === '/app'}
      onClick={handleClick}
      className={({ isActive }) =>
        `nav-item relative overflow-hidden flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer select-none
        ${isActive ? 'nav-item--active' : 'nav-item--idle'}`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active left accent bar */}
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300"
            style={{
              height:     isActive ? '60%' : '0%',
              background: item.color === 'url(#ai-grad-sidebar)' ? 'linear-gradient(to bottom, #22d3ee, #c084fc)' : item.color,
            }}
          />
          {/* Icon */}
          <span
            className="flex-shrink-0 transition-all duration-200"
            style={{ color: isActive ? (item.color === 'url(#ai-grad-sidebar)' ? 'transparent' : item.color) : 'inherit' }}
          >
            <item.icon size={17} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? item.color : 'currentColor'} />
          </span>
          {/* Label */}
          <span className="transition-all duration-200" style={{ color: isActive && item.color !== 'url(#ai-grad-sidebar)' ? '#ffffff' : 'inherit' }}>{item.name}</span>
        </>
      )}
    </NavLink>
  );
}


/* ── Main Sidebar ─────────────────────────────────────── */
export default function Sidebar({ user }) {
  const navigate = useNavigate();
  return (
    <>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ai-grad-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      {/* ── Desktop ───────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-[248px] h-screen fixed left-0 top-0 py-5 z-40"
        style={{
          background:   'rgba(8,11,18,0.96)',
          borderRight:  '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="px-5 mb-7">
          <div
            className="flex items-center gap-3 cursor-pointer group w-fit"
            onClick={() => navigate('/app')}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/8 group-hover:border-white/20 transition-colors">
              <span style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 40%, #e879f9 70%, #fb923c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '1.05rem',
                fontWeight: 800,
                letterSpacing: '-0.01em',
              }}>Fs.</span>
            </div>
            <span className="font-bold text-lg text-white tracking-tight group-hover:text-white/80 transition-colors">Flowstate.</span>
          </div>
        </div>

        {/* Profile card */}
        <div className="px-4 mb-5">
          <div
            onClick={() => navigate('/app/settings')}
            className="group relative flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Hover shimmer sweep */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(139,92,246,0.06) 50%, rgba(34,211,238,0.06) 60%, transparent 70%)' }} />



            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight group-hover:text-white transition-colors">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-secondary truncate font-mono leading-tight mt-0.5 group-hover:text-white/50 transition-colors">
                {user?.email || 'user@flowstate.app'}
              </p>
            </div>

            {/* Settings arrow */}
            <svg className="shrink-0 text-secondary group-hover:text-white/60 transition-all duration-300 group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>


        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {/* Divider between groups */}
              {gi > 0 && (
                <div
                  className="mx-1 my-2"
                  style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}
                />
              )}
              <div className="space-y-0.5">
                {group.map(item => <NavItem key={item.name} item={item} />)}
              </div>
            </div>
          ))}
        </div>

      </aside>

      {/* ── Mobile Tab Bar ────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full h-16 z-50 flex items-center justify-around px-2"
        style={{
          background:     'rgba(8,11,18,0.94)',
          backdropFilter: 'blur(20px)',
          borderTop:      '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-colors duration-150
              ${isActive ? '' : 'text-secondary'}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={19} strokeWidth={1.8} color={isActive ? item.color : 'currentColor'} />
                <span className="text-[9px] font-medium tracking-wide" style={{ color: isActive && item.color !== 'url(#ai-grad-sidebar)' ? '#ffffff' : 'inherit' }}>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
