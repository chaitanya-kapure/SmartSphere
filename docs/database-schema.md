# Database Schema

## ER Diagram

```mermaid
erDiagram
    User ||--o{ Complaint : submits
    User ||--o{ Complaint : assigned_to
    User ||--o{ ComplaintHistory : changes
    User ||--o{ Notification : receives
    User ||--o{ Feedback : provides
    User ||--o{ RefreshToken : owns
    Department ||--o{ User : belongs_to
    Department ||--o{ Complaint : assigned_department
    Department ||--o{ Feedback : department_feedback
    Complaint ||--o{ ComplaintHistory : has_history
    Complaint ||--o{ Notification : references
    Complaint ||--o{ Feedback : references
    Complaint ||--o| Complaint : duplicate_of

    User {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "citizen|worker|dept_head|super_admin"
        ObjectId department FK
        string phone
        string avatar
        boolean isActive
        boolean isDeleted
        date createdAt
        date updatedAt
    }

    Department {
        ObjectId _id PK
        string name UK
        string code UK
        string description
        ObjectId head FK
        boolean isActive
        boolean isDeleted
        date createdAt
        date updatedAt
    }

    Complaint {
        ObjectId _id PK
        string complaintId UK "CMP-2026-0001"
        ObjectId citizen FK
        string title
        string description
        string category
        ObjectId department FK
        ObjectId assignedWorker FK
        ObjectId assignedBy FK
        date assignedAt
        object location "GeoJSON Point"
        string address
        array images "Cloudinary URLs"
        array proofImages
        string status "pending|assigned|in_progress|verification|resolved|rejected|reopened"
        string priority "low|medium|high|critical"
        object aiClassification "AI predictions"
        boolean isDuplicate
        ObjectId duplicateOf FK
        date slaDeadline
        boolean isOverdue
        number resolutionTimeHours
        date resolvedAt
        string aiSummary
        boolean isDeleted
        date createdAt
        date updatedAt
    }

    ComplaintHistory {
        ObjectId _id PK
        ObjectId complaint FK
        string previousStatus
        string newStatus
        ObjectId changedBy FK
        string remark
        date createdAt
    }

    Notification {
        ObjectId _id PK
        ObjectId recipient FK
        string type "assignment|status_change|feedback_request"
        string title
        string message
        ObjectId complaint FK
        boolean isRead
        date createdAt
        date updatedAt
    }

    Feedback {
        ObjectId _id PK
        ObjectId complaint FK
        ObjectId citizen FK
        ObjectId department FK
        number rating
        string comment
        date createdAt
        date updatedAt
    }

    RefreshToken {
        ObjectId _id PK
        string token
        ObjectId user FK
        date expiresAt TTL
        date createdAt
        date updatedAt
    }

    Counter {
        ObjectId _id PK "_id = 'complaintId'"
        number seq
        string year
    }
```

## Collections

### Users

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `ObjectId` | Primary key |
| `name` | `String` | Full name (2–100 chars) |
| `email` | `String` | Unique, lowercased |
| `passwordHash` | `String` | bcrypt, saltRounds=12, select: false |
| `role` | `String` | `citizen`, `worker`, `dept_head`, `super_admin` |
| `department` | `ObjectId` | Ref → Department |
| `phone` | `String` | Optional |
| `avatar` | `String` | Cloudinary URL |
| `isActive` | `Boolean` | Soft disable |
| `isDeleted` | `Boolean` | Soft delete |

### Complaints

| Field | Type | Description |
|-------|------|-------------|
| `complaintId` | `String` | Auto-generated: `CMP-{year}-{seq:04}` |
| `citizen` | `ObjectId` | Ref → User (submitter) |
| `title` | `String` | 5–200 chars |
| `description` | `String` | 10–2000 chars |
| `category` | `String` | AI-predicted or admin-set |
| `department` | `ObjectId` | Ref → Department |
| `assignedWorker` | `ObjectId` | Ref → User (worker role) |
| `assignedBy` | `ObjectId` | Ref → User (dept_head) |
| `assignedAt` | `Date` | Assignment timestamp |
| `location` | `GeoJSON` | `{ type: "Point", coordinates: [lng, lat] }` |
| `address` | `String` | Human-readable address |
| `images` | `Array` | `[{ url, publicId, uploadedAt }]` max 5 |
| `proofImages` | `Array` | `[{ url, publicId, uploadedAt }]` max 5 |
| `status` | `String` | State machine: 7 states |
| `priority` | `String` | `low`, `medium`, `high`, `critical` |
| `aiClassification` | `Object` | See AI Classification below |
| `isDuplicate` | `Boolean` | Flagged by AI |
| `duplicateOf` | `ObjectId` | Ref → Complaint |
| `slaDeadline` | `Date` | createdAt + 48 hours |
| `isOverdue` | `Boolean` | Past deadline |
| `resolutionTimeHours` | `Number` | Elapsed hours |
| `resolvedAt` | `Date` | Resolution timestamp |
| `aiSummary` | `String` | AI-generated 1-line summary |

