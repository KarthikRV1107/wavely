import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { prefetchTrending } from './services/youtube';

// Fire prefetch SYNCHRONOUSLY before React.render — this starts the
// YouTube API fetch as early as possible. By the time Firebase auth
// resolves and user lands on Home (~1-2s), data will be in cache.
prefetchTrending();

ReactDOM.createRoot(document.getElementById('root'))
  .render(<React.StrictMode><App /></React.StrictMode>);
