// src/pages/SearchPage.jsx
import { useState, useEffect, useRef } from 'react';
import { searchSongs }  from '../services/youtube';
import { debounce }     from '../utils/debounce';
import SongCard         from '../components/SongCard/SongCard';

const MOOD_TAGS = [
  { label:'Chill',   query:'chill lofi music',         color:'#27856a' },
  { label:'Workout', query:'workout motivation music',  color:'#8d67ab' },
  { label:'Focus',   query:'focus study music',         color:'#1e3264' },
  { label:'Party',   query:'party hits music',          color:'#e8115b' },
  { label:'Sleep',   query:'sleep calm music',          color:'#148a08' },
  { label:'Happy',   query:'happy feel good songs',     color:'#e61e32' },
  { label:'Hip-Hop', query:'hip hop hits 2024',         color:'#ba5d07' },
  { label:'Pop',     query:'pop hits 2024',             color:'#0d73ec' },
];

const SearchPage = () => {
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  const debouncedSearch = useRef(debounce(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true); setError(null);
    try { setResults(await searchSongs(q)); }
    catch (err) { setError(err.message || 'Search failed.'); }
    finally { setLoading(false); }
  }, 500)).current;

  useEffect(() => { debouncedSearch(query); }, [query]);

  const handleTag = (tag) => {
    setActiveTag(tag.label);
    setQuery(tag.query);
  };

  const showBrowse = !query && results.length === 0;

  return (
    <div style={{ padding:'24px 32px 32px' }}>
      {/* Search input */}
      <div style={{
        display:'flex', alignItems:'center', gap:12,
        background:'#fff', borderRadius:50,
        padding:'10px 20px', marginBottom:32,
        maxWidth:480,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
          <path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 9.808 0 4.798 3.898 8.673 9.407 8.673 1.88 0 3.619-.56 5.081-1.554l4.637 5.47 1.54-1.361-4.638-5.48a8.979 8.979 0 0 0 2.188-5.748c0-4.881-4.227-9.808-8.808-9.808zm-7.407 9.808c0-4.07 3.427-7.808 7.407-7.808s7.407 3.738 7.407 7.808c0 4.007-3.427 7.208-7.407 7.208-3.98 0-7.407-3.201-7.407-7.208z"/>
        </svg>
        <input
          type="search"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveTag(null); }}
          autoFocus
          style={{
            flex:1, border:'none', background:'transparent',
            fontSize:15, color:'#000', outline:'none',
            fontFamily:'inherit',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setActiveTag(null); }}
                  style={{ background:'none', border:'none', cursor:'pointer',
                           fontSize:20, color:'#555', lineHeight:1, padding:0 }}>×</button>
        )}
      </div>

      {/* Browse categories */}
      {showBrowse && (
        <>
          <h2 style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:20 }}>
            Browse categories
          </h2>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
            gap:24,
          }}>
            {MOOD_TAGS.map(tag => (
              <div key={tag.label} onClick={() => handleTag(tag)} style={{
                height:120, background:tag.color, borderRadius:8,
                padding:16, cursor:'pointer', overflow:'hidden',
                position:'relative',
                transition:'transform 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
              >
                <span style={{ fontSize:18, fontWeight:700, color:'#fff' }}>
                  {tag.label}
                </span>
                {/* Decorative rotated circle */}
                <div style={{
                  position:'absolute', right:-10, bottom:-10,
                  width:80, height:80, borderRadius:'50%',
                  background:'rgba(0,0,0,0.25)',
                }}/>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              height:56, borderRadius:4,
              background:'rgba(255,255,255,0.05)',
            }}/>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p style={{ color:'#f87171', fontSize:13 }}>{error}</p>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <h2 style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:16 }}>
            {activeTag ? activeTag : 'Results'}
          </h2>
          {/* Column headers */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'16px 40px 1fr auto auto',
            gap:16, padding:'0 16px 8px',
            borderBottom:'1px solid #282828',
            marginBottom:8,
          }}>
            <span style={{ fontSize:12, color:'#b3b3b3', textAlign:'center' }}>#</span>
            <span/>
            <span style={{ fontSize:12, color:'#b3b3b3' }}>Title</span>
            <span/>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#b3b3b3">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-3.25a.75.75 0 0 1 .75.75v3.25H9.5a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1-.75-.75V6.5A.75.75 0 0 1 8 4.75z"/>
            </svg>
          </div>
          {results.map((song, i) => (
            <SongCard key={song.videoId} song={song} queue={results}
                      queueIndex={i} index={i} />
          ))}
        </>
      )}
    </div>
  );
};

export default SearchPage;
