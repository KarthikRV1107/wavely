// src/hooks/useBreakpoint.js
import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  mobile:  0,
  tablet:  768,
  desktop: 1024,
};

export const useBreakpoint = () => {
  const getBreakpoint = () => {
    const w = window.innerWidth;
    if (w < BREAKPOINTS.tablet)  return 'mobile';
    if (w < BREAKPOINTS.desktop) return 'tablet';
    return 'desktop';
  };

  const [bp,    setBp]    = useState(getBreakpoint);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    let frame;
    const handle = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setWidth(window.innerWidth);
        setBp(getBreakpoint());
      });
    };
    window.addEventListener('resize', handle, { passive: true });
    return () => { window.removeEventListener('resize', handle); cancelAnimationFrame(frame); };
  }, []);

  return {
    bp,
    width,
    isMobile:  bp === 'mobile',
    isTablet:  bp === 'tablet',
    isDesktop: bp === 'desktop',
    isTouch:   bp !== 'desktop',
  };
};
