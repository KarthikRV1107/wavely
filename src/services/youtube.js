// src/services/youtube.js — max performance: cache + dedup + parallel fetches
import { cache } from '../utils/cache';

const API_KEY  = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// In-flight deduplication — two callers get the same promise
const IN_FLIGHT = new Map();
const dedup = (url) => {
  if (IN_FLIGHT.has(url)) return IN_FLIGHT.get(url);
  const p = fetch(url)
    .then(r => { if (!r.ok) return r.json().then(d => Promise.reject(d)); return r.json(); })
    .finally(() => IN_FLIGHT.delete(url));
  IN_FLIGHT.set(url, p);
  return p;
};

const qs = (p) => new URLSearchParams({ ...p, key: API_KEY }).toString();

const parseDur = (iso = '') => {
  const m = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/) || [];
  return (parseInt(m[1])||0)*3600 + (parseInt(m[2])||0)*60 + (parseInt(m[3])||0);
};

const toSong = (item, dur = 0) => ({
  videoId:         item.id?.videoId ?? item.id,
  title:           item.snippet?.title ?? 'Unknown',
  channelName:     item.snippet?.channelTitle ?? '',
  thumbnailUrl:    item.snippet?.thumbnails?.medium?.url
                ?? item.snippet?.thumbnails?.default?.url ?? '',
  durationSeconds: dur,
});

// Batch duration fetch — single API call for up to 50 IDs
const fetchDurations = async (ids) => {
  if (!ids.length) return {};
  const cKey   = 'dur_' + ids.slice(0, 6).join('');
  const cached = cache.get(cKey);
  if (cached) return cached;

  const data = await dedup(`${BASE_URL}/videos?${qs({ part:'contentDetails', id: ids.join(',') })}`);
  const map  = {};
  (data.items ?? []).forEach(i => { map[i.id] = parseDur(i.contentDetails?.duration); });
  cache.set(cKey, map, 60 * 60 * 1000); // cache durations 1 hour
  return map;
};

// Search — cached 5 min, instant on repeat queries
export const searchSongs = async (query) => {
  const cKey   = 'srch_' + query.toLowerCase().trim().slice(0, 60);
  const cached = cache.get(cKey);
  if (cached) return cached; // instant

  const data  = await dedup(`${BASE_URL}/search?${qs({
    part:'snippet', q:`${query} music`,
    type:'video', videoCategoryId:'10', maxResults:'20',
  })}`);
  if (data.error) throw new Error(data.error.message);

  const songs = (data.items ?? []).map(i => toSong(i));
  // Fetch durations in parallel — don't block returning songs
  const ids   = songs.map(s => s.videoId).filter(Boolean);
  fetchDurations(ids).then(map => {
    songs.forEach(s => { s.durationSeconds = map[s.videoId] ?? 0; });
  });

  cache.set(cKey, songs, 5 * 60 * 1000);
  return songs;
};

// Trending — cached 20 min, includes durations immediately
export const getTrendingSongs = async () => {
  const cached = cache.get('trending');
  if (cached) return cached; // instant after first load

  const data = await dedup(`${BASE_URL}/videos?${qs({
    part:'snippet,contentDetails',
    chart:'mostPopular', videoCategoryId:'10', maxResults:'20',
  })}`);

  if (data.error) {
    console.warn('Trending failed, falling back to search:', data.error.message);
    return searchSongs('top music hits 2024');
  }

  const songs = (data.items ?? []).map(i =>
    toSong(i, parseDur(i.contentDetails?.duration))
  );
  cache.set('trending', songs, 20 * 60 * 1000); // 20 min
  return songs;
};
