const PrevIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/></svg>;
const NextIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/></svg>;
const PlayIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>;
const PauseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;

const PlayerControls = ({ isPlaying, onPlay, onPrev, onNext }) => {
  const btn = { width:36, height:36, borderRadius:'50%', border:'0.5px solid var(--color-border-secondary)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-text-secondary)' };
  const primary = { ...btn, width:44, height:44, background:'var(--color-text-primary)', border:'none', color:'var(--color-background-primary)' };
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16 }}>
      <button style={btn} onClick={onPrev} aria-label="Previous"><PrevIcon /></button>
      <button style={primary} onClick={onPlay} aria-label={isPlaying?'Pause':'Play'}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
      <button style={btn} onClick={onNext} aria-label="Next"><NextIcon /></button>
    </div>
  );
};
export default PlayerControls;
