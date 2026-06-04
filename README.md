# 🚀 SHRINK – URL Shortener & Analytics Platform

> **Shorten. Share. Track.**

SHRINK is a full-stack SaaS-style URL Shortener and Analytics platform built using the **MERN Stack (MongoDB, Express, React, Node.js)**.  
It allows users to create short links, track clicks, and manage URLs with a modern dashboard experience.

---

## ✨ Features

### 🔐 Authentication System
- User Signup & Login
- JWT-based authentication
- Protected routes
- Persistent sessions using localStorage
- Secure logout functionality

---

### 🔗 URL Shortener
- Generate unique short URLs
- Custom alias support
- Copy short link instantly
- Delete and manage URLs
- Server-side redirect handling

---

### 📊 Analytics System
- Click tracking for every short URL
- Visit timestamp logging
- Recent visit history
- Basic analytics dashboard

---

### 📁 Dashboard
- View all created URLs
- Clean SaaS-style interface
- URL management tools
- Workspace-ready structure

---

### 🎨 UI/UX Features
- Responsive design (mobile + desktop)
- Modern SaaS dashboard UI
- Smooth animations
- Toast notifications
- Loading states & empty states
- Teal + Lime + Light Yellow theme

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- React Router DOM
- Axios
- Context API
- Recharts (optional analytics)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt.js
- Helmet
- CORS
- express-rate-limit

---

## 📁 Project Structure


SHRINK/
│
├── client/ # Frontend (React)
├── server/ # Backend (Express + Node)
└── README.md


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/shrink.git
cd shrink
2️⃣ Backend Setup
cd server
npm install

Create .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173

Run backend:

npm run dev
3️⃣ Frontend Setup
cd client
npm install
npm run dev
📌 Assumptions Made
Each user manages only their own URLs
JWT token is stored in localStorage
Backend handles all URL redirection logic
Analytics are stored in MongoDB per click event
No third-party URL shortening APIs are used
Basic analytics are sufficient (no enterprise-level tracking required)
🧠 AI Planning Document

The application follows a modular MERN architecture:

Backend Design
REST APIs for authentication, URL creation, analytics
MongoDB schemas for Users, URLs, Clicks
Middleware for authentication and security
Frontend Design
Component-based React architecture
Context API for authentication state
Dashboard-based UI structure
Core Flow
User registers or logs in
User creates a short URL
Backend generates unique short code
Redirect endpoint tracks clicks
Analytics stored in MongoDB
Dashboard displays insights
🏗️ Architecture Diagram
Client (React)
      ↓
REST API (Express)
      ↓
Backend Logic (Node.js)
      ↓
Database (MongoDB)
🎥 Demo Video

👉 Add your demo video link here:

https://your-video-link-here.com

⚠️ Note: A working video demonstration is mandatory for evaluation.

🚀 API Endpoints
Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
URL Management
POST   /api/url/shorten
GET    /api/url/user
PUT    /api/url/:id
DELETE /api/url/:id
Analytics
GET /api/analytics/:id
GET /api/public-stats/:shortCode
Redirect
GET /:shortCode
🎨 UI Theme
Primary Color: #14B8A6 (Teal)
Secondary Color: #84CC16 (Lime)
Accent Color: #FEF08A (Light Yellow)
🚀 Future Enhancements
QR Code generation
Custom domains for short links
Advanced analytics (geo/device tracking)
Dark mode support
CSV bulk upload
Real-time analytics via WebSockets
👨‍💻 Author

Built as a full-stack SaaS project using MERN stack for learning and hackathon submission.

youtube video link:https://youtu.be/MwCQYx98Y6w?si=e7AgKbK5GK-eL2Ie

📜 License

This project is for educational purposes only.

🏁 Hackathon Declaration

This project is a part of a hackathon run by https://katomaran.com
