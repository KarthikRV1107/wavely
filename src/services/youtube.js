// src/services/youtube.js
// Performance strategy:
// 1. Memory cache — zero latency, same JS process lifetime
// 2. localStorage cache — ~1ms, survives page refresh
// 3. Request dedup — one in-flight fetch per URL max
// 4. Prefetch on app load — data ready before user reaches Home

const API_KEY  = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const LS_KEY   = 'wv3_';

// ── Memory cache ──────────────────────────────────────────
const MEM = new Map();
const mGet = (k) => { const e=MEM.get(k); return e&&Date.now()<e.x ? e.v : (MEM.delete(k),null); };
const mSet = (k, v, ttl) => MEM.set(k, { v, x: Date.now()+ttl });

// ── localStorage cache ────────────────────────────────────
const lGet = (k) => {
  try {
    const s = localStorage.getItem(LS_KEY+k);
    if (!s) return null;
    const e = JSON.parse(s);
    if (Date.now() < e.x) return e.v;
    localStorage.removeItem(LS_KEY+k);
  } catch {}
  return null;
};
const lSet = (k, v, ttl) => {
  try { localStorage.setItem(LS_KEY+k, JSON.stringify({ v, x: Date.now()+ttl })); } catch {}
};

const cGet = (k) => mGet(k) ?? lGet(k);
const cSet = (k, v, ttl) => { mSet(k,v,ttl); lSet(k,v,ttl); };

// ── In-flight dedup ───────────────────────────────────────
const FLY = new Map();
const go = (url) => {
  if (FLY.has(url)) return FLY.get(url);
  const p = fetch(url).then(r => r.json()).finally(() => FLY.delete(url));
  FLY.set(url, p);
  return p;
};

const q  = (p) => new URLSearchParams({ ...p, key: API_KEY }).toString();
const dur = (s='') => {
  const m = s.match(/PT(\d+H)?(\d+M)?(\d+S)?/) || [];
  return (parseInt(m[1])||0)*3600+(parseInt(m[2])||0)*60+(parseInt(m[3])||0);
};
const song = (item, d=0) => ({
  videoId:         item.id?.videoId ?? item.id,
  title:           item.snippet?.title ?? '',
  channelName:     item.snippet?.channelTitle ?? '',
  thumbnailUrl:    item.snippet?.thumbnails?.medium?.url
                ?? item.snippet?.thumbnails?.default?.url ?? '',
  durationSeconds: d,
});

// ── Trending ──────────────────────────────────────────────
export const getTrendingSongs = async () => {
  const KEY = 'tr3';
  const hit = cGet(KEY);
  if (hit) return hit;                 // ~0ms memory / ~1ms localStorage

  const data = await go(`${BASE_URL}/videos?${q({
    part:'snippet,contentDetails', chart:'mostPopular',
    videoCategoryId:'10', maxResults:'20',
  })}`);

  if (data.error) {
    console.warn('Trending:', data.error.message);
    return searchSongs('top music hits 2025');
  }

  const songs = (data.items??[]).map(i => song(i, dur(i.contentDetails?.duration)));
  cSet(KEY, songs, 30*60*1000);        // cache 30 min
  return songs;
};

// ── Search ────────────────────────────────────────────────
export const searchSongs = async (query) => {
  const KEY = 'sc_' + query.trim().toLowerCase().slice(0,60);
  const hit = cGet(KEY);
  if (hit) return hit;

  const data = await go(`${BASE_URL}/search?${q({
    part:'snippet', q:`${query} music`,
    type:'video', videoCategoryId:'10', maxResults:'20',
  })}`);
  if (data.error) throw new Error(data.error.message);

  const songs = (data.items??[]).map(i => song(i));
  cSet(KEY, songs, 10*60*1000);        // cache 10 min

  // Fetch durations non-blocking — updates cache silently
  const ids = songs.map(s => s.videoId).filter(Boolean).join(',');
  if (ids) {
    go(`${BASE_URL}/videos?${q({ part:'contentDetails', id:ids })}`)
      .then(d => {
        const map = {};
        (d.items??[]).forEach(i => { map[i.id] = dur(i.contentDetails?.duration); });
        songs.forEach(s => { s.durationSeconds = map[s.videoId] ?? 0; });
        cSet(KEY, [...songs], 10*60*1000);
      }).catch(()=>{});
  }
  return songs;
};

// Called at app start — warms cache before user even logs in
export const prefetchTrending = () => {
  if (!cGet('tr3')) getTrendingSongs().catch(()=>{});
};
