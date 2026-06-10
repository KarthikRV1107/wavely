// src/components/Player/VolumeControl.jsx
import { useState } from 'react';
import { usePlayerActions, useVolume } from '../../context/PlayerContext';

const VolumeHigh = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/>
    <path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z"/>
  </svg>
);
const VolumeMute = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"/>
    <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.816 9.5a2.142 2.142 0 0 1 0-3.7l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z"/>
  </svg>
);

const VolumeControl = () => {
  const volume = useVolume();
  const { setVolume } = usePlayerActions();
  const [hovering, setHovering] = useState(false);

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <button
        onClick={() => setVolume(volume > 0 ? 0 : 80)}
        style={{ background:'none', border:'none', cursor:'pointer',
                 color:'#b3b3b3', padding:4, display:'flex',
                 alignItems:'center' }}
        onMouseEnter={e => e.currentTarget.style.color='#fff'}
        onMouseLeave={e => e.currentTarget.style.color='#b3b3b3'}
      >
        {volume === 0 ? <VolumeMute /> : <VolumeHigh />}
      </button>

      {/* Volume slider */}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={e => {
          const rect  = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          setVolume(Math.round(ratio * 100));
        }}
        style={{
          width: 93, height: hovering ? 6 : 4,
          background:'#4d4d4d', borderRadius:3,
          cursor:'pointer', position:'relative',
          transition:'height 0.1s',
        }}
      >
        <div style={{
          position:'absolute', left:0, top:0, bottom:0,
          width:`${volume}%`,
          background: hovering ? '#1db954' : '#fff',
          borderRadius:3,
          transition:'background 0.1s',
        }}/>
        {hovering && (
          <div style={{
            position:'absolute', top:'50%',
            left:`${volume}%`,
            transform:'translate(-50%,-50%)',
            width:12, height:12, borderRadius:'50%', background:'#fff',
          }}/>
        )}
      </div>
    </div>
  );
};

export default VolumeControl;
