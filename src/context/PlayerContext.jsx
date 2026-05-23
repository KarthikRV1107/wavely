import { createContext, useContext, useReducer, useRef } from 'react';

const PlayerContext = createContext(null);

const initialState = {
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  volume: 80,
  currentTime: 0,
};

const playerReducer = (state, action) => {
  switch (action.type) {
    case 'PLAY_SONG':
      return { ...state, currentSong: action.song, queue: action.queue ?? [action.song], queueIndex: action.queueIndex ?? 0, isPlaying: true, currentTime: 0 };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.value };
    case 'NEXT_SONG': {
      const nextIndex = state.queueIndex + 1;
      if (nextIndex >= state.queue.length) return state;
      return { ...state, queueIndex: nextIndex, currentSong: state.queue[nextIndex], isPlaying: true, currentTime: 0 };
    }
    case 'PREV_SONG': {
      const prevIndex = Math.max(0, state.queueIndex - 1);
      return { ...state, queueIndex: prevIndex, currentSong: state.queue[prevIndex], isPlaying: true, currentTime: 0 };
    }
    case 'SET_VOLUME':  return { ...state, volume: action.value };
    case 'SET_TIME':    return { ...state, currentTime: action.value };
    case 'SET_QUEUE':   return { ...state, queue: action.queue, queueIndex: 0, currentSong: action.queue[0], isPlaying: true };
    default:            return state;
  }
};

export const PlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const playerRef = useRef(null);

  const playSong   = (song, queue = null, index = 0) => dispatch({ type: 'PLAY_SONG',  song, queue, queueIndex: index });
  const togglePlay = ()       => dispatch({ type: 'TOGGLE_PLAY' });
  const nextSong   = ()       => dispatch({ type: 'NEXT_SONG' });
  const prevSong   = ()       => dispatch({ type: 'PREV_SONG' });
  const setVolume  = (v)      => dispatch({ type: 'SET_VOLUME', value: v });
  const setTime    = (t)      => dispatch({ type: 'SET_TIME',   value: t });
  const setQueue   = (queue)  => dispatch({ type: 'SET_QUEUE',  queue });

  return (
    <PlayerContext.Provider value={{ ...state, playerRef, dispatch, playSong, togglePlay, nextSong, prevSong, setVolume, setTime, setQueue }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
};
