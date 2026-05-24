// src/services/youtube.js — maximum speed: memory cache + localStorage + request dedup
const API_KEY  = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// ── Layer 1: Memory cache (instant, same session) ─────────
const MEM = new Map();
const memGet = (k) => {
  const e = MEM.get(k);
  if (!e) return null;
  if (Date.now() > e.exp) { MEM.delete(k); return null; }
  return e.data;
};
const memSet = (k, v, ttl) => MEM.set(k, { data: v, exp: Date.now() + ttl });

// ── Layer 2: localStorage cache (survives page refresh) ───
const LS = 'wvy2_';
const lsGet = (k) => {
  try {
    const r = localStorage.getItem(LS + k);
    if (!r) return null;
    const { data, exp } = JSON.parse(r);
    if (Date.now() > exp) { localStorage.removeItem(LS + k); return null; }
    return data;
  } catch { return null; }
};
const lsSet = (k, v, ttl) => {
  try { localStorage.setItem(LS + k, JSON.stringify({ data: v, exp: Date.now() + ttl })); } catch {}
};

const cacheGet = (k) => memGet(k) ?? lsGet(k);
const cacheSet = (k, v, ttl) => { memSet(k, v, ttl); lsSet(k, v, ttl); };

// ── Request deduplication (no parallel duplicate fetches) ─
const INFLIGHT = new Map();
const apiFetch = async (url) => {
  if (INFLIGHT.has(url)) return INFLIGHT.get(url);
  const p = fetch(url)
    .then(r => r.json())
    .finally(() => INFLIGHT.delete(url));
  INFLIGHT.set(url, p);
  return p;
};

const qs = (p) => new URLSearchParams({ ...p, key: API_KEY }).toString();

const parseDur = (s = '') => {
  const m = s.match(/PT(\d+H)?(\d+M)?(\d+S)?/) || [];
  return (parseInt(m[1]) || 0) * 3600 + (parseInt(m[2]) || 0) * 60 + (parseInt(m[3]) || 0);
};

const toSong = (item, dur = 0) => ({
  videoId:         item.id?.videoId ?? item.id,
  title:           item.snippet?.title ?? '',
  channelName:     item.snippet?.channelTitle ?? '',
  thumbnailUrl:    item.snippet?.thumbnails?.medium?.url
                ?? item.snippet?.thumbnails?.default?.url ?? '',
  durationSeconds: dur,
});

// ── Trending — cached 30 min ──────────────────────────────
export const getTrendingSongs = async () => {
  const key  = 'trending_v3';
  const hit  = cacheGet(key);
  if (hit) return hit;                     // instant on cache hit

  const url  = `${BASE_URL}/videos?${qs({
    part: 'snippet,contentDetails',
    chart: 'mostPopular',
    videoCategoryId: '10',
    maxResults: '20',
  })}`;
  const data = await apiFetch(url);

  if (data.error) {
    console.warn('Trending failed:', data.error.message);
    return searchSongs('top music hits 2024');
  }

  const songs = (data.items ?? []).map(i => toSong(i, parseDur(i.contentDetails?.duration)));
  cacheSet(key, songs, 30 * 60 * 1000);
  return songs;
};

// ── Search — cached 10 min ────────────────────────────────
export const searchSongs = async (query) => {
  const key = 'srch_' + query.trim().toLowerCase().slice(0, 80);
  const hit = cacheGet(key);
  if (hit) return hit;

  const url  = `${BASE_URL}/search?${qs({
    part: 'snippet', q: `${query} music`,
    type: 'video', videoCategoryId: '10', maxResults: '20',
  })}`;
  const data = await apiFetch(url);
  if (data.error) throw new Error(data.error.message);

  const songs = (data.items ?? []).map(i => toSong(i));
  cacheSet(key, songs, 10 * 60 * 1000);

  // Fetch durations async — don't block UI
  const ids = songs.map(s => s.videoId).filter(Boolean).join(',');
  if (ids) {
    const durUrl = `${BASE_URL}/videos?${qs({ part: 'contentDetails', id: ids })}`;
    apiFetch(durUrl).then(d => {
      const map = {};
      (d.items ?? []).forEach(i => { map[i.id] = parseDur(i.contentDetails?.duration); });
      songs.forEach(s => { s.durationSeconds = map[s.videoId] ?? 0; });
      cacheSet(key, [...songs], 10 * 60 * 1000); // update cache with durations
    }).catch(() => {});
  }

  return songs;
};

// Pre-warm cache in background (called from index.js)
export const prefetchTrending = () => {
  if (!cacheGet('trending_v3')) {
    setTimeout(() => getTrendingSongs().catch(() => {}), 0);
  }
};
