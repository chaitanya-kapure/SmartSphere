# Deployment Guide

## Architecture Overview

```
Frontend (Vercel) ──→ Backend (Render/Railway) ──→ MongoDB Atlas
                              │
                              ├── Cloudinary (image upload)
                              └── Gemini API (AI features)
```

---

## 1. MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and sign in
2. Create a new cluster (M0 free tier is sufficient)
3. Under **Security → Database Access**, create a database user with read/write permissions
4. Under **Security → Network Access**, add `0.0.0.0/0` (allow all) for production, or restrict to your backend's IP
5. Click **Connect → Connect your application** → copy the connection string
6. Replace `<password>` with your database user's password and `<dbname>` with your database name

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smartsphere?retryWrites=true&w=majority
```

---

## 2. Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/) (free tier: 25GB storage, 25GB bandwidth)
2. From the Dashboard, copy:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

---

## 3. Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **Get API Key** → **Create API Key**
3. Copy the key (starts with `AIzaSy...`)

---

## 4. Backend — Render

### Prerequisites
- Push your code to GitHub (smartsphere-v2 branch)
- Ensure `server/package.json` has a `start` script: `node src/app.js`

### Steps

1. Go to [Render](https://render.com/) and sign in with GitHub
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `smartsphere-city-api` |
| **Region** | Choose closest to your users |
| **Branch** | `smartsphere-v2` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

5. Add environment variables (see table below)
6. Click **Create Web Service**

### Environment Variables

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render sets this automatically) |
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | Strong random string (64+ chars) |
| `JWT_REFRESH_SECRET` | Different strong random string |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `GEMINI_API_KEY` | From Google AI Studio |
| `CLIENT_URL` | `https://your-app.vercel.app` (set after frontend deploy) |
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASS` | Gmail app password |

---

## 5. Frontend — Vercel

### Prerequisites
- Push your code to GitHub (smartsphere-v2 branch)

### Steps

1. Go to [Vercel](https://vercel.com/) and sign in with GitHub
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Create React App` |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `build` |

5. Add environment variables:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://smartsphere-city-api.onrender.com/api` |
| `REACT_APP_SOCKET_URL` | `https://smartsphere-city-api.onrender.com` |

6. Click **Deploy**

### Post-Deployment

After Vercel deployment completes:
1. Copy your Vercel domain (e.g., `https://smartsphere-city.vercel.app`)
2. Go back to Render → Environment → update `CLIENT_URL` to your Vercel URL
3. Redeploy the backend (Render → Manual Deploy → Deploy latest commit)

---

## 6. Verify Deployment

Run through this checklist after deployment:

- [ ] `GET /api/health` returns `{ "status": "ok" }`
- [ ] Register a new user → 201 response
- [ ] Login → receives access + refresh tokens
- [ ] Create complaint → complaint created with AI classification
- [ ] Upload image → Cloudinary URL returned
- [ ] Socket.io connection → notification received on status change
- [ ] Analytics dashboard → charts load with data
- [ ] Frontend routing → all 4 dashboards accessible per role

---

## 7. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | `development` / `production` / `test` |
| `PORT` | Yes | Server port (Render sets auto) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `JWT_EXPIRY` | No | Default: `15m` |
| `JWT_REFRESH_EXPIRY` | No | Default: `7d` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `CLIENT_URL` | Yes | Frontend URL (CORS origin) |
| `EMAIL_USER` | Yes | Gmail address for notifications |
| `EMAIL_PASS` | Yes | Gmail app password |

---

## 8. Free Tier Limitations

| Service | Limitation |
|---------|------------|
| **Render** | Server spins down after 15 min idle (cold start ~30s) |
| **MongoDB Atlas** | M0: 512MB storage, 100 max connections |
| **Cloudinary** | Free: 25GB storage, 25GB bandwidth/month |
| **Gemini API** | Free: 60 requests per minute (flash model) |
| **Vercel** | 100GB bandwidth, 6000 build minutes/month |

[Back to README](../README.md)
