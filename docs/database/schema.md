# SkillBridge Database Schema Documentation

**Document Version:** 1.0  
**Project:** SkillBridge – Smart Freelance & Mentorship Platform  
**Database System:** MongoDB with Mongoose ODM  
**Date:** September 2026  

---

## 1. Overview & Data Modeling Strategy

SkillBridge is designed with a **MongoDB document database** using **Mongoose ODM**. The schema balances normalization (via `mongoose.Schema.Types.ObjectId` references) with strategic embedding for high-performance querying and referential consistency.

### Key Modeling Principles:
1. **Referential Integrity**: Explicit references via `ObjectId` are used for major entities (e.g., Users, Projects, Workspaces, Bookings).
2. **Timestamps**: All collections include automatic `createdAt` and `updatedAt` timestamps.
3. **Indexing**: Primary lookup keys, compound search filters, and foreign keys are explicitly indexed for sub-millisecond query performance.
4. **Enums & Validation**: Strict type validation and enum constraints prevent invalid state transitions.

---

## 2. Core Collections & Entity Schemas

---

### 2.1 Users Collection (`users`)

* **Purpose:** Stores core account identity, authentication credentials, base role, verification status, and timestamps for all platform participants.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique MongoDB Identifier |
| `name` | `String` | Yes | - | Full name of the user (trim, max: 100) |
| `email` | `String` | Yes | - | Unique email address (trim, lowercase, unique index) |
| `passwordHash` | `String` | Yes | - | Hashed password using bcrypt |
| `role` | `String` | Yes | `'student'` | Enum: `['student', 'client', 'freelancer', 'mentor', 'company', 'admin']` |
| `profileImage` | `String` | No | `null` | URL / Cloud storage path for avatar image |
| `status` | `String` | Yes | `'active'` | Enum: `['active', 'suspended', 'deactivated']` |
| `isVerified` | `Boolean` | Yes | `false` | Email / Identity verification flag |
| `createdAt` | `Date` | Yes | Auto | Timestamp of account creation |
| `updatedAt` | `Date` | Yes | Auto | Timestamp of last account update |

* **Indexes:**
  * `{ email: 1 }` (Unique)
  * `{ role: 1, status: 1 }`

---

### 2.2 Freelancer Profiles Collection (`freelancer_profiles`)

* **Purpose:** Extends the base user identity with freelancer-specific skills, rates, portfolio items, completed project metrics, and rating statistics.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Profile Identifier |
| `userId` | `ObjectId` | Yes | - | Ref: `User` (Unique 1-to-1 relationship) |
| `headline` | `String` | Yes | - | Professional title (e.g., "Full-Stack MERN Developer") |
| `bio` | `String` | Yes | - | Professional biography and background summary |
| `skills` | `[String]` | Yes | `[]` | Array of skill tags (e.g., `["React", "Node.js", "MongoDB"]`) |
| `experience` | `[Object]` | No | `[]` | Subdocuments: `{ title, company, startYear, endYear, description }` |
| `education` | `[Object]` | No | `[]` | Subdocuments: `{ institution, degree, fieldOfStudy, graduationYear }` |
| `portfolio` | `[Object]` | No | `[]` | Subdocuments: `{ title, description, projectUrl, imageUrl, githubUrl }` |
| `hourlyRate` | `Number` | No | `null` | Hourly rate in USD/LKR |
| `projectRate` | `Number` | No | `null` | Minimum project fixed rate |
| `availability` | `String` | Yes | `'available'` | Enum: `['available', 'busy', 'not_available']` |
| `rating` | `Number` | Yes | `0` | Calculated aggregate rating (0.00 to 5.00) |
| `reviewCount` | `Number` | Yes | `0` | Total number of received reviews |
| `completedProjects` | `Number` | Yes | `0` | Counter for completed projects |
| `verificationStatus`| `String` | Yes | `'unverified'`| Enum: `['unverified', 'pending', 'verified', 'rejected']` |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ userId: 1 }` (Unique)
  * `{ skills: 1, rating: -1 }`
  * `{ availability: 1, verificationStatus: 1 }`

---

### 2.3 Mentor Profiles Collection (`mentor_profiles`)

* **Purpose:** Stores mentor professional background, expertise domains, booking availability slots, session pricing, and reviews.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Profile Identifier |
| `userId` | `ObjectId` | Yes | - | Ref: `User` (Unique 1-to-1 relationship) |
| `professionalTitle`| `String` | Yes | - | Current industry title (e.g., "Senior Software Architect") |
| `bio` | `String` | Yes | - | Mentorship bio, guidance philosophy |
| `expertise` | `[String]` | Yes | `[]` | Array of mentoring domains (e.g., `["Career Guidance", "System Design"]`) |
| `experienceYears` | `Number` | Yes | `0` | Total years of professional experience |
| `certifications` | `[Object]` | No | `[]` | Subdocuments: `{ title, issuingOrganization, issueYear, credentialUrl }` |
| `sessionFee` | `Number` | Yes | `0` | Fee per mentoring session (0 for free/pro-bono) |
| `availableSlots` | `[Object]` | No | `[]` | Subdocuments: `{ dayOfWeek, startTime, endTime, isRecurring }` |
| `rating` | `Number` | Yes | `0` | Calculated average rating (0.00 to 5.00) |
| `reviewCount` | `Number` | Yes | `0` | Total number of reviews received |
| `completedSessions`| `Number` | Yes | `0` | Total completed mentorship sessions |
| `verificationStatus`| `String` | Yes | `'unverified'`| Enum: `['unverified', 'pending', 'verified', 'rejected']` |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ userId: 1 }` (Unique)
  * `{ expertise: 1, rating: -1 }`
  * `{ sessionFee: 1 }`