### AI Classification Object

| Field | Type | Description |
|-------|------|-------------|
| `category` | `String` | AI-predicted category |
| `department` | `String` | AI-predicted department name |
| `priority` | `String` | AI-predicted priority |
| `confidence` | `Number` | 0–1 classification confidence |
| `isDuplicate` | `Boolean` | AI duplicate verdict |
| `duplicateOf` | `ObjectId` | Referenced duplicate |
| `duplicateConfidence` | `Number` | 0–1 duplicate confidence |

### Complaint Status State Machine

```
pending ──→ assigned ──→ in_progress ──→ verification ──→ resolved
  │            │              │                │
  └──→ rejected ←────────────┴────────────────┘
                                        │
                                   reopened ──→ assigned
```

### Departments

| Field | Type | Description |
|-------|------|-------------|
| `name` | `String` | Unique, e.g. "Electrical Department" |
| `code` | `String` | Unique, uppercase, e.g. "ELEC" |
| `description` | `String` | Optional |
| `head` | `ObjectId` | Ref → User (dept_head) |
| `isActive` | `Boolean` | Active status |
| `isDeleted` | `Boolean` | Soft delete |

### Notifications

| Field | Type | Description |
|-------|------|-------------|
| `recipient` | `ObjectId` | Ref → User |
| `type` | `String` | `assignment`, `status_change`, `feedback_request` |
| `title` | `String` | Notification title |
| `message` | `String` | Notification body |
| `complaint` | `ObjectId` | Ref → Complaint |
| `isRead` | `Boolean` | Read status |

### Other Collections

- **ComplaintHistory** — immutable audit log of all status transitions
- **Feedback** — citizen ratings and comments on resolved complaints
- **RefreshToken** — server-side token store with TTL index for auto-expiry
- **Counter** — atomic `$inc` counter for complaintId generation

## Indexes

| Collection | Index | Purpose |
|------------|-------|---------|
| Complaints | `{ complaintId: 1 }` UNIQUE | Fast lookup by display ID |
| Complaints | `{ citizen: 1, createdAt: -1 }` | Citizen's complaint list |
| Complaints | `{ assignedWorker: 1, status: 1 }` | Worker task filtering |
| Complaints | `{ department: 1, status: 1 }` | Dept head dashboard |
| Complaints | `{ status: 1, createdAt: -1 }` | Status-based queries |
| Complaints | `{ location: "2dsphere" }` | Geospatial `$nearSphere` queries |
| Complaints | `{ isDuplicate: 1 }` | Duplicate filtering |
| Complaints | `{ isDeleted: 1 }` | Soft delete filter |
| Users | `{ email: 1 }` UNIQUE | Auth lookup |
| Users | `{ role: 1 }` | Role-based queries |
| Users | `{ department: 1 }` | Department membership |
| Departments | `{ name: 1 }` UNIQUE | Lookup by name |
| Departments | `{ code: 1 }` UNIQUE | Lookup by code |
| RefreshTokens | `{ token: 1 }` | Token verification |
| RefreshTokens | `{ expiresAt: 1 }` TTL | Auto-expire after 7 days |

## GeoJSON Structure

Complaint locations are stored as [MongoDB GeoJSON Points](https://www.mongodb.com/docs/manual/reference/geojson/):

```json
{
  "type": "Point",
  "coordinates": [73.8567, 18.5204]
}
```

- `coordinates[0]` — Longitude (lng)
- `coordinates[1]` — Latitude (lat)

The `2dsphere` index enables:
- `$nearSphere` — radius-based nearby search
- `$geoWithin` — polygon boundary queries
- `$geoNear` — aggregation pipeline geo distance

[Back to README](../README.md)
