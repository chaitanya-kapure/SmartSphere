# API Reference

Base URL: `http://localhost:5000/api` (development) or `https://your-app.onrender.com/api` (production)

All endpoints (except auth) require `Authorization: Bearer <accessToken>` header.

---

## Auth APIs

### Register

```
POST /auth/register
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "citizen"
}
```

**Response (201):**
```json
{
  "user": {
    "_id": "665a...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

---

### Login

```
POST /auth/login
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com", "role": "citizen" },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "AUTH_ERROR"
}
```

---

### Refresh Token

```
POST /auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

> **Security:** Old refresh token is revoked. New access + refresh pair issued (rotation).

---

### Logout

```
POST /auth/logout
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Complaint APIs

### Create Complaint

```
POST /complaints
Authorization: Bearer <accessToken>
Roles: citizen, super_admin
```

**Request:**
```json
{
  "title": "Street light not working on Main Road",
  "description": "The street light near the main junction has been broken for 3 days. Area is dark at night.",
  "location": {
    "type": "Point",
    "coordinates": [73.8567, 18.5204]
  },
  "address": "Main Road Junction, City Center",
  "images": [
    { "url": "https://res.cloudinary.com/...", "publicId": "complaints/abc" }
  ]
}
```

**Response (201):**
```json
{
  "complaintId": "CMP-2026-0001",
  "title": "Street light not working on Main Road",
  "status": "pending",
  "category": "Electrical",
  "priority": "high",
  "aiClassification": {
    "category": "Electrical",
    "department": "Electrical Department",
    "priority": "high",
    "confidence": 0.92,
    "isDuplicate": false
  },
  "aiSummary": "Broken street light at Main Road junction needs repair"
}
```

---

### List Complaints

```
GET /complaints?status=pending&priority=high&department=<deptId>
Authorization: Bearer <accessToken>
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | String | Filter by status |
| `priority` | String | Filter by priority |
| `department` | String | Filter by department ID |

**Response (200):**
```json
[
  {
    "_id": "...",
    "complaintId": "CMP-2026-0001",
    "title": "Street light not working",
    "status": "pending",
    "priority": "high",
    "citizen": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
    "createdAt": "2026-06-23T10:00:00.000Z"
  }
]
```

> **Role-based filtering:** Citizens see only their own; workers see only assigned; dept_heads see department scope.

---

### Get Complaint

```
GET /complaints/:id
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "_id": "...",
  "complaintId": "CMP-2026-0001",
  "title": "Street light not working",
  "description": "Broken for 3 days...",
  "status": "assigned",
  "priority": "high",
  "category": "Electrical",
  "assignedWorker": { "_id": "...", "name": "Jane Worker", "email": "jane@city.gov" },
  "aiClassification": { "category": "Electrical", "confidence": 0.92 },
  "aiSummary": "Broken street light at Main Road"
}
```

---

### Update Complaint

```
PUT /complaints/:id
Authorization: Bearer <accessToken>
Roles: citizen (own), super_admin
```

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

---

### Delete Complaint

```
DELETE /complaints/:id
Authorization: Bearer <accessToken>
Roles: citizen (own, pending only), super_admin
```

**Response (200):** Soft delete — sets `isDeleted: true`.

---

### Assign Worker

```
POST /complaints/:id/assign
Authorization: Bearer <accessToken>
Roles: dept_head, super_admin
```

**Request:**
```json
{
  "workerId": "665a..."
}
```

**Response (200):** Status changes to `assigned`. Worker receives real-time notification.

---

### Update Status

```
POST /complaints/:id/status
Authorization: Bearer <accessToken>
Roles: worker, dept_head, super_admin
```

**Request:**
```json
{
  "status": "in_progress",
  "remark": "Starting work on this issue",
  "proofImages": [
    { "url": "https://res.cloudinary.com/...", "publicId": "proof/xyz" }
  ]
}
```

**Valid Transitions:**

| Current | Next |
|---------|------|
| pending | assigned, rejected |
| assigned | in_progress, rejected |
| in_progress | verification, rejected |
| verification | resolved, rejected |
| resolved | reopened |
| reopened | assigned |

---

### Get Timeline

```
GET /complaints/:id/timeline
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  {
    "previousStatus": null,
    "newStatus": "pending",
    "changedBy": { "name": "John Doe", "role": "citizen" },
    "remark": "Complaint submitted",
    "createdAt": "2026-06-23T10:00:00.000Z"
  },
  {
    "previousStatus": "pending",
    "newStatus": "assigned",
    "changedBy": { "name": "Dept Head", "role": "dept_head" },
    "remark": "Assigned to Jane Worker",
    "createdAt": "2026-06-23T11:00:00.000Z"
  }
]
```

---

## Analytics APIs

All analytics endpoints respect RBAC (citizen → own data, worker → assigned, dept_head → department).

### Dashboard Stats

```
GET /analytics/stats
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "total": 128,
  "pending": 34,
  "inProgress": 22,
  "resolved": 58,
  "overdue": 8,
  "avgResolutionTime": 36.5
}
```

### Monthly Trend

```
GET /analytics/monthly-trend
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  { "month": "2026-01", "count": 15 },
  { "month": "2026-02", "count": 22 },
  { "month": "2026-03", "count": 18 }
]
```

### Department Distribution

