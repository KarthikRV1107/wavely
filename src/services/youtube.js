// src/services/youtube.js — 3-layer cache: RAM → sessionStorage → localStorage
const KEY  = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE = 'https://www.googleapis.com/youtube/v3';

// Layer 1: RAM Map — 0ms, lives as long as JS module is loaded
const RAM = new Map();
const ramGet = (k) => { const e=RAM.get(k); return e&&Date.now()<e.x?e.v:null; };
const ramSet = (k,v,ms) => RAM.set(k,{v,x:Date.now()+ms});

// Layer 2: sessionStorage — <1ms, same browser tab session
const ssGet = (k) => {
  try { const e=JSON.parse(sessionStorage.getItem('wv_'+k)||'null'); return e&&Date.now()<e.x?e.v:null; } catch{return null;}
};
const ssSet = (k,v,ms) => {
  try{sessionStorage.setItem('wv_'+k,JSON.stringify({v,x:Date.now()+ms}));}catch{}
};

// Layer 3: localStorage — <2ms, survives page refresh
const lsGet = (k) => {
  try{const e=JSON.parse(localStorage.getItem('wvy_'+k)||'null');if(!e)return null;if(Date.now()>e.x){localStorage.removeItem('wvy_'+k);return null;}return e.v;}catch{return null;}
};
const lsSet = (k,v,ms) => {
  try{localStorage.setItem('wvy_'+k,JSON.stringify({v,x:Date.now()+ms}));}catch{}
};

// Read from fastest available layer
const cGet = (k) => ramGet(k) ?? ssGet(k) ?? lsGet(k);
// Write to all layers
const cSet = (k,v,ms) => { ramSet(k,v,ms); ssSet(k,v,ms); lsSet(k,v,ms); };

// In-flight dedup — prevents parallel duplicate fetches
const FLY = new Map();
const apiFetch = (url) => {
  if(FLY.has(url)) return FLY.get(url);
  const p = fetch(url)
    .then(r=>r.ok?r.json():r.json().then(d=>Promise.reject(d)))
    .finally(()=>FLY.delete(url));
  FLY.set(url,p);
  return p;
};

const qs  = (p) => new URLSearchParams({...p, key:KEY}).toString();
const dur = (s='') => {
  const m=(s.match(/PT(\d+H)?(\d+M)?(\d+S)?/)||[]);
  return (parseInt(m[1])||0)*3600+(parseInt(m[2])||0)*60+(parseInt(m[3])||0);
};
const toSong = (item, d=0) => ({
  videoId:     item.id?.videoId ?? item.id ?? '',
  title:       item.snippet?.title ?? '',
  channelName: item.snippet?.channelTitle ?? '',
  thumbnailUrl:item.snippet?.thumbnails?.medium?.url
             ??item.snippet?.thumbnails?.default?.url??'',
  durationSeconds: d,
});

export const getTrendingSongs = async () => {
  const K   = 'india_music_mix_v2';
  const hit = cGet(K);
  if(hit) return hit;

  const year = new Date().getFullYear();
  const languages = [
    { language:'Hindi', query:`trending Hindi songs India ${year}` },
    { language:'Tamil', query:`trending Tamil songs India ${year}` },
    { language:'Telugu', query:`trending Telugu songs India ${year}` },
  ];
  const [results, chartResult] = await Promise.all([
    Promise.allSettled(languages.map(async ({ language, query }) => {
      const songs = await searchSongs(query, { regionCode:'IN', fetchDurations:false });
      return songs.slice(0, 8).map(song => ({ ...song, language }));
    })),
    apiFetch(`${BASE}/videos?${qs({
      part:'snippet,contentDetails', chart:'mostPopular', regionCode:'IN',
      videoCategoryId:'10', maxResults:'50',
    })}`).then(data => {
      if (data.error) throw new Error(data.error.message);
      return (data.items ?? []).map(item => ({
        ...toSong(item, dur(item.contentDetails?.duration)), language:'India Trending',
        isChartTrending:true,
      }));
    }).catch(() => []),
  ]);
  const batches = results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
  batches.push(chartResult);
  if (!batches.some(batch => batch.length)) throw new Error('Could not load trending songs.');

  const chartIds = new Set(chartResult.map(song => song.videoId));
  const songs = [];
  const seen = new Set();
  for (let index = 0; index < Math.max(...batches.map(batch => batch.length)); index += 1) {
    batches.forEach(batch => {
      const song = batch[index];
      if (song && !seen.has(song.videoId)) {
        seen.add(song.videoId);
        songs.push(chartIds.has(song.videoId) ? { ...song, isChartTrending:true } : song);
      }
    });
  }
  const ids = songs.filter(song => song.language !== 'India Trending')
    .map(song => song.videoId).filter(Boolean).join(',');
  if (ids) {
    try {
      const details = await apiFetch(`${BASE}/videos?${qs({ part:'contentDetails', id:ids })}`);
      const durations = new Map((details.items ?? []).map(item => [item.id, dur(item.contentDetails?.duration)]));
      songs.forEach(song => { song.durationSeconds = durations.get(song.videoId) ?? song.durationSeconds; });
    } catch { /* Keep songs playable if duration lookup fails. */ }
  }
  cSet(K, songs, 6*60*60*1000);
  return songs;
};

export const searchSongs = async (query, { regionCode, fetchDurations = true } = {}) => {
  const K   = 'sr_'+(regionCode ? `${regionCode}_` : '')+(fetchDurations ? '' : 'nd_')+query.trim().toLowerCase().slice(0,60);
  const hit = cGet(K);
  if(hit) return hit;

  const data = await apiFetch(`${BASE}/search?${qs({
    part:'snippet', q:`${query} music`,
    type:'video', videoCategoryId:'10', maxResults:'20',
    ...(regionCode ? { regionCode } : {}),
  })}`);
  if(data.error) throw new Error(data.error.message);

  const songs = (data.items??[]).map(i=>toSong(i));
  cSet(K, songs, 10*60000);

  // Fetch durations in background — doesn't block UI
  const ids = songs.map(s=>s.videoId).filter(Boolean).join(',');
  if(ids && fetchDurations) {
    apiFetch(`${BASE}/videos?${qs({part:'contentDetails',id:ids})}`).then(d=>{
      const map={};
      (d.items??[]).forEach(i=>{map[i.id]=dur(i.contentDetails?.duration);});
      songs.forEach(s=>{s.durationSeconds=map[s.videoId]??0;});
      cSet(K,[...songs],10*60000);
    }).catch(()=>{});
  }
  return songs;
};

export const prefetchTrending = () => {
  if(!cGet('india_music_mix_v2')) getTrendingSongs().catch(()=>{});
};
