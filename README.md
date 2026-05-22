# 🎵 Wavely — Music Streaming App

A full-stack music streaming web app built with **React**, **Firebase**, and the **YouTube Data API v3**.

---

## ⚡ Quick Start

### 1. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/wavely.git
cd wavely
npm install
```

### 2. Set up environment variables
Copy `.env` and fill in your keys:
```bash
cp .env .env.local
```

Edit `.env.local`:
```
REACT_APP_FIREBASE_API_KEY=your_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_YOUTUBE_API_KEY=your_youtube_key_here
```

### 3. Run locally
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Getting API Keys

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Add a Web App → copy the config values
4. Enable **Authentication** → Sign-in methods → Google + Email/Password
5. Enable **Firestore Database** → Start in production mode
6. Paste the Firestore security rules from `firestore.rules`

### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable **YouTube Data API v3**
3. Go to Credentials → Create API Key
4. Restrict the key to your domain (important for production!)

---

## 🚀 Deploy to GitHub Pages

```bash
npm install -D gh-pages
```

Add to `package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/wavely",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

Then deploy:
```bash
npm run deploy
```

## 🚀 Deploy to Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all environment variables from `.env`
4. Deploy — done!

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Player/         # SeekBar, Controls, Volume, Player bar
│   ├── Playlist/       # PlaylistForm modal
│   └── SongCard/       # Reusable song row component
├── context/
│   ├── AuthContext.jsx # Firebase auth state
│   └── PlayerContext.jsx # Global player state
├── hooks/
│   └── usePlayer.js    # YouTube IFrame API bridge
├── pages/
│   ├── Home.jsx        # Trending + playlists
│   ├── SearchPage.jsx  # Search + mood tags
│   ├── PlaylistPage.jsx
│   ├── LibraryPage.jsx
│   └── LoginPage.jsx
├── services/
│   ├── firebase.js     # Firebase init
│   ├── firestore.js    # All Firestore CRUD
│   └── youtube.js      # YouTube API calls
└── utils/
    ├── formatTime.js
    └── debounce.js
```

---

## ✨ Features

- 🔐 Google & email/password authentication
- 🎵 Music search powered by YouTube Data API v3
- 🏠 Home screen with trending music
- 🎛️ Full music player — play, pause, next, previous, seek bar, volume
- 📋 Create and manage playlists
- ❤️ Like/unlike songs
- 🎭 Mood-based search tags (Chill, Workout, Focus…)
- 📱 Mobile-friendly responsive design

---

## ⚠️ Common Issues

**"YouTube API key not working"** — Make sure you enabled the YouTube Data API v3 in Google Cloud Console and the key has no domain restrictions during development.

**"Firestore permission denied"** — Make sure you've pasted the rules from `firestore.rules` into Firebase Console → Firestore → Rules.

**"Player not loading"** — The YouTube IFrame API script in `public/index.html` must load before React mounts. Check your browser console for script errors.
