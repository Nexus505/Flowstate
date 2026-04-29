/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:  '#080b12',
        surface:     '#0d1120',
        elevated:    '#111828',
        primary:     '#22d3ee',
        secondary:   '#64748b',
        violet:      '#8b5cf6',
        indigo:      '#6366f1',
        cyan:        '#22d3ee',
        sky:         '#38bdf8',
        emerald:     '#34d399',
        amber:       '#fbbf24',
        rose:        '#fb7185',
        pink:        '#e879f9',
        'accent-glow': 'rgba(34, 211, 238, 0.15)',
      },
      fontFamily: {
        sans:    ['Inter', 'Geist Variable', 'sans-serif'],
        mono:    ['Fira Code', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2rem': '2rem',
        '3rem': '3rem',
      },
      boxShadow: {
        'glow-violet':  '0 0 40px rgba(139,92,246,0.25)',
        'glow-cyan':    '0 0 40px rgba(34,211,238,0.25)',
        'glow-emerald': '0 0 40px rgba(52,211,153,0.25)',
        'glow-amber':   '0 0 40px rgba(251,191,36,0.25)',
        'glow-rose':    '0 0 40px rgba(251,113,133,0.25)',
        'card':         '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
      },
      animation: {
        'fade-in-up':     'fade-in-up 0.65s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':       'scale-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'pulse-glow':     'pulse-glow 2s ease-in-out infinite',
        'wave':           'wave 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
