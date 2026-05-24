// src/services/youtube.js
// Speed hierarchy:
//  1. Module-level JS Map  → 0ms  (same tab, same session)
//  2. sessionStorage       → <1ms (same tab, survives re-render)
//  3. localStorage         → <2ms (survives full page refresh)
//  4. Network fetch        → 800-2000ms (cold only)
//
// After first load, EVERY subsequent visit is served from cache (0-2ms).

const KEY   = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE  = 'https://www.googleapis.com/youtube/v3';
const SS    = 'wvss_';   // sessionStorage prefix
const LS    = 'wvls_';   // localStorage prefix

// ── Layer 1: JS Map (0ms, lives as long as JS module is loaded) ──
const RAM = new Map();

const ramGet = (k) => {
  const e = RAM.get(k);
  return e && Date.now() < e.x ? e.v : null;
};
const ramSet = (k, v, ms) => RAM.set(k, { v, x: Date.now() + ms });

// ── Layer 2: sessionStorage (<1ms, same browser tab) ──────────────
const ssGet = (k) => {
  try {
    const r = sessionStorage.getItem(SS + k);
    if (!r) return null;
    const e = JSON.parse(r);
    return Date.now() < e.x ? e.v : null;
  } catch { return null; }
};
const ssSet = (k, v, ms) => {
  try { sessionStorage.setItem(SS + k, JSON.stringify({ v, x: Date.now() + ms })); } catch {}
};

// ── Layer 3: localStorage (<2ms, survives refresh) ─────────────────
const lsGet = (k) => {
  try {
    const r = localStorage.getItem(LS + k);
    if (!r) return null;
    const e = JSON.parse(r);
    if (Date.now() < e.x) return e.v;
    localStorage.removeItem(LS + k);
  } catch {}
  return null;
};
const lsSet = (k, v, ms) => {
  try { localStorage.setItem(LS + k, JSON.stringify({ v, x: Date.now() + ms })); }
  catch { /* storage full */ }
};

// Read from fastest available layer, promote to faster layers on hit
const get = (k) => {
  const r = ramGet(k);
  if (r) return r;
  const s = ssGet(k);
  if (s) { ramSet(k, s, 60_000); return s; }
  const l = lsGet(k);
  if (l) { ramSet(k, l, 60_000); ssSet(k, l, 60_000); return l; }
  return null;
};

// Write to all three layers
const set = (k, v, ms) => {
  ramSet(k, v, ms);
  ssSet(k, v, ms);
  lsSet(k, v, ms);
};

// ── In-flight dedup (prevents parallel duplicate requests) ─────────
const FLY = new Map();
const api = (url) => {
  if (FLY.has(url)) return FLY.get(url);
  const p = fetch(url)
    .then(r => { if (!r.ok) return r.json().then(d => Promise.reject(d)); return r.json(); })
    .finally(() => FLY.delete(url));
  FLY.set(url, p);
  return p;
};

const qs  = (p) => new URLSearchParams({ ...p, key: KEY }).toString();
const dur = (s = '') => {
  const m = (s.match(/PT(\d+H)?(\d+M)?(\d+S)?/) || []);
  return (parseInt(m[1]) || 0) * 3600 + (parseInt(m[2]) || 0) * 60 + (parseInt(m[3]) || 0);
};
const toSong = (item, d = 0) => ({
  videoId:     item.id?.videoId ?? item.id ?? '',
  title:       item.snippet?.title ?? '',
  channelName: item.snippet?.channelTitle ?? '',
  thumbnailUrl:item.snippet?.thumbnails?.medium?.url
             ?? item.snippet?.thumbnails?.default?.url ?? '',
  durationSeconds: d,
});

// ── getTrendingSongs ───────────────────────────────────────────────
export const getTrendingSongs = async () => {
  const K = 'tr4';
  const hit = get(K);
  if (hit) return hit;          // 0-2ms on cache hit

  const data = await api(`${BASE}/videos?${qs({
    part: 'snippet,contentDetails',
    chart: 'mostPopular',
    videoCategoryId: '10',
    maxResults: '20',
  })}`);

  if (data.error) {
    console.warn('[youtube] trending failed:', data.error.message);
    return searchSongs('top music hits 2025');
  }

  const songs = (data.items ?? []).map(i => toSong(i, dur(i.contentDetails?.duration)));
  set(K, songs, 30 * 60_000);  // cache 30 min
  return songs;
};

// ── searchSongs ────────────────────────────────────────────────────
export const searchSongs = async (query) => {
  const K = 'sr_' + query.trim().toLowerCase().slice(0, 60);
  const hit = get(K);
  if (hit) return hit;

  const data = await api(`${BASE}/search?${qs({
    part: 'snippet',
    q: `${query} music`,
    type: 'video',
    videoCategoryId: '10',
    maxResults: '20',
  })}`);
  if (data.error) throw new Error(data.error.message);

  const songs = (data.items ?? []).map(i => toSong(i));
  set(K, songs, 10 * 60_000);  // cache 10 min immediately (no duration yet)

  // Fetch durations in background — doesn't block UI
  const ids = songs.map(s => s.videoId).filter(Boolean).join(',');
  if (ids) {
    api(`${BASE}/videos?${qs({ part: 'contentDetails', id: ids })}`)
      .then(d => {
        const map = {};
        (d.items ?? []).forEach(i => { map[i.id] = dur(i.contentDetails?.duration); });
        songs.forEach(s => { s.durationSeconds = map[s.videoId] ?? 0; });
        set(K, [...songs], 10 * 60_000); // update cache with durations
      })
      .catch(() => {});
  }
  return songs;
};

// ── Prefetch (called at app start, before login) ───────────────────
// This runs the moment the JS bundle loads — by the time the user
// finishes logging in (~1-2s), trending data is already cached.
export const prefetchTrending = () => {
  if (!get('tr4')) {
    getTrendingSongs().catch(() => {});
  }
};
