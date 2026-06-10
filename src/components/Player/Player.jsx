// src/components/Player/Player.jsx
// FIX: Uses granular selectors — only re-renders on relevant state slices
// setTime fires every second; only Player re-renders, not the whole tree
import { memo } from 'react';
import {
  useCurrentSong,
  useCurrentTime,
  useIsPlaying,
  usePlayerActions,
  useQueueState,
  useVolume,
} from '../../context/PlayerContext';
import { useYouTubePlayer } from '../../hooks/usePlayer';
import { useBreakpoint }    from '../../hooks/useBreakpoint';
import { formatTime }       from '../../utils/formatTime';

const Player = memo(function Player() {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const currentTime = useCurrentTime();
  const volume = useVolume();
  const { queue, queueIndex } = useQueueState();
  const { togglePlay, nextSong, prevSong, setVolume }
    = usePlayerActions();
  const { containerRef, seekTo } = useYouTubePlayer();
  const { isDesktop } = useBreakpoint();

  const hidden = (
    <div ref={containerRef}
      style={{ position:'absolute', width:0, height:0, overflow:'hidden', pointerEvents:'none' }}
      aria-hidden/>
  );

  if (!currentSong) return hidden;

  const pct     = currentSong.durationSeconds > 0
    ? (currentTime / currentSong.durationSeconds) * 100 : 0;
  const hasPrev = queueIndex > 0;
  const hasNext = queueIndex < queue.length - 1;

  const handleSeek = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    seekTo(Math.floor(((e.clientX - r.left) / r.width) * currentSong.durationSeconds));
  };

  if (isDesktop) return (
    <>
      {hidden}
      <div style={{
        position:'fixed', bottom:0, left:'var(--sidebar-w)', right:0, zIndex:80,
        height:'var(--player-h)',
        background:'rgba(12,12,20,0.97)',
        backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
        borderTop:'1px solid var(--border2)',
        boxShadow:'0 -4px 32px rgba(0,0,0,0.5)',
        display:'flex', alignItems:'center', gap:24, padding:'0 32px',
      }}>
        {/* Song info */}
        <div style={{ display:'flex', alignItems:'center', gap:12, width:240, flexShrink:0 }}>
          <img src={currentSong.thumbnailUrl} alt={currentSong.title}
            style={{ width:48, height:48, borderRadius:10, objectFit:'cover', flexShrink:0,
                     boxShadow: isPlaying?'0 0 16px rgba(124,106,247,0.4)':'none',
                     transition:'box-shadow 0.4s' }}/>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text1)', margin:0,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {currentSong.title}
            </p>
            <p style={{ fontSize:11, color:'var(--text3)', margin:'1px 0 0',
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {currentSong.channelName}
            </p>
          </div>
        </div>

        {/* Controls + seekbar */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6, alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <CB onClick={prevSong} disabled={!hasPrev} size={30}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/>
              </svg>
            </CB>
            <CB onClick={togglePlay} size={42} primary>
              {isPlaying
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft:2}}><polygon points="5,3 19,12 5,21"/></svg>
              }
            </CB>
            <CB onClick={nextSong} disabled={!hasNext} size={30}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/>
              </svg>
            </CB>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, width:'100%', maxWidth:480 }}>
            <span style={{ fontSize:10, color:'var(--text3)', minWidth:34, textAlign:'right' }}>
              {formatTime(currentTime)}
            </span>
            <div onClick={handleSeek} style={{
              flex:1, height:4, background:'var(--bg4)',
              borderRadius:2, cursor:'pointer', position:'relative',
            }}>
              <div style={{
                position:'absolute', left:0, top:0, bottom:0, width:`${pct}%`,
                background:'linear-gradient(90deg,var(--accent),var(--pink))',
                borderRadius:2, transition:'width 0.8s linear',
              }}/>
            </div>
            <span style={{ fontSize:10, color:'var(--text3)', minWidth:34 }}>
              {formatTime(currentSong.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div style={{ display:'flex', alignItems:'center', gap:8, width:160, flexShrink:0 }}>
          <button onClick={()=>setVolume(volume>0?0:80)} style={{
            background:'none', border:'none', color:'var(--text3)', cursor:'pointer', padding:2,
          }}>
            <VolIco muted={volume===0}/>
          </button>
          <input type="range" min="0" max="100" value={volume} step="1"
            onChange={e=>setVolume(Number(e.target.value))}
            style={{ flex:1, accentColor:'var(--accent)', cursor:'pointer', height:4 }}/>
          <span style={{ fontSize:10, color:'var(--text3)', minWidth:26 }}>{volume}%</span>
        </div>
      </div>
    </>
  );

  // Mobile
  return (
    <>
      {hidden}
      <div style={{
        position:'fixed', bottom:'var(--nav-h)', left:0, right:0, zIndex:80, padding:'0 10px 6px',
      }}>
        <div style={{
          background:'rgba(18,18,28,0.97)',
          backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
          borderRadius:18, border:'1px solid var(--border2)',
          boxShadow:'0 -4px 28px rgba(0,0,0,0.6)', overflow:'hidden',
        }}>
          <div onClick={handleSeek} style={{ height:3, background:'var(--bg4)', cursor:'pointer' }}>
            <div style={{ height:'100%', width:`${pct}%`,
                          background:'linear-gradient(90deg,var(--accent),var(--pink))',
                          transition:'width 0.8s linear' }}/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px 10px' }}>
            <img src={currentSong.thumbnailUrl} alt=""
              style={{ width:42, height:42, borderRadius:9, objectFit:'cover', flexShrink:0,
                       boxShadow:isPlaying?'0 0 12px rgba(124,106,247,0.4)':'none' }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, fontWeight:600, color:'var(--text1)', margin:0,
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {currentSong.title}
              </p>
              <p style={{ fontSize:10, color:'var(--text3)', margin:'1px 0 0',
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {currentSong.channelName}
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              <CB onClick={prevSong} disabled={!hasPrev} size={28}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/>
                </svg>
              </CB>
              <CB onClick={togglePlay} size={40} primary>
                {isPlaying
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft:1}}><polygon points="5,3 19,12 5,21"/></svg>
                }
              </CB>
              <CB onClick={nextSong} disabled={!hasNext} size={28}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/>
                </svg>
              </CB>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between',
                        padding:'0 12px 8px', fontSize:10, color:'var(--text3)' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentSong.durationSeconds)}</span>
          </div>
        </div>
      </div>
    </>
  );
});
export default Player;

const CB = ({ onClick, children, disabled, size=36, primary }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width:size, height:size, borderRadius:'50%', border:'none', flexShrink:0,
    display:'flex', alignItems:'center', justifyContent:'center',
    background: primary ? 'linear-gradient(135deg,var(--accent),#5b4fcf)' : 'transparent',
    color: disabled ? 'var(--text3)' : 'var(--text1)',
    cursor: disabled ? 'not-allowed' : 'pointer', transition:'all 0.12s',
    boxShadow: primary ? '0 4px 14px rgba(124,106,247,0.35)' : 'none',
  }}>{children}</button>
);

const VolIco = ({muted}) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    {muted
      ? <><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
      : <><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>
    }
  </svg>
);
