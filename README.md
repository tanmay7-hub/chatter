# Chatter — Real-Time WhatsApp Clone

Chatter is a full-stack real-time messaging application inspired by WhatsApp, built using the MERN stack. It supports one-to-one and group conversations with real-time messaging, media sharing, reactions, presence tracking, and WebRTC-based audio/video calling.

### Features

* 🔐 JWT-based authentication and protected APIs
* 💬 Real-time one-to-one messaging using Socket.IO
* 👥 Group creation, member management, and group messaging
* 📎 Image and audio file sharing
* 😊 Message reactions
* 👀 Message delivery and read-status tracking
* 🟢 Real-time online/offline presence
* 📞 WebRTC-based audio and video calling
* 🔄 Redis-based Socket.IO adapter for scalable real-time communication
* 👤 User profiles and profile-picture management
* ⚙️ Profile and application settings
* 🐳 Docker and Docker Compose support

### Tech Stack

**Frontend:** React, Redux Toolkit, Axios, Socket.IO Client
**Backend:** Node.js, Express.js, Socket.IO
**Database:** MongoDB
**Caching & Scaling:** Redis, Redis Adapter
**Real-Time Communication:** WebSockets, WebRTC
**Authentication:** JWT
**File Uploads:** Multer
**Deployment:** Docker, Docker Compose, Nginx

The project focuses not only on building a functional chat application but also on understanding real-time communication, distributed Socket.IO servers, Redis-based coordination, WebRTC signaling, authentication, and production-oriented backend architecture.