---

### 2.4 Company Profiles Collection (`company_profiles`)

* **Purpose:** Contains company metadata, industry classification, corporate credentials, verified status, and hiring history.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Company Identifier |
| `userId` | `ObjectId` | Yes | - | Ref: `User` (Organization administrator / account owner) |
| `companyName` | `String` | Yes | - | Registered business name (trim, index) |
| `logo` | `String` | No | `null` | URL / Cloud storage image path |
| `description` | `String` | Yes | - | Company overview and mission |
| `industry` | `String` | Yes | - | Industry category (e.g., "Fintech", "E-commerce", "EdTech") |
| `website` | `String` | No | `null` | Official website URL |
| `location` | `String` | Yes | - | Headquarters city / country |
| `companySize` | `String` | Yes | `'1-10'` | Enum: `['1-10', '11-50', '51-200', '201-500', '500+']` |
| `verificationStatus`| `String` | Yes | `'unverified'`| Enum: `['unverified', 'pending', 'verified', 'rejected']` |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ userId: 1 }` (Unique)
  * `{ companyName: 1 }`
  * `{ industry: 1 }`

---

### 2.5 Projects Collection (`projects`)

* **Purpose:** Represents client/student/company project requirements, budgets, deliverables, deadlines, and current hiring status.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Project Identifier |
| `ownerId` | `ObjectId` | Yes | - | Ref: `User` (Client, Student, or Company) |
| `title` | `String` | Yes | - | Project title (trim, max: 150) |
| `description` | `String` | Yes | - | Detailed requirement description |
| `category` | `String` | Yes | - | Category (e.g., "Web Development", "UI/UX", "Data Analysis") |
| `requiredSkills` | `[String]` | Yes | `[]` | List of required skills |
| `budget` | `Number` | Yes | - | Total proposed project budget |
| `deadline` | `Date` | Yes | - | Required project completion date |
| `projectType` | `String` | Yes | `'fixed'` | Enum: `['fixed', 'hourly', 'complete_system', 'academic_project']` |
| `attachments` | `[String]` | No | `[]` | URLs to uploaded requirement documents |
| `expectedDeliverables`| `[String]`| No | `[]` | List of target deliverables |
| `status` | `String` | Yes | `'open'` | Enum: `['open', 'in_progress', 'under_review', 'completed', 'cancelled']` |
| `selectedFreelancer`| `ObjectId` | No | `null` | Ref: `User` (Freelancer assigned to project) |
| `workspaceId` | `ObjectId` | No | `null` | Ref: `Workspace` (Created upon hiring) |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ ownerId: 1, status: 1 }`
  * `{ category: 1, status: 1 }`
  * `{ requiredSkills: 1 }`
  * `{ budget: 1 }`
  * `{ createdAt: -1 }`

---

### 2.6 Proposals Collection (`proposals`)

