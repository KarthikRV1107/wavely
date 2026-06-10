// src/services/firestore.js
// Data persistence strategy:
//   Firestore  = permanent storage (survives logout/login)
//   localStorage = fast local cache keyed by uid (survives refresh)
//   module Maps = in-session speed layer (reset on refresh, filled from localStorage)
//
// On login: localStorage → module Maps (instant)
// On write: module Maps updated first (0ms UI), then Firestore + localStorage in bg
// On Firestore read: result written back to localStorage for next session

import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where,
  serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';

// ── localStorage helpers ──────────────────────────────────
const LS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

const lsSet = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, exp: Date.now() + LS_TTL }));
  } catch {}
};

const lsGet = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, exp } = JSON.parse(raw);
    if (Date.now() > exp) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
};

const lsDel = (key) => { try { localStorage.removeItem(key); } catch {} };

// ── In-session Maps (0ms reads) ───────────────────────────
export const LIKED    = new Map();   // videoId → true/false
const PL_CACHE  = new Map();   // uid → playlist[]
const PLS_CACHE = new Map();   // playlistId → song[]

// ─────────────────────────────────────────────────────────
// BOOTSTRAP — called once on login/refresh
// Loads ALL user data from localStorage into memory Maps
// so every read is instant from the very first render
// ─────────────────────────────────────────────────────────
export const bootstrapUserData = async (userId) => {
  // 1. Load liked songs from localStorage into LIKED Map
  const cachedLiked = lsGet(`wv_liked_${userId}`);
  if (cachedLiked) {
    cachedLiked.forEach(v => LIKED.set(v, true));
  }

  // 2. Load playlists from localStorage into PL_CACHE
  const cachedPls = lsGet(`wv_pls_${userId}`);
  if (cachedPls) {
    PL_CACHE.set(userId, cachedPls);
  }

  // 3. Fetch fresh data from Firestore in parallel (background)
  // Don't await — let the UI render with cached data first
  Promise.all([
    _fetchLikedFromFirestore(userId),
    _fetchPlaylistsFromFirestore(userId),
  ]).catch(console.error);
};

// ─────────────────────────────────────────────────────────
// LIKED SONGS
// ─────────────────────────────────────────────────────────
const _fetchLikedFromFirestore = async (userId) => {
  const snap = await getDocs(
    query(collection(db, 'liked_songs'), where('userId', '==', userId))
  );
  const songs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.likedAt?.seconds ?? 0) - (a.likedAt?.seconds ?? 0));

  // Update LIKED Map
  songs.forEach(s => LIKED.set(s.videoId, true));

  // Persist to localStorage
  lsSet(`wv_liked_${userId}`, songs.map(s => s.videoId));
  lsSet(`wv_liked_songs_${userId}`, songs);

  return songs;
};

export const isLiked = (videoId) => LIKED.get(videoId) === true;

export const getCachedLikedSongs = (userId) => {
  const cached = lsGet(`wv_liked_songs_${userId}`) ?? [];
  cached.forEach(s => LIKED.set(s.videoId, true));
  return cached;
};

export const addLikedSong = async (userId, song) => {
  // Instant optimistic update
  LIKED.set(song.videoId, true);

  // Update localStorage liked list
  const existing = lsGet(`wv_liked_songs_${userId}`) ?? [];
  const updated  = [{ ...song, likedAt: { seconds: Date.now() / 1000 } }, ...existing];
  lsSet(`wv_liked_songs_${userId}`, updated);
  lsSet(`wv_liked_${userId}`, updated.map(s => s.videoId));

  // Background Firestore write
  setDoc(doc(db, 'liked_songs', `${userId}_${song.videoId}`), {
    userId,
    videoId:         song.videoId      ?? '',
    title:           song.title        ?? '',
    channelName:     song.channelName  ?? '',
    thumbnailUrl:    song.thumbnailUrl ?? '',
    durationSeconds: song.durationSeconds ?? 0,
    likedAt:         serverTimestamp(),
  }).catch(err => {
    console.error('addLikedSong:', err);
    LIKED.set(song.videoId, false); // revert
  });
};

