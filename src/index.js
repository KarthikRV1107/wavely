import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { getTrendingSongs } from './services/youtube';
import { warmCache } from './utils/cache';

// 🚀 Prefetch trending songs IMMEDIATELY on app load
// By the time user logs in and lands on Home, data is already cached → instant
warmCache(getTrendingSongs);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
