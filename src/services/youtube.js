// src/services/youtube.js
const API_KEY  = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

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
  const params = new URLSearchParams({ part: 'contentDetails', id: ids, key: API_KEY });
  try {
    const res  = await fetch(`${BASE_URL}/videos?${params}`);
    const data = await res.json();
    const map  = {};
    (data.items ?? []).forEach(i => { map[i.id] = parseDuration(i.contentDetails?.duration); });
    return songs.map(s => ({ ...s, durationSeconds: map[s.videoId] ?? 0 }));
  } catch { return songs; }
};

export const searchSongs = async (query) => {
  const params = new URLSearchParams({
    part:            'snippet',
    q:               `${query} music`,
    type:            'video',
    videoCategoryId: '10',
    maxResults:      '20',
    key:             API_KEY,
  });
  const res  = await fetch(`${BASE_URL}/search?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Search failed');
  return enrichWithDuration((data.items ?? []).map(formatSong));
};

export const getTrendingSongs = async () => {
  // NO regionCode — works globally
  const params = new URLSearchParams({
    part:            'snippet,contentDetails',
    chart:           'mostPopular',
    videoCategoryId: '10',
    maxResults:      '15',
    key:             API_KEY,
  });
  const res  = await fetch(`${BASE_URL}/videos?${params}`);
  const data = await res.json();

  if (!res.ok) {
    console.error('Trending error:', data.error);
    // Fallback to search if chart endpoint fails
    return searchSongs('top hits 2024');
  }

  return (data.items ?? []).map(item => ({
    videoId:         item.id,
    title:           item.snippet?.title ?? 'Unknown',
    channelName:     item.snippet?.channelTitle ?? '',
    thumbnailUrl:    item.snippet?.thumbnails?.medium?.url
                  ?? item.snippet?.thumbnails?.default?.url ?? '',
    durationSeconds: parseDuration(item.contentDetails?.duration),
  }));
};
