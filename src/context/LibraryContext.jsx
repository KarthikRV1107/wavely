import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  addLikedSong,
  createPlaylist,
  getCachedLikedSongs,
  getCachedUserPlaylists,
  getLikedSongs,
  getUserPlaylists,
  removeLikedSong,
} from '../services/firestore';

const Ctx = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const alive = useRef(true);

  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    alive.current = true;
    if (!uid) {
      setPlaylists([]);
      setLikedSongs([]);
      setLoading(false);
      return () => { alive.current = false; };
    }

    const cachedPlaylists = getCachedUserPlaylists(uid);
    const cachedLiked = getCachedLikedSongs(uid);
    const hasCache = cachedPlaylists.length > 0 || cachedLiked.length > 0;

    setPlaylists(cachedPlaylists);
    setLikedSongs(cachedLiked);
    setLoading(!hasCache);

    Promise.all([
      getUserPlaylists(uid),
      getLikedSongs(uid),
    ]).then(([nextPlaylists, nextLiked]) => {
      if (!alive.current) return;
      setPlaylists(nextPlaylists);
      setLikedSongs(nextLiked);
    }).catch((err) => {
      console.error('Library bootstrap failed:', err);
    }).finally(() => {
      if (alive.current) setLoading(false);
    });

    return () => { alive.current = false; };
  }, [uid]);

  const createPlaylistEntry = useCallback(async (name) => {
    if (!uid) throw new Error('User not available');
    const playlist = await createPlaylist(uid, { name });
    setPlaylists((current) => [playlist, ...current]);
    return playlist;
  }, [uid]);

  const adjustPlaylistSongCount = useCallback((playlistId, delta) => {
    if (!delta) return;
    setPlaylists((current) => current.map((pl) =>
      pl.id === playlistId
        ? { ...pl, songCount: Math.max(0, (pl.songCount ?? 0) + delta) }
        : pl
    ));
  }, []);

  const removePlaylistEntry = useCallback((playlistId) => {
    setPlaylists((current) => current.filter((pl) => pl.id !== playlistId));
  }, []);

  const likeSong = useCallback((song) => {
    if (!uid) return;
    setLikedSongs((current) => {
      if (current.some((item) => item.videoId === song.videoId)) return current;
      return [{ ...song, likedAt: { seconds: Date.now() / 1000 } }, ...current];
    });
    addLikedSong(uid, song);
  }, [uid]);

  const unlikeSong = useCallback((videoId) => {
    if (!uid) return;
    setLikedSongs((current) => current.filter((song) => song.videoId !== videoId));
    removeLikedSong(uid, videoId);
  }, [uid]);

  const value = useMemo(() => ({
    playlists,
    likedSongs,
    loading,
    createPlaylistEntry,
    adjustPlaylistSongCount,
    removePlaylistEntry,
    likeSong,
    unlikeSong,
  }), [
    playlists,
    likedSongs,
    loading,
    createPlaylistEntry,
    adjustPlaylistSongCount,
    removePlaylistEntry,
    likeSong,
    unlikeSong,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLibrary() {
  const value = useContext(Ctx);
  if (!value) throw new Error('useLibrary must be inside LibraryProvider');
  return value;
}