* **Purpose:** Stores bids/proposals submitted by freelancers for posted projects.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Proposal Identifier |
| `projectId` | `ObjectId` | Yes | - | Ref: `Project` |
| `freelancerId` | `ObjectId` | Yes | - | Ref: `User` (Freelancer) |
| `coverLetter` | `String` | Yes | - | Proposal text / pitch |
| `proposedPrice` | `Number` | Yes | - | Bid price proposed by freelancer |
| `deliveryTime` | `Number` | Yes | - | Estimated delivery in days |
| `milestones` | `[Object]` | No | `[]` | Proposed milestones: `{ title, amount, durationDays }` |
| `portfolioReferences`| `[String]`| No | `[]` | Links to relevant portfolio items |
| `status` | `String` | Yes | `'submitted'` | Enum: `['submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn']` |
| `submittedAt` | `Date` | Yes | Auto | Submission timestamp |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ projectId: 1, freelancerId: 1 }` (Unique compound constraint: 1 proposal per freelancer per project)
  * `{ projectId: 1, status: 1 }`
  * `{ freelancerId: 1, status: 1 }`

---

### 2.7 Workspaces Collection (`workspaces`)

* **Purpose:** Dedicated collaboration environment provisioned automatically after a freelancer is hired.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Workspace Identifier |
| `projectId` | `ObjectId` | Yes | - | Ref: `Project` (Unique 1-to-1) |
| `clientUser` | `ObjectId` | Yes | - | Ref: `User` (Project owner) |
| `freelancerUser`| `ObjectId` | Yes | - | Ref: `User` (Assigned freelancer) |
| `status` | `String` | Yes | `'active'` | Enum: `['active', 'completed', 'disputed', 'terminated']` |
| `sharedFiles` | `[Object]` | No | `[]` | Subdocuments: `{ fileName, fileUrl, uploadedBy, uploadedAt }` |
| `progressPercentage`| `Number`| Yes | `0` | Progress completion metric (0 to 100) |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ projectId: 1 }` (Unique)
  * `{ clientUser: 1 }`
  * `{ freelancerUser: 1 }`

---

### 2.8 Tasks Collection (`tasks`)

* **Purpose:** Manages granular to-do items, progress stages, and deadlines within a Project Workspace.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Task Identifier |
| `workspaceId` | `ObjectId` | Yes | - | Ref: `Workspace` |
| `projectId` | `ObjectId` | Yes | - | Ref: `Project` |
| `title` | `String` | Yes | - | Task title (trim, max: 120) |
| `description` | `String` | No | `''` | Detailed task instructions |
| `assignedTo` | `ObjectId` | No | `null` | Ref: `User` |
| `priority` | `String` | Yes | `'medium'` | Enum: `['low', 'medium', 'high', 'urgent']` |
| `status` | `String` | Yes | `'todo'` | Enum: `['todo', 'in_progress', 'review', 'completed']` |
| `dueDate` | `Date` | No | `null` | Optional target completion date |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ workspaceId: 1, status: 1 }`
  * `{ projectId: 1 }`
  * `{ assignedTo: 1 }`

---

### 2.9 Milestones Collection (`milestones`)

* **Purpose:** Manages formal payment deliverables, submission reviews, and release approvals.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Milestone Identifier |
| `workspaceId` | `ObjectId` | Yes | - | Ref: `Workspace` |
| `projectId` | `ObjectId` | Yes | - | Ref: `Project` |
| `title` | `String` | Yes | - | Milestone title (e.g., "Frontend UI Integration") |
| `description` | `String` | Yes | - | Deliverable requirements |
| `amount` | `Number` | Yes | - | Milestone monetary value |
| `dueDate` | `Date` | Yes | - | Target submission deadline |
| `deliverables` | `[Object]` | No | `[]` | Subdocuments: `{ fileUrl, note, submittedAt }` |
| `status` | `String` | Yes | `'pending'` | Enum: `['pending', 'in_progress', 'submitted', 'approved', 'rejected', 'completed']` |
| `transactionId`| `ObjectId` | No | `null` | Ref: `Transaction` |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ workspaceId: 1, status: 1 }`
  * `{ projectId: 1 }`

---

### 2.10 Bookings Collection (`bookings`)

