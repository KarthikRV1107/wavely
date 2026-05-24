// src/components/Player/SeekBar.jsx
import { useState } from 'react';
import { formatTime } from '../../utils/formatTime';

const SeekBar = ({ currentTime, duration, onSeek }) => {
  const [hovering, setHovering] = useState(false);
  const percent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const handleClick = (e) => {
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.floor(ratio * duration));
  };

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, width:'100%', maxWidth:520 }}>
      <span style={{ fontSize:11, color:'#b3b3b3', minWidth:40, textAlign:'right', flexShrink:0 }}>
        {formatTime(currentTime)}
      </span>

      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={handleClick}
        style={{
          flex:1, height: hovering ? 6 : 4,
          background:'#4d4d4d', borderRadius:3,
          cursor:'pointer', position:'relative',
          transition:'height 0.1s',
        }}
      >
        {/* Progress fill */}
        <div style={{
          position:'absolute', left:0, top:0, bottom:0,
          width:`${percent}%`,
          background: hovering ? '#1db954' : '#fff',
          borderRadius:3,
          transition:'background 0.1s',
        }}/>
        {/* Thumb — only on hover */}
        {hovering && (
          <div style={{
            position:'absolute', top:'50%',
            left:`${percent}%`,
            transform:'translate(-50%,-50%)',
            width:12, height:12, borderRadius:'50%',
            background:'#fff', flexShrink:0,
          }}/>
        )}
      </div>

      <span style={{ fontSize:11, color:'#b3b3b3', minWidth:40, flexShrink:0 }}>
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default SeekBar;
