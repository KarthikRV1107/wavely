// src/services/firestore.js
// Architecture: optimistic local state + background Firestore sync
// UI updates in 0ms. Firestore writes happen async in background.

import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where,
  serverTimestamp, increment, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── In-memory store (source of truth for UI) ────────────
// These Maps are the single source of truth that makes UI instant.
// Firestore is the persistent backup that syncs asynchronously.

const MEM = new Map();   // general cache
const g = (k) => { const e=MEM.get(k); return e&&Date.now()<e.x?e.v:null; };
const s = (k,v,ms=120000) => MEM.set(k,{v,x:Date.now()+ms});
const d = (...ks) => ks.forEach(k=>MEM.delete(k));

// Liked songs: videoId → true/false (instant isLiked check)
export const LIKED = new Map();

// Local playlist songs store: playlistId → song[]
const PL_SONGS = new Map();

// ─── Playlists ────────────────────────────────────────────

export const createPlaylist = async (userId, { name, description='' }) => {
  // Optimistic: create a temp ID, add to local state immediately
  const tempId = `temp_${Date.now()}`;
  const newPl = { id: tempId, userId, name, description, songCount: 0,
                  createdAt: { seconds: Date.now()/1000 },
                  updatedAt: { seconds: Date.now()/1000 } };

  // Update local cache immediately so UI is instant
  const cachedLists = g(`pls_${userId}`) ?? [];
  s(`pls_${userId}`, [newPl, ...cachedLists]);

  // Write to Firestore in background
  const ref = await addDoc(collection(db,'playlists'), {
    userId, name, description,
    coverImageUrl:'', isPublic:false, songCount:0,
    createdAt:serverTimestamp(), updatedAt:serverTimestamp(),
  });

  // Replace temp ID with real ID in cache
  const updated = (g(`pls_${userId}`) ?? []).map(p =>
    p.id === tempId ? { ...p, id: ref.id } : p
  );
  s(`pls_${userId}`, updated);
  return ref.id;
};

export const getUserPlaylists = async (userId) => {
  const key = `pls_${userId}`;
  const hit = g(key);
  if (hit) return hit;

  const snap = await getDocs(query(collection(db,'playlists'), where('userId','==',userId)));
  const data = snap.docs
    .map(d2 => ({ id:d2.id, ...d2.data() }))
    .sort((a,b) => (b.updatedAt?.seconds??0)-(a.updatedAt?.seconds??0));

  s(key, data, 5*60000);
  return data;
};

export const getPlaylist = async (id) => {
  const hit = g(`pl_${id}`);
  if (hit) return hit;
  const snap = await getDoc(doc(db,'playlists',id));
  if (!snap.exists()) throw new Error('Playlist not found');
  const data = { id:snap.id, ...snap.data() };
  s(`pl_${id}`, data, 5*60000);
  return data;
};

export const deletePlaylist = async (id, userId) => {
  // Optimistic: remove from local cache immediately
  const lists = g(`pls_${userId}`) ?? [];
  s(`pls_${userId}`, lists.filter(p=>p.id!==id));
  d(`pl_${id}`, `plsongs_${id}`);
  PL_SONGS.delete(id);
  // Background delete
  await deleteDoc(doc(db,'playlists',id));
};

// ─── Playlist Songs ───────────────────────────────────────

export const addSongToPlaylist = async (playlistId, song, userId) => {
  const songObj = {
    id: `temp_${Date.now()}`,
    playlistId,
    videoId:         song.videoId      ?? '',
    title:           song.title        ?? '',
    channelName:     song.channelName  ?? '',
    thumbnailUrl:    song.thumbnailUrl ?? '',
    durationSeconds: song.durationSeconds ?? 0,
    orderIndex:      0,
    addedAt:         { seconds: Date.now()/1000 },
  };

  // 1. Optimistic: add to local songs list instantly
  const local = PL_SONGS.get(playlistId) ?? [];
  const newOrderIndex = local.length;
  songObj.orderIndex = newOrderIndex;
  PL_SONGS.set(playlistId, [...local, songObj]);
  d(`plsongs_${playlistId}`);

  // 2. Optimistic: increment songCount in playlist cache
  const plCache = g(`pls_${userId}`) ?? [];
  s(`pls_${userId}`, plCache.map(p =>
    p.id === playlistId ? { ...p, songCount: (p.songCount??0)+1 } : p
  ));

  // 3. Background: write to Firestore (don't await in UI path)
  addDoc(collection(db,'playlist_songs'), {
    playlistId,
    videoId:         songObj.videoId,
    title:           songObj.title,
    channelName:     songObj.channelName,
    thumbnailUrl:    songObj.thumbnailUrl,
    durationSeconds: songObj.durationSeconds,
    orderIndex:      newOrderIndex,
    addedAt:         serverTimestamp(),
  }).then(ref => {
    // Replace temp ID with real Firestore ID
    const songs = PL_SONGS.get(playlistId) ?? [];
    PL_SONGS.set(playlistId, songs.map(s2 =>
      s2.id === songObj.id ? { ...s2, id: ref.id } : s2
    ));
  }).catch(err => console.error('addSongToPlaylist Firestore err:', err));

  updateDoc(doc(db,'playlists',playlistId), {
    songCount: increment(1), updatedAt: serverTimestamp(),
  }).catch(err => console.error('updatePlaylist err:', err));
};