export const removeLikedSong = async (userId, videoId) => {
  LIKED.set(videoId, false);

  // Update localStorage
  const existing = lsGet(`wv_liked_songs_${userId}`) ?? [];
  const updated  = existing.filter(s => s.videoId !== videoId);
  lsSet(`wv_liked_songs_${userId}`, updated);
  lsSet(`wv_liked_${userId}`, updated.map(s => s.videoId));

  deleteDoc(doc(db, 'liked_songs', `${userId}_${videoId}`))
    .catch(err => {
      console.error('removeLikedSong:', err);
      LIKED.set(videoId, true); // revert
    });
};

export const getLikedSongs = async (userId) => {
  // 1. Return from localStorage instantly if available
  const cached = lsGet(`wv_liked_songs_${userId}`);
  if (cached) {
    cached.forEach(s => LIKED.set(s.videoId, true));
    // Refresh in background
    _fetchLikedFromFirestore(userId).catch(() => {});
    return cached;
  }
  // 2. Fetch from Firestore
  return _fetchLikedFromFirestore(userId);
};

// ─────────────────────────────────────────────────────────
// PLAYLISTS
// ─────────────────────────────────────────────────────────
const _fetchPlaylistsFromFirestore = async (userId) => {
  const snap = await getDocs(
    query(collection(db, 'playlists'), where('userId', '==', userId))
  );
  const data = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0));

  PL_CACHE.set(userId, data);
  lsSet(`wv_pls_${userId}`, data);
  return data;
};

export const getUserPlaylists = async (userId) => {
  // 1. In-memory (fastest)
  if (PL_CACHE.has(userId)) return PL_CACHE.get(userId);

  // 2. localStorage (fast, survives refresh)
  const cached = lsGet(`wv_pls_${userId}`);
  if (cached) {
    PL_CACHE.set(userId, cached);
    _fetchPlaylistsFromFirestore(userId).catch(() => {}); // refresh in bg
    return cached;
  }

  // 3. Firestore
  return _fetchPlaylistsFromFirestore(userId);
};

export const getCachedUserPlaylists = (userId) => {
  if (PL_CACHE.has(userId)) return PL_CACHE.get(userId);
  const cached = lsGet(`wv_pls_${userId}`) ?? [];
  if (cached.length) PL_CACHE.set(userId, cached);
  return cached;
};

export const createPlaylist = async (userId, { name, description = '' }) => {
  const tempId = `temp_${Date.now()}`;
  const newPl  = {
    id: tempId, userId, name, description,
    songCount: 0, isPublic: false,
    createdAt: { seconds: Date.now() / 1000 },
    updatedAt: { seconds: Date.now() / 1000 },
  };

  // Update in-memory and localStorage immediately
  const current = PL_CACHE.get(userId) ?? [];
  const updated = [newPl, ...current];
  PL_CACHE.set(userId, updated);
  lsSet(`wv_pls_${userId}`, updated);

  // Write to Firestore
  const ref = await addDoc(collection(db, 'playlists'), {
    userId, name, description,
    coverImageUrl: '', isPublic: false, songCount: 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });

  // Replace temp ID with real ID everywhere
  const withRealId = (PL_CACHE.get(userId) ?? []).map(p =>
    p.id === tempId ? { ...p, id: ref.id } : p
  );
  PL_CACHE.set(userId, withRealId);
  lsSet(`wv_pls_${userId}`, withRealId);

  return ref.id;
};

export const getPlaylist = async (id) => {
  // Check all playlist caches first
  for (const [, pls] of PL_CACHE) {
    const found = pls.find(p => p.id === id);
    if (found) return found;
  }
  const snap = await getDoc(doc(db, 'playlists', id));
  if (!snap.exists()) throw new Error('Playlist not found');
  return { id: snap.id, ...snap.data() };
};

export const getCachedPlaylist = (id) => {
  for (const [, pls] of PL_CACHE) {
    const found = pls.find(p => p.id === id);
    if (found) return found;
  }
  return null;
};

export const deletePlaylist = async (id, userId) => {
  // Remove from caches immediately
  const current = PL_CACHE.get(userId) ?? [];
  const updated = current.filter(p => p.id !== id);
  PL_CACHE.set(userId, updated);
  lsSet(`wv_pls_${userId}`, updated);
  PLS_CACHE.delete(id);

  deleteDoc(doc(db, 'playlists', id)).catch(console.error);
};

