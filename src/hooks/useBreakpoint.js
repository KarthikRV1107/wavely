// src/hooks/useBreakpoint.js
// FIX: Debounced resize + memoized return value to prevent cascade re-renders
import { useState, useEffect, useRef } from 'react';

const getBp = (w) => w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';

// Module-level singleton so all components share one listener, one state
const listeners = new Set();
let   _bp        = getBp(window.innerWidth);

if (typeof window !== 'undefined') {
  let raf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const next = getBp(window.innerWidth);
      if (next !== _bp) {
        _bp = next;
        listeners.forEach(fn => fn(next));
      }
    });
  }, { passive: true });
}

export const useBreakpoint = () => {
  const [bp, setBp] = useState(_bp);
  useEffect(() => {
    listeners.add(setBp);
    return () => listeners.delete(setBp);
  }, []);
  return {
    bp,
    isMobile:  bp === 'mobile',
    isTablet:  bp === 'tablet',
    isDesktop: bp === 'desktop',
    isTouch:   bp !== 'desktop',
  };
};
