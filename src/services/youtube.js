// src/services/youtube.js  — optimized with caching + request deduplication
import { cache } from '../utils/cache';

const API_KEY  = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// In-flight request deduplication — prevents duplicate API calls
const IN_FLIGHT = new Map();

const dedupeFetch = async (url) => {
  if (IN_FLIGHT.has(url)) return IN_FLIGHT.get(url); // reuse in-flight
  const promise = fetch(url).then(r => r.json()).finally(() => IN_FLIGHT.delete(url));
  IN_FLIGHT.set(url, promise);
  return promise;
};

const parseDuration = (iso) => {
  if (!iso) return 0;
  const m = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!m) return 0;
  return (parseInt(m[1]) || 0) * 3600
       + (parseInt(m[2]) || 0) * 60
       + (parseInt(m[3]) || 0);
};

const formatSong = (item) => ({
  videoId:         item.id?.videoId ?? item.id,
  title:           item.snippet?.title ?? 'Unknown',
  channelName:     item.snippet?.channelTitle ?? '',
  thumbnailUrl:    item.snippet?.thumbnails?.medium?.url
                ?? item.snippet?.thumbnails?.default?.url ?? '',
  durationSeconds: 0,
});

const enrichWithDuration = async (songs) => {
  if (!songs.length) return songs;
  const ids    = songs.map(s => s.videoId).filter(Boolean).join(',');
  const cKey   = `dur_${ids.slice(0, 80)}`;
  const cached = cache.get(cKey);
  if (cached) return songs.map(s => ({ ...s, durationSeconds: cached[s.videoId] ?? 0 }));

  try {
    const params = new URLSearchParams({ part: 'contentDetails', id: ids, key: API_KEY });
    const data   = await dedupeFetch(`${BASE_URL}/videos?${params}`);
    const map    = {};
    (data.items ?? []).forEach(i => { map[i.id] = parseDuration(i.contentDetails?.duration); });
    cache.set(cKey, map, 30 * 60 * 1000); // cache durations 30 min
    return songs.map(s => ({ ...s, durationSeconds: map[s.videoId] ?? 0 }));
  } catch { return songs; }
};

export const searchSongs = async (query) => {
  const cKey   = `search_${query.toLowerCase().trim()}`;
  const cached = cache.get(cKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    part: 'snippet', q: `${query} music`,
    type: 'video', videoCategoryId: '10',
    maxResults: '20', key: API_KEY,
  });
  const data = await dedupeFetch(`${BASE_URL}/search?${params}`);
  if (data.error) throw new Error(data.error.message ?? 'Search failed');

  const songs = await enrichWithDuration((data.items ?? []).map(formatSong));
  cache.set(cKey, songs, 5 * 60 * 1000); // cache searches 5 min
  return songs;
};

export const getTrendingSongs = async () => {
  const cKey   = 'trending';
  const cached = cache.get(cKey);
  if (cached) return cached; // instant if cached

  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    chart: 'mostPopular',
    videoCategoryId: '10',
    maxResults: '20',
    key: API_KEY,
  });
  const data = await dedupeFetch(`${BASE_URL}/videos?${params}`);

  if (data.error) {
    console.error('Trending error:', data.error.message);
    return searchSongs('top music hits 2024');
  }

  const songs = (data.items ?? []).map(item => ({
    videoId:         item.id,
    title:           item.snippet?.title ?? 'Unknown',
    channelName:     item.snippet?.channelTitle ?? '',
    thumbnailUrl:    item.snippet?.thumbnails?.medium?.url
                  ?? item.snippet?.thumbnails?.default?.url ?? '',
    durationSeconds: parseDuration(item.contentDetails?.duration),
  }));
  cache.set(cKey, songs, 15 * 60 * 1000); // cache trending 15 min
  return songs;
};
