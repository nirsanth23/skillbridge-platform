# SkillBridge System Architecture Documentation

**Document Version:** 1.0  
**Project:** SkillBridge – Smart Freelance & Mentorship Platform  
**Architecture Pattern:** 3-Tier Web Architecture with Modular Monolith Backend  
**Date:** September 2026  

---

## 1. System Overview & Architectural Vision

SkillBridge is built on a **3-Tier Full-Stack Architecture** utilizing the **MERN Stack** (MongoDB, Express.js, React, Node.js). To ensure long-term maintainability, developer velocity, and horizontal scalability without premature microservice overhead, the backend is organized as a **Modular Monolith**.

```text
+-----------------------------------------------------------------------------------+
|                            PRESENTATION LAYER (Client)                            |
|          React.js + Vite | Tailwind CSS | React Router | Socket.IO Client         |
+-----------------------------------------------------------------------------------+
                                         |
                       HTTP / REST API  |  WebSocket (Socket.IO)
                                         v
+-----------------------------------------------------------------------------------+
|                        APPLICATION LAYER (Backend Server)                         |
|                      Node.js + Express.js (Modular Monolith)                      |
|                                                                                   |
|  [Auth] [Users] [Freelancers] [Mentors] [Companies] [Projects] [Proposals]        |
|  [Bookings] [Workspace] [Reviews] [Notifications] [Chat] [Payments] [AI] [Admin] |
|                                                                                   |
|  Cross-Cutting: Auth Middleware | Role RBAC | Error Handler | Multer | Socket Hub |
+-----------------------------------------------------------------------------------+
                         |                          |                    |
                         v                          v                    v
+---------------------------------+  +-----------------------+  +-------------------+
|           DATA LAYER            |  |  EXTERNAL AI SERVICE  |  |   FILE STORAGE    |
|      MongoDB Atlas + Mongoose   |  |   Skill Matching API  |  | Cloudinary/Storage|
+---------------------------------+  +-----------------------+  +-------------------+
```

---

## 2. Core Architectural Layers

### 2.1 Presentation Layer (Frontend)
* **Framework:** React.js initialized with Vite for rapid HMR and optimized tree-shaken production bundles.
* **Styling Engine:** Tailwind CSS with utility-first design tokens and responsive breakpoints.
* **State & Data Management:** 
  * Context API for global authentication state (`AuthContext`) and real-time socket connections (`SocketContext`).
  * Axios configured with centralized interceptors for automatic JWT bearer token attachment and global HTTP error handling.
* **Routing:** `react-router-dom` with declarative public, protected, and role-guarded routes.
* **Real-time Client:** `socket.io-client` managing persistent bi-directional WebSocket connections.

### 2.2 Application Layer (Backend Modular Monolith)
* **Runtime:** Node.js (ES Modules standard).
* **Web Server Framework:** Express.js providing RESTful HTTP endpoint routing.
* **Real-Time Gateway:** Socket.IO server running alongside the HTTP server on unified connection handlers.
* **Modular Monolith Design:** Each business capability resides within its own domain module under `src/modules/`, encapsulating its own controllers, services, and route definitions while sharing core infrastructure (database, middleware, utils).

#### Domain Modules:
1. **`auth`**: Registration, login, password hashing, JWT issue/refresh, role assignment.
2. **`users`**: Account lifecycle, base profile info, avatar management.
3. **`freelancers`**: Freelancer profiles, portfolio showcases, skill catalog, rates.
4. **`mentors`**: Mentor profiles, expertise domains, session fee, availability slots.
5. **`companies`**: Organization profiles, corporate verification, talent acquisition.
6. **`projects`**: Project posting, requirement categorizations, lifecycle statuses.
7. **`proposals`**: Bid submissions, cover letters, pricing negotiations, shortlisting.
8. **`bookings`**: Mentorship schedule bookings, slot locking, meeting link dispatch.
9. **`workspace`**: Post-hire collaboration hub, task boards, milestones, shared files.
10. **`reviews`**: Ratings and qualitative feedback calculation for users/sessions.
11. **`notifications`**: Persistent notification generation and dispatch.
12. **`chat`**: Direct and project-bound 1-on-1 messaging history.
13. **`payments`**: Simulated milestone escrow, release, and session payment records.
14. **`ai`**: Algorithmic and AI-assisted skill matching recommendation engine.
15. **`admin`**: Platform analytics, user moderation, report resolutions, skill verifications.

### 2.3 Data Layer (Database)
* **Database Engine:** MongoDB (MongoDB Atlas cloud deployment / Local instance).
* **Object Data Modeling (ODM):** Mongoose providing schema validation, typed references, and lifecycle hooks.
* **Indexing Strategy:** Compound and unique indexes on high-frequency filters (e.g., user email, project status/skills, booking date/time slots).

---

## 3. Integration & Supporting Services

### 3.1 External AI Recommendation Service
* **Purpose:** Matches client project descriptions and required skill tags against freelancer competencies, ratings, and budgets; also recommends mentors to students based on learning objectives.
* **Integration:** Backend-to-AI REST service integration. The backend extracts structured text/metadata, requests match scoring, and returns ranked recommendations to the client.

