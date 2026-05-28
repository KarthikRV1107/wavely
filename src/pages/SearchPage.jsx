// src/pages/SearchPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { searchSongs }   from '../services/youtube';
import { useBreakpoint } from '../hooks/useBreakpoint';
import SongCard          from '../components/SongCard/SongCard';

const MOODS = [
  { label:'Chill',   q:'chill lofi music',        c:'#2dd4bf' },
  { label:'Workout', q:'workout gym motivation',   c:'#f87171' },
  { label:'Focus',   q:'focus study deep work',    c:'#60a5fa' },
  { label:'Party',   q:'party hits 2024',          c:'#f472b6' },
  { label:'Sleep',   q:'sleep calm ambient',       c:'#a78bfa' },
  { label:'Happy',   q:'happy feel good pop',      c:'#fbbf24' },
  { label:'Hip-Hop', q:'hip hop rap beats 2024',   c:'#34d399' },
  { label:'Rock',    q:'rock guitar anthems',       c:'#fb923c' },
];

// Module cache for search results — instant back-navigation
const _cache = new Map();

export default function SearchPage() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [active,  setActive]  = useState(null);
  const { isDesktop } = useBreakpoint();
  const inputRef = useRef(null);
  const timer    = useRef(null);
  const alive    = useRef(true);

  useEffect(() => {
    inputRef.current?.focus();
    alive.current = true;
    return () => { alive.current = false; clearTimeout(timer.current); };
  }, []);

  const doSearch = useCallback((q) => {
    clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); setLoading(false); return; }

    // Check module cache first — instant
    if (_cache.has(q)) { setResults(_cache.get(q)); return; }

    setLoading(true);
    setError(null);

    // Debounce 350ms
    timer.current = setTimeout(async () => {
      try {
        const songs = await searchSongs(q);
        if (!alive.current) return;
        _cache.set(q, songs);
        setResults(songs);
      } catch (e) {
        if (alive.current) setError(e.message);
      } finally {
        if (alive.current) setLoading(false);
      }
    }, 350);
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    setActive(null);
    doSearch(v);
  };

  const handleMood = (m) => {
    setActive(m.label);
    setQuery(m.q);
    doSearch(m.q);
  };

  const clear = () => {
    setQuery(''); setResults([]); setActive(null);
    setError(null); setLoading(false);
    clearTimeout(timer.current);
    inputRef.current?.focus();
  };

  return (
    <div>
      {/* Sticky search bar */}
      <div style={{
        padding: isDesktop ? '14px 0 12px' : '12px 16px',
        position:'sticky', top: isDesktop ? 52 : 0, zIndex:20,
        background:'rgba(10,10,15,.95)',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--border)',
      }}>
        {!isDesktop && (
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800,
                       letterSpacing:'-0.02em', color:'var(--text1)', margin:'0 0 10px' }}>
            Search
          </h1>
        )}
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'var(--bg3)', border:'1px solid var(--border2)',
          borderRadius:12, padding:'10px 14px',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="var(--text3)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="search"
            placeholder="Songs, artists, albums…"
            value={query}
            onChange={handleInput}
            style={{
              flex:1, border:'none', background:'transparent',
              fontSize:14, color:'var(--text1)', outline:'none',
              caretColor:'var(--accent)',
            }}
          />
          {loading && (
            <div style={{
              width:14, height:14, borderRadius:'50%',
              border:'2px solid var(--border)', borderTopColor:'var(--accent)',
              animation:'spin .6s linear infinite', flexShrink:0,
            }}/>
          )}
          {(query || active) && !loading && (
            <button onClick={clear} style={{
              background:'none', border:'none', color:'var(--text3)',
              fontSize:18, cursor:'pointer', padding:0, lineHeight:1,
            }}>×</button>
          )}
        </div>
      </div>

      <div style={{ padding: isDesktop ? '14px 0' : '12px 16px' }}>
        {/* Mood tags */}
        {!query && (
          <div style={{ marginBottom:16 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700,
                         color:'var(--text1)', margin:'0 0 8px' }}>Browse by mood</h2>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(4,1fr)',
              gap:6,
            }}>
              {MOODS.map(m => (
                <button key={m.label} onClick={() => handleMood(m)} style={{
                  padding:'10px 6px',
                  background: active===m.label ? `${m.c}18` : 'var(--bg3)',
                  border:`1px solid ${active===m.label ? m.c+'44' : 'var(--border)'}`,
                  borderRadius:10, cursor:'pointer', transition:'all .15s',
                  fontSize:11, fontWeight:700, letterSpacing:'0.04em',
                  color: active===m.label ? m.c : 'var(--text2)',
                }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding:'10px', marginBottom:12, background:'rgba(248,113,113,.08)',
                        border:'1px solid rgba(248,113,113,.2)', borderRadius:8,
                        fontSize:12, color:'var(--red)' }}>⚠ {error}</div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <>
            <p style={{ fontSize:11, color:'var(--text3)', margin:'0 0 6px' }}>
              {results.length} results{active ? ` · ${active}` : ''}
            </p>
            <div style={{
              display:'grid',
              gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
              gap:2,
            }}>
              {results.map((s,i) => (
                <SongCard key={s.videoId} song={s}
                  queue={results} queueIndex={i}
                />
              ))}
            </div>
          </>
        )}

        {!loading && !query && !active && (
          <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text3)' }}>
            <p style={{ fontSize:32, marginBottom:8 }}>🎵</p>
            <p style={{ fontSize:14, fontWeight:500, color:'var(--text2)' }}>Find your music</p>
            <p style={{ fontSize:12, marginTop:4 }}>Search or pick a mood above</p>
          </div>
        )}
      </div>
    </div>
  );
}
