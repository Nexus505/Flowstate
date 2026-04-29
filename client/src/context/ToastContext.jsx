import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => removeToast(id), duration + 400); // +400 for exit animation
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/* ── Toast Container + Individual Toast ─────────────────────── */
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

const typeConfig = {
  success: {
    icon: '✓',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.25)',
    glow: 'rgba(52,211,153,0.2)',
  },
  error: {
    icon: '✕',
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.12)',
    border: 'rgba(251,113,133,0.25)',
    glow: 'rgba(251,113,133,0.2)',
  },
  warning: {
    icon: '⚠',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.25)',
    glow: 'rgba(251,191,36,0.2)',
  },
  info: {
    icon: 'i',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.12)',
    border: 'rgba(129,140,248,0.25)',
    glow: 'rgba(129,140,248,0.2)',
  },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);
  const cfg = typeConfig[toast.type] || typeConfig.info;

  React.useEffect(() => {
    // Trigger enter
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Trigger exit before removal
    const exitTimer = setTimeout(() => setExiting(true), toast.duration);
    return () => { clearTimeout(enterTimer); clearTimeout(exitTimer); };
  }, [toast.duration]);

  return (
    <div
      className="pointer-events-auto cursor-pointer select-none"
      style={{
        transform: visible && !exiting ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.9)',
        opacity: visible && !exiting ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
      }}
      onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300); }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl min-w-[260px] max-w-[340px] backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${cfg.bg}, rgba(8,11,18,0.85))`,
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${cfg.glow}`,
        }}
      >
        {/* Icon Badge */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            backgroundColor: cfg.bg,
            border: `1px solid ${cfg.border}`,
            color: cfg.color,
            fontFamily: 'monospace',
          }}
        >
          {cfg.icon}
        </div>

        {/* Message */}
        <p className="text-sm text-white font-medium flex-1 leading-snug">{toast.message}</p>

        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[2px] rounded-b-2xl"
          style={{
            background: `linear-gradient(to right, ${cfg.color}44, ${cfg.color})`,
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