```
GET /analytics/department-distribution
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  { "department": "665a...", "name": "Water Supply", "count": 45 },
  { "department": "665b...", "name": "Electrical", "count": 38 }
]
```

### Status Distribution

```
GET /analytics/status-distribution
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  { "status": "pending", "count": 34 },
  { "status": "resolved", "count": 58 },
  { "status": "in_progress", "count": 22 },
  { "status": "assigned", "count": 10 },
  { "status": "rejected", "count": 4 }
]
```

### Priority Distribution

```
GET /analytics/priority-distribution
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  { "priority": "medium", "count": 68 },
  { "priority": "high", "count": 42 },
  { "priority": "low", "count": 18 }
]
```

### Worker Performance

```
GET /analytics/worker-performance
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  { "worker": "665a...", "name": "Rahul Sharma", "resolved": 25, "avgTime": 28.3 },
  { "worker": "665b...", "name": "Priya Singh", "resolved": 18, "avgTime": 32.1 }
]
```

### Area Trend

```
GET /analytics/area-trend
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  { "area": "18.52, 73.86", "count": 10, "lat": 18.52, "lng": 73.86 },
  { "area": "18.53, 73.85", "count": 7, "lat": 18.53, "lng": 73.85 }
]
```

---

## Notification APIs

### List Notifications

```
GET /notifications?unreadOnly=true
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  {
    "_id": "...",
    "type": "assignment",
    "title": "New Task Assigned",
    "message": "Complaint CMP-2026-0001: Street light not working",
    "isRead": false,
    "complaint": { "_id": "...", "complaintId": "CMP-2026-0001", "title": "Street light...", "status": "assigned" },
    "createdAt": "2026-06-23T11:00:00.000Z"
  }
]
```

### Unread Count

```
GET /notifications/unread-count
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{ "count": 3 }
```

### Mark Read

```
PATCH /notifications/:id/read
Authorization: Bearer <accessToken>
```

### Mark All Read

```
PATCH /notifications/read-all
Authorization: Bearer <accessToken>
```

---

## AI APIs

### Classify

```
POST /ai/classify
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "title": "Garbage overflowing near market area",
  "description": "The garbage dump near the main market has not been collected for a week. Smell is unbearable."
}
```

**Response (200):**
```json
{
  "classification": {
    "category": "Sanitation",
    "department": "Sanitation Department",
    "confidence": 0.95
  },
  "priority": {
    "priority": "high",
    "confidence": 0.88
  },
  "summary": {
    "summary": "Uncollected garbage at main market causing health hazard"
  }
}
```

### Detect Duplicate

```
POST /ai/detect-duplicate
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "title": "Street light broken at Main Road",
  "description": "The street light near junction is not working since Monday"
}
```

**Response (200):**
```json
{
  "isDuplicate": true,
  "duplicateOf": "665a...",
  "duplicateComplaintId": "CMP-2026-0001",
  "reason": "Same issue (broken street light) reported at the same location (Main Road junction)",
  "confidence": 0.91
}
```

### AI Insights

```
GET /ai/insights
Authorization: Bearer <accessToken>
Roles: super_admin
```

**Response (200):**
```json
{
  "data": {
    "totalComplaints": 128,
    "categoryDistribution": [
      { "category": "Sanitation", "count": 42 },
      { "category": "Electrical", "count": 35 }
    ],
    "departmentWorkload": [
      { "department": "Sanitation Department", "count": 45 }
    ]
  },
  "insights": {
    "topCategories": "Sanitation and Electrical complaints dominate, accounting for 60% of all reports.",
    "highRiskAreas": "Market area (18.52, 73.86) shows highest complaint density with 10 reports.",
    "emergingTrends": "Water-related complaints increased 40% in the last month.",
    "workloadPredictions": "Sanitation Department expected 20% increase next month based on current trend."
  }
}
```

### Override AI

```
PATCH /ai/override/:id
Authorization: Bearer <accessToken>
Roles: super_admin, dept_head
```

**Request:**
```json
{
  "category": "Roads",
  "priority": "critical",
  "aiSummary": "Major pothole on highway causing accidents"
}
```

---

## Upload APIs

```
POST /uploads/complaint
Authorization: Bearer <accessToken>
Roles: citizen, super_admin
Content-Type: multipart/form-data
Field: image (JPEG/PNG/WebP, max 5MB)
```

**Response (200):**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "complaints/abc123"
}
```

---

## Map APIs

### Nearby Complaints

```
GET /maps/nearby?lng=73.8567&lat=18.5204&maxDistance=5000
Authorization: Bearer <accessToken>
```

### Reverse Geocode

```
GET /maps/reverse-geocode?lat=18.5204&lng=73.8567
Authorization: Bearer <accessToken>
```

---

## Error Responses

All errors follow the standardized format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errorCode": "ERROR_CODE"
}
```

| HTTP Code | errorCode | Description |
|-----------|-----------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 401 | `AUTH_ERROR` | Missing/expired/invalid token |
| 403 | `FORBIDDEN` | Insufficient role permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `DUPLICATE_ERROR` | Duplicate value (e.g., email) |
| 413 | `FILE_ERROR` | Request too large |
| 429 | `RATE_LIMIT` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error |

Validation errors include field details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": [
    { "field": "title", "message": "Title must be 5–200 characters" }
  ]
}
```

[Back to README](../README.md)
