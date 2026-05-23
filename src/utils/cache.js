// src/utils/cache.js — aggressive multi-layer cache with prefetch support
const MEM    = new Map();
const LS_PFX = 'wv2_';

export const cache = {
  get(key) {
    // Layer 1: memory (zero latency)
    if (MEM.has(key)) {
      const { data, exp } = MEM.get(key);
      if (Date.now() < exp) return data;
      MEM.delete(key);
    }
    // Layer 2: localStorage (fast, survives page refresh)
    try {
      const raw = localStorage.getItem(LS_PFX + key);
      if (raw) {
        const { data, exp } = JSON.parse(raw);
        if (Date.now() < exp) {
          MEM.set(key, { data, exp }); // promote to memory
          return data;
        }
        localStorage.removeItem(LS_PFX + key);
      }
    } catch {}
    return null;
  },

  set(key, data, ttl = 15 * 60 * 1000) {
    const exp = Date.now() + ttl;
    MEM.set(key, { data, exp });
    try {
      localStorage.setItem(LS_PFX + key, JSON.stringify({ data, exp }));
    } catch {
      // Storage full — evict 5 oldest and retry
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(LS_PFX));
        keys.slice(0, 5).forEach(k => localStorage.removeItem(k));
        localStorage.setItem(LS_PFX + key, JSON.stringify({ data, exp }));
      } catch {}
    }
  },

  clear() {
    MEM.clear();
    Object.keys(localStorage)
      .filter(k => k.startsWith(LS_PFX))
      .forEach(k => localStorage.removeItem(k));
  },
};

// Called at app startup — silently prefetches trending if not cached
export const warmCache = (fetchFn) => {
  if (!cache.get('trending')) {
    // Small delay so it doesn't block React render
    setTimeout(() => {
      fetchFn().catch(() => {}); // silent fail — no crash if offline
    }, 200);
  }
};
