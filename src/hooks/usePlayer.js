import { useEffect, useRef, useCallback } from 'react';
import { usePlayer as usePlayerContext } from '../context/PlayerContext';

export const useYouTubePlayer = () => {
  const { currentSong, isPlaying, volume, playerRef, setTime, nextSong, dispatch } = usePlayerContext();
  const intervalRef  = useRef(null);
  const containerRef = useRef(null);

  const onPlayerStateChange = useCallback((event) => {
    const YT = window.YT.PlayerState;
    if (event.data === YT.PLAYING) {
      dispatch({ type: 'SET_PLAYING', value: true });
      intervalRef.current = setInterval(() => {
        const t = playerRef.current?.getCurrentTime?.() ?? 0;
        setTime(Math.floor(t));
      }, 1000);
    } else if (event.data === YT.PAUSED) {
      dispatch({ type: 'SET_PLAYING', value: false });
      clearInterval(intervalRef.current);
    } else if (event.data === YT.ENDED) {
      clearInterval(intervalRef.current);
      nextSong();
    }
  }, [dispatch, setTime, nextSong, playerRef]);

  const onPlayerError = useCallback((event) => {
    console.warn('YouTube player error:', event.data);
    if ([101, 150].includes(event.data)) nextSong();
  }, [nextSong]);

  useEffect(() => {
    if (!containerRef.current) return;
    const createPlayer = () => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '0', width: '0',
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, modestbranding: 1, rel: 0 },
        events: { onStateChange: onPlayerStateChange, onError: onPlayerError },
      });
    };
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }
    return () => {
      clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!playerRef.current || !currentSong?.videoId) return;
    playerRef.current.loadVideoById(currentSong.videoId);
  }, [currentSong?.videoId]); // eslint-disable-line

  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) { playerRef.current.playVideo?.(); }
    else { playerRef.current.pauseVideo?.(); }
  }, [isPlaying]); // eslint-disable-line

  useEffect(() => { playerRef.current?.setVolume?.(volume); }, [volume]); // eslint-disable-line

  const seekTo = useCallback((seconds) => {
    playerRef.current?.seekTo?.(seconds, true);
    setTime(seconds);
  }, [setTime]); // eslint-disable-line

  return { containerRef, seekTo };
};