* **Purpose:** Handles student-mentor appointment scheduling, time slot allocations, meeting links, and session status.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Booking Identifier |
| `studentId` | `ObjectId` | Yes | - | Ref: `User` (Student role) |
| `mentorId` | `ObjectId` | Yes | - | Ref: `User` (Mentor role) |
| `sessionType` | `String` | Yes | `'1_on_1'` | Enum: `['1_on_1', 'code_review', 'career_guidance', 'project_consultation']` |
| `date` | `Date` | Yes | - | Date of session |
| `startTime` | `String` | Yes | - | Start time string (e.g., "14:00") |
| `endTime` | `String` | Yes | - | End time string (e.g., "15:00") |
| `duration` | `Number` | Yes | `60` | Duration in minutes (e.g., 30, 60, 90) |
| `fee` | `Number` | Yes | `0` | Cost of the session |
| `meetingLink` | `String` | No | `null` | Video conferencing URL (Zoom/Google Meet/Jitsi) |
| `notes` | `String` | No | `''` | Student's questions / agenda items |
| `status` | `String` | Yes | `'pending'` | Enum: `['pending', 'confirmed', 'cancelled', 'completed', 'rejected']` |
| `transactionId`| `ObjectId` | No | `null` | Ref: `Transaction` |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ mentorId: 1, date: 1, startTime: 1 }` (Overlap prevention lookup)
  * `{ studentId: 1, status: 1 }`
  * `{ mentorId: 1, status: 1 }`

---

### 2.11 Reviews Collection (`reviews`)

* **Purpose:** Stores multi-criteria ratings and qualitative feedback for freelancers, mentors, and clients upon engagement completion.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Review Identifier |
| `reviewerId` | `ObjectId` | Yes | - | Ref: `User` (Person giving review) |
| `revieweeId` | `ObjectId` | Yes | - | Ref: `User` (Person receiving review) |
| `reviewType` | `String` | Yes | - | Enum: `['project', 'mentorship']` |
| `projectId` | `ObjectId` | No | `null` | Ref: `Project` (Conditional on `reviewType === 'project'`) |
| `bookingId` | `ObjectId` | No | `null` | Ref: `Booking` (Conditional on `reviewType === 'mentorship'`) |
| `rating` | `Number` | Yes | - | Overall score (1 to 5) |
| `communicationRating`| `Number`| Yes | 5 | Sub-score: Communication (1 to 5) |
| `qualityRating` | `Number` | Yes | 5 | Sub-score: Work/Guidance Quality (1 to 5) |
| `professionalismRating`| `Number`| Yes| 5 | Sub-score: Professionalism (1 to 5) |
| `comment` | `String` | Yes | - | Written review content |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ revieweeId: 1, reviewType: 1 }`
  * `{ reviewerId: 1, projectId: 1 }`
  * `{ reviewerId: 1, bookingId: 1 }`

---

### 2.12 Conversations Collection (`conversations`)

* **Purpose:** Tracks 1-on-1 direct or project-based communication channels between users.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Conversation Identifier |
| `participants` | `[ObjectId]` | Yes | `[]` | Ref: `[User]` (Array of user ObjectIds) |
| `projectId` | `ObjectId` | No | `null` | Ref: `Project` (Optional context) |
| `lastMessage` | `ObjectId` | No | `null` | Ref: `Message` |
| `lastMessageAt`| `Date` | Yes | Auto | Timestamp of latest activity |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ participants: 1 }`
  * `{ projectId: 1 }`
  * `{ lastMessageAt: -1 }`

---

### 2.13 Messages Collection (`messages`)

* **Purpose:** Stores individual chat messages, attachments, timestamps, and read receipts.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Message Identifier |
| `conversationId`| `ObjectId` | Yes | - | Ref: `Conversation` |
| `senderId` | `ObjectId` | Yes | - | Ref: `User` |
| `text` | `String` | No | `''` | Message content |
| `attachments` | `[Object]` | No | `[]` | Subdocuments: `{ fileUrl, fileName, fileType, fileSize }` |
| `isRead` | `Boolean` | Yes | `false` | Read receipt flag |
| `readAt` | `Date` | No | `null` | Timestamp when recipient viewed message |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ conversationId: 1, createdAt: 1 }`
  * `{ senderId: 1 }`
  * `{ isRead: 1 }`

---

### 2.14 Notifications Collection (`notifications`)

