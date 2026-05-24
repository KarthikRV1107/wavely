import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { prefetchTrending } from './services/youtube';

// Kick off YouTube prefetch immediately — before React even mounts
// By the time user logs in and reaches Home, data is in cache
prefetchTrending();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
