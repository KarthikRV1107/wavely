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
  const K   = 'tr5';
  const hit = cGet(K);
  if(hit) return hit;

  const data = await apiFetch(`${BASE}/videos?${qs({
    part:'snippet,contentDetails',
    chart:'mostPopular',
    videoCategoryId:'10',
    maxResults:'20',
  })}`);

  if(data.error) {
    console.warn('Trending failed:',data.error.message);
    return searchSongs('top music hits 2025');
  }

  const songs = (data.items??[]).map(i=>toSong(i,dur(i.contentDetails?.duration)));
  cSet(K, songs, 30*60000);
  return songs;
};

export const searchSongs = async (query) => {
  const K   = 'sr_'+query.trim().toLowerCase().slice(0,60);
  const hit = cGet(K);
  if(hit) return hit;

  const data = await apiFetch(`${BASE}/search?${qs({
    part:'snippet', q:`${query} music`,
    type:'video', videoCategoryId:'10', maxResults:'20',
  })}`);
  if(data.error) throw new Error(data.error.message);

  const songs = (data.items??[]).map(i=>toSong(i));
  cSet(K, songs, 10*60000);

  // Fetch durations in background — doesn't block UI
  const ids = songs.map(s=>s.videoId).filter(Boolean).join(',');
  if(ids) {
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
  if(!cGet('tr5')) getTrendingSongs().catch(()=>{});
};
