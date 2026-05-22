import { usePlayer } from '../../context/PlayerContext';

const VolumeIcon = ({ muted }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    {muted
      ? <><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
      : <><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>
    }
  </svg>
);

const VolumeControl = () => {
  const { volume, setVolume } = usePlayer();
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <button onClick={() => setVolume(volume > 0 ? 0 : 80)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-secondary)', padding:4 }} aria-label="Toggle mute">
        <VolumeIcon muted={volume === 0} />
      </button>
      <input type="range" min="0" max="100" value={volume} step="1" onChange={e => setVolume(Number(e.target.value))} style={{ width:80 }} aria-label="Volume" />
    </div>
  );
};
export default VolumeControl;
