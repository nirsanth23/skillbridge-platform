# SkillBridge REST API Endpoints Specification

**Document Version:** 1.0  
**Project:** SkillBridge – Smart Freelance & Mentorship Platform  
**Base URL:** `/api`  
**Date:** September 2026  

---

## 1. Global API Standards

* **Base URL:** `http://localhost:5000/api` (Development) / `https://api.skillbridge.com/api` (Production)
* **Request Format:** `Content-Type: application/json` (or `multipart/form-data` for file uploads)
* **Response Format:** Standard JSON envelope:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional message"
  }
  ```
* **Authentication:** Sent via standard Bearer header: `Authorization: Bearer <JWT_TOKEN>`

---

## 2. API Endpoints by Domain Module

---

### 2.1 System & Health Check

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server & API health status check | Public | All |

---

### 2.2 Authentication Module (`/api/auth`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user account with specified role | Public | All |
| `POST` | `/auth/login` | Authenticate user and issue signed JWT token | Public | All |
| `POST` | `/auth/logout` | Invalidate user session / clear token | Required | All Authenticated |
| `GET` | `/auth/me` | Fetch authenticated user's profile and credentials | Required | All Authenticated |
| `POST` | `/auth/forgot-password` | Request password reset token via email | Public | All |
| `POST` | `/auth/reset-password` | Reset password using valid reset token | Public | All |

---

### 2.3 Users Module (`/api/users`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Fetch authenticated user's own profile | Required | All Authenticated |
| `PATCH` | `/users/me` | Update authenticated user's own profile (name, profileImage) | Required | All Authenticated |
| `GET` | `/users/:id` | Fetch public user profile and basic information | Required | All Authenticated |
| `PATCH` | `/users/:id` | Update personal account profile details | Required | Account Owner / Admin |
| `POST` | `/users/:id/avatar` | Upload or update user profile image | Required | Account Owner |
| `DELETE`| `/users/:id` | Request account deactivation | Required | Account Owner / Admin |

---

### 2.4 Freelancers Module (`/api/freelancers`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/freelancers` | Search and filter freelancer profiles (skills, rating, rate) | Public / Optional | All |
| `GET` | `/freelancers/:id` | Fetch detailed freelancer profile, portfolio, and stats | Public / Optional | All |
| `POST` | `/freelancers/profile` | Create freelancer profile extension | Required | Freelancer |
| `PATCH` | `/freelancers/profile` | Update freelancer bio, skills, rates, availability | Required | Freelancer |
| `POST` | `/freelancers/portfolio`| Add new portfolio item | Required | Freelancer |
| `DELETE`| `/freelancers/portfolio/:itemId` | Remove portfolio item | Required | Freelancer |
| `POST` | `/freelancers/verify-skill` | Submit skill verification request | Required | Freelancer |

---

### 2.5 Mentors Module (`/api/mentors`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/mentors` | Search and filter mentors (expertise, fees, rating) | Public / Optional | All |
| `GET` | `/mentors/:id` | Fetch mentor details, certifications, and availability slots | Public / Optional | All |
| `POST` | `/mentors/profile` | Create mentor profile extension | Required | Mentor |
| `PATCH` | `/mentors/profile` | Update mentor profile, expertise, and session fee | Required | Mentor |
| `PUT` | `/mentors/availability`| Set or update weekly recurring availability slots | Required | Mentor |

---

### 2.6 Companies Module (`/api/companies`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/companies` | Browse verified company profiles | Public / Optional | All |
| `GET` | `/companies/:id` | Fetch company details and posted projects | Public / Optional | All |
| `POST` | `/companies/profile` | Create organization profile | Required | Company |
| `PATCH` | `/companies/profile` | Update company description, size, and website | Required | Company |
| `GET` | `/companies/talent-pool` | View saved freelancers in company talent pool | Required | Company |
| `POST` | `/companies/talent-pool` | Add freelancer to talent pool with notes | Required | Company |
| `DELETE`| `/companies/talent-pool/:freelancerId` | Remove freelancer from talent pool | Required | Company |
| `POST` | `/companies/career-opportunities` | Extend internship/employment offer to a freelancer | Required | Company |
| `GET` | `/companies/career-opportunities` | View sent career opportunities | Required | Company |

---

### 2.7 Projects Module (`/api/projects`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/projects` | Create a new project posting | Required | Student, Client, Company |
| `GET` | `/projects` | Browse and filter open projects (category, budget, skills) | Public / Optional | All |
| `GET` | `/projects/:id` | Fetch project details, requirements, and owner info | Required | All Authenticated |
| `PATCH` | `/projects/:id` | Update project details (if still open) | Required | Project Owner |
| `DELETE`| `/projects/:id` | Cancel/delete an open project posting | Required | Project Owner, Admin |
| `GET` | `/projects/my-projects`| List projects posted by the authenticated user | Required | Student, Client, Company |

---

