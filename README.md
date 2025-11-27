# Futuristic CV - Modern Portfolio Application

A stunning, futuristic CV/Resume web application with multi-language support (EN/ES/FR) and secure cloud-based admin panel.

## Features

- 🎨 **Futuristic Design**: Dark mode, glassmorphism, neon accents
- 🌍 **Multi-Language**: Auto-detect browser language (EN/ES/FR)
- 🔐 **Secure Admin Panel**: Firebase Authentication
- ☁️ **Cloud Storage**: Real-time sync with Firebase Firestore
- 📱 **Responsive**: Works on all devices
- ✏️ **Full CRUD**: Edit all CV sections in real-time

## Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind), Vanilla JavaScript
- **Backend**: Firebase (Authentication + Firestore)
- **Fonts**: Orbitron, Rajdhani (Google Fonts)

## Setup

1. Clone the repository
2. Replace Firebase config in `js/storage.js` with your own
3. Create a user in Firebase Authentication
4. Open `index.html` for the public CV
5. Open `admin.html` for the admin panel

## Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Copy your config to `js/storage.js`

## Deployment

Deploy to GitHub Pages, Vercel, or Netlify:
- Public files: `index.html`, `admin.html`, `css/`, `js/`
- No backend required - fully client-side with Firebase

## License

MIT License - Feel free to use for your own CV!
