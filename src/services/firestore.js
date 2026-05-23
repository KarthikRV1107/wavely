// src/services/firestore.js — optimised with in-memory caching
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy,
  limit, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { cache } from '../utils/cache';

// ─── Playlists ────────────────────────────────────────────
export const createPlaylist = async (userId, { name, description='' }) => {
  const ref = await addDoc(collection(db,'playlists'), {
    userId, name, description, coverImageUrl:'',
    isPublic:false, songCount:0,
    createdAt:serverTimestamp(), updatedAt:serverTimestamp(),
  });
  cache.clear(); // invalidate playlist cache
  return ref.id;
};

export const getUserPlaylists = async (userId) => {
  const cKey   = `playlists_${userId}`;
  const cached = cache.get(cKey);
  if (cached) return cached;

  const q    = query(collection(db,'playlists'), where('userId','==',userId), orderBy('updatedAt','desc'));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  cache.set(cKey, data, 3 * 60 * 1000); // 3 min
  return data;
};

export const getPlaylist = async (playlistId) => {
  const cKey   = `pl_${playlistId}`;
  const cached = cache.get(cKey);
  if (cached) return cached;

  const snap = await getDoc(doc(db,'playlists',playlistId));
  if (!snap.exists()) throw new Error('Playlist not found');
  const data = { id:snap.id, ...snap.data() };
  cache.set(cKey, data, 3 * 60 * 1000);
  return data;
};

export const deletePlaylist    = async (id) => { await deleteDoc(doc(db,'playlists',id)); cache.clear(); };
export const updatePlaylistName = async (id, name) => {
  await updateDoc(doc(db,'playlists',id), { name, updatedAt:serverTimestamp() });
  cache.clear();
};

// ─── Playlist Songs ───────────────────────────────────────
export const addSongToPlaylist = async (playlistId, song) => {
  const pl = await getPlaylist(playlistId);
  await addDoc(collection(db,'playlist_songs'), {
    playlistId, videoId:song.videoId, title:song.title,
    channelName:song.channelName, thumbnailUrl:song.thumbnailUrl,
    durationSeconds:song.durationSeconds, orderIndex:pl.songCount,
    addedAt:serverTimestamp(),
  });
  await updateDoc(doc(db,'playlists',playlistId), { songCount:increment(1), updatedAt:serverTimestamp() });
  cache.clear();
};

export const getPlaylistSongs = async (playlistId) => {
  const cKey   = `plsongs_${playlistId}`;
  const cached = cache.get(cKey);
  if (cached) return cached;

  const q    = query(collection(db,'playlist_songs'), where('playlistId','==',playlistId), orderBy('orderIndex','asc'));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  cache.set(cKey, data, 2 * 60 * 1000);
  return data;
};

export const removeSongFromPlaylist = async (songDocId, playlistId) => {
  await deleteDoc(doc(db,'playlist_songs',songDocId));
  await updateDoc(doc(db,'playlists',playlistId), { songCount:increment(-1), updatedAt:serverTimestamp() });
  cache.clear();
};

// ─── Liked Songs ──────────────────────────────────────────
// Uses userId_videoId as doc ID — makes isLiked O(1) and prevents duplicates

export const addLikedSong = async (userId, song) => {
  const docId = `${userId}_${song.videoId}`;
  await setDoc(doc(db,'liked_songs',docId), {
    userId, videoId:song.videoId, title:song.title,
    channelName:song.channelName, thumbnailUrl:song.thumbnailUrl,
    durationSeconds:song.durationSeconds ?? 0,
    likedAt:serverTimestamp(),
  });
  // Bust liked cache
  cache.set(`liked_${userId}_${song.videoId}`, true, 30*60*1000);
  MEM_LIKED.set(docId, true);
  cache.clear();
};

export const removeLikedSong = async (userId, videoId) => {
  const docId = `${userId}_${videoId}`;
  await deleteDoc(doc(db,'liked_songs',docId));
  MEM_LIKED.delete(docId);
  cache.clear();
};

// Fast in-memory liked set — avoids Firestore reads on every SongCard
const MEM_LIKED = new Map();

export const isLiked = async (userId, videoId) => {
  const docId  = `${userId}_${videoId}`;
  if (MEM_LIKED.has(docId)) return MEM_LIKED.get(docId);

  const cKey   = `lk_${docId}`;
  const cached = cache.get(cKey);
  if (cached !== null) return !!cached;

  const snap = await getDoc(doc(db,'liked_songs',docId));
  const val  = snap.exists();
  MEM_LIKED.set(docId, val);
  cache.set(cKey, val, 10*60*1000);
  return val;
};

export const getLikedSongs = async (userId) => {
  const cKey   = `liked_all_${userId}`;
  const cached = cache.get(cKey);
  if (cached) {
    // Populate MEM_LIKED from cached data
    cached.forEach(s => MEM_LIKED.set(`${userId}_${s.videoId}`, true));
    return cached;
  }

  const q    = query(collection(db,'liked_songs'), where('userId','==',userId), orderBy('likedAt','desc'));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  data.forEach(s => MEM_LIKED.set(`${userId}_${s.videoId}`, true));
  cache.set(cKey, data, 5*60*1000);
  return data;
};

// ─── Recently Played ──────────────────────────────────────
export const addRecentlyPlayed = async (userId, song) => {
  await setDoc(doc(db,'recently_played',`${userId}_${song.videoId}`), {
    userId, videoId:song.videoId, title:song.title,
    channelName:song.channelName, thumbnailUrl:song.thumbnailUrl,
    playedAt:serverTimestamp(),
  });
};

export const getRecentlyPlayed = async (userId) => {
  const q    = query(collection(db,'recently_played'), where('userId','==',userId), orderBy('playedAt','desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
};
