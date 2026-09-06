# Phase 4 Review Report
# UniConnect – Student Skill & Collaboration Platform

> **Document Type:** Phase 4 Comprehensive Database Architecture & Traceability Audit Report
> **Phase:** 4 — Database Architecture
> **Status:** 🟢 APPROVED
> **Approval Date:** 2026-08-31
> **Prepared By:** AI Database Architect (Antigravity)
> **Document Version:** 1.3.1 (Approved Baseline)

---

## 1. Executive Summary

Phase 4 — Database Architecture has established the physical data layer for **UniConnect** and was formally **APPROVED** by the Project Owner on **2026-08-31**.

The physical relational schema converts the approved **Phase 2 Conceptual Domain Model (14 classes)** into **17 fully normalized physical tables** in **PostgreSQL 15+**, supporting all functional requirements from **Phase 1 (v1.2.0)** and all screen data requirements from **Phase 3 (v1.1.0)** with complete cross-table integrity safeguards, deterministic participant ordering, trusted write paths, and concurrency-safe transactions.

---

## 2. Relational Schema Architecture Overview

`
UniConnect Physical Database Schema (17 Tables)
├── 1. Identity, Authentication & Profile (6 Tables)
│   ├── users (Credentials, role, status, UNIQUE email + .edu.vn regex CHECK)
│   ├── student_profiles (Academic metadata, bio, dynamic BR-001 completeness)
│   ├── skills (Master standardized skill directory)
│   ├── profile_skills (Student-skill proficiency association)
│   ├── courses (Standardized course catalog)
│   └── profile_courses (Student course enrollment association)
├── 2. Core 1: Project Match (3 Tables)
│   ├── project_posts (Vacancy listings, category, slots, deadline, soft lifecycle)
│   ├── project_post_skills (Required skill tags per project post)
│   └── project_applications (Candidate applications, cross-table self-apply guard, UNIQUE post+applicant, single response BR-004)
├── 3. Core 2: Study Buddy (2 Tables)
│   ├── study_requests (Strict course_id FK -> courses(id), topic, study mode, schedule)
│   └── study_connections (Peer connection requests, status, UNIQUE request+requester, single response BR-004)
├── 4. Core 3: Skill Exchange (2 Tables)
│   ├── skill_listings (Offers vs. Requests, format, schedule)
│   └── skill_responses (Peer exchange proposals, status, UNIQUE listing+responder, single response BR-004)
├── 5. Messaging & Alerts (3 Tables)
│   ├── conversations (1-to-1 chat context with CHECK (user_one_id < user_two_id) + UNIQUE, trusted write path BR-006)
│   ├── messages (Chronological text stream, 1000 char limit, Participant trigger guard)
│   └── notifications (In-app alerts queue with unread tracking)
└── 6. Administration & Auditing (1 Table)
    └── account_moderation_logs (Audit log with target_entity_type + target_entity_id)
`

---

## 3. Key Architectural Decisions & Safeguards

1. **Declarative & Layered Integrity Enforcement:**
   - **BR-001 (Complete Profile):** Authoritative dynamic query expression prevents stale boolean desynchronization.
   - **BR-002 (Max 5 Active Listings):** Concurrency-safe transaction guard locking stable users record (SELECT ... FOR UPDATE).
   - **BR-003 (Self-Application Guard):** Classified as cross-table invariant (pplicant_id != project_posts.author_id) and enforced via transactional verification and BEFORE INSERT database triggers.
   - **BR-004 (Single Response Record per Target):** UNIQUE (post_id, applicant_id) enforces a single response record per target listing (application, connection request, or exchange proposal) throughout its lifecycle.
   - **BR-006 (Gated Chat & Trusted Write Path):** conversations enforces canonical ascending participant ordering CHECK (user_one_id < user_two_id) + UNIQUE (user_one_id, user_two_id). Created strictly inside authorized match acceptance transactions.
   - **Message Participant Guard:** Enforces sender_id IN (user_one_id, user_two_id) via trigger and service validation.
   - **BR-007 (Session Revocation on Suspension):** users.status = 'SUSPENDED' + Authentication Middleware denying access with 403 Forbidden.
   - **BR-008 (Token Expiration):** Verification service checks erification_expires_at > CURRENT_TIMESTAMP.
   - **BR-009 (Admin Listing Removal):** Atomic transaction combining status update to REMOVED_BY_ADMIN and audit record insertion into ccount_moderation_logs.
   - **Email Domain Validation:** Distinguishes UNIQUE (email) from regex format constraint CHECK (email ~* '^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)*edu\.vn$') and application-level institution whitelist validation.
   - **Course Catalog Consistency:** study_requests strictly references courses(id) via Foreign Key.
   - **Administrator Credential Security:** No plaintext credentials in repo/docs; secure environment variable injection (SEED_ADMIN_PASSWORD_HASH) with mandatory initial login rotation.
2. **Third Normal Form (3NF) Compliance:**
   - Atomic attributes throughout; zero unmanaged redundancy.
3. **Indexing Strategy for Sub-Second Feed Retrieval:**
   - Partial B-Tree indexes on active posts (WHERE status = 'OPEN').
   - Compound indexes on (status, created_at DESC) for high-performance feed pagination.
   - Compound unread indexes on 
otifications(recipient_id, is_read, created_at DESC).

---

## 4. Database Traceability & Consistency Audit

- [x] All 14 conceptual domain classes from Phase 2 mapped to physical relational tables.
- [x] All 46 Must Have, 27 Should Have, and 28 Could Have requirements accounted for.
- [x] All 24 UI/UX screen specifications from Phase 3 supported by table columns and relations.
- [x] Master Integrity Matrix (BR-001 to BR-009) fully documented in Section 5.10 with accurate layer classifications.
- [x] Post-Core / Deferred features (Portfolio, Challenges, Events) remain cleanly separated.
- [x] Out-of-scope boundaries strictly maintained (No AI vector stores, No SSO OAuth tables).

---

## 5. Phase Gate Status

`
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1 — REQUIREMENTS:        🟢 APPROVED (v1.2.0)         │
│ PHASE 2 — SYSTEM ANALYSIS:     🟢 APPROVED (v1.2.0)         │
│ PHASE 3 — UI/UX DESIGN:        🟢 APPROVED (v1.1.0)         │
│ PHASE 4 — DATABASE ARCH.:      🟢 APPROVED (v1.3.1)         │
│ CURRENT PHASE:                 PHASE 5 — API SPECIFICATION  │
│ STATUS:                        🔓 UNLOCKED                  │
└─────────────────────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       Phase 6: Development           Phases 7–8: Future
       🔒 LOCKED                      🔒 LOCKED
`

---

*End of Phase 4 Review Report v1.3.1*
*Phase 4 Formal Approval Completed*