export const getPlaylistSongs = async (playlistId) => {
  // Return local optimistic state if available
  if (PL_SONGS.has(playlistId)) return PL_SONGS.get(playlistId);

  const hit = g(`plsongs_${playlistId}`);
  if (hit) { PL_SONGS.set(playlistId, hit); return hit; }

  const snap = await getDocs(
    query(collection(db,'playlist_songs'), where('playlistId','==',playlistId))
  );
  const data = snap.docs
    .map(d2 => ({ id:d2.id, ...d2.data() }))
    .sort((a,b) => (a.orderIndex??0)-(b.orderIndex??0));

  PL_SONGS.set(playlistId, data);
  s(`plsongs_${playlistId}`, data, 2*60000);
  return data;
};

export const removeSongFromPlaylist = async (songDocId, playlistId, userId) => {
  // Optimistic remove instantly
  const songs = PL_SONGS.get(playlistId) ?? [];
  PL_SONGS.set(playlistId, songs.filter(s2=>s2.id!==songDocId));

  const plCache = g(`pls_${userId}`) ?? [];
  s(`pls_${userId}`, plCache.map(p =>
    p.id === playlistId ? { ...p, songCount: Math.max(0,(p.songCount??1)-1) } : p
  ));
  d(`pl_${playlistId}`, `plsongs_${playlistId}`);

  // Background
  deleteDoc(doc(db,'playlist_songs',songDocId)).catch(console.error);
  updateDoc(doc(db,'playlists',playlistId), {
    songCount:increment(-1), updatedAt:serverTimestamp(),
  }).catch(console.error);
};

// ─── Liked Songs ──────────────────────────────────────────

export const addLikedSong = async (userId, song) => {
  // Optimistic: instant
  LIKED.set(song.videoId, true);

  // Invalidate liked list cache so Library refreshes
  d(`liked_${userId}`);

  // Background Firestore write
  setDoc(doc(db,'liked_songs',`${userId}_${song.videoId}`), {
    userId,
    videoId:         song.videoId      ?? '',
    title:           song.title        ?? '',
    channelName:     song.channelName  ?? '',
    thumbnailUrl:    song.thumbnailUrl ?? '',
    durationSeconds: song.durationSeconds ?? 0,
    likedAt:         serverTimestamp(),
  }).catch(err => {
    console.error('addLikedSong err:', err);
    LIKED.set(song.videoId, false); // revert on error
  });
};

export const removeLikedSong = async (userId, videoId) => {
  LIKED.set(videoId, false);
  d(`liked_${userId}`);

  deleteDoc(doc(db,'liked_songs',`${userId}_${videoId}`))
    .catch(err => {
      console.error('removeLikedSong err:', err);
      LIKED.set(videoId, true); // revert on error
    });
};

export const getLikedSongs = async (userId) => {
  const key = `liked_${userId}`;
  const hit = g(key);
  if (hit) return hit;

  const snap = await getDocs(
    query(collection(db,'liked_songs'), where('userId','==',userId))
  );
  const data = snap.docs
    .map(d2 => ({ id:d2.id, ...d2.data() }))
    .sort((a,b) => (b.likedAt?.seconds??0)-(a.likedAt?.seconds??0));

  data.forEach(s2 => LIKED.set(s2.videoId, true));
  s(key, data, 5*60000);
  return data;
};

// Sync check — 0ms, reads from in-memory Map
export const isLiked = (videoId) => LIKED.get(videoId) === true;

// Called on login — pre-warm LIKED map from Firestore
export const warmLikedSongs = async (userId) => {
  try {
    // Check localStorage first for instant warm
    const lsKey = `wv_liked_${userId}`;
    const cached = localStorage.getItem(lsKey);
    if (cached) {
      const { data, exp } = JSON.parse(cached);
      if (Date.now() < exp) {
        data.forEach(v => LIKED.set(v, true));
        return;
      }
    }
    // Fetch from Firestore
    const snap = await getDocs(
      query(collection(db,'liked_songs'), where('userId','==',userId))
    );
    const videoIds = snap.docs.map(d2 => d2.data().videoId).filter(Boolean);
    videoIds.forEach(v => LIKED.set(v, true));
    // Persist to localStorage (24h)
    localStorage.setItem(lsKey, JSON.stringify({
      data: videoIds, exp: Date.now() + 24*60*60000,
    }));
  } catch (err) { console.error('warmLikedSongs:', err); }
};

// ─── Recently Played ──────────────────────────────────────

export const addRecentlyPlayed = async (userId, song) => {
  setDoc(doc(db,'recently_played',`${userId}_${song.videoId}`), {
    userId, videoId:song.videoId, title:song.title,
    channelName:song.channelName, thumbnailUrl:song.thumbnailUrl,
    playedAt:serverTimestamp(),
  }).catch(()=>{});
};
