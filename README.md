<div align="center">

# 🔗 LinkUp

**A real-time video calling platform built from scratch with WebRTC, Socket.IO, and React.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black?logo=socket.io)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-EF4136?logo=webrtc&logoColor=white)](https://webrtc.org)

[Live Demo](https://link-up-video-call.vercel.app/) · [Report a Bug](#) · [Request a Feature](#)

</div>

---

## Overview

LinkUp is a Google Meet–style video calling platform built to understand how real-time communication actually works under the hood — peer-to-peer media streaming, signaling, NAT traversal, and multi-user state synchronization — rather than wrapping an existing SDK.

Every core piece is hand-built: the WebRTC signaling layer over Socket.IO, a host/waiting-room approval system, live reactions and hand-raising, JWT authentication, and a TURN server fallback for users behind restrictive networks.

## 🚀 Live Demo

| | |
|---|---|
| 🌐 **Frontend** | [link-up-video-call.vercel.app](https://link-up-video-call.vercel.app/) |
| ⚙️ **Backend** | [linkup-videocall.onrender.com](https://linkup-videocall.onrender.com) |

> The backend runs on Render's free tier, so the first request after a period of inactivity may take 20–30 seconds to spin up.

## ✨ Features

**Calling**
- Peer-to-peer video and audio calling via WebRTC
- Screen sharing
- Dynamic grid layout that adapts to the number of participants
- Pin any participant to full screen with a double-click
- Live mute and camera-off indicators on every tile

**Collaboration**
- Real-time in-call chat
- Emoji reactions
- Raise hand
- Live participant count
- One-click meeting link copy

**Access control**
- Host-approved waiting room — new joiners wait until admitted
- Automatic host transfer if the current host leaves
- Meeting rooms identified by short, shareable links (`/meet/:meetingId`)

**Accounts**
- JWT-based authentication with expiring tokens
- Meeting history per user, with one-click rejoin

**Reliability**
- STUN/TURN (Metered.ca) fallback so calls connect even across strict NATs and firewalls

## 🛠️ Tech Stack

**Frontend**
- React 19, React Router
- Material UI
- Socket.IO Client
- WebRTC (`RTCPeerConnection`)
- CSS Modules

**Backend**
- Node.js, Express
- Socket.IO
- MongoDB with Mongoose
- JWT + bcrypt
- CORS

**Infrastructure**
- Frontend hosted on **Vercel**
- Backend hosted on **Render**
- Database on **MongoDB Atlas**
- TURN relay via **Metered.ca**

## 🏗️ How it works

```
Browser A ──┐                              ┌── Browser B
            │        Socket.IO signaling    │
            ├──────────► Express server ◄───┤
            │        (offer/answer/ICE)     │
            │                                │
            └──────── WebRTC media stream ───┘
                    (direct P2P, or relayed
                     through TURN if needed)
```

Socket.IO is used purely for **signaling** — exchanging session descriptions and ICE candidates, chat messages, and presence events (join/leave, mute status, reactions). Once a peer connection is negotiated, video and audio flow directly between browsers, falling back to a TURN relay only when a direct connection isn't possible.

## 📂 Project Structure

```
LinkUp/
├── backend/
│   └── src/
│       ├── controllers/   # Route handlers + Socket.IO event logic
│       ├── models/        # Mongoose schemas (User, Meeting)
│       ├── routes/        # Express routes
│       ├── middlewares/   # JWT verification
│       └── app.js
│
└── frontend/
    └── src/
        ├── components/    # Video tiles, chat panel, controls
        ├── hooks/         # useMediaStream, useSocket, usePeerConnections
        ├── pages/         # Landing, auth, home, history, video meet
        ├── contexts/      # AuthContext
        └── styles/
```

## ⚙️ Getting Started

### Prerequisites
- Node.js and npm
- A MongoDB connection string (e.g. from MongoDB Atlas)
- A free TURN credential set (e.g. from [Metered.ca](https://www.metered.ca))

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/LinkUp.git
cd LinkUp
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
METERED_DOMAIN=your_metered_domain
METERED_SECRET_KEY=your_metered_secret_key
METERED_TURN_USERNAME=your_turn_username
METERED_TURN_PASSWORD=your_turn_password
```

```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

In `src/environment.js`, set `IS_PROD` to `false` to point the app at your local backend:
```js
let IS_PROD = false;
```

```bash
npm start
```

The app will be running at `http://localhost:3000`.

## 🗺️ Roadmap

- [ ] Google OAuth login
- [ ] In-call recording
- [ ] Virtual backgrounds / background blur
- [ ] Rate limiting and stricter production hardening

## 👤 Author

Built by **Aditya Rajpoot**

---

<div align="center">
Made with a lot of debugging, one WebRTC race condition at a time.
</div>
