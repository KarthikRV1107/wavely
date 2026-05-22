import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy,
  limit, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Playlists ──────────────────────────────────────────────
export const createPlaylist = async (userId, { name, description = '' }) => {
  const ref = await addDoc(collection(db, 'playlists'), {
    userId, name, description, coverImageUrl: '',
    isPublic: false, songCount: 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getUserPlaylists = async (userId) => {
  const q    = query(collection(db, 'playlists'), where('userId', '==', userId), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getPlaylist = async (playlistId) => {
  const snap = await getDoc(doc(db, 'playlists', playlistId));
  if (!snap.exists()) throw new Error('Playlist not found');
  return { id: snap.id, ...snap.data() };
};

export const deletePlaylist = async (playlistId) => deleteDoc(doc(db, 'playlists', playlistId));

export const updatePlaylistName = async (playlistId, name) =>
  updateDoc(doc(db, 'playlists', playlistId), { name, updatedAt: serverTimestamp() });

// ── Playlist Songs ─────────────────────────────────────────
export const addSongToPlaylist = async (playlistId, song) => {
  const playlist   = await getPlaylist(playlistId);
  const orderIndex = playlist.songCount;
  await addDoc(collection(db, 'playlist_songs'), {
    playlistId, videoId: song.videoId, title: song.title,
    channelName: song.channelName, thumbnailUrl: song.thumbnailUrl,
    durationSeconds: song.durationSeconds, orderIndex, addedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'playlists', playlistId), { songCount: increment(1), updatedAt: serverTimestamp() });
};

export const getPlaylistSongs = async (playlistId) => {
  const q    = query(collection(db, 'playlist_songs'), where('playlistId', '==', playlistId), orderBy('orderIndex', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const removeSongFromPlaylist = async (songDocId, playlistId) => {
  await deleteDoc(doc(db, 'playlist_songs', songDocId));
  await updateDoc(doc(db, 'playlists', playlistId), { songCount: increment(-1), updatedAt: serverTimestamp() });
};

// ── Liked Songs ────────────────────────────────────────────
export const addLikedSong = async (userId, song) =>
  setDoc(doc(db, 'liked_songs', `${userId}_${song.videoId}`), {
    userId, videoId: song.videoId, title: song.title,
    channelName: song.channelName, thumbnailUrl: song.thumbnailUrl,
    durationSeconds: song.durationSeconds, likedAt: serverTimestamp(),
  });

export const removeLikedSong = async (userId, videoId) =>
  deleteDoc(doc(db, 'liked_songs', `${userId}_${videoId}`));

export const getLikedSongs = async (userId) => {
  const q    = query(collection(db, 'liked_songs'), where('userId', '==', userId), orderBy('likedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const isLiked = async (userId, videoId) => {
  const snap = await getDoc(doc(db, 'liked_songs', `${userId}_${videoId}`));
  return snap.exists();
};

// ── Recently Played ────────────────────────────────────────
export const addRecentlyPlayed = async (userId, song) =>
  setDoc(doc(db, 'recently_played', `${userId}_${song.videoId}`), {
    userId, videoId: song.videoId, title: song.title,
    channelName: song.channelName, thumbnailUrl: song.thumbnailUrl,
    playedAt: serverTimestamp(),
  });

export const getRecentlyPlayed = async (userId) => {
  const q    = query(collection(db, 'recently_played'), where('userId', '==', userId), orderBy('playedAt', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
