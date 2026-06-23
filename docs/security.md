# Security

## JWT Security

### Token Architecture

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| Access Token | 15 minutes | Client memory / localStorage | Authenticates API requests |
| Refresh Token | 7 days | Client + MongoDB (with TTL index) | Issues new access tokens |

### Access Token Payload

```json
{
  "sub": "user ObjectId",
  "role": "citizen|worker|dept_head|super_admin",
  "department": "department ObjectId or null",
  "iat": 1719000000,
  "exp": 1719000900
}
```

### Refresh Token Rotation

On every `POST /auth/refresh`:
1. Verify current refresh token JWT signature + expiry
2. Check token exists in MongoDB (server-side revocation)
3. **Delete old token from DB**
4. Issue **new** access token + **new** refresh token
5. Store new refresh token in DB

This prevents replay attacks: if a stolen refresh token is used, it works once, then the old token is deleted. If the attacker and victim both try to use the same token, the second request fails ("Refresh token revoked").

### Server-Side Revocation

- **Logout:** `RefreshToken.findOneAndDelete()` removes token from DB
- **User deleted:** All user's refresh tokens are cleaned up
- **TTL Index:** `expiresAt` index with `expireAfterSeconds: 0` auto-deletes expired tokens

---

## RBAC (Role-Based Access Control)

### Role Hierarchy

| Role | Scope | Can Assign Workers | Can Update Status | View All Complaints |
|------|-------|-------------------|-------------------|---------------------|
| `citizen` | Own complaints only | No | No | No |
| `worker` | Assigned complaints only | No | Yes (assigned→in_progress→verification) | No |
| `dept_head` | Department-wide | Yes | Yes (verification→resolved) | Department only |
| `super_admin` | City-wide | Yes | Yes (any transition) | Yes |

### Middleware Implementation

```javascript
// roles.js
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError("Insufficient permissions", 403));
  }
  next();
};
```

### Route Protection Map

| Route | Middleware |
|-------|-----------|
| `POST /api/complaints` | `authenticate` + `authorize("citizen", "super_admin")` |
| `POST /api/complaints/:id/assign` | `authenticate` + `authorize("dept_head", "super_admin")` |
| `POST /api/complaints/:id/status` | `authenticate` + `authorize("worker", "dept_head", "super_admin")` |
| `GET /api/ai/insights` | `authenticate` + `authorize("super_admin")` |
| `PATCH /api/ai/override/:id` | `authenticate` + `authorize("super_admin", "dept_head")` |
| `POST /api/uploads/complaint` | `authenticate` + `authorize("citizen", "super_admin")` |
| `POST /api/uploads/proof` | `authenticate` + `authorize("worker", "dept_head", "super_admin")` |

### Service-Level Filtering

Beyond route-level RBAC, complaint queries in the service layer enforce data scoping:

- **Citizen:** `{ citizen: req.user.id }`
- **Worker:** `{ assignedWorker: req.user.id }`
- **Dept Head:** `{ department: userDepartment }`
- **Super Admin:** No filter (full access)

---

## XSS Protection

### Input Sanitization

The `sanitizeInput` middleware (positioned after `express.json`) runs every request body, query, and param through the `xss` npm package:

```javascript
// sanitize.js — simplified
function sanitizeObject(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (SKIP_FIELDS.has(key)) {
      sanitized[key] = value;   // passwords, tokens — not sanitized
    } else {
      sanitized[key] = xss(value);  // strips HTML, JS, event handlers
    }
  }
}
```

**What `xss` blocks:**
- HTML tags (`<script>`, `<img onerror=...>`)
- `javascript:` URLs
- Event handlers (`onclick`, `onerror`, `onload`)
- Encoded attack vectors

### Output Protection

- React's JSX auto-escapes by default (no `dangerouslySetInnerHTML` used anywhere)
- All user content is rendered as text nodes

---

## NoSQL Injection Prevention

The `express-mongo-sanitize` middleware strips `$` and `.` from `req.body`, `req.query`, and `req.params`:

```javascript
app.use(mongoSanitize());
```

**Attack blocked:**
```json
// Malicious payload
{ "email": { "$gt": "" }, "password": { "$ne": "" } }
// → sanitized to
{ "email": {}, "password": {} }
// → validation error
```

Additionally, all route parameters with MongoDB IDs are validated with `isMongoId()` from `express-validator`, preventing garbage input from reaching queries.

---

## Rate Limiting

| Limiter | Window | Max | Applied To |
|---------|--------|-----|------------|
| Global | 15 min | 200 | All routes |
| Auth | 15 min | 20 | `/api/auth/*` |
| AI | 1 min | 10 | `/api/ai/*` |
| Upload | 1 min | 10 | `/api/uploads/*` |

All rate limiters return standardized error response:

```json
{
  "success": false,
  "message": "Too many requests",
  "errorCode": "RATE_LIMIT"
}
```

---

## Input Validation

### Validation Stack

1. **express-validator rules** — field-level validation (type, length, enum, format)
2. **validate middleware** — collects errors, returns structured response
3. **Mongoose schema validation** — document-level fallback (minlength, maxlength, enum)

### Validation Coverage

| Route Group | Fields Validated |
|-------------|-----------------|
| Auth | name, email, password, role, refreshToken |
| Complaints | title, description, category, location, images, status, remark, proofImages, workerId, complaint ID |
| Maps | lng (±180), lat (±90), maxDistance, ObjectIds |
| AI | title, description, complaint ID, category, priority, aiSummary |
| Notifications | unreadOnly boolean, notification ID |
| Uploads | File MIME type, file size, file count |

---

## HTTP Security Headers

Helmet.js sets the following headers:

| Header | Value | Protection |
|--------|-------|------------|
| `X-Content-Type-Options` | `nosniff` | MIME type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking |
| `X-XSS-Protection` | `0` (modern) | XSS (legacy browsers) |
| `Strict-Transport-Security` | `max-age=15552000` | HTTPS enforcement |
| `Content-Security-Policy` | Helmet defaults | Resource loading control |
| `Referrer-Policy` | `no-referrer` | Referrer leakage |

---

## CORS

```javascript
cors({ origin: config.clientUrl, credentials: true })
```

- Only the whitelisted client URL can make cross-origin requests
- Credentials (cookies) enabled for potential future use
- In production, set `CLIENT_URL` to the exact Vercel deployment URL

---

## Additional Protections

### File Upload Security

- **MIME validation:** Only `image/jpeg`, `image/png`, `image/webp`
- **Size limit:** 5MB per file (`multer` limits)
- **Count limit:** Max 5 per complaint (Mongoose validator)
- **No executables:** Non-image MIME types rejected at middleware

### Request Size

```javascript
express.json({ limit: "1mb" })
```

Bodies larger than 1MB are rejected with HTTP 413.

### Compression

```javascript
compression()  // gzip/deflate
```

Reduces bandwidth and mitigates certain attack vectors by normalizing response size.

[Back to README](../README.md)
