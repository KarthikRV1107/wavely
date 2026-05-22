const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const parseDuration = (isoDuration) => {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours   = parseInt(match[1] ?? 0) || 0;
  const minutes = parseInt(match[2] ?? 0) || 0;
  const seconds = parseInt(match[3] ?? 0) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

const formatSong = (item) => ({
  videoId:         item.id?.videoId ?? item.id,
  title:           item.snippet.title,
  channelName:     item.snippet.channelTitle,
  thumbnailUrl:    item.snippet.thumbnails?.medium?.url ?? '',
  durationSeconds: 0,
});

const enrichWithDuration = async (songs) => {
  const ids    = songs.map(s => s.videoId).join(',');
  const params = new URLSearchParams({ part: 'contentDetails', id: ids, key: API_KEY });
  const res    = await fetch(`${BASE_URL}/videos?${params}`);
  const data   = await res.json();
  const durationMap = {};
  data.items.forEach(item => { durationMap[item.id] = parseDuration(item.contentDetails.duration); });
  return songs.map(song => ({ ...song, durationSeconds: durationMap[song.videoId] ?? 0 }));
};

export const searchSongs = async (query) => {
  const params = new URLSearchParams({
    part: 'snippet', q: `${query} official music`,
    type: 'video', videoCategoryId: '10', maxResults: '20', key: API_KEY,
  });
  const res  = await fetch(`${BASE_URL}/search?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'YouTube search failed');
  return enrichWithDuration(data.items.map(formatSong));
};

export const getTrendingSongs = async () => {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails', chart: 'mostPopular',
    videoCategoryId: '10', maxResults: '15', regionCode: 'IN', key: API_KEY,
  });
  const res  = await fetch(`${BASE_URL}/videos?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Failed to fetch trending');
  return data.items.map(item => ({
    videoId:         item.id,
    title:           item.snippet.title,
    channelName:     item.snippet.channelTitle,
    thumbnailUrl:    item.snippet.thumbnails?.medium?.url ?? '',
    durationSeconds: parseDuration(item.contentDetails.duration),
  }));
};
