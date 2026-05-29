// src/hooks/usePlayer.js — updated to use split PlayerContext
import { useEffect, useRef, useCallback } from 'react';
import { usePlayerState, usePlayerActions } from '../context/PlayerContext';

export const useYouTubePlayer = () => {
  const { currentSong, isPlaying, volume } = usePlayerState();
  const { setTime, nextSong, dispatch, playerRef } = usePlayerActions();

  const intervalRef  = useRef(null);
  const containerRef = useRef(null);

  const onStateChange = useCallback((event) => {
    const YT = window.YT?.PlayerState;
    if (!YT) return;
    if (event.data === YT.PLAYING) {
      dispatch({ type:'SET_PLAY', v:true });
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const t = playerRef.current?.getCurrentTime?.() ?? 0;
        setTime(Math.floor(t));
      }, 1000);
    } else if (event.data === YT.PAUSED) {
      dispatch({ type:'SET_PLAY', v:false });
      clearInterval(intervalRef.current);
    } else if (event.data === YT.ENDED) {
      clearInterval(intervalRef.current);
      nextSong();
    }
  }, [dispatch, setTime, nextSong, playerRef]);

  const onError = useCallback((e) => {
    if ([101, 150].includes(e.data)) nextSong();
  }, [nextSong]);

  useEffect(() => {
    if (!containerRef.current) return;
    const create = () => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height:'0', width:'0',
        playerVars: { autoplay:1, controls:0, disablekb:1, modestbranding:1, rel:0 },
        events: { onStateChange, onError },
      });
    };
    if (window.YT?.Player) create();
    else window.onYouTubeIframeAPIReady = create;
    return () => { clearInterval(intervalRef.current); playerRef.current?.destroy?.(); };
  }, []); // eslint-disable-line

  // Load new video
  useEffect(() => {
    if (!playerRef.current || !currentSong?.videoId) return;
    playerRef.current.loadVideoById?.(currentSong.videoId);
  }, [currentSong?.videoId]); // eslint-disable-line

  // Sync play/pause
  useEffect(() => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.playVideo?.() : playerRef.current.pauseVideo?.();
  }, [isPlaying]); // eslint-disable-line

  // Sync volume
  useEffect(() => {
    playerRef.current?.setVolume?.(volume);
  }, [volume]); // eslint-disable-line

  const seekTo = useCallback((s) => {
    playerRef.current?.seekTo?.(s, true);
    setTime(s);
  }, [setTime]); // eslint-disable-line

  return { containerRef, seekTo };
};
