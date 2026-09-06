# 01 — Project Requirements
# UniConnect – Student Skill & Collaboration Platform

> **Phase:** 1 — Requirements
> **Status:** 🔵 REVIEW REQUIRED
> **Approved:** ❌ NOT YET APPROVED
> **Document Version:** 1.2.0 (Final Calibrated MVP Scope for Student Project)
> **Author:** AI Requirements Analyst (Antigravity)
> **Created:** 2026-08-31
> **Last Updated:** 2026-08-31

---

## Table of Contents

1. [Project Background & Context](#1-project-background--context)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Target Users](#4-target-users)
5. [User Roles](#5-user-roles)
6. [Project Scope](#6-project-scope)
7. [In-Scope Features](#7-in-scope-features)
8. [Out-of-Scope Features](#8-out-of-scope-features)
9. [Functional Requirements](#9-functional-requirements)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Business Rules](#11-business-rules)
12. [System Constraints](#12-system-constraints)
13. [Success Criteria](#13-success-criteria)
14. [Requirement Dependencies](#14-requirement-dependencies)
15. [Decisions Log](#15-decisions-log)
16. [Assumptions](#16-assumptions)
17. [Approval Sign-Off](#17-approval-sign-off)

---

## 1. Project Background & Context

### 1.1 Project Nature & Context

**UniConnect** is developed as a **student final-course project (Đồ án tốt nghiệp / Khóa luận tốt nghiệp)**. Development is executed by a small student team (approximately 1–3 members) leveraging AI-assisted development workflows.

The project is designed to deliver a **realistic, demonstrable, secure, and well-structured web application** that solves real student collaboration challenges while remaining fully achievable within student course timelines and resources. It explicitly avoids enterprise overhead, unnecessary microservices, paid enterprise infrastructure, and speculative machine learning systems.

### 1.2 Platform Vision

UniConnect is a centralized student collaboration and skill-exchange web platform designed for a single university community. It empowers students to:

- Find qualified teammates for course projects and competitions based on complementary skills (**Project Match**)
- Find compatible study partners for specific subjects and shared schedules (**Study Buddy**)
- Offer and request peer-to-peer knowledge sharing and tutoring (**Skill Exchange**)
- Maintain a personal skill and academic profile (**Student Profile**)
- Build a lightweight portfolio showcasing academic projects (**Portfolio** — Should Have / Post-Core)
- Communicate directly with accepted collaborators (**Basic Chat**)
- Receive timely notifications regarding match updates and requests (**Basic Notifications**)

### 1.3 Distinction from Existing Tools

| Category | What UniConnect is NOT | What UniConnect IS |
|---|---|---|
| General Social Networks (Facebook, Threads) | Not a general feed for casual social posting, ads, or viral media | A focused academic & project collaboration community |
| Professional Networks (LinkedIn) | Not a corporate recruiting platform or job board | A student-first peer networking and project discovery tool |
| Learning Management Systems (Moodle, Canvas) | Not a gradebook, exam proctoring, or course submission engine | A student-driven co-working and peer study finder |
| Freelancing Platforms (Upwork, Fiverr) | Not a paid commercial gig marketplace | A peer-to-peer non-monetized skill exchange |

---

## 2. Problem Statement

### 2.1 Core Problems

| ID | Problem | Real-world Student Impact |
|---|---|---|
| P-01 | **Difficult Teammate Discovery** | Students struggle to find peers with complementary technical/design skills for course assignments and hackathons, leading to unbalanced teams. |
| P-02 | **Isolated Study Experience** | Students revising for difficult courses lack structured ways to connect with classmates studying the same subjects. |
| P-03 | **Invisible Peer Skills** | Talented students have no central university channel to showcase their practical skills or offer peer tutoring. |
| P-04 | **Unstructured Skill Sharing** | Informal knowledge sharing in group chats gets buried and lacks accountability. |
| P-05 | **Scattered Academic Work** | Students lack a simple academic-focused profile highlighting university projects and coursework. |
| P-06 | **High Noise on Social Platforms** | Facebook groups and generic chat channels are cluttered with spam, memes, and unrelated content. |

---

## 3. Project Objectives

| ID | Objective | Priority |
|---|---|---|
| OBJ-01 | Provide a secure authentication system restricted to university students via email verification. | Must Have |
| OBJ-02 | Enable students to create and maintain a personal profile with verified skills and course enrollments. | Must Have |
| OBJ-03 | Deliver the **Project Match** module for posting team vacancies, searching listings, and processing applications. | Must Have |
| OBJ-04 | Deliver the **Study Buddy** module for finding study partners by course, topic, and schedule. | Must Have |
| OBJ-05 | Deliver the **Skill Exchange** module for peer-to-peer skill offers and learning requests. | Must Have |
| OBJ-06 | Provide basic 1-to-1 in-platform messaging between matched collaborators. | Must Have |
| OBJ-07 | Deliver an in-app notification system to alert users of applications, responses, and match confirmations. | Must Have |
| OBJ-08 | Provide a minimal Admin panel for basic moderation (user suspension, listing removal). | Must Have |
| OBJ-09 | Support lightweight student portfolio entries documenting past project work. | Should Have |
| OBJ-10 | Support community engagement through platform challenges and event listings. | Could Have |

---

## 4. Target Users

### 4.1 Primary Users: University Students
- Enrolled students within the institution
- Using web browsers on desktop laptops and mobile smartphones
- Goal: Find project partners, study buddies, and learn practical skills from peers

### 4.2 Secondary Users: Platform Administrators
- Course instructors, student moderators, or system administrators
- Goal: Ensure platform safety, moderate violating content, and manage user status

---

## 5. User Roles

| Role ID | Role Name | Description & Access Level |
|---|---|---|
| ROLE-01 | **Student** | Verified student. Full access to create profile, post/apply in Project Match, Study Buddy, Skill Exchange, chat with matches, and receive notifications. |
| ROLE-02 | **Admin** | System administrator. Access to admin dashboard, view/search users, ban/suspend accounts, and remove violating posts. |
| ROLE-03 | **Guest** | Unauthenticated visitor. Can view the landing page and public introduction; must log in to view profiles or listings. |

---

## 6. Project Scope

### 6.1 Scope Boundary
- **Single Institution Scope:** UniConnect v1.0 is strictly designed and deployed for a **single university**. Multi-institution federation is excluded.
- **Platform Architecture:** Responsive web application accessible via standard web browsers.
- **Team & Timeline:** Designed for implementation by 1–3 students within an academic course cycle.

---

## 7. In-Scope Features

| Feature Group | Component | Priority | Target MVP | Rationale |
|---|---|---|---|---|
| **Foundation** | Authentication & Verification | **Must Have** | **Yes** | Required for security and student-only trust model |
| **Foundation** | Student Profile & Skills | **Must Have** | **Yes** | Core identity and prerequisite for matching |
| **Core 1** | Project Match | **Must Have** | **Yes** | Primary feature: finding teammates for projects |
| **Core 2** | Study Buddy | **Must Have** | **Yes** | Primary feature: finding study partners for courses |
| **Core 3** | Skill Exchange | **Must Have** | **Yes** | Primary feature: structured peer-to-peer skill sharing |
| **Supporting** | Basic 1-to-1 Chat | **Must Have** | **Yes** | Essential communication channel for matched peers |
| **Supporting** | Basic In-App Notifications | **Must Have** | **Yes** | Action alerts for applications and matches |
| **Supporting** | Minimal Admin Panel | **Must Have** | **Yes** | Basic moderation and user management |
| **Lower Priority** | Student Portfolio | **Should Have** | **Post-Core** | Project showcase; non-blocking for core matches |
| **Lower Priority** | Challenges | **Could Have** | **Stretch** | Community activity; optional stretch goal |
| **Lower Priority** | Events | **Could Have** | **Stretch** | Campus/community events; optional stretch goal |

---

## 8. Out-of-Scope Features (v1.0)

The following capabilities are **explicitly excluded** from UniConnect v1.0:

| ID | Out-of-Scope Feature | Target MVP | Justification |
|---|---|---|---|
| OS-01 | **AI Recommendations / Machine Learning Models** | No | High implementation complexity; replaced with direct database skill/course filtering. |
| OS-02 | **SSO / Enterprise Identity Federation (Google/Microsoft OAuth)** | No | Requires institutional IT partnerships; self-contained email verification is used. |
| OS-03 | **Payment & Monetary Transactions** | No | UniConnect is non-commercial peer learning; no escrow or payments. |
| OS-04 | **Native Mobile Apps (iOS / Android)** | No | Responsive web design covers desktop and mobile without dual-codebase maintenance. |
| OS-05 | **Video & Audio Calling** | No | Bandwidth and infrastructure intensive; external tools (Google Meet, Discord) can be linked. |
| OS-06 | **File Sharing within Chat** | No | Storage overhead and security risk; chat is text-only. |
| OS-07 | **Multi-University Federation** | No | Out of scope; v1.0 targets a single university community. |
| OS-08 | **Public API & Third-party Integrations** | No | Unnecessary overhead for a student course MVP. |
| OS-09 | **Gamification / Point-to-Cash Systems** | No | High balance and anti-cheat complexity; out of MVP scope. |
| OS-10 | **Formal Enterprise Compliance Audits** | No | Not applicable to a student course project. Standard security best practices apply. |


---

## 9. Functional Requirements

> **Priority & Target MVP Definitions:**
> - **Must Have (MH) / Target MVP: Yes** — Essential core features required for the primary student collaboration flows and project evaluation.
> - **Should Have (SH) / Target MVP: Post-Core** — Important supporting features to be built after Must Have features are complete and functional.
> - **Could Have (CH) / Target MVP: Stretch** — Optional enhancements and stretch goals to be implemented if development time permits.

---

### 9.1 Authentication & Account Management (FR-AUTH)

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-AUTH-001 | The system shall allow new students to register an account using an institutional email address and password. | **Must Have** | **Yes** |
| FR-AUTH-002 | The system shall validate that the registration email belongs to the designated university domain. | **Must Have** | **Yes** |
| FR-AUTH-003 | The system shall send an email verification link/token upon registration; accounts remain inactive until verified. | **Must Have** | **Yes** |
| FR-AUTH-004 | The system shall allow registered, verified students and administrators to log in with their email and password. | **Must Have** | **Yes** |
| FR-AUTH-005 | The system shall provide a password reset flow via a secure time-limited email link. | **Must Have** | **Yes** |
| FR-AUTH-006 | The system shall allow authenticated users to log out and terminate their active session. | **Must Have** | **Yes** |
| FR-AUTH-007 | The system shall automatically expire inactive user sessions after a defined duration. | **Should Have** | **Post-Core** |
| FR-AUTH-008 | The system shall prevent duplicate registrations using the same email address. | **Should Have** | **Post-Core** |
| FR-AUTH-009 | The system shall allow a student to request account deactivation/deletion. | **Should Have** | **Post-Core** |

---

### 9.2 Student Profile & Skills (FR-PROF)

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-PROF-001 | The system shall allow a student to create, view, and maintain their personal profile. | **Must Have** | **Yes** |
| FR-PROF-002 | The profile shall contain basic identity details: Full Name, Profile Photo/Avatar, University/Campus, Faculty/Major, Year of Study, and a short Bio. | **Must Have** | **Yes** |
| FR-PROF-003 | The profile shall include a **Skills** section where students list skills along with self-assessed proficiency levels (Beginner, Intermediate, Advanced). | **Must Have** | **Yes** |
| FR-PROF-004 | The profile shall include a **Courses** section listing current and past enrolled course codes/names. | **Must Have** | **Yes** |
| FR-PROF-005 | The profile may include optional external links (GitHub, LinkedIn, Portfolio site). | **Should Have** | **Post-Core** |
| FR-PROF-006 | The system shall provide a basic profile visibility toggle (Public to institution vs. Limited to matches). | **Should Have** | **Post-Core** |
| FR-PROF-007 | The system shall allow students to edit their profile details, skills, and courses at any time. | **Should Have** | **Post-Core** |
| FR-PROF-008 | The system may display a profile completion indicator to guide students to fill in required matching info. | **Could Have** | **Stretch** |
| FR-PROF-009 | The system shall allow authenticated students to view public profiles of other peers. | **Must Have** | **Yes** |
| FR-PROF-010 | The system may display active listings created by the student on their public profile. | **Could Have** | **Stretch** |

---

### 9.3 Student Portfolio (FR-PORT) — Should Have

> *Portfolio is classified as **Should Have** (0 Must Have requirements) to ensure foundational matching features are prioritized first.*

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-PORT-001 | The system shall allow a student to create structured portfolio items documenting past academic or personal projects. | **Should Have** | **Post-Core** |
| FR-PORT-002 | A portfolio entry shall include: Project Title, Summary Description, Role, Technologies/Skills demonstrated, and optional external demo/repo link. | **Should Have** | **Post-Core** |
| FR-PORT-003 | The system may allow students to attach a preview image or screenshot to a portfolio entry. | **Could Have** | **Stretch** |
| FR-PORT-004 | The system shall allow students to toggle a portfolio entry's visibility between Public and Draft/Private. | **Should Have** | **Post-Core** |
| FR-PORT-005 | The system shall allow students to edit or delete their own portfolio entries. | **Should Have** | **Post-Core** |
| FR-PORT-006 | The system shall display a student's public portfolio entries on their public profile page. | **Should Have** | **Post-Core** |
| FR-PORT-007 | The system shall allow students to associate portfolio items with specific skills from their profile. | **Should Have** | **Post-Core** |
| FR-PORT-008 | The system may allow peers to view and express appreciation (like/endorse) for portfolio items. | **Could Have** | **Stretch** |

---

### 9.4 Project Match — Core Feature 1 (FR-PM)

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-PM-001 | The system shall allow a student to create a Project Match vacancy post to recruit teammates for a project. | **Must Have** | **Yes** |
| FR-PM-002 | A Project Match post shall include: Title, Description, Category (Coursework, Hackathon, Research, Personal), Required Skills, Total Members Needed, and Application Deadline. | **Must Have** | **Yes** |
| FR-PM-003 | The system may allow the post creator to specify open slots per specific sub-role (e.g., 1 Frontend, 1 Designer). | **Could Have** | **Stretch** |
| FR-PM-004 | The system shall display active Project Match listings in a searchable and filterable feed. | **Must Have** | **Yes** |
| FR-PM-005 | The system shall allow students to filter listings by multiple criteria (skills, category, open slots). | **Should Have** | **Post-Core** |
| FR-PM-006 | The system shall allow a student to apply to an open Project Match listing with an optional introduction note. | **Must Have** | **Yes** |
| FR-PM-007 | The system shall notify the post creator via in-app notification when a new application is submitted. | **Should Have** | **Post-Core** |
| FR-PM-008 | The post creator shall be able to view applicant profiles and Accept or Decline each application. | **Must Have** | **Yes** |
| FR-PM-009 | The system shall notify the applicant via in-app notification when their application status is updated (Accepted/Declined). | **Should Have** | **Post-Core** |
| FR-PM-010 | The system may automatically create a group chat between the post creator and all accepted project members. | **Could Have** | **Stretch** |
| FR-PM-011 | The system shall allow the post creator to manually close or delete their listing once filled or cancelled. | **Must Have** | **Yes** |
| FR-PM-012 | The system may allow students to bookmark/save Project Match listings for quick access. | **Could Have** | **Stretch** |
| FR-PM-013 | The system shall prevent a student from applying to their own Project Match listing. | **Must Have** | **Yes** |
| FR-PM-014 | The system shall automatically close Project Match listings when the deadline passes or all slots are filled. | **Must Have** | **Yes** |

---

### 9.5 Study Buddy — Core Feature 2 (FR-SB)

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-SB-001 | The system shall allow a student to post a Study Buddy request to find study partners. | **Must Have** | **Yes** |
| FR-SB-002 | A Study Buddy request shall include: Course Name/Code, Specific Topic/Goal, Preferred Study Mode (Online, Offline, Hybrid), General Availability, and Description. | **Must Have** | **Yes** |
| FR-SB-003 | The system shall display active Study Buddy requests in a searchable and filterable feed. | **Must Have** | **Yes** |
| FR-SB-004 | The system shall allow students to filter Study Buddy requests by course, study mode, and topic keywords. | **Should Have** | **Post-Core** |
| FR-SB-005 | The system shall allow a student to express interest ("Connect / Study Together") on an open Study Buddy request. | **Must Have** | **Yes** |
| FR-SB-006 | The system shall notify the request creator via in-app notification when someone expresses interest. | **Should Have** | **Post-Core** |
| FR-SB-007 | The request creator shall be able to Accept or Decline study connection requests. | **Must Have** | **Yes** |
| FR-SB-008 | Upon acceptance, the system shall enable 1-to-1 direct messaging between the matched study partners. | **Must Have** | **Yes** |
| FR-SB-009 | The system shall allow the request creator to close or delete their Study Buddy post. | **Must Have** | **Yes** |
| FR-SB-010 | The system may allow students to bookmark Study Buddy requests. | **Could Have** | **Stretch** |
| FR-SB-011 | The system shall prevent a student from connecting to their own Study Buddy request. | **Must Have** | **Yes** |
| FR-SB-012 | The system may provide an interactive visual weekly schedule selector for availability matching. | **Could Have** | **Stretch** |

---

### 9.6 Skill Exchange — Core Feature 3 (FR-SE)

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-SE-001 | The system shall allow a student to create a **Skill Offer** listing (teaching/sharing a skill). | **Must Have** | **Yes** |
| FR-SE-002 | A Skill Offer shall include: Skill Name, Proficiency Level, Format (1-on-1, Online, In-person), General Schedule, and Description. | **Should Have** | **Post-Core** |
| FR-SE-003 | The system shall allow a student to create a **Skill Request** listing (seeking to learn a skill). | **Must Have** | **Yes** |
| FR-SE-004 | A Skill Request shall include: Skill Wanted, Current Level, Preferred Learning Format, and Description. | **Should Have** | **Post-Core** |
| FR-SE-005 | The system shall display both Skill Offers and Skill Requests in a unified, filterable feed. | **Must Have** | **Yes** |
| FR-SE-006 | The system shall allow students to filter listings by Type (Offer vs. Request), Skill Name, and Format. | **Should Have** | **Post-Core** |
| FR-SE-007 | The system shall allow a student to respond to a Skill Offer/Request to propose an exchange session. | **Must Have** | **Yes** |
| FR-SE-008 | The post creator shall be notified of incoming exchange responses and can Accept or Decline. | **Should Have** | **Post-Core** |
| FR-SE-009 | Upon mutual acceptance, the system shall enable 1-to-1 direct messaging between the two exchange participants. | **Must Have** | **Yes** |
| FR-SE-010 | The system may allow participants to rate/review a completed skill exchange session (1–5 stars). | **Could Have** | **Stretch** |
| FR-SE-011 | The system may display an aggregate skill exchange rating on the user's profile. | **Could Have** | **Stretch** |
| FR-SE-012 | The system shall prevent a student from responding to their own Skill Offer or Request. | **Must Have** | **Yes** |
| FR-SE-013 | The system shall allow the post owner to close or delete their Skill Exchange post. | **Must Have** | **Yes** |

---

### 9.7 Basic In-Platform Chat (FR-CHAT)

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-CHAT-001 | The system shall provide a text-based direct messaging interface between two matched students. | **Must Have** | **Yes** |
| FR-CHAT-002 | Direct messaging shall only be permitted between students who have an accepted match (Project Match, Study Buddy, or Skill Exchange). Unsolicited cold messaging is disabled. | **Must Have** | **Yes** |
| FR-CHAT-003 | The system shall display chronological message history within an active conversation thread. | **Must Have** | **Yes** |
| FR-CHAT-004 | The system may show read/unread status indicators per conversation. | **Could Have** | **Stretch** |
| FR-CHAT-005 | The system shall trigger an in-app notification when a user receives a new message in a conversation. | **Must Have** | **Yes** |
| FR-CHAT-006 | The system may support multi-user group conversations for accepted Project Match teams. | **Could Have** | **Stretch** |
| FR-CHAT-007 | Chat is strictly text-only for v1.0; file attachments and voice/video calling are excluded per OS-05 and OS-06. | **Should Have** | **Post-Core** |
| FR-CHAT-008 | The system shall allow a student to report an abusive message/conversation to administrators. | **Should Have** | **Post-Core** |

---

### 9.8 Basic Notifications (FR-NOTIF)

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-NOTIF-001 | The system shall generate in-app notifications for key collaboration events (applications, acceptances, responses, new messages). | **Must Have** | **Yes** |
| FR-NOTIF-002 | In-app notifications shall appear promptly while the user is active on the platform. | **Must Have** | **Yes** |
| FR-NOTIF-003 | The platform navigation bar shall display a notification icon with an unread badge counter. | **Must Have** | **Yes** |
| FR-NOTIF-004 | The system shall provide a notification history dropdown/page listing recent notifications with timestamps. | **Must Have** | **Yes** |
| FR-NOTIF-005 | The system may allow users to mark all notifications as read in a single action. | **Could Have** | **Stretch** |
| FR-NOTIF-006 | The system may send transactional emails for critical account actions (verification, password reset). | **Could Have** | **Stretch** |
| FR-NOTIF-007 | The system may provide user preferences to toggle specific notification types. | **Could Have** | **Stretch** |

---

### 9.9 Challenges (FR-CHAL) — Could Have

> *Challenges is an optional community engagement feature (all Could Have requirements).*

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-CHAL-001 | The system may allow an Administrator to publish campus coding/design challenges with rules and deadlines. | **Could Have** | **Stretch** |
| FR-CHAL-002 | The system may allow students to submit challenge entries or project links. | **Could Have** | **Stretch** |
| FR-CHAL-003 | The system may display a public list of active and past challenges. | **Could Have** | **Stretch** |
| FR-CHAL-004 | The system may notify students when a new official challenge is announced. | **Could Have** | **Stretch** |
| FR-CHAL-005 | The system may allow an Administrator to conclude a challenge and publish winners. | **Could Have** | **Stretch** |

---

### 9.10 Events (FR-EVT) — Could Have

> *Events is an optional community engagement feature (all Could Have requirements).*

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-EVT-001 | The system may allow an Administrator to publish campus academic/tech event listings. | **Could Have** | **Stretch** |
| FR-EVT-002 | The system may allow students to RSVP/register interest in an event. | **Could Have** | **Stretch** |
| FR-EVT-003 | The system may display a calendar or feed of upcoming campus collaboration events. | **Could Have** | **Stretch** |
| FR-EVT-004 | The system may send event reminder notifications to registered attendees. | **Could Have** | **Stretch** |
| FR-EVT-005 | The system may allow administrators to cancel or reschedule events and notify attendees. | **Could Have** | **Stretch** |

---

### 9.11 Minimal Admin Panel (FR-ADM)

> *Admin functionality is streamlined to the minimum set required for moderation and demonstration.*

| ID | Requirement Statement | Priority | Target MVP |
|---|---|---|---|
| FR-ADM-001 | The system shall provide a dedicated Admin Dashboard accessible only to authenticated users with the Admin role. | **Must Have** | **Yes** |
| FR-ADM-002 | Admin shall be able to view, search, and filter the list of all registered student accounts. | **Must Have** | **Yes** |
| FR-ADM-003 | Admin shall be able to suspend or ban a student account for violating community guidelines. | **Must Have** | **Yes** |
| FR-ADM-004 | Admin shall be able to view all active Project Match, Study Buddy, and Skill Exchange listings. | **Should Have** | **Post-Core** |
| FR-ADM-005 | Admin shall be able to delete/remove any listing that violates platform policies. | **Must Have** | **Yes** |
| FR-ADM-006 | Admin shall be able to review reported messages and take corrective action. | **Should Have** | **Post-Core** |
| FR-ADM-007 | Admin may publish platform-wide announcement banners. | **Could Have** | **Stretch** |
| FR-ADM-008 | Admin may view basic aggregate system counts (total users, active listings, total matches). | **Could Have** | **Stretch** |
| FR-ADM-009 | Admin accounts shall be seeded initially via database script or managed by an existing admin. | **Should Have** | **Post-Core** |
| FR-ADM-010 | Admin may curate or add standardized skill tags to the system skill dictionary. | **Should Have** | **Post-Core** |


---

## 10. Non-Functional Requirements

### 10.1 Performance (NFR-PERF)

| ID | Requirement Statement | Target Benchmark |
|---|---|---|
| NFR-PERF-001 | Main application views (feed, profile, listing details) should load within approximately 3 seconds under normal network conditions. | < 3s load time |
| NFR-PERF-002 | Search and filter operations across listings should return results within approximately 2 seconds. | < 2s query response |
| NFR-PERF-003 | Direct messages between matched users should deliver with low noticeable latency under normal demo/network conditions. | < 1s delivery |
| NFR-PERF-004 | The system should support an evaluation workload of approximately 50 concurrent active users without crashing. | ~50 concurrent users |

### 10.2 Security & Data Privacy (NFR-SEC)

| ID | Requirement Statement | Standard |
|---|---|---|
| NFR-SEC-001 | All web communication between client and server should use HTTPS / TLS encryption. | HTTPS / TLS |
| NFR-SEC-002 | All user passwords shall be stored securely using industry-standard salted one-way cryptographic hashing. | Industry standard |
| NFR-SEC-003 | The application shall enforce Role-Based Access Control (RBAC) restricting admin endpoints strictly to the Admin role. | RBAC |
| NFR-SEC-004 | The application shall implement standard defenses against common web vulnerabilities (SQL Injection, XSS, CSRF, and parameter tampering). | Web best practices |
| NFR-SEC-005 | User authentication sessions shall expire after a period of inactivity and immediately invalidate upon logout. | Secure session handling |
| NFR-SEC-006 | Student personal contact details shall be handled responsibly and only visible to authorized/matched peers. | Responsible data handling |

### 10.3 Usability & Responsiveness (NFR-USE)

| ID | Requirement Statement | Standard |
|---|---|---|
| NFR-USE-001 | The web application shall be fully functional on modern mainstream browsers (Google Chrome, Microsoft Edge, Mozilla Firefox). | Modern browsers |
| NFR-USE-002 | The user interface shall be responsive and usable on mobile viewport sizes (smartphones portrait orientation). | Mobile responsive |
| NFR-USE-003 | Core user flows (registration, profile completion, creating a listing, applying, chatting) shall be clear and completable within 3 minutes. | Intuitive UX |
| NFR-USE-004 | The primary user interface language shall be Vietnamese. | Vietnamese (vi-VN) |

### 10.4 Reliability & Demo Readiness (NFR-REL)

| ID | Requirement Statement | Standard |
|---|---|---|
| NFR-REL-001 | The platform shall maintain high stability and availability during evaluation, testing, and live presentation demonstrations. | Stable for demo |
| NFR-REL-002 | The database state shall be easily exportable and restorable via seed/backup scripts for reliable demonstration setups. | Reproducible data |

### 10.5 Maintainability & Code Quality (NFR-MAINT)

| ID | Requirement Statement | Standard |
|---|---|---|
| NFR-MAINT-001 | The codebase shall follow clean modular architecture and consistent naming conventions documented in Phase 6. | Clean code |
| NFR-MAINT-002 | Critical core business logic (auth, matching state transitions, chat permissions) should have basic automated test coverage. | Core automated tests |
| NFR-MAINT-003 | Backend API routes and data contracts shall be clearly documented to support collaborative development and grading review. | Documented APIs |
| NFR-MAINT-004 | Application runtime errors shall be logged clearly to standard server console/logs for straightforward debugging. | Clear error logging |

---

## 11. Business Rules

| ID | Business Rule Statement | Applies To |
|---|---|---|
| BR-001 | A student must complete basic profile details (Name, at least 1 Skill, at least 1 Course) before posting a Project Match, Study Buddy, or Skill Exchange listing. | All Core Features |
| BR-002 | A student may have at most a reasonable anti-spam limit (e.g., maximum 5) of active open listings per feature simultaneously. | All Core Features |
| BR-003 | A student cannot apply to, connect to, or respond to their own listings. | All Core Features |
| BR-004 | A student cannot submit duplicate pending applications to the same Project Match listing. | Project Match |
| BR-005 | A Project Match listing automatically closes when all vacancy slots are filled or its deadline expires. | Project Match |
| BR-006 | Direct messaging is strictly restricted to students who share an approved match. Cold unsolicited messaging is blocked. | Chat |
| BR-007 | A suspended or banned account is immediately restricted from logging in, creating listings, or sending messages. | Auth, Moderation |
| BR-008 | User registrations must verify ownership of an institutional email before full platform access is granted. | Authentication |
| BR-009 | Content violating academic integrity or community guidelines may be removed by an Administrator at any time. | Moderation |
| BR-010 | Students may close or delete their own listings at any time, which automatically updates applicant statuses. | All Core Features |

---

## 12. System Constraints

| ID | Constraint Statement | Type |
|---|---|---|
| SC-001 | The platform is delivered as a **responsive web application**; native mobile apps (iOS/Android) are not built for v1.0. | Technical |
| SC-002 | The technology stack will be finalized during **Phase 4 — Architecture** (not mandated in Phase 1). | Technical |
| SC-003 | Hosting and deployment shall utilize low-cost/free tier cloud services (e.g., Render, Vercel, Railway) or run locally for demonstration. | Budgetary |
| SC-004 | The system is designed for a **single university context**; complex multi-tenant data partitioning is excluded. | Scope |
| SC-005 | Development is executed by a small student team (1–3 members) with AI-assisted development tools within course timelines. | Resource |
| SC-006 | All user-facing UI text shall be in Vietnamese as the primary language. | Localization |

---

## 13. Success Criteria

### 13.1 Phase 1 Success Criteria
- [x] Project scope and requirements clearly defined for student final-course project context.
- [x] Contradictions (single institution vs. multi-institution, SSO, AI scope) fully resolved.
- [x] Core matching features and supporting modules prioritized with unique requirement IDs.
- [x] Must Have requirement count calibrated strictly to student MVP target (~40–45).
- [x] Non-functional requirements calibrated realistically for course evaluation.
- [x] Formal sign-off and approval obtained from the Project Owner before unlocking Phase 2.

### 13.2 Final Project Evaluation & Demonstration Success Criteria
| ID | Criterion Statement | Verification Method |
|---|---|---|
| SC-DEMO-001 | **End-to-end Authentication:** Student registration with institutional email verification, login, password reset, and logout function reliably. | Live demonstration |
| SC-DEMO-002 | **Student Profile & Skills:** Student profile creation, skill management with proficiency levels, and course listing display accurately. | Live demonstration |
| SC-DEMO-003 | **Project Match Workflow:** Creating a vacancy post, searching/filtering listings, submitting an application, owner review, and acceptance flow work end-to-end. | Live demonstration |
| SC-DEMO-004 | **Study Buddy Workflow:** Creating a study request, filtering by course/topic, connecting, and owner acceptance flow work end-to-end. | Live demonstration |
| SC-DEMO-005 | **Skill Exchange Workflow:** Posting skill offers and skill requests, responding to an exchange, and mutual acceptance work end-to-end. | Live demonstration |
| SC-DEMO-006 | **Basic Chat:** Matched collaborators can exchange direct text messages in real time or near-real-time. | Live demonstration |
| SC-DEMO-007 | **In-App Notifications:** Users receive visual badge and list notifications when peers apply, connect, or message. | Live demonstration |
| SC-DEMO-008 | **Minimal Admin Moderation:** Administrator can view all users, suspend violating accounts, and remove inappropriate posts. | Live demonstration |
| SC-DEMO-009 | **Responsive Design:** Platform layout adjusts cleanly between desktop browsers and mobile screen widths. | Live demonstration |

---

## 14. Requirement Dependencies

### 14.1 Foundational Dependencies
`
[FR-AUTH: Registration & Verification]
        │
        ▼
[FR-PROF: Profile, Skills & Courses]  ◄── (Prerequisite for all matching: BR-001)
        │
        ├──► [FR-PM: Project Match Post / Apply] ────┐
        │                                            │
        ├──► [FR-SB: Study Buddy Post / Connect] ────┼──► [Match Accepted] ──► [FR-CHAT: Direct Messaging]
        │                                            │                                 ▲
        └──► [FR-SE: Skill Exchange Offer / Request] ┘                                 │
                                                     │                                 │
                                                     └──► [Trigger Events] ────────────┴──► [FR-NOTIF: In-App Notifications]
`

### 14.2 Critical Path
- **Student Profile & Skills (FR-PROF)** is the central dependency. Without completed profiles, Project Match, Study Buddy, and Skill Exchange cannot function effectively.
- **Match Acceptance** in any of the 3 core features is the strict prerequisite for initiating **Direct Messaging (FR-CHAT)**.

---

## 15. Decisions Log

All architectural, scoping, and operational decisions have been categorized and resolved for Phase 1 as follows:

| Decision ID | Topic | Resolution / Status | Phase Timing |
|---|---|---|---|
| **DR-01** | Supported User Roles | **Resolved: Students & Admin only.** Faculty role excluded to keep user model lean. | Phase 1 (Resolved) |
| **DR-02** | Guest Visitor Access Level | **Resolved: Landing page only.** Login required to view listings and peer profiles. | Phase 1 (Resolved) |
| **DR-03** | Separate Moderator Role | **Resolved: No separate Moderator.** Admin handles basic moderation. | Phase 1 (Resolved) |
| **DR-04** | Institutional Scope | **Resolved: Single Institution (Option A).** Multi-university federation is Out of Scope. | Phase 1 (Resolved) |
| **DR-05** | Single Sign-On (SSO / OAuth) | **Resolved: No SSO (Option A).** Self-contained email verification is used. | Phase 1 (Resolved) |
| **DR-06** | Student Identity Verification | **Resolved: Email domain restriction + email verification token.** | Phase 1 (Resolved) |
| **DR-07** | Skills Taxonomy Structure | **Resolved: Standardized skill tag list with flexible custom tag addition.** | Phase 1 (Resolved) |
| **DR-08** | Portfolio Attachment Storage | **Deferred to Phase 4.** Technology architecture will define local vs. cloud media storage. | Phase 4 (Architecture) |
| **DR-09** | Portfolio Social Reactions | **Deferred / Could Have.** Portfolio is Should Have; social reactions are optional stretch. | Phase 1 (Resolved - CH) |
| **DR-10** | AI / Recommendation Scope | **Resolved: No AI in v1.0 (Option A).** Core matching uses direct database query filtering. | Phase 1 (Resolved) |
| **DR-11** | Study Buddy Match Cardinality | **Resolved: 1-to-1 matching for MVP.** Group study buddy is a future extension. | Phase 1 (Resolved) |
| **DR-12** | Skill Exchange Peer Ratings | **Deferred / Could Have.** Basic exchange match is Must Have; rating system is stretch. | Phase 1 (Resolved - CH) |
| **DR-13** | Chat Communication Architecture | **Deferred to Phase 4.** Architecture phase will evaluate WebSocket vs. Polling vs. lightweight service. | Phase 4 (Architecture) |
| **DR-14** | Transactional Email Extent | **Resolved: Verification & password reset emails only.** Routine alerts are in-app. | Phase 1 (Resolved) |
| **DR-15** | Challenge Authoring Permissions | **Deferred / Could Have.** Challenges feature is classified as Could Have. | Phase 1 (Resolved - CH) |
| **DR-16** | Event Authoring Permissions | **Deferred / Could Have.** Events feature is classified as Could Have. | Phase 1 (Resolved - CH) |
| **DR-17** | Target User Capacity | **Resolved: ~50 concurrent users target for student course project demo.** | Phase 1 (Resolved) |
| **DR-18** | Formal Regulatory Compliance | **Resolved: Standard responsible data practices; formal GDPR/enterprise audits excluded.** | Phase 1 (Resolved) |
| **DR-19** | Interface Language | **Resolved: Vietnamese as primary language.** | Phase 1 (Resolved) |
| **DR-20** | Anti-Spam Post Limits | **Resolved: Soft limit of maximum 5 active posts per feature per student.** | Phase 1 (Resolved) |

---

## 16. Assumptions

| ID | Assumption Statement | Risk & Calibration Note |
|---|---|---|
| **A-01** | The primary target institution is a Vietnamese university; user interface text is provided in Vietnamese. | Confirmed. |
| **A-02** | Students interact with the platform via standard desktop and mobile web browsers; native apps are not required. | Confirmed. |
| **A-03** | The platform will be deployed using a free or low-cost hosting service suitable for a student project, or demonstrated locally. | Confirmed. Replaced enterprise cloud assumption. |
| **A-04** | This is a student final-course project. Development is performed by approximately 1–3 students with AI-assisted development tools. Scope and quality expectations must reflect student project constraints. | Confirmed. Replaced professional team assumption. |
| **A-05** | All 3 core features (**Project Match, Study Buddy, Skill Exchange**) constitute the core identity of UniConnect and are Must Have for MVP. | Confirmed. |
| **A-06** | Chat communication is strictly text-only for v1.0. | Confirmed. |
| **A-07** | Initial administrative credentials will be provisioned via database seed scripts. | Confirmed. |
| **A-08** | A relational database (e.g., PostgreSQL or MySQL) is suitable for modeling user relations, posts, and matches. | To be finalized in Phase 4. |
| **A-09** | The platform will be a web application. The specific technology stack will be decided during Phase 4 — Architecture. | Confirmed. Removed stack prescription from Phase 1. |
| **A-10** | Challenges and Events are classified as **Could Have** and may be deferred without impacting core evaluation. | Confirmed. |
| **A-11** | AI Recommendations are **Out of Scope** for v1.0. Simple skill/course filtering is handled via standard database queries. | Confirmed. |

---

## 17. Approval Sign-Off

> **PHASE 1 STATUS: 🔵 REVIEW REQUIRED**
> This revised requirements document is submitted for formal Project Owner review.
> **Phase 2 — System Analysis remains 🔒 LOCKED until this document is explicitly approved.**

| Stakeholder Role | Representative Name | Review Decision | Date | Signature / Note |
|---|---|---|---|---|
| **Project Owner** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |
| **Academic Supervisor / Instructor** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |
| **Technical Lead (Student Team)** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |

---

*End of 01 — Project Requirements v1.2.0*
*Document Status: REVIEW REQUIRED — Awaiting Project Owner Approval*
*Next Phase: Phase 2 — System Analysis (LOCKED)*
