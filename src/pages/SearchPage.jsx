// src/pages/SearchPage.jsx — responsive
import { useState, useEffect, useRef } from 'react';
import { searchSongs }      from '../services/youtube';
import { debounce }         from '../utils/debounce';
import { useBreakpoint }    from '../hooks/useBreakpoint';
import SongCard             from '../components/SongCard/SongCard';

const MOODS = [
  { label:'Chill',    query:'chill lofi music',         color:'#2dd4bf', bg:'rgba(45,212,191,0.1)'  },
  { label:'Workout',  query:'workout gym music',         color:'#f87171', bg:'rgba(248,113,113,0.1)' },
  { label:'Focus',    query:'deep focus study music',    color:'#60a5fa', bg:'rgba(96,165,250,0.1)'  },
  { label:'Party',    query:'party hits music 2024',     color:'#f472b6', bg:'rgba(244,114,182,0.1)' },
  { label:'Sleep',    query:'sleep ambient calm music',  color:'#a78bfa', bg:'rgba(167,139,250,0.1)' },
  { label:'Happy',    query:'happy feel good pop',       color:'#fbbf24', bg:'rgba(251,191,36,0.1)'  },
  { label:'Hip-Hop',  query:'hip hop beats rap 2024',    color:'#34d399', bg:'rgba(52,211,153,0.1)'  },
  { label:'Rock',     query:'rock anthems guitar hits',  color:'#fb923c', bg:'rgba(251,146,60,0.1)'  },
];

export default function SearchPage() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [active,  setActive]  = useState(null);
  const { isDesktop } = useBreakpoint();
  const inputRef = useRef(null);

  const doSearch = useRef(debounce(async q => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true); setError(null);
    try { setResults(await searchSongs(q)); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, 450)).current;

  useEffect(() => { doSearch(query); }, [query]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const moodCols = isDesktop ? 4 : 4;

  return (
    <div>
      {/* Sticky search bar */}
      <div style={{
        padding: isDesktop ? '20px 0 16px' : '16px 20px',
        position:'sticky', top: isDesktop ? 52 : 0, zIndex:20,
        background:'rgba(10,10,15,0.92)',
        backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
        borderBottom:'1px solid var(--border)',
      }}>
        {!isDesktop && (
          <h1 style={{
            fontFamily:'var(--font-display)', fontSize:24, fontWeight:800,
            letterSpacing:'-0.02em', color:'var(--text1)', margin:'0 0 14px',
          }}>Search</h1>
        )}
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'var(--bg3)', border:'1px solid var(--border2)',
          borderRadius:16, padding:'12px 16px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--text3)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input ref={inputRef} type="search"
            placeholder="Songs, artists, albums…"
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(null); }}
            style={{
              flex:1, border:'none', background:'transparent',
              fontSize:15, color:'var(--text1)', outline:'none',
              caretColor:'var(--accent)',
            }}
          />
          {loading && (
            <div style={{
              width:16, height:16, borderRadius:'50%',
              border:'2px solid var(--border)',
              borderTopColor:'var(--accent)',
              animation:'spin 0.7s linear infinite', flexShrink:0,
            }}/>
          )}
          {query && !loading && (
            <button onClick={() => { setQuery(''); setResults([]); setActive(null); }}
              style={{ background:'none', border:'none', color:'var(--text3)',
                       fontSize:20, lineHeight:1, cursor:'pointer', padding:0 }}>×</button>
          )}
        </div>
      </div>

      <div style={{ padding: isDesktop ? '20px 0' : '16px 20px' }}>
        {/* Mood grid */}
        {!query && (
          <div style={{ marginBottom:24 }}>
            <h2 style={{
              fontFamily:'var(--font-display)', fontSize:16, fontWeight:700,
              color:'var(--text1)', margin:'0 0 12px', letterSpacing:'-0.01em',
            }}>Browse by mood</h2>
            <div style={{
              display:'grid',
              gridTemplateColumns:`repeat(${moodCols}, 1fr)`,
              gap:8,
            }}>
              {MOODS.map(m => (
                <button key={m.label}
                  onClick={() => { setActive(m.label); setQuery(m.query); }}
                  style={{
                    padding: isDesktop ? '18px 12px' : '14px 8px',
                    background: active===m.label ? m.bg : 'var(--bg3)',
                    border:`1px solid ${active===m.label ? m.color+'44' : 'var(--border)'}`,
                    borderRadius:14, cursor:'pointer', transition:'all 0.18s',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                  }}
                  onMouseEnter={e => { if(active!==m.label) e.currentTarget.style.background='var(--bg4)'; }}
                  onMouseLeave={e => { if(active!==m.label) e.currentTarget.style.background='var(--bg3)'; }}
                >
                  <span style={{
                    fontSize: isDesktop ? 11 : 10, fontWeight:700,
                    letterSpacing:'0.06em',
                    color: active===m.label ? m.color : 'var(--text2)',
                  }}>{m.label.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding:'12px 14px', marginBottom:16,
            background:'rgba(248,113,113,0.08)',
            border:'1px solid rgba(248,113,113,0.2)',
            borderRadius:12, fontSize:13, color:'var(--red)',
          }}>⚠ {error}</div>
        )}

        {/* Results — 2 col on desktop */}
        {results.length > 0 && (
          <div>
            <p style={{ fontSize:12, color:'var(--text3)', marginBottom:12, letterSpacing:'0.03em' }}>
              {results.length} results{active ? ` for "${active}"` : ''}
            </p>
            <div style={{
              display:'grid',
              gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
              gap:6,
            }}>
              {results.map((song, i) => (
                <SongCard key={song.videoId} song={song}
                  queue={results} queueIndex={i}
                  style={{ animationDelay:`${i*0.03}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !query && !active && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <p style={{ fontSize:40, marginBottom:12 }}>🎵</p>
            <p style={{ fontSize:15, color:'var(--text2)', fontWeight:500 }}>Discover your music</p>
            <p style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Search or pick a mood above</p>
          </div>
        )}
      </div>
    </div>
  );
}
