// src/hooks/usePlayer.js — updated to use split PlayerContext
import { useEffect, useRef, useCallback } from 'react';
import {
  useCurrentSong,
  useCurrentTime,
  useIsPlaying,
  usePlayerActions,
  useVolume,
} from '../context/PlayerContext';
import { loadYouTubeVideo } from '../utils/youtubePlayer';

export const useYouTubePlayer = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const currentTime = useCurrentTime();
  const volume = useVolume();
  const { setTime, nextSong, dispatch, playerRef } = usePlayerActions();
  const { prevSong } = usePlayerActions();

  const intervalRef  = useRef(null);
  const containerRef = useRef(null);
  const readyRef = useRef(false);
  const latestRef = useRef({ currentSong, isPlaying, volume });
  latestRef.current = { currentSong, isPlaying, volume };

  const onReady = useCallback((event) => {
    readyRef.current = true;
    playerRef.current = event.target;
    event.target.__wavelyReady = true;
    event.target.__wavelyRequestedVideoId = null;
    event.target.__wavelyPendingUntil = 0;
    const latest = latestRef.current;
    event.target.setVolume?.(latest.volume);
    if (!latest.currentSong?.videoId) return;
    if (latest.isPlaying) loadYouTubeVideo(event.target, latest.currentSong.videoId);
    else {
      event.target.cueVideoById?.(latest.currentSong.videoId);
      event.target.__wavelyRequestedVideoId = latest.currentSong.videoId;
    }
  }, [playerRef]);

  useEffect(() => {
    const mediaSession = navigator.mediaSession;
    if (!mediaSession || !currentSong) return;

    if (typeof window.MediaMetadata === 'function') {
      mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.title || 'Wavely',
        artist: currentSong.channelName || 'Wavely',
        album: 'Wavely',
        artwork: currentSong.thumbnailUrl ? [
          { src: currentSong.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' },
        ] : [],
      });
    }

    const actions = {
      play: () => {
        playerRef.current?.playVideo?.();
        dispatch({ type:'SET_PLAY', v:true });
      },
      pause: () => {
        playerRef.current?.pauseVideo?.();
        dispatch({ type:'SET_PLAY', v:false });
      },
      previoustrack: () => prevSong(),
      nexttrack: () => nextSong(),
      seekto: (event) => {
        if (Number.isFinite(event.seekTime)) {
          playerRef.current?.seekTo?.(event.seekTime, true);
          setTime(Math.floor(event.seekTime));
        }
      },
    };
    Object.entries(actions).forEach(([action, handler]) => {
      try { mediaSession.setActionHandler(action, handler); } catch (_) { /* Unsupported action */ }
    });

    return () => {
      Object.keys(actions).forEach((action) => {
        try { mediaSession.setActionHandler(action, null); } catch (_) { /* Unsupported action */ }
      });
    };
  }, [currentSong?.videoId, nextSong, prevSong, playerRef, setTime, dispatch]);

  useEffect(() => {
    if (!navigator.mediaSession || !currentSong) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    if (currentSong.durationSeconds > 0 && Number.isFinite(currentTime)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: currentSong.durationSeconds,
          playbackRate: 1,
          position: Math.min(currentTime, currentSong.durationSeconds),
        });
      } catch (_) { /* Position state is optional */ }
    }
  }, [currentSong, currentTime, isPlaying]);

  const onStateChange = useCallback((event) => {
    const YT = window.YT?.PlayerState;
    if (!YT) return;
    if (event.data === YT.PLAYING) {
      if (playerRef.current) playerRef.current.__wavelyPendingUntil = 0;
      dispatch({ type:'SET_PLAY', v:true });
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const t = playerRef.current?.getCurrentTime?.() ?? 0;
        setTime(Math.floor(t));
      }, 1000);
    } else if (event.data === YT.PAUSED) {
      if ((playerRef.current?.__wavelyPendingUntil ?? 0) > Date.now()) return;
      if (playerRef.current) playerRef.current.__wavelyPendingUntil = 0;
      dispatch({ type:'SET_PLAY', v:false });
      clearInterval(intervalRef.current);
    } else if (event.data === YT.ENDED) {
      clearInterval(intervalRef.current);
      nextSong();
    }
  }, [dispatch, setTime, nextSong, playerRef]);

  const onError = useCallback((e) => {
    if (playerRef.current) playerRef.current.__wavelyPendingUntil = 0;
    if ([101, 150].includes(e.data)) nextSong();
  }, [nextSong, playerRef]);

  useEffect(() => {
    if (!containerRef.current) return;
    const create = () => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height:'0', width:'0',
        playerVars: { autoplay:1, controls:0, disablekb:1, modestbranding:1, rel:0 },
        events: { onReady, onStateChange, onError },
      });
    };
    if (window.YT?.Player) create();
    else window.onYouTubeIframeAPIReady = create;
    return () => {
      readyRef.current = false;
      clearInterval(intervalRef.current);
      playerRef.current?.destroy?.();
    };
  }, [onReady]); // eslint-disable-line

  // Load new video
  useEffect(() => {
    if (!readyRef.current || !currentSong?.videoId) return;
    loadYouTubeVideo(playerRef.current, currentSong.videoId);
  }, [currentSong?.videoId]); // eslint-disable-line

  // Sync play/pause
  useEffect(() => {
    if (!readyRef.current) return;
    if (!isPlaying) playerRef.current.__wavelyPendingUntil = 0;
    isPlaying ? playerRef.current.playVideo?.() : playerRef.current.pauseVideo?.();
  }, [isPlaying]); // eslint-disable-line

  // Sync volume
  useEffect(() => {
    if (readyRef.current) playerRef.current?.setVolume?.(volume);
  }, [volume]); // eslint-disable-line

  const seekTo = useCallback((s) => {
    playerRef.current?.seekTo?.(s, true);
    setTime(s);
  }, [setTime]); // eslint-disable-line

  return { containerRef, seekTo };
};
