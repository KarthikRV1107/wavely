import { formatTime } from '../../utils/formatTime';

const SeekBar = ({ currentTime, duration, onSeek }) => {
  const percent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const handleClick = (e) => {
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.floor(ratio * duration));
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', minWidth: 32, textAlign: 'right' }}>
        {formatTime(currentTime)}
      </span>
      <div onClick={handleClick} style={{ flex: 1, height: 4, background: 'var(--color-border-tertiary)', borderRadius: 2, cursor: 'pointer', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percent}%`, background: 'var(--color-text-primary)', borderRadius: 2, transition: 'width 0.5s linear' }}/>
        <div style={{ position: 'absolute', top: '50%', left: `${percent}%`, transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', background: 'var(--color-text-primary)' }}/>
      </div>
      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', minWidth: 32 }}>
        {formatTime(duration)}
      </span>
    </div>
  );
};
export default SeekBar;
