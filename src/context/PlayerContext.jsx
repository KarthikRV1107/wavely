// src/context/PlayerContext.jsx
// FIX: Split into two contexts — PlayerStateCtx and PlayerActionsCtx
// Actions never change reference → components using only actions never re-render
// from state changes (e.g. setTime fires every second but doesn't affect action refs)
import { createContext, useContext, useReducer, useRef, useMemo } from 'react';

const CurrentSongCtx = createContext(null);
const PlaybackCtx    = createContext(false);
const VolumeCtx      = createContext(80);
const CurrentTimeCtx = createContext(0);
const QueueCtx       = createContext({ queue: [], queueIndex: 0 });
const ActionsCtx     = createContext(null);

const init = {
  currentSong: null, queue: [], queueIndex: 0,
  isPlaying: false,  volume: 80, currentTime: 0,
};

const reducer = (s, a) => {
  switch (a.type) {
    case 'PLAY':      return { ...s, currentSong:a.song, queue:a.queue??[a.song], queueIndex:a.idx??0, isPlaying:true,  currentTime:0 };
    case 'TOGGLE':    return { ...s, isPlaying:!s.isPlaying };
    case 'SET_PLAY':  return { ...s, isPlaying:a.v };
    case 'NEXT': {
      const ni = s.queueIndex+1;
      return ni>=s.queue.length ? s : { ...s, queueIndex:ni, currentSong:s.queue[ni], isPlaying:true, currentTime:0 };
    }
    case 'PREV': {
      const pi = Math.max(0,s.queueIndex-1);
      return { ...s, queueIndex:pi, currentSong:s.queue[pi], isPlaying:true, currentTime:0 };
    }
    case 'VOL':  return { ...s, volume:a.v };
    case 'TIME': return { ...s, currentTime:a.v };  // fires every second — only TIME consumers re-render
    case 'QUEUE':return { ...s, queue:a.queue, queueIndex:0, currentSong:a.queue[0], isPlaying:true };
    default:     return s;
  }
};

export const PlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, init);
  const playerRef = useRef(null);
  const queueState = useMemo(() => ({
    queue: state.queue,
    queueIndex: state.queueIndex,
  }), [state.queue, state.queueIndex]);

  // Actions are stable refs — created once, never change
  const actions = useMemo(() => ({
    playerRef,
    dispatch,
    playSong:   (song, queue=null, idx=0) => dispatch({ type:'PLAY',   song, queue, idx }),
    togglePlay: ()    => dispatch({ type:'TOGGLE' }),
    nextSong:   ()    => dispatch({ type:'NEXT' }),
    prevSong:   ()    => dispatch({ type:'PREV' }),
    setVolume:  (v)   => dispatch({ type:'VOL',  v }),
    setTime:    (v)   => dispatch({ type:'TIME', v }),
    setQueue:   (q)   => dispatch({ type:'QUEUE', queue:q }),
  }), []); // empty deps — truly stable

  return (
    <ActionsCtx.Provider value={actions}>
      <CurrentSongCtx.Provider value={state.currentSong}>
        <PlaybackCtx.Provider value={state.isPlaying}>
          <VolumeCtx.Provider value={state.volume}>
            <CurrentTimeCtx.Provider value={state.currentTime}>
              <QueueCtx.Provider value={queueState}>
                {children}
              </QueueCtx.Provider>
            </CurrentTimeCtx.Provider>
          </VolumeCtx.Provider>
        </PlaybackCtx.Provider>
      </CurrentSongCtx.Provider>
    </ActionsCtx.Provider>
  );
};

// usePlayer — full state + actions (use sparingly, re-renders on every state change)
export const usePlayer = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const volume = useVolume();
  const currentTime = useCurrentTime();
  const { queue, queueIndex } = useQueueState();
  const actions = usePlayerActions();
  return { currentSong, isPlaying, volume, currentTime, queue, queueIndex, ...actions };
};

// Granular selectors — components only re-render when their slice changes
export const usePlayerActions = () => {
  const value = useContext(ActionsCtx);
  if (!value) throw new Error('usePlayerActions must be inside PlayerProvider');
  return value;
};
export const useCurrentSong = () => useContext(CurrentSongCtx);
export const useIsPlaying = () => useContext(PlaybackCtx);
export const useVolume = () => useContext(VolumeCtx);
export const useCurrentTime = () => useContext(CurrentTimeCtx);
export const useQueueState = () => useContext(QueueCtx);