* **Purpose:** Central notification queue for in-app alerts, activity triggers, and status updates.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Notification Identifier |
| `userId` | `ObjectId` | Yes | - | Ref: `User` (Recipient) |
| `type` | `String` | Yes | - | Enum: `['project', 'proposal', 'booking', 'chat', 'payment', 'system', 'career', 'verification']` |
| `title` | `String` | Yes | - | Brief title header |
| `message` | `String` | Yes | - | Full notification body |
| `relatedId` | `ObjectId` | No | `null` | Generic reference to associated entity |
| `relatedModel`| `String` | No | `null` | Target model: `['Project', 'Booking', 'Conversation', 'Workspace']` |
| `isRead` | `Boolean` | Yes | `false` | Read status |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ userId: 1, isRead: 1, createdAt: -1 }`

---

### 2.15 Transactions Collection (`transactions`)

* **Purpose:** Records simulated/production payments, escrow holds, milestone settlements, and session disbursements.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Transaction Identifier |
| `payerId` | `ObjectId` | Yes | - | Ref: `User` (Client or Student) |
| `payeeId` | `ObjectId` | Yes | - | Ref: `User` (Freelancer or Mentor) |
| `transactionType`| `String` | Yes | - | Enum: `['milestone_escrow', 'milestone_release', 'mentorship_fee', 'refund']` |
| `projectId` | `ObjectId` | No | `null` | Ref: `Project` |
| `milestoneId` | `ObjectId` | No | `null` | Ref: `Milestone` |
| `bookingId` | `ObjectId` | No | `null` | Ref: `Booking` |
| `amount` | `Number` | Yes | - | Transaction value |
| `currency` | `String` | Yes | `'USD'` | Currency code (USD / LKR) |
| `status` | `String` | Yes | `'pending'` | Enum: `['pending', 'escrowed', 'completed', 'failed', 'refunded']` |
| `transactionReference`| `String`| Yes | - | Unique transaction hash / reference |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ transactionReference: 1 }` (Unique)
  * `{ payerId: 1, status: 1 }`
  * `{ payeeId: 1, status: 1 }`
  * `{ projectId: 1 }`

---

### 2.16 Skill Verifications Collection (`skill_verifications`)

* **Purpose:** Handles freelancer/mentor skill verification requests, evidence submissions, and admin approval workflows.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Verification Identifier |
| `userId` | `ObjectId` | Yes | - | Ref: `User` |
| `skillName` | `String` | Yes | - | Verified skill (e.g., "Node.js", "UI Design") |
| `verificationType`| `String` | Yes | `'certificate'`| Enum: `['certificate', 'portfolio_proof', 'test_score', 'admin_review']` |
| `evidenceUrls`| `[String]` | Yes | `[]` | URLs to certificates or proof |
| `status` | `String` | Yes | `'pending'` | Enum: `['pending', 'approved', 'rejected']` |
| `reviewedBy` | `ObjectId` | No | `null` | Ref: `User` (Admin reviewer) |
| `adminNotes` | `String` | No | `''` | Feedback / Reason for rejection |
| `reviewedAt` | `Date` | No | `null` | Approval timestamp |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ userId: 1, skillName: 1 }`
  * `{ status: 1 }`

---

### 2.17 Talent Pools Collection (`talent_pools`)

* **Purpose:** Allows company accounts to bookmark, categorize, and track shortlisted freelancers for future projects and opportunities.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Identifier |
| `companyUserId`| `ObjectId` | Yes | - | Ref: `User` (Company) |
| `freelancerUserId`| `ObjectId` | Yes | - | Ref: `User` (Freelancer) |
| `tags` | `[String]` | No | `[]` | Internal company tags (e.g., `["Top MERN", "Available Q4"]`) |
| `notes` | `String` | No | `''` | Internal notes written by company recruiters |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ companyUserId: 1, freelancerUserId: 1 }` (Unique)

---

### 2.18 Career Opportunities Collection (`career_opportunities`)

