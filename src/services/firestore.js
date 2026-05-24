// src/services/firestore.js
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy,
  limit, serverTimestamp, increment, getCountFromServer,
} from 'firebase/firestore';
import { db } from './firebase';

// Simple in-memory cache — no localStorage to avoid stale data bugs
const MEM = new Map();
const memGet = (k) => {
  const e = MEM.get(k);
  if (!e) return null;
  if (Date.now() > e.exp) { MEM.delete(k); return null; }
  return e.data;
};
const memSet = (k, data, ttl = 60000) => MEM.set(k, { data, exp: Date.now() + ttl });
const memDel = (...keys) => keys.forEach(k => MEM.delete(k));
const memClear = () => MEM.clear();

// ─── Playlists ────────────────────────────────────────────
export const createPlaylist = async (userId, { name, description = '' }) => {
  const ref = await addDoc(collection(db, 'playlists'), {
    userId, name, description,
    coverImageUrl: '', isPublic: false, songCount: 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  memDel(`pls_${userId}`);
  return ref.id;
};

export const getUserPlaylists = async (userId) => {
  const key = `pls_${userId}`;
  const hit = memGet(key);
  if (hit) return hit;
  // Simple query without orderBy to avoid needing composite index
  const q    = query(collection(db, 'playlists'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const data = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0));
  memSet(key, data, 2 * 60 * 1000);
  return data;
};

export const getPlaylist = async (id) => {
  const key = `pl_${id}`;
  const hit = memGet(key);
  if (hit) return hit;
  const snap = await getDoc(doc(db, 'playlists', id));
  if (!snap.exists()) throw new Error('Playlist not found');
  const data = { id: snap.id, ...snap.data() };
  memSet(key, data, 2 * 60 * 1000);
  return data;
};

export const deletePlaylist = async (id, userId) => {
  await deleteDoc(doc(db, 'playlists', id));
  memDel(`pl_${id}`, `pls_${userId}`);
  memClear();
};

export const updatePlaylistName = async (id, name, userId) => {
  await updateDoc(doc(db, 'playlists', id), { name, updatedAt: serverTimestamp() });
  memDel(`pl_${id}`, `pls_${userId}`);
};

// ─── Playlist Songs ───────────────────────────────────────
export const addSongToPlaylist = async (playlistId, song, userId) => {
  // Get current count directly from Firestore (no cache) to avoid orderIndex bugs
  const plSnap = await getDoc(doc(db, 'playlists', playlistId));
  const orderIndex = plSnap.exists() ? (plSnap.data().songCount ?? 0) : 0;

  await addDoc(collection(db, 'playlist_songs'), {
    playlistId,
    videoId:         song.videoId      ?? '',
    title:           song.title        ?? '',
    channelName:     song.channelName  ?? '',
    thumbnailUrl:    song.thumbnailUrl ?? '',
    durationSeconds: song.durationSeconds ?? 0,
    orderIndex,
    addedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'playlists', playlistId), {
    songCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  // Bust caches
  memDel(`pl_${playlistId}`, `plsongs_${playlistId}`);
  if (userId) memDel(`pls_${userId}`);
};

export const getPlaylistSongs = async (playlistId) => {
  const key = `plsongs_${playlistId}`;
  const hit = memGet(key);
  if (hit) return hit;
  // Simple query without orderBy to avoid composite index requirement
  const q    = query(collection(db, 'playlist_songs'), where('playlistId', '==', playlistId));
  const snap = await getDocs(q);
  const data = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  memSet(key, data, 60 * 1000);
  return data;
};

export const removeSongFromPlaylist = async (songDocId, playlistId) => {
  await deleteDoc(doc(db, 'playlist_songs', songDocId));
  await updateDoc(doc(db, 'playlists', playlistId), {
    songCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
  memDel(`pl_${playlistId}`, `plsongs_${playlistId}`);
};

// ─── Liked Songs ──────────────────────────────────────────
const LIKED_MEM = new Map(); // videoId → bool, per session

export const addLikedSong = async (userId, song) => {
  const docId = `${userId}_${song.videoId}`;
  await setDoc(doc(db, 'liked_songs', docId), {
    userId,
    videoId:         song.videoId      ?? '',
    title:           song.title        ?? '',
    channelName:     song.channelName  ?? '',
    thumbnailUrl:    song.thumbnailUrl ?? '',
    durationSeconds: song.durationSeconds ?? 0,
    likedAt: serverTimestamp(),
  });
  LIKED_MEM.set(song.videoId, true);
  memDel(`liked_${userId}`);
};

export const removeLikedSong = async (userId, videoId) => {
  await deleteDoc(doc(db, 'liked_songs', `${userId}_${videoId}`));
  LIKED_MEM.set(videoId, false);
  memDel(`liked_${userId}`);
};

export const getLikedSongs = async (userId) => {
  const key = `liked_${userId}`;
  const hit = memGet(key);
  if (hit) return hit;
  // Simple query without orderBy
  const q    = query(collection(db, 'liked_songs'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const data = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.likedAt?.seconds ?? 0) - (a.likedAt?.seconds ?? 0));
  // Populate LIKED_MEM from real data
  data.forEach(s => LIKED_MEM.set(s.videoId, true));
  memSet(key, data, 3 * 60 * 1000);
  return data;
};

export const isLiked = (videoId) => LIKED_MEM.get(videoId) ?? false;

// Pre-warm liked set from Firestore on login
export const warmLikedSongs = async (userId) => {
  try {
    const data = await getLikedSongs(userId);
    data.forEach(s => LIKED_MEM.set(s.videoId, true));
  } catch {}
};

// ─── Recently Played ──────────────────────────────────────
export const addRecentlyPlayed = async (userId, song) => {
  try {
    await setDoc(doc(db, 'recently_played', `${userId}_${song.videoId}`), {
      userId, videoId: song.videoId,
      title: song.title, channelName: song.channelName,
      thumbnailUrl: song.thumbnailUrl,
      playedAt: serverTimestamp(),
    });
  } catch {} // non-critical, never crash for this
};

export const getRecentlyPlayed = async (userId) => {
  const q    = query(collection(db, 'recently_played'), where('userId', '==', userId), limit(20));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.playedAt?.seconds ?? 0) - (a.playedAt?.seconds ?? 0));
};
