import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global reset — Spotify dark style
const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root {
    height: 100%;
    background: #000;
    color: #fff;
    font-family: "Circular", "DM Sans", system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #4d4d4d; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #727272; }
  button { font-family: inherit; }
  input, textarea { font-family: inherit; }
  a { color: inherit; text-decoration: none; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