* **Purpose:** Enables companies to extend internship, contract, or full-time offers directly to high-performing freelancers.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Identifier |
| `companyUserId`| `ObjectId` | Yes | - | Ref: `User` (Company) |
| `freelancerUserId`| `ObjectId` | Yes | - | Ref: `User` (Freelancer) |
| `opportunityType`| `String` | Yes | `'internship'` | Enum: `['internship', 'full_time', 'part_time', 'contract', 'long_term_freelance']` |
| `title` | `String` | Yes | - | Opportunity title (e.g., "Full-Stack Software Engineering Intern") |
| `description` | `String` | Yes | - | Role details, compensation, benefits |
| `status` | `String` | Yes | `'offered'` | Enum: `['offered', 'accepted', 'declined', 'expired']` |
| `expiryDate` | `Date` | No | `null` | Offer valid until date |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ companyUserId: 1, freelancerUserId: 1 }`
  * `{ freelancerUserId: 1, status: 1 }`

---

### 2.19 Reports Collection (`reports`)

* **Purpose:** Centralized compliance and dispute reporting for inappropriate content, abusive behavior, and contractual issues.

| Field | Type | Required | Default | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | Unique Identifier |
| `reporterId` | `ObjectId` | Yes | - | Ref: `User` (User filing the report) |
| `reportedUserId`| `ObjectId` | No | `null` | Ref: `User` (Reported user) |
| `targetType` | `String` | Yes | - | Enum: `['user', 'project', 'proposal', 'review', 'workspace']` |
| `targetId` | `ObjectId` | Yes | - | Target entity ID |
| `reason` | `String` | Yes | - | Reason category (e.g., "Scam", "Plagiarism", "Harassment") |
| `details` | `String` | Yes | - | Explanation of violation |
| `evidenceUrls`| `[String]` | No | `[]` | Supporting screenshots or logs |
| `status` | `String` | Yes | `'pending'` | Enum: `['pending', 'investigating', 'resolved', 'dismissed']` |
| `resolvedBy` | `ObjectId` | No | `null` | Ref: `User` (Admin) |
| `resolutionNotes`| `String` | No | `''` | Admin notes |
| `createdAt` | `Date` | Yes | Auto | Auto timestamp |
| `updatedAt` | `Date` | Yes | Auto | Auto timestamp |

* **Indexes:**
  * `{ status: 1, createdAt: -1 }`
  * `{ targetType: 1, targetId: 1 }`

---

## 3. Entity Relationships Diagram & Reference Mapping

```text
+-----------------------------------------------------------------------------------------+
|                                    USER (users)                                         |
+-----------------------------------------------------------------------------------------+
    |                 |                   |                |                 |
 (1 to 1)          (1 to 1)            (1 to 1)         (1 to Many)       (1 to Many)
    v                 v                   v                v                 v
FreelancerProfile MentorProfile     CompanyProfile     Projects (owner)   Bookings (student)
    |                                                      |                 |
 (1 to Many)                                            (1 to 1)          (1 to Many)
    v                                                      v                 v
Proposals                                              Workspace          Reviews
                                                           |
                                                    +------+------+
                                                    |             |
                                               (1 to Many)   (1 to Many)
                                                    v             v
                                                  Tasks       Milestones
                                                                  |
                                                               (1 to 1)
                                                                  v
                                                             Transaction
```

### Reference Mapping Rules:
1. **User → Profile Extensions**: `FreelancerProfile`, `MentorProfile`, and `CompanyProfile` hold a unique `userId` ref to `User`.
2. **User → Projects**: `Project.ownerId` maps to `User._id`.
3. **Project → Proposals**: `Proposal.projectId` links multiple proposals to a project.
4. **Project → Workspace**: When a proposal is accepted, a single `Workspace` is created referencing `projectId`.
5. **Workspace → Tasks & Milestones**: `Task.workspaceId` and `Milestone.workspaceId` link execution units to the active workspace.
6. **User → Bookings**: `Booking.studentId` and `Booking.mentorId` link students with mentors.
7. **Conversation → Messages**: `Message.conversationId` links individual chat messages to a conversation thread.
8. **Entity → Reviews**: `Review.reviewerId`, `Review.revieweeId`, with conditional `Review.projectId` or `Review.bookingId`.
9. **Milestone / Booking → Transactions**: `Transaction.milestoneId` or `Transaction.bookingId` records financial events.

---

## 4. Data Consistency & Business Validation Rules

* **Single Active Proposal**: Compound unique index `{ projectId: 1, freelancerId: 1 }` prevents duplicate active proposals from the same freelancer.
* **Mentorship Slot Overlaps**: Lookup constraint ensures a mentor cannot have overlapping confirmed bookings on `{ mentorId, date, startTime }`.
* **Workspace Exclusivity**: A project can have at most one active `Workspace`.
* **Review Eligibility**: Reviews can only reference completed projects (`Project.status === 'completed'`) or completed mentorship sessions (`Booking.status === 'completed'`).
* **Role Verification**: Only users with appropriate role values can create matching profile sub-entities.
