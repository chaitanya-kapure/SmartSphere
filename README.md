# SmartSphere City

<p align="center">
  <strong>AI-Powered Municipal Operations Platform</strong>
  <br />
  <em>From Citizen Complaints to Intelligent City Management</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/Express-4.21-000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Gemini-AI-8E75B2?logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Socket.io-4.8-010101?logo=socket.io" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet" alt="Leaflet" />
</p>

---

## Overview

SmartSphere City transforms traditional citizen complaint management into an intelligent municipal operations platform. Citizens submit complaints with location data, AI automatically classifies and prioritizes them, workers receive real-time assignments, department heads monitor team performance, and administrators gain city-wide analytics — all in one unified platform.

---

## Key Features

### For Citizens
- **Submit Complaints** with location pinning (Leaflet + Nominatim reverse geocode)
- **Real-time Status Updates** via Socket.io push notifications
- **Personal Analytics** — track complaint history and resolution trends
- **Image Upload** — attach photos to complaints (Cloudinary)

### For Workers
- **Task Dashboard** — view assigned complaints with map visualization
- **Status Progression** — move complaints through verification workflow
- **Proof Upload** — attach resolution photos
- **Performance Metrics** — track resolved counts and average resolution time

### For Department Heads
- **Department Oversight** — view all complaints within department scope
- **Worker Assignment** — assign complaints to team members
- **Verification Workflow** — verify and resolve worker-completed complaints
- **Team Analytics** — worker performance charts and department distribution

### For Super Admins
- **City-wide Dashboard** — full analytics with 6 chart types
- **AI Insights** — Gemini-powered strategic recommendations
- **AI Override** — correct AI predictions for category, priority, and department
- **Complete RBAC** — manage all roles and permissions

### AI Intelligence (Gemini)
- **Auto Classification** — predicts category + department from title/description
- **Priority Detection** — low / medium / high / critical with confidence score
- **Auto Department Routing** — assigns department automatically at ≥70% confidence
- **Duplicate Detection** — semantic matching against 20 most recent complaints
- **AI Summarization** — generates concise 1-line summaries
- **Strategic Insights** — identifies trends, high-risk areas, workload predictions

### Infrastructure
- **JWT Auth** — access token (15m) + refresh token (7d) with rotation
- **Socket.io** — real-time notifications for assignment, status changes, creation
- **RBAC** — 4 roles with granular middleware enforcement
- **MongoDB Aggregation** — performant analytics pipelines
- **Cloudinary** — secure image upload and CDN delivery
- **Rate Limiting** — 4 tiers (global, auth, AI, upload)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router 6, Recharts, Leaflet, Socket.io Client |
| **Backend** | Node.js, Express 4, Socket.io 4 |
| **Database** | MongoDB 8, Mongoose 8 (with geospatial indexes) |
| **AI** | Google Gemini 2.0 Flash |
| **Auth** | JWT (jsonwebtoken), bcryptjs (saltRounds=12) |
| **Media** | Cloudinary, Multer |
| **Security** | Helmet, CORS, express-mongo-sanitize, xss, express-rate-limit, compression |
| **Validation** | express-validator |
| **Logging** | Morgan, custom structured logger |

---

## Architecture

```
client/  (React SPA — Vercel)
  │
  ├── REST API (Express — Render/Railway)
  │     ├── Auth Service (JWT + bcrypt)
  │     ├── Complaint Service (state machine + AI pipeline)
  │     ├── Analytics Service (aggregation pipelines)
  │     ├── Notification Service (DB + Socket.io emit)
  │     └── AI Service (Gemini API)
  │
  ├── Socket.io (real-time events)
  │
  └── MongoDB Atlas (primary data store)
        ├── Users, Complaints, Departments
        ├── Notifications, Feedback, ComplaintHistory
        └── RefreshTokens
```

See [docs/architecture.md](docs/architecture.md) for detailed flow diagrams.

---

## Prerequisites

