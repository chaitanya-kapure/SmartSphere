# Resume Description

## One-Line Description

Built SmartSphere City — a production-grade, AI-powered municipal complaint management platform using React, Express, MongoDB, and Google Gemini, serving 4 user roles with real-time communication and geospatial intelligence.

---

## Three Bullet Points

1. **Architected and built from scratch** a full-stack municipal operations platform serving citizens, field workers, department heads, and administrators with role-based access control, JWT authentication (access + refresh token rotation), and Socket.io real-time notifications across 7 complaint lifecycle states.

2. **Integrated Google Gemini AI** for automated complaint classification, priority detection (low/medium/high/critical), semantic duplicate detection against recent complaints, auto-department routing at ≥70% confidence, 1-line summarization, and strategic analytics insights — all with graceful fallback behavior ensuring zero disruption on AI failure.

3. **Implemented production-grade security and performance features** including 4-tier rate limiting, NoSQL injection prevention, XSS input sanitization, Helmet security headers, MongoDB aggregation pipelines (7 endpoints, single `$facet` for 6 counters), geospatial `$nearSphere` queries, Cloudinary image upload with MIME validation, and compressed API responses.

---

## Tech Stack Summary

```
Frontend:  React 18, React Router 6, Recharts, Leaflet, Socket.io Client, Axios
Backend:   Node.js, Express 4, Socket.io 4, JWT (jsonwebtoken), bcryptjs
Database:  MongoDB 8, Mongoose 8 (GeoJSON, Aggregation Pipeline, TTL Indexes)
AI:        Google Gemini 2.0 Flash, custom prompt engineering (5 prompt templates)
Media:     Cloudinary, Multer (memory storage, MIME validation, 5MB limit)
Security:  Helmet, CORS, express-mongo-sanitize, xss, express-rate-limit, compression,
           express-validator (6 validator files), bcrypt (saltRounds=12)
DevOps:    Git, npm workspaces, Concurrently, Nodemon, Morgan logging, Render, Vercel
```

[Back to README](../README.md)
