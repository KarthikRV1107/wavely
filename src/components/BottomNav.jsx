// src/components/BottomNav.jsx
import { useNavigate } from 'react-router-dom';

const HomeIcon    = ({ active }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#1a1a1a' : '#aaa'} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
const SearchIcon  = ({ active }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#1a1a1a' : '#aaa'} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const LibraryIcon = ({ active }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#1a1a1a' : '#aaa'} strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;

const NAV_ITEMS = [
  { key: 'home',    label: 'Home',    path: '/',        Icon: HomeIcon    },
  { key: 'search',  label: 'Search',  path: '/search',  Icon: SearchIcon  },
  { key: 'library', label: 'Library', path: '/library', Icon: LibraryIcon },
];

const BottomNav = ({ active }) => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', background: '#fff', borderTop: '1px solid #e5e5e5', position: 'sticky', bottom: 0 }}>
      {NAV_ITEMS.map(({ key, label, path, Icon }) => (
        <button key={key} onClick={() => navigate(path)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '8px 4px 10px', gap: 3, background: 'none', border: 'none', cursor: 'pointer',
        }}>
          <Icon active={active === key} />
          <span style={{ fontSize: 10, color: active === key ? '#1a1a1a' : '#aaa',
                         fontWeight: active === key ? 500 : 400 }}>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