- Node.js 18+
- MongoDB 8+ (local or Atlas)
- Cloudinary account (free tier)
- Google Gemini API key (free tier)
- npm or yarn

---

## Installation

```bash
# Clone the repository
git clone https://github.com/chaitanya-kapure/SmartCity_complaintSystem.git
cd SmartCity_complaintSystem

# Switch to v2 branch
git checkout smartsphere-v2

# Install backend dependencies
cd server
cp .env.example .env   # Edit with your values
npm install

# Install frontend dependencies
cd ../client
npm install

# Start development
cd ../server && npm run dev   # Backend on :5000
cd ../client && npm start      # Frontend on :3000
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Access token signing secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `CLIENT_URL` | Frontend URL (for CORS) | Yes |
| `EMAIL_USER` | Gmail address for notifications | Yes |
| `EMAIL_PASS` | Gmail app password | Yes |

---

## Running Locally

```bash
# Terminal 1 — Backend
cd server
npm run dev    # Nodemon on port 5000

# Terminal 2 — Frontend
cd client
npm start      # React dev server on port 3000
```

Open http://localhost:3000. Register as a citizen, submit a complaint with a location pin, and watch real-time classification in action.

---

## Deployment

| Service | Platform | Docs |
|---------|----------|------|
| Frontend | Vercel | [docs/deployment.md](docs/deployment.md) |
| Backend | Render / Railway | [docs/deployment.md](docs/deployment.md) |
| Database | MongoDB Atlas | [docs/deployment.md](docs/deployment.md) |
| Media | Cloudinary | [docs/deployment.md](docs/deployment.md) |
| AI | Google AI Studio | [docs/deployment.md](docs/deployment.md) |

---

## Project Structure

```
server/                    # Express backend
├── src/
│   ├── config/            # DB connection, env validation
│   ├── controllers/       # Request handlers
│   ├── middleware/         # Auth, RBAC, validation, upload, sanitize, error handler
│   ├── models/            # Mongoose schemas (6 models)
│   ├── routes/            # Express routers
│   ├── services/          # Business logic
│   │   └── ai/            # Gemini integration (7 files)
│   ├── socket/            # Socket.io init + JWT auth
│   ├── utils/             # Errors, logger
│   └── validators/        # express-validator rules (6 files)
├── package.json
└── .env

client/                    # React SPA
├── src/
│   ├── api/               # Axios instance with interceptors
│   ├── components/
│   │   ├── charts/        # 7 Recharts components
│   │   ├── layout/        # Navbar, ProtectedRoute
│   │   └── maps/          # LocationPicker, ComplaintMap, MapFilters
│   ├── contexts/          # AuthContext, SocketContext
│   ├── hooks/             # (extensible)
│   ├── pages/             # 8 page components
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── citizen/
│   │   ├── dept-head/
│   │   └── worker/
│   └── services/          # Axios service wrappers
├── package.json
└── public/

docs/                      # Documentation
├── architecture.md
├── api-reference.md
├── database-schema.md
├── deployment.md
├── security.md
└── resume-description.md
```

---

## Screenshots

> Screenshots coming soon. Key views:
>
> - **Citizen Dashboard** — complaint list + map + personal stats
> - **New Complaint** — form with interactive location picker
> - **Admin Dashboard** — 6 stat cards + 5 chart types + worker performance
> - **Department Head** — team oversight + assignment workflow
> - **Worker Dashboard** — task list + status transitions + proof upload
> - **Notification Bell** — real-time dropdown with unread count
> - **AI Classification** — confidence badges on complaint cards

---

## Future Scope

- **Voice-based complaint submission** using speech-to-text
- **WhatsApp / Telegram bot** integration for complaint filing
- **AI-generated resolution suggestions** based on historical data
- **Predictive maintenance** — flag infrastructure before failure
- **Public dashboard** — anonymized city-wide complaint heatmap
- **Mobile app** — React Native or Flutter
- **Multi-language support** for diverse city populations

---

## License

MIT

---

## Contact

Chaitanya Kapure — [GitHub](https://github.com/chaitanya-kapure)
