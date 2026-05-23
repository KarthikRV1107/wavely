// src/components/Player/Player.jsx — adapts between mobile bar and desktop full player
import { useState } from 'react';
import { usePlayer }        from '../../context/PlayerContext';
import { useYouTubePlayer } from '../../hooks/usePlayer';
import { useBreakpoint }    from '../../hooks/useBreakpoint';
import { formatTime }       from '../../utils/formatTime';

export default function Player() {
  const {
    currentSong, isPlaying, currentTime,
    togglePlay, nextSong, prevSong,
    volume, setVolume, queue, queueIndex,
  } = usePlayer();
  const { containerRef, seekTo } = useYouTubePlayer();
  const { isDesktop, isMobile }  = useBreakpoint();
  const [showVolume, setShowVolume] = useState(false);

  // Hidden YT iframe — always mounted
  const hidden = (
    <div ref={containerRef}
      style={{ position:'absolute', width:0, height:0, overflow:'hidden', pointerEvents:'none' }}
      aria-hidden />
  );

  if (!currentSong) return hidden;

  const progress = currentSong.durationSeconds > 0
    ? (currentTime / currentSong.durationSeconds) * 100 : 0;

  const hasPrev = queueIndex > 0;
  const hasNext = queueIndex < queue.length - 1;

  const handleSeek = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - r.left) / r.width;
    seekTo(Math.floor(ratio * currentSong.durationSeconds));
  };

  // ── Desktop: full-width bar above bottom (no bottom nav on desktop)
  if (isDesktop) {
    return (
      <>
        {hidden}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 'var(--sidebar-w)',
          right: 0,
          zIndex: 80,
          background: 'rgba(12,12,20,0.97)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderTop: '1px solid var(--border2)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.5)',
          padding: '0 32px',
          height: 'var(--player-h)',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}>
          {/* Song info — left */}
          <div style={{ display:'flex', alignItems:'center', gap:14, width:260, flexShrink:0 }}>
            <img src={currentSong.thumbnailUrl} alt={currentSong.title}
              style={{
                width: 52, height: 52, borderRadius: 10,
                objectFit: 'cover', flexShrink: 0,
                boxShadow: isPlaying ? '0 0 20px rgba(124,106,247,0.4)' : '0 2px 12px rgba(0,0,0,0.4)',
                animation: isPlaying ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                transition: 'box-shadow 0.4s',
              }}/>
            <div style={{ minWidth:0 }}>
              <p style={{
                fontSize:14, fontWeight:600, color:'var(--text1)', margin:0,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{currentSong.title}</p>
              <p style={{ fontSize:12, color:'var(--text3)', margin:'2px 0 0',
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {currentSong.channelName}
              </p>
            </div>
          </div>

          {/* Controls + seekbar — center */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <CtrlBtn onClick={prevSong} disabled={!hasPrev} size={32}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/>
                </svg>
              </CtrlBtn>
              <CtrlBtn onClick={togglePlay} size={44} primary>
                {isPlaying
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft:2}}><polygon points="5,3 19,12 5,21"/></svg>
                }
              </CtrlBtn>
              <CtrlBtn onClick={nextSong} disabled={!hasNext} size={32}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/>
                </svg>
              </CtrlBtn>
            </div>
            {/* Seekbar */}
            <div style={{ display:'flex', alignItems:'center', gap:10, width:'100%', maxWidth:500 }}>
              <span style={{ fontSize:11, color:'var(--text3)', minWidth:36, textAlign:'right' }}>
                {formatTime(currentTime)}
              </span>
              <div onClick={handleSeek} style={{
                flex:1, height:4, background:'var(--bg4)',
                borderRadius:2, cursor:'pointer', position:'relative',
              }}
                onMouseEnter={e => e.currentTarget.querySelector('.thumb').style.opacity='1'}
                onMouseLeave={e => e.currentTarget.querySelector('.thumb').style.opacity='0'}
              >
                <div style={{
                  position:'absolute', left:0, top:0, bottom:0,
                  width:`${progress}%`,
                  background:'linear-gradient(90deg, var(--accent), var(--pink))',
                  borderRadius:2, transition:'width 0.8s linear',
                }}/>
                <div className="thumb" style={{
                  position:'absolute', top:'50%', left:`${progress}%`,
                  transform:'translate(-50%,-50%)',
                  width:12, height:12, borderRadius:'50%',
                  background:'var(--text1)',
                  boxShadow:'0 0 0 3px rgba(124,106,247,0.4)',
                  transition:'opacity 0.15s', opacity:0,
                }}/>
              </div>
              <span style={{ fontSize:11, color:'var(--text3)', minWidth:36 }}>
                {formatTime(currentSong.durationSeconds)}
              </span>
            </div>
          </div>

          {/* Volume — right */}
          <div style={{ width:180, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <button onClick={() => setVolume(volume > 0 ? 0 : 80)} style={{
              background:'none', border:'none', color:'var(--text3)', cursor:'pointer', padding:4,
              transition:'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color='var(--text1)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
            >
              <VolumeIcon muted={volume === 0}/>
            </button>
            <div style={{ flex:1, position:'relative' }}>
              <input type="range" min="0" max="100" value={volume} step="1"
                onChange={e => setVolume(Number(e.target.value))}
                style={{
                  width:'100%', height:4, borderRadius:2,
                  appearance:'none', WebkitAppearance:'none',
                  background:`linear-gradient(to right, var(--accent) ${volume}%, var(--bg4) ${volume}%)`,
                  outline:'none', cursor:'pointer',
                }}
              />
            </div>
            <span style={{ fontSize:11, color:'var(--text3)', minWidth:28 }}>{volume}%</span>
          </div>
        </div>
      </>
    );
  }

  // ── Mobile: compact floating bar above bottom nav
  return (
    <>
      {hidden}
      <div style={{
        position:'fixed',
        bottom: 'var(--nav-h)',
        left:0, right:0,
        zIndex:80,
        padding:'0 10px 8px',
      }}>
        <div style={{
          background:'rgba(18,18,28,0.97)',
          backdropFilter:'blur(40px)',
          WebkitBackdropFilter:'blur(40px)',
          borderRadius:20,
          border:'1px solid var(--border2)',
          boxShadow:'0 -4px 32px rgba(0,0,0,0.6)',
          overflow:'hidden',
        }}>
          {/* Progress line */}
          <div style={{ height:3, background:'var(--bg4)', cursor:'pointer' }}
            onClick={handleSeek}>
            <div style={{
              height:'100%', width:`${progress}%`,
              background:'linear-gradient(90deg, var(--accent), var(--pink))',
              transition:'width 0.8s linear',
            }}/>
          </div>

          {/* Row */}
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'10px 14px 12px',
          }}>
            <img src={currentSong.thumbnailUrl} alt={currentSong.title}
              style={{
                width:44, height:44, borderRadius:10, objectFit:'cover', flexShrink:0,
                boxShadow: isPlaying ? '0 0 14px rgba(124,106,247,0.4)' : 'none',
                animation: isPlaying ? 'pulse-glow 2s ease-in-out infinite' : 'none',
              }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text1)', margin:0,
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {currentSong.title}
              </p>
              <p style={{ fontSize:11, color:'var(--text3)', margin:'1px 0 0',
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {currentSong.channelName}
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              <CtrlBtn onClick={prevSong} disabled={!hasPrev} size={30}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/>
                </svg>
              </CtrlBtn>
              <CtrlBtn onClick={togglePlay} size={42} primary>
                {isPlaying
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft:2}}><polygon points="5,3 19,12 5,21"/></svg>
                }
              </CtrlBtn>
              <CtrlBtn onClick={nextSong} disabled={!hasNext} size={30}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/>
                </svg>
              </CtrlBtn>
            </div>
          </div>
          {/* Time row */}
          <div style={{
            display:'flex', justifyContent:'space-between',
            padding:'0 14px 8px', fontSize:10, color:'var(--text3)',
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentSong.durationSeconds)}</span>
          </div>
        </div>
      </div>
    </>
  );
}

const CtrlBtn = ({ onClick, children, disabled, size=36, primary }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width:size, height:size, borderRadius:'50%', border:'none',
    display:'flex', alignItems:'center', justifyContent:'center',
    background: primary
      ? 'linear-gradient(135deg, var(--accent), #5b4fcf)'
      : 'transparent',
    color: disabled ? 'var(--text3)' : 'var(--text1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition:'all 0.15s', flexShrink:0,
    boxShadow: primary ? '0 4px 16px rgba(124,106,247,0.35)' : 'none',
  }}
    onMouseEnter={e => !primary && !disabled && (e.currentTarget.style.background='var(--bg4)')}
    onMouseLeave={e => !primary && (e.currentTarget.style.background='transparent')}
  >{children}</button>
);

const VolumeIcon = ({ muted }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8">
    {muted
      ? <><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/></>
      : <><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
          <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>
    }
  </svg>
);
