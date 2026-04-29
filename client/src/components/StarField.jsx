import React, { useEffect, useRef } from 'react';

/* ── Tuning ─────────────────────────────────────────────── */
const COUNT     = 32;
const SPEED_MIN = 0.6;
const SPEED_MAX = 1.8;
const TAIL_MIN  = 100;
const TAIL_MAX  = 220;

/* Diagonal angle: ~110°–140° (down + left) */
const ANGLE_MIN = Math.PI * 0.60;
const ANGLE_MAX = Math.PI * 0.78;

/* Colours weighted toward white */
const PALETTE = [
  { r: 255, g: 255, b: 255 },
  { r: 255, g: 255, b: 255 },
  { r: 255, g: 255, b: 255 },
  { r: 210, g: 245, b: 255 },
  { r: 34,  g: 211, b: 238 },
  { r: 167, g: 139, b: 250 },
  { r: 255, g: 248, b: 180 },
];

const EDGE_FADE = 120; // px — fade band at screen edges

function rand(a, b) { return a + Math.random() * (b - a); }

/**
 * Spawn from BOTH the top edge and the right edge so stars
 * cover the entire screen for diagonal (down-left) motion.
 * `scatter` = true for initial fill (spread across full canvas).
 */
function makeStar(w, h, scatter = false) {
  const speed  = rand(SPEED_MIN, SPEED_MAX);
  const angle  = rand(ANGLE_MIN, ANGLE_MAX);
  const color  = PALETTE[Math.floor(Math.random() * PALETTE.length)];

  let x, y;
  if (scatter) {
    /* Seed evenly across the canvas so it's not empty on load */
    x = rand(-w * 0.4, w * 1.2);
    y = rand(-h * 0.4, h * 0.9);
  } else {
    /* Alternate: top edge or right edge so full screen is covered */
    if (Math.random() < 0.55) {
      /* Top edge — full width including overflow so right portion is seeded */
      x = rand(-50, w * 1.3);
      y = rand(-80, -10);
    } else {
      /* Right edge */
      x = rand(w * 0.5, w + 60);
      y = rand(-60, h * 0.6);
    }
  }

  return {
    x, y,
    vx:      Math.cos(angle) * speed,
    vy:      Math.sin(angle) * speed,
    size:    rand(0.8, 2.2),
    tailLen: rand(TAIL_MIN, TAIL_MAX),
    maxAlpha: rand(0.5, 0.92),
    color,
  };
}

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: COUNT }, () =>
      makeStar(canvas.width, canvas.height, true)
    );

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;

      stars.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;

        /* Recycle when star exits screen */
        if (s.y > H + 80 || s.x < -120) {
          stars[i] = makeStar(W, H, false);
          return;
        }

        /* ── Position-based alpha (smooth fade in/out at edges) ── */
        let alpha = s.maxAlpha;

        /* Fade in from top */
        if (s.y < EDGE_FADE)          alpha *= Math.max(0, s.y / EDGE_FADE);
        /* Fade out at bottom */
        if (s.y > H - EDGE_FADE)      alpha *= Math.max(0, (H - s.y) / EDGE_FADE);
        /* Fade out at left edge */
        if (s.x < EDGE_FADE)          alpha *= Math.max(0, s.x / EDGE_FADE);
        /* Fade in from right */
        if (s.x > W - EDGE_FADE)      alpha *= Math.max(0, (W - s.x) / EDGE_FADE);

        alpha = Math.min(s.maxAlpha, Math.max(0, alpha));
        if (alpha < 0.01) return;

        const { r, g, b } = s.color;

        /* Normalised direction for tail */
        const mag = Math.hypot(s.vx, s.vy);
        const nx  = s.vx / mag;
        const ny  = s.vy / mag;
        const tx  = s.x - nx * s.tailLen;
        const ty  = s.y - ny * s.tailLen;

        /* ── Tail gradient ── */
        const tailGrad = ctx.createLinearGradient(tx, ty, s.x, s.y);
        tailGrad.addColorStop(0,    `rgba(${r},${g},${b},0)`);
        tailGrad.addColorStop(0.4,  `rgba(${r},${g},${b},${(alpha * 0.06).toFixed(3)})`);
        tailGrad.addColorStop(0.75, `rgba(${r},${g},${b},${(alpha * 0.3).toFixed(3)})`);
        tailGrad.addColorStop(1,    `rgba(${r},${g},${b},${(alpha * 0.7).toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth   = s.size * 1.2;
        ctx.lineCap     = 'round';
        ctx.stroke();

        /* ── Wide outer glow ── */
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 9);
        halo.addColorStop(0,   `rgba(${r},${g},${b},${(alpha * 0.3).toFixed(3)})`);
        halo.addColorStop(0.4, `rgba(${r},${g},${b},${(alpha * 0.08).toFixed(3)})`);
        halo.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 9, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        /* ── Inner glow ── */
        const inner = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2.5);
        inner.addColorStop(0, `rgba(${r},${g},${b},${(alpha * 0.85).toFixed(3)})`);
        inner.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = inner;
        ctx.fill();

        /* ── Solid bright core ── */
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        1,
        opacity:       0.72,
      }}
    />
  );
}