### 3.2 File Storage Service
* **Purpose:** Stores user avatars, portfolio artifacts, project requirement briefs, workspace deliverables, and verification certificates.
* **Mechanism:** Express `multer` handles multi-part form uploads, which stream directly to cloud storage (e.g., Cloudinary or S3-compatible storage), returning persistent CDN URLs stored in MongoDB documents.

---

## 4. Key Architectural & Communication Flows

### 4.1 Frontend-Backend REST Communication Flow

```text
[React Component] 
       │ 
       ▼ (Calls service method)
[Axios Client (services/api.js)] ─── Attaches "Authorization: Bearer <JWT>"
       │
       ▼ (HTTP Request: JSON payload)
[Express Server (app.js)]
       │
       ▼ (Global Middleware: CORS, express.json())
[Route / Module Middleware] ─────── authMiddleware (verifies JWT) + roleMiddleware (checks RBAC)
       │
       ▼ (Controller & Service Logic)
[Mongoose ODM] ──────────────────── Queries / Mutates MongoDB
       │
       ▼ (JSON Response)
[React State / UI Update]
```

---

### 4.2 Real-Time Communication Flow (Socket.IO)

```text
[React Client A]                    [Socket.IO Server]                    [React Client B]
       │                                     │                                    │
       ├─── 1. Authenticate with JWT ───────>│                                    │
       │    (Registers socket to userId)     │                                    │
       │                                     │<─── 1. Authenticate with JWT ──────┤
       ├─── 2. Join Conversation Room ──────>│                                    │
       │       "conversation:123"            │<─── 2. Join Conversation Room ─────┤
       │                                     │                                    │
       ├─── 3. Emit "sendMessage" ──────────>│                                    │
       │       (Payload: text, convId)       ├─── Persists message to MongoDB     │
       │                                     │                                    │
       │                                     ├─── 4. Broadcast "receiveMessage" ─>│
       │                                     │                                    │
       │                                     ├─── 5. Emit "notificationReceived" ─>│
```

---

### 4.3 User Authentication Flow

```text
User Submits Credentials (Email + Password)
       │
       ▼
POST /api/auth/login
       │
       ▼
Find User by Email in MongoDB
       │
       ├── User Not Found / Suspended ──────────► Return 401 Unauthorized / 403 Forbidden
       │
       ▼
Verify Password with bcrypt.compare()
       │
       ├── Password Invalid ────────────────────► Return 401 Unauthorized
       │
       ▼
Generate Signed JWT (Payload: userId, role; Expiry: 7d)
       │
       ▼
Return JSON { token, user: { id, name, email, role, isVerified } }
       │
       ▼
Frontend stores Token in LocalStorage / Memory & sets AuthContext state
```

---

### 4.4 Project Hiring & Workspace Lifecycle Flow

```text
1. Client posts project (POST /api/projects) -> status: "open"
2. Freelancers browse & submit proposals (POST /api/projects/:id/proposals)
3. Client reviews, shortlists, and accepts proposal (PATCH /api/proposals/:id)
4. SYSTEM ACTIONS:
   a. Project status updated to "in_progress"
   b. Auto-creates Workspace (projectId, clientUser, freelancerUser)
   c. Auto-creates initial Milestones from proposal details
   d. Auto-creates Conversation channel between client and freelancer
   e. Emits real-time notification to freelancer
5. Freelancer works in Workspace, adds Tasks, uploads Deliverables
6. Client reviews deliverables & approves Milestone -> Triggers payment release
7. Project marked "completed" -> Both parties prompted to submit Reviews
```

---

### 4.5 Mentorship Booking Flow

```text
1. Student filters & discovers Mentor (GET /api/mentors)
2. Student selects available slot & session type (POST /api/bookings) -> status: "pending"
3. Mentor receives booking notification
4. Mentor accepts booking (PATCH /api/bookings/:id) -> status: "confirmed"
   (Generates & attaches meeting link)
5. Mentorship session occurs at scheduled date & time
6. Mentor marks session as "completed"
7. Student receives prompt and submits Review (POST /api/reviews)
8. Mentor aggregate rating is re-calculated and updated
```

---

## 5. Security Architecture & Considerations

1. **Password Protection:** Passwords are never stored in plaintext; they are hashed using `bcryptjs` with a cost factor (salt rounds) of 10.
2. **Stateless JWT Authentication:** Authentication tokens are cryptographically signed with a secure server-side secret key (`JWT_SECRET`).
3. **Role-Based Access Control (RBAC):** Middleware guarantees that sensitive operations (e.g., posting projects, approving verifications, managing disputes) are restricted strictly to designated user roles (`student`, `client`, `freelancer`, `mentor`, `company`, `admin`).
4. **Input Validation & Sanitization:** All incoming request payloads undergo explicit type, boundary, and format validation to prevent NoSQL injection, cross-site scripting (XSS), and data corruption.
5. **CORS Hardening:** Cross-Origin Resource Sharing is strictly bound to authorized frontend origin URLs (`CLIENT_URL`).
6. **File Security:** Multi-part file uploads are filtered by MIME type whitelist and size constraints before processing.
7. **Environment Isolation:** Sensitive database URIs, API keys, and secrets are strictly loaded via `.env` variables and excluded from source control.
