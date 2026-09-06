# Database Architecture Review Report
# UniConnect – Student Skill & Collaboration Platform

> **Document Type:** Phase 4 Final Database Architecture & Approval Report
> **Phase:** 4 — Database Architecture
> **Status:** 🟢 APPROVED
> **Approval Date:** 2026-08-31
> **Prepared By:** AI Database Architect (Antigravity)
> **Version:** 1.3.1 (Approved Baseline)

---

## 1. Executive Summary

Phase 4 — Database Architecture has been formally **APPROVED** by the Project Owner on **2026-08-31**.

Building upon the approved **Phase 1 Requirements (v1.2.0)**, **Phase 2 System Analysis (v1.2.0)**, and **Phase 3 UI/UX Design (v1.1.0)**, the specification document (docs/04_architecture/04_Database_Architecture.md v1.3.1) establishes the physical relational schema, 3NF normalization, foreign key cascade strategies, row-locking concurrency transactions, status state machines, trusted write paths, and secure deployment seed data definitions across **17 physical database tables**.

Primary Deliverables:
- [docs/04_architecture/04_Database_Architecture.md](file:///d:/quản lý trường học/docs/04_architecture/04_Database_Architecture.md) (v1.3.1, 🟢 APPROVED)
- [docs/04_architecture/PHASE_4_CORRECTION_REPORT.md](file:///d:/quản lý trường học/docs/04_architecture/PHASE_4_CORRECTION_REPORT.md) (v1.3.1, 🟢 APPROVED)
- [docs/04_architecture/PHASE_4_REVIEW_REPORT.md](file:///d:/quản lý trường học/docs/04_architecture/PHASE_4_REVIEW_REPORT.md) (v1.3.1, 🟢 APPROVED)

---

## 2. Physical Database Tables Inventory (17 Tables)

| # | Table Name | Primary Purpose | Primary Key | Key Foreign Keys | Integrity & Constraint Strategy |
|:---:|---|---|:---:|---|---|
| 1 | users | Core account credentials, role & status | id UUID | — | UNIQUE (email) + .edu.vn format regex CHECK |
| 2 | student_profiles | Academic & personal student metadata | id UUID | user_id $\rightarrow$ users(id) | 1:1 with User, CASCADE delete, Dynamic BR-001 check |
| 3 | skills | Standardized master skill directory | id UUID | — | UNIQUE (name) |
| 4 | profile_skills | Student-skill join with proficiency | id UUID | profile_id, skill_id | UNIQUE (profile_id, skill_id), Level CHECK |
| 5 | courses | Standardized course catalog | id UUID | — | UNIQUE (course_code) |
| 6 | profile_courses | Student-course enrollment association | id UUID | profile_id, course_id | UNIQUE (profile_id, course_id) |
| 7 | project_posts | Project team vacancy posts | id UUID | uthor_id $\rightarrow$ users(id) | Slots & category CHECKs, Row-locking quota guard (BR-002) |
| 8 | project_post_skills | Required skills per project post | id UUID | post_id, skill_id | UNIQUE (post_id, skill_id) |
| 9 | project_applications | Project candidate applications | id UUID | post_id, pplicant_id | UNIQUE (post_id, applicant_id), Cross-table self-apply guard (BR-003), Single response per target (BR-004) |
| 10 | study_requests | Study buddy search requests | id UUID | uthor_id, course_id | Strict FK to courses(id), Mode CHECK |
| 11 | study_connections | Peer study connection requests | id UUID | equest_id, equester_id | UNIQUE (request_id, requester_id), Self-connect guard, Single response per target (BR-004) |
| 12 | skill_listings | Skill sharing offers & requests | id UUID | uthor_id $\rightarrow$ users(id) | Type (OFFER/REQUEST) & level CHECKs |
| 13 | skill_responses | Peer skill exchange proposals | id UUID | listing_id, esponder_id | UNIQUE (listing_id, responder_id), Self-proposal guard, Single response per target (BR-004) |
| 14 | conversations | 1-to-1 direct messaging sessions | id UUID | user_one_id, user_two_id | CHECK (user_one_id < user_two_id) + UNIQUE (user_one_id, user_two_id), Match gate & trusted write path (BR-006) |
| 15 | messages | Chat text message stream | id UUID | conversation_id, sender_id | Text-only CHECK (1..1000), Participant trigger guard |
| 16 | 
otifications | In-app alerts queue | id UUID | ecipient_id $\rightarrow$ users(id) | Unread index optimization |
| 17 | ccount_moderation_logs| Admin moderation audit trail | id UUID | dmin_id $\rightarrow$ users(id) | 	arget_entity_type + 	arget_entity_id audit tracking |

---

## 3. Strict Boundary Compliance Verification

Phase 4 strictly respects the separation of phases in Waterfall methodology:

- [x] **No REST API Endpoints or HTTP Routes:** HTTP methods, route paths (/api/v1/...), and controller definitions belong to **Phase 5 (API Specification)**.
- [x] **No JSON Request / Response Payloads:** Serialization contracts belong to Phase 5.
- [x] **No Frontend Code or UI Implementation:** All UI designs remain locked in Phase 3.
- [x] **No Application Code:** Backend and frontend code implementation is deferred to **Phase 6 (Development)**.
- [x] **Approved Baselines Preserved:** 100% traceability to approved Phase 1 (v1.2.0), Phase 2 (v1.2.0), and Phase 3 (v1.1.0).

---

## 4. Phase Gate Status

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

*End of Database Architecture Review Report v1.3.1*
*Phase 4 Formal Sign-off Completed*
