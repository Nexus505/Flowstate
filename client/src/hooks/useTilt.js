import { useEffect } from 'react';

export function useTilt() {
  useEffect(() => {
    // Wait for elements to be present
    const t = setTimeout(() => {
      const cards = document.querySelectorAll('.glass-card');

      const onMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width  / 2;
        const cy = rect.height / 2;

        card.style.setProperty('--mouse-x', `${(x / rect.width)  * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

        const tiltX = ((y - cy) / cy) * -5;
        const tiltY = ((x - cx) / cx) *  5;
        card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale(1.015)`;
      };

      const onLeave = (e) => {
        const card = e.currentTarget;
        card.style.transform = '';
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');
      };

      cards.forEach(c => {
        c.addEventListener('mousemove',  onMove);
        c.addEventListener('mouseleave', onLeave);
      });

      return () => {
        cards.forEach(c => {
          c.removeEventListener('mousemove',  onMove);
          c.removeEventListener('mouseleave', onLeave);
        });
      };
    }, 100);

    return () => clearTimeout(t);
  }, []);
}
