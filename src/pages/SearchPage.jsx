// src/pages/SearchPage.jsx
import { useState, useEffect, useRef } from 'react';
import { searchSongs }  from '../services/youtube';
import { debounce }     from '../utils/debounce';
import SongCard         from '../components/SongCard/SongCard';
import BottomNav        from '../components/BottomNav';

const MOOD_TAGS = [
  { label: 'Chill',   query: 'chill lofi music'        },
  { label: 'Workout', query: 'workout motivation music' },
  { label: 'Focus',   query: 'focus study music'        },
  { label: 'Party',   query: 'party hits music'         },
  { label: 'Sleep',   query: 'sleep calm music'         },
  { label: 'Happy',   query: 'happy feel good songs'    },
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
    catch { setError('Search failed. Try again.'); }
    finally { setLoading(false); }
  }, 500)).current;

  useEffect(() => { debouncedSearch(query); }, [query, debouncedSearch]);

  const handleTagClick = (tag) => { setActiveTag(tag.label); setQuery(tag.query); };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 16 }}>
      <div style={{ padding: '12px 16px', background: '#fff',
                    borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f5',
                      border: '1px solid #e0e0e0', borderRadius: 10, padding: '8px 12px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="search" placeholder="Artists, songs, albums…" value={query}
                 onChange={e => { setQuery(e.target.value); setActiveTag(null); }} autoFocus
                 style={{ flex: 1, border: 'none', background: 'transparent',
                          fontSize: 14, color: '#1a1a1a', outline: 'none' }} />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setActiveTag(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                             fontSize: 18, color: '#aaa', padding: 0, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {MOOD_TAGS.map(tag => (
            <button key={tag.label} onClick={() => handleTagClick(tag)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: '1px solid #e0e0e0',
              background: activeTag === tag.label ? '#eff6ff' : 'transparent',
              color:      activeTag === tag.label ? '#3b82f6' : '#555',
            }}>{tag.label}</button>
          ))}
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: 60, borderRadius: 8, background: '#f0f0f0' }} />)}
          </div>
        )}
        {error && !loading && <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>}
        {!loading && !error && results.length === 0 && !query && (
          <p style={{ fontSize: 13, color: '#999', textAlign: 'center', marginTop: 40 }}>
            Search for a song or pick a mood above
          </p>
        )}
        {!loading && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#999', marginBottom: 4, display: 'block' }}>
              {results.length} results
            </span>
            {results.map((song, i) => (
              <SongCard key={song.videoId} song={song} queue={results} queueIndex={i} />
            ))}
          </div>
        )}
      </div>

      <BottomNav active="search" />
    </div>
  );
};

export default SearchPage;