### 2.8 Proposals Module (`/api/proposals`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/projects/:projectId/proposals` | Submit a project proposal / bid | Required | Freelancer |
| `GET` | `/projects/:projectId/proposals` | View all proposals submitted for a specific project | Required | Project Owner |
| `GET` | `/proposals/:id` | View proposal details | Required | Proposal Owner, Project Owner |
| `PATCH` | `/proposals/:id` | Accept, shortlist, or reject a proposal | Required | Project Owner |
| `DELETE`| `/proposals/:id` | Withdraw a submitted proposal | Required | Proposal Owner |
| `GET` | `/proposals/my-proposals` | View all proposals submitted by current freelancer | Required | Freelancer |

---

### 2.9 Bookings Module (`/api/bookings`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/bookings` | Request a mentorship session booking | Required | Student, Client |
| `GET` | `/bookings` | List user's mentorship bookings (upcoming & past) | Required | Student, Mentor |
| `GET` | `/bookings/:id` | Fetch specific booking details and meeting link | Required | Involved Student / Mentor |
| `PATCH` | `/bookings/:id` | Confirm, reject, or complete a booking | Required | Mentor, Admin |
| `DELETE`| `/bookings/:id` | Cancel a scheduled booking | Required | Involved Student / Mentor |

---

### 2.10 Workspace Module (`/api/workspaces`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/workspaces/:id` | Fetch project workspace overview, progress, files | Required | Project Owner, Freelancer |
| `POST` | `/workspaces/:id/tasks` | Create a new task in workspace | Required | Project Owner, Freelancer |
| `PATCH` | `/tasks/:id` | Update task status, priority, assignment | Required | Project Owner, Freelancer |
| `DELETE`| `/tasks/:id` | Delete a task | Required | Project Owner, Freelancer |
| `POST` | `/workspaces/:id/milestones` | Create a new project milestone | Required | Project Owner |
| `PATCH` | `/milestones/:id` | Submit deliverables or approve/release milestone | Required | Project Owner, Freelancer |
| `POST` | `/workspaces/:id/files` | Upload workspace document or deliverable | Required | Project Owner, Freelancer |

---

### 2.11 Reviews Module (`/api/reviews`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/reviews` | Submit rating & review for completed project/mentorship | Required | Client, Student, Freelancer |
| `GET` | `/users/:userId/reviews`| List all reviews received by a user | Public / Optional | All |
| `GET` | `/reviews/:id` | View specific review breakdown | Required | All Authenticated |

---

### 2.12 Chat Module (`/api/chat` / `/api/conversations`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/conversations` | List all active chat conversations for current user | Required | All Authenticated |
| `POST` | `/conversations` | Start or retrieve conversation with another user | Required | All Authenticated |
| `GET` | `/conversations/:id/messages` | Retrieve paginated message history | Required | Conversation Participants |
| `POST` | `/conversations/:id/messages` | Send message (REST fallback for Socket) | Required | Conversation Participants |
| `PATCH` | `/conversations/:id/read` | Mark all unread messages as read | Required | Conversation Participants |

---

### 2.13 Notifications Module (`/api/notifications`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Get user's notifications (with unread count) | Required | All Authenticated |
| `PATCH` | `/notifications/:id/read` | Mark specific notification as read | Required | Notification Recipient |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read | Required | All Authenticated |

---

### 2.14 Payments & Transactions Module (`/api/payments`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/payments/milestone/escrow` | Fund milestone escrow (Simulated / Payment gateway) | Required | Client, Student, Company |
| `POST` | `/payments/milestone/release`| Release milestone funds to freelancer | Required | Client, Student, Company |
| `POST` | `/payments/mentorship` | Process mentorship session payment | Required | Student |
| `GET` | `/payments/transactions` | View user's transaction history | Required | All Authenticated |
| `GET` | `/payments/transactions/:id`| Fetch transaction receipt details | Required | Involved Parties / Admin |

---

### 2.15 AI & Recommendation Module (`/api/ai`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/ai/recommend-freelancers` | Get AI recommendations of freelancers for a project | Required | Student, Client, Company |
| `POST` | `/ai/recommend-mentors` | Get AI recommendations of mentors based on goals | Required | Student |
| `POST` | `/ai/match-score` | Calculate compatibility score between project & talent | Required | All Authenticated |

---

### 2.16 Admin Module (`/api/admin`)

| Method | Endpoint | Purpose | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/analytics` | Get global platform metrics (users, projects, GMV) | Required | Admin |
| `GET` | `/admin/users` | List, search, and filter all registered platform users | Required | Admin |
| `PATCH` | `/admin/users/:id/status` | Suspend, activate, or verify a user account | Required | Admin |
| `GET` | `/admin/verifications` | View pending skill & company verification requests | Required | Admin |
| `PATCH` | `/admin/verifications/:id`| Approve or reject skill verification submission | Required | Admin |
| `GET` | `/admin/reports` | View reported users, projects, or disputes | Required | Admin |
| `PATCH` | `/admin/reports/:id` | Resolve or dismiss filed report | Required | Admin |
| `DELETE`| `/admin/projects/:id` | Force-remove policy-violating project | Required | Admin |
