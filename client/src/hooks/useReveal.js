import { useCallback, useRef } from 'react';

export function useReveal(delay = 0) {
  const observerRef = useRef(null);

  const ref = useCallback(
    (el) => {
      // Disconnect any previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!el) return;

      // If already visible from a prior mount, just show immediately
      if (el.classList.contains('visible')) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add('visible'), delay);
            observer.unobserve(el);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(el);
      observerRef.current = observer;
    },
    [delay]
  );

  return ref;
}