// ─────────────────────────────────────────────────────────
// PLAYLIST SONGS
// ─────────────────────────────────────────────────────────
export const addSongToPlaylist = async (playlistId, song, userId) => {
  const local = PLS_CACHE.get(playlistId) ?? [];
  const songObj = {
    id:              `temp_${Date.now()}`,
    playlistId,
    videoId:         song.videoId      ?? '',
    title:           song.title        ?? '',
    channelName:     song.channelName  ?? '',
    thumbnailUrl:    song.thumbnailUrl ?? '',
    durationSeconds: song.durationSeconds ?? 0,
    orderIndex:      local.length,
    addedAt:         { seconds: Date.now() / 1000 },
  };

  // Instant optimistic update
  const newSongs = [...local, songObj];
  PLS_CACHE.set(playlistId, newSongs);
  lsSet(`wv_plsongs_${playlistId}`, newSongs);

  // Update playlist songCount in cache
  if (userId) {
    const pls = PL_CACHE.get(userId) ?? [];
    const updated = pls.map(p =>
      p.id === playlistId ? { ...p, songCount: (p.songCount ?? 0) + 1 } : p
    );
    PL_CACHE.set(userId, updated);
    lsSet(`wv_pls_${userId}`, updated);
  }

  // Background Firestore writes
  addDoc(collection(db, 'playlist_songs'), {
    playlistId,
    videoId:         songObj.videoId,
    title:           songObj.title,
    channelName:     songObj.channelName,
    thumbnailUrl:    songObj.thumbnailUrl,
    durationSeconds: songObj.durationSeconds,
    orderIndex:      songObj.orderIndex,
    addedAt:         serverTimestamp(),
  }).then(ref => {
    const songs = PLS_CACHE.get(playlistId) ?? [];
    const fixed = songs.map(s => s.id === songObj.id ? { ...s, id: ref.id } : s);
    PLS_CACHE.set(playlistId, fixed);
    lsSet(`wv_plsongs_${playlistId}`, fixed);
  }).catch(console.error);

  updateDoc(doc(db, 'playlists', playlistId), {
    songCount: increment(1), updatedAt: serverTimestamp(),
  }).catch(console.error);
};

export const getPlaylistSongs = async (playlistId) => {
  // 1. In-memory
  if (PLS_CACHE.has(playlistId)) return PLS_CACHE.get(playlistId);

  // 2. localStorage
  const cached = lsGet(`wv_plsongs_${playlistId}`);
  if (cached) {
    PLS_CACHE.set(playlistId, cached);
    // Refresh from Firestore in background
    _fetchPlaylistSongsFromFirestore(playlistId).catch(() => {});
    return cached;
  }

  // 3. Firestore
  return _fetchPlaylistSongsFromFirestore(playlistId);
};

export const getCachedPlaylistSongs = (playlistId) => {
  if (PLS_CACHE.has(playlistId)) return PLS_CACHE.get(playlistId);
  const cached = lsGet(`wv_plsongs_${playlistId}`) ?? [];
  if (cached.length) PLS_CACHE.set(playlistId, cached);
  return cached;
};

const _fetchPlaylistSongsFromFirestore = async (playlistId) => {
  const snap = await getDocs(
    query(collection(db, 'playlist_songs'), where('playlistId', '==', playlistId))
  );
  const data = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  PLS_CACHE.set(playlistId, data);
  lsSet(`wv_plsongs_${playlistId}`, data);
  return data;
};

export const removeSongFromPlaylist = async (songDocId, playlistId, userId) => {
  const songs  = PLS_CACHE.get(playlistId) ?? [];
  const filtered = songs.filter(s => s.id !== songDocId);
  PLS_CACHE.set(playlistId, filtered);
  lsSet(`wv_plsongs_${playlistId}`, filtered);

  if (userId) {
    const pls = PL_CACHE.get(userId) ?? [];
    const updated = pls.map(p =>
      p.id === playlistId
        ? { ...p, songCount: Math.max(0, (p.songCount ?? 1) - 1) }
        : p
    );
    PL_CACHE.set(userId, updated);
    lsSet(`wv_pls_${userId}`, updated);
  }

  deleteDoc(doc(db, 'playlist_songs', songDocId)).catch(console.error);
  updateDoc(doc(db, 'playlists', playlistId), {
    songCount: increment(-1), updatedAt: serverTimestamp(),
  }).catch(console.error);
};

// Legacy export — still used by AuthContext
export const warmLikedSongs = (userId) => bootstrapUserData(userId);
