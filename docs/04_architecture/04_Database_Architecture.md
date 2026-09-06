# 04 — Database Architecture
# UniConnect – Student Skill & Collaboration Platform

> **Phase:** 4 — Database Architecture
> **Status:** 🟢 APPROVED
> **Approved Date:** 2026-08-31
> **Document Version:** 1.3.1 (Approved Baseline)
> **Author:** AI Database Architect (Antigravity)
> **Approved Requirements Baseline:** Phase 1 Requirements v1.2.0 (Approved 2026-08-31)
> **Approved Analysis Baseline:** Phase 2 System Analysis v1.2.0 (Approved 2026-08-31)
> **Approved UI/UX Baseline:** Phase 3 UI/UX Specification v1.1.0 (Approved 2026-08-31)
> **Target Context:** Student Final-Course Project (1–3 Members, AI-Assisted)
> **Target RDBMS:** PostgreSQL 15+ (Relational with ACID compliance)
> **Created:** 2026-08-31
> **Last Updated:** 2026-08-31

---

## Table of Contents

1. [Executive Summary & Architecture Principles](#1-executive-summary--architecture-principles)
2. [Database Technology Selection & Conventions](#2-database-technology-selection--conventions)
   - 2.1 Technology Selection & Rationale
   - 2.2 Naming Conventions & Standard Data Types
   - 2.3 Email Uniqueness & Institutional Domain Validation Strategy
3. [Physical Entity-Relationship Diagram (ERD)](#3-physical-entity-relationship-diagram-erd)
4. [Detailed Table Schemas & Data Dictionaries (17 Tables)](#4-detailed-table-schemas--data-dictionaries-17-tables)
   - 4.1 Module AUTH: users
   - 4.2 Module PROFILE: student_profiles, skills, profile_skills, courses, profile_courses
   - 4.3 Module PROJECT MATCH: project_posts, project_post_skills, project_applications
   - 4.4 Module STUDY BUDDY: study_requests, study_connections
   - 4.5 Module SKILL EXCHANGE: skill_listings, skill_responses
   - 4.6 Module CHAT & NOTIFICATIONS: conversations, messages, 
otifications
   - 4.7 Module ADMIN & AUDIT: ccount_moderation_logs
5. [Business Rules & Comprehensive Integrity Enforcement Strategy](#5-business-rules--comprehensive-integrity-enforcement-strategy)
   - 5.1 Profile Completeness Computation Strategy (BR-001)
   - 5.2 Concurrency-Safe Listing Quotas Enforcement (BR-002)
   - 5.3 Cross-Table Self-Application Prevention (BR-003)
   - 5.4 Single Response Record per Target (BR-004)
   - 5.5 Chat Authorization & Trusted Write Path (BR-006)
   - 5.6 Message Participant Integrity Strategy
   - 5.7 Account Suspension & Session Revocation (BR-007)
   - 5.8 Account Deactivation vs Hard Delete Policy
   - 5.9 Polymorphic Moderation Target Integrity
   - 5.10 Master Integrity & Business Rules Matrix (BR-001 to BR-009)
6. [Relationships, Foreign Keys & Referential Integrity](#6-relationships-foreign-keys--referential-integrity)
7. [Database Normalization & Integrity Analysis](#7-database-normalization--integrity-analysis)
8. [Indexing & Query Performance Optimization](#8-indexing--query-performance-optimization)
9. [Enums, Status State Machines & CHECK Constraints](#9-enums-status-state-machines--check-constraints)
10. [Seed Data & Initial Catalog Strategy](#10-seed-data--initial-catalog-strategy)
11. [Database Traceability Matrix](#11-database-traceability-matrix)
12. [Approval Sign-Off](#12-approval-sign-off)

---

## 1. Executive Summary & Architecture Principles

### 1.1 Purpose of this Specification
This **Database Architecture Specification** translates the approved conceptual domain model (14 classes from Phase 2), business rules (from Phase 1), and screen data requirements (from Phase 3) into an enterprise-grade physical relational schema for **UniConnect v1.0**.

### 1.2 Core Architectural Principles
1. **Third Normal Form (3NF) Rigor:** Every non-key attribute depends strictly on the key, the whole key, and nothing but the key.
2. **Layered Constraint & Integrity Architecture:**
   - *Declarative Database Constraints:* Single-table invariants (CHECK, UNIQUE, NOT NULL, FOREIGN KEY) enforced directly by PostgreSQL.
   - *Cross-Table & Transactional Invariants:* Multi-table invariants (such as self-application prevention, active quota counting, and chat authorization) formally enforced via transactional serialization and database triggers.
3. **Deterministic Uniqueness & Trusted Write Paths:** Canonical participant ordering (user_one_id < user_two_id) and unique compound keys eliminate race conditions and duplicate channels.
4. **Lifecycle State Clarity:** Formal distinction between soft operational state transitions (ACTIVE, SUSPENDED, DEACTIVATED, OPEN, FULL, CLOSED, EXPIRED, REMOVED_BY_ADMIN) and permanent physical cascading deletes.
5. **Technology Neutrality:** ANSI SQL standard data types combined with PostgreSQL 15+ UUID generation and indexing capabilities.

---

## 2. Database Technology Selection & Conventions

### 2.1 Technology Selection & Rationale
- **Primary Engine:** **PostgreSQL (v15+)**
- **Rationale:**
  - ACID transaction support for multi-table collaboration lifecycles (e.g., accepting an application atomically increments slots, marks status FULL if limit reached, creates a chat conversation, and dispatches a notification).
  - Native gen_random_uuid() UUID generation, TIMESTAMPTZ timezone handling, and regex-based check constraints.

### 2.2 Naming Conventions & Standard Data Types
- **Table Names:** Plural, lowercase snake_case (e.g., users, student_profiles, project_posts).
- **Primary Keys:** Column id of type UUID with default gen_random_uuid().
- **Foreign Keys:** <referenced_table_singular>_id (e.g., uthor_id, post_id, conversation_id, course_id).
- **Timestamps:** created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP.

### 2.3 Email Uniqueness & Institutional Domain Validation Strategy
The architecture clearly separates **identity uniqueness** from **institutional domain verification**:
1. **Database Uniqueness Constraint:** UNIQUE (email) guarantees no two accounts share the same email address.
2. **Database Format / Generic Educational CHECK Constraint:**
   `sql
   CHECK (email ~* '^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)*edu\.vn$')
   `
   Enforces that email addresses conform to standard higher education domain syntax (.edu.vn).
3. **Application / Configuration Layer Domain Validation:** The backend service layer validates the exact university domain (e.g., @university.edu.vn per configuration) against the institution's whitelist during registration (UC-AUTH-01).

---

## 3. Physical Entity-Relationship Diagram (ERD)

`mermaid
erDiagram
    users ||--o| student_profiles : "has"
    users ||--o{ project_posts : "authors"
    users ||--o{ project_applications : "submits"
    users ||--o{ study_requests : "authors"
    users ||--o{ study_connections : "submits"
    users ||--o{ skill_listings : "authors"
    users ||--o{ skill_responses : "submits"
    users ||--o{ notifications : "receives"
    users ||--o{ account_moderation_logs : "performed_by"

    student_profiles ||--o{ profile_skills : "possesses"
    skills ||--o{ profile_skills : "categorized_by"
    student_profiles ||--o{ profile_courses : "enrolled_in"
    courses ||--o{ profile_courses : "taken_by"

    project_posts ||--o{ project_post_skills : "requires"
    skills ||--o{ project_post_skills : "needed_for"
    project_posts ||--o{ project_applications : "receives"

    courses ||--o{ study_requests : "focuses_on"
    study_requests ||--o{ study_connections : "receives"
    skill_listings ||--o{ skill_responses : "receives"

    conversations ||--o{ messages : "contains"
    users ||--o{ conversations : "participant_1"
    users ||--o{ conversations : "participant_2"
    users ||--o{ messages : "sends"

    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar role
        varchar status
        varchar verification_token
        timestamptz verification_expires_at
        varchar reset_token
        timestamptz reset_expires_at
        timestamptz created_at
        timestamptz updated_at
    }

    student_profiles {
        uuid id PK
        uuid user_id FK,UK
        varchar full_name
        varchar avatar_url
        varchar campus
        varchar major
        int year_of_study
        text bio
        varchar github_url
        varchar linkedin_url
        timestamptz created_at
        timestamptz updated_at
    }

    skills {
        uuid id PK
        varchar name UK
        varchar category
        boolean is_system_standard
        timestamptz created_at
    }

    profile_skills {
        uuid id PK
        uuid profile_id FK
        uuid skill_id FK
        varchar proficiency_level
        timestamptz created_at
    }

    courses {
        uuid id PK
        varchar course_code UK
        varchar course_name
        timestamptz created_at
    }

    profile_courses {
        uuid id PK
        uuid profile_id FK
        uuid course_id FK
        timestamptz created_at
    }

    project_posts {
        uuid id PK
        uuid author_id FK
        varchar title
        text description
        varchar category
        int total_slots
        int accepted_slots
        date deadline
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    project_post_skills {
        uuid id PK
        uuid post_id FK
        uuid skill_id FK
    }

    project_applications {
        uuid id PK
        uuid post_id FK
        uuid applicant_id FK
        text intro_note
        varchar status
        timestamptz applied_at
        timestamptz resolved_at
    }

    study_requests {
        uuid id PK
        uuid author_id FK
        uuid course_id FK
        varchar topic
        varchar study_mode
        varchar availability
        text description
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    study_connections {
        uuid id PK
        uuid request_id FK
        uuid requester_id FK
        text note
        varchar status
        timestamptz requested_at
        timestamptz resolved_at
    }

    skill_listings {
        uuid id PK
        uuid author_id FK
        varchar type
        varchar skill_name
        varchar proficiency_level
        varchar format
        varchar availability
        text description
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    skill_responses {
        uuid id PK
        uuid listing_id FK
        uuid responder_id FK
        text proposal_note
        varchar status
        timestamptz responded_at
        timestamptz resolved_at
    }

    conversations {
        uuid id PK
        uuid user_one_id FK
        uuid user_two_id FK
        varchar match_type
        uuid match_source_id
        timestamptz created_at
        timestamptz last_message_at
    }

    messages {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content
        timestamptz sent_at
    }

    notifications {
        uuid id PK
        uuid recipient_id FK
        varchar type
        varchar title
        text content
        varchar target_url
        boolean is_read
        timestamptz created_at
    }

    account_moderation_logs {
        uuid id PK
        uuid admin_id FK
        varchar target_entity_type
        uuid target_entity_id
        varchar action
        text reason
        timestamptz created_at
    }
`


---

## 4. Detailed Table Schemas & Data Dictionaries (17 Tables)

---

### 4.1 Module AUTH: users

#### Table: users
Stores user authentication credentials, system roles, lifecycle status, and verification/reset tokens.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| email | VARCHAR(255) | No | — | — | **UNIQUE**, CHECK (email ~* '^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)*edu\.vn$') (**FR-AUTH-002**) |
| password_hash | VARCHAR(255) | No | — | — | Secure Argon2id / bcrypt hash (**NFR-SEC-001**) |
| ole | VARCHAR(20) | No | 'STUDENT' | — | CHECK (role IN ('STUDENT', 'ADMIN')) |
| status | VARCHAR(30) | No | 'PENDING_VERIFICATION' | — | CHECK (status IN ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED')) |
| erification_token | VARCHAR(255) | Yes | NULL | — | Secure random token for email verification |
| erification_expires_at | TIMESTAMPTZ | Yes | NULL | — | Token lifespan 24 hours (**BR-008**) |
| eset_token | VARCHAR(255) | Yes | NULL | — | Secure random token for password reset |
| eset_expires_at | TIMESTAMPTZ | Yes | NULL | — | Token lifespan 1 hour |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Account creation timestamp |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Account update timestamp |

---

### 4.2 Module PROFILE: Profile & Skill Tables

#### Table: student_profiles
Stores extended personal and academic details for registered students.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| user_id | UUID | No | — | **FK, UK** | References users(id) **ON DELETE CASCADE** (1:1 with User) |
| ull_name | VARCHAR(100) | No | — | — | Student's full display name (2–100 chars) |
| vatar_url | VARCHAR(500) | Yes | NULL | — | URL to avatar image |
| campus | VARCHAR(100) | Yes | NULL | — | Campus name / location |
| major | VARCHAR(100) | Yes | NULL | — | Faculty / Major of study |
| year_of_study | SMALLINT | Yes | NULL | — | CHECK (year_of_study BETWEEN 1 AND 6) |
| io | TEXT | Yes | NULL | — | Short personal biography (max 1000 chars) |
| github_url | VARCHAR(255) | Yes | NULL | — | Optional external link [SH / Post-Core] |
| linkedin_url | VARCHAR(255) | Yes | NULL | — | Optional external link [SH / Post-Core] |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Profile creation timestamp |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Profile update timestamp |

---

#### Table: skills
Standardized master directory of technical, creative, and academic skill tags.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| 
ame | VARCHAR(100) | No | — | — | **UNIQUE**, unique skill name tag |
| category | VARCHAR(50) | Yes | 'GENERAL' | — | Category (e.g., TECH, DESIGN, LANGUAGE, ACADEMIC) |
| is_system_standard | BOOLEAN | No | TRUE | — | TRUE if pre-seeded; FALSE if user-suggested |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Record creation timestamp |

---

#### Table: profile_skills
Associative table linking student profiles to skills with declared proficiency levels.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| profile_id | UUID | No | — | **FK** | References student_profiles(id) **ON DELETE CASCADE** |
| skill_id | UUID | No | — | **FK** | References skills(id) **ON DELETE RESTRICT** |
| proficiency_level | VARCHAR(20) | No | 'BEGINNER' | — | CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')) |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Timestamp added |

- **Unique Constraint:** UNIQUE (profile_id, skill_id) (A student cannot add the same skill twice).

---

#### Table: courses
Standardized catalog of academic courses and subjects.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| course_code | VARCHAR(30) | No | — | — | **UNIQUE**, e.g., CS101, INT2204, MTH102 |
| course_name | VARCHAR(200) | No | — | — | Full course name, e.g., Cấu trúc dữ liệu và giải thuật |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Record creation timestamp |

---

#### Table: profile_courses
Associative table mapping students to courses they are taking or have completed.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| profile_id | UUID | No | — | **FK** | References student_profiles(id) **ON DELETE CASCADE** |
| course_id | UUID | No | — | **FK** | References courses(id) **ON DELETE RESTRICT** |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Record creation timestamp |

- **Unique Constraint:** UNIQUE (profile_id, course_id).

---

### 4.3 Module PROJECT MATCH: Core 1 Tables

#### Table: project_posts
Stores project vacancy listings recruiting student teammates.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| uthor_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| 	itle | VARCHAR(150) | No | — | — | Project title (10–150 chars) |
| description | TEXT | No | — | — | Detailed project requirements (min 20 chars) |
| category | VARCHAR(30) | No | 'COURSEWORK' | — | CHECK (category IN ('COURSEWORK', 'HACKATHON', 'RESEARCH', 'PERSONAL')) |
| 	otal_slots | SMALLINT | No | 1 | — | CHECK (total_slots BETWEEN 1 AND 10) |
| ccepted_slots | SMALLINT | No |   | — | CHECK (accepted_slots >= 0 AND accepted_slots <= total_slots) |
| deadline | DATE | No | — | — | Application deadline date |
| status | VARCHAR(30) | No | 'OPEN' | — | CHECK (status IN ('OPEN', 'FULL', 'EXPIRED', 'CLOSED', 'REMOVED_BY_ADMIN')) |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Post publication timestamp |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Post update timestamp |

---

#### Table: project_post_skills
Associative table linking project vacancy posts to required skill tags.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| post_id | UUID | No | — | **FK** | References project_posts(id) **ON DELETE CASCADE** |
| skill_id | UUID | No | — | **FK** | References skills(id) **ON DELETE RESTRICT** |

- **Unique Constraint:** UNIQUE (post_id, skill_id).

---

#### Table: project_applications
Stores candidate applications submitted to project vacancies.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| post_id | UUID | No | — | **FK** | References project_posts(id) **ON DELETE CASCADE** |
| pplicant_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| intro_note | TEXT | Yes | NULL | — | Short self-intro / pitch (max 500 chars) |
| status | VARCHAR(20) | No | 'PENDING' | — | CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED')) |
| pplied_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Application submission timestamp |
| esolved_at | TIMESTAMPTZ | Yes | NULL | — | Decision timestamp (Accept/Decline) |

- **Unique Constraint:** UNIQUE (post_id, applicant_id) (**BR-004**: Single response record per target — one application per project post).
- **Cross-Table Self-Application Guard:** Enforced via transactional query / trigger validation project_applications.applicant_id != project_posts.author_id (**BR-003**, Section 5.3).

---

### 4.4 Module STUDY BUDDY: Core 2 Tables

#### Table: study_requests
Stores study partner search posts for academic courses.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| uthor_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| course_id | UUID | No | — | **FK** | References courses(id) **ON DELETE RESTRICT** (Strict catalog alignment) |
| 	opic | VARCHAR(100) | No | — | — | Topic / Study goal (5–100 chars) |
| study_mode | VARCHAR(20) | No | 'ONLINE' | — | CHECK (study_mode IN ('ONLINE', 'OFFLINE', 'HYBRID')) |
| vailability | VARCHAR(200) | No | — | — | Availability schedule description |
| description | TEXT | Yes | NULL | — | Detailed study preferences |
| status | VARCHAR(30) | No | 'OPEN' | — | CHECK (status IN ('OPEN', 'CLOSED', 'REMOVED_BY_ADMIN')) |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Publication timestamp |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Update timestamp |

---

#### Table: study_connections
Stores connection requests from peers wishing to study together.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| equest_id | UUID | No | — | **FK** | References study_requests(id) **ON DELETE CASCADE** |
| equester_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| 
ote | TEXT | Yes | NULL | — | Optional connection note |
| status | VARCHAR(20) | No | 'PENDING' | — | CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED')) |
| equested_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Connection request timestamp |
| esolved_at | TIMESTAMPTZ | Yes | NULL | — | Resolution timestamp |

- **Unique Constraint:** UNIQUE (request_id, requester_id) (**BR-004**: Single response record per target — one connection request per study request).
- **Cross-Table Self-Connection Guard:** Enforced via transactional verification study_connections.requester_id != study_requests.author_id (**BR-003**, Section 5.3).

---

### 4.5 Module SKILL EXCHANGE: Core 3 Tables

#### Table: skill_listings
Stores skill sharing offers and skill learning requests.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| uthor_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| 	ype | VARCHAR(20) | No | 'OFFER' | — | CHECK (type IN ('OFFER', 'REQUEST')) |
| skill_name | VARCHAR(100) | No | — | — | Name of skill offered or wanted |
| proficiency_level | VARCHAR(20) | No | 'BEGINNER' | — | CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')) |
| ormat | VARCHAR(50) | Yes | NULL | — | Format (e.g., 1-on-1 Online, In-person) [SH / Post-Core] |
| vailability | VARCHAR(200) | Yes | NULL | — | General schedule [SH / Post-Core] |
| description | TEXT | No | — | — | Detailed description (min 20 chars) |
| status | VARCHAR(30) | No | 'OPEN' | — | CHECK (status IN ('OPEN', 'CLOSED', 'REMOVED_BY_ADMIN')) |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Publication timestamp |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Update timestamp |

---

#### Table: skill_responses
Stores exchange proposals submitted to skill listings.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| listing_id | UUID | No | — | **FK** | References skill_listings(id) **ON DELETE CASCADE** |
| esponder_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| proposal_note | TEXT | No | — | — | Explanation of what responder offers in exchange |
| status | VARCHAR(20) | No | 'PENDING' | — | CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED')) |
| esponded_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Response timestamp |
| esolved_at | TIMESTAMPTZ | Yes | NULL | — | Resolution timestamp |

- **Unique Constraint:** UNIQUE (listing_id, responder_id) (**BR-004**: Single response record per target — one proposal per skill listing).
- **Cross-Table Self-Proposal Guard:** Enforced via transactional verification skill_responses.responder_id != skill_listings.author_id (**BR-003**, Section 5.3).

---

### 4.6 Module CHAT & NOTIFICATIONS: Collaboration Tables

#### Table: conversations
Direct 1-to-1 conversation session between two matched student users.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| user_one_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| user_two_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| match_type | VARCHAR(30) | No | — | — | CHECK (match_type IN ('PROJECT_MATCH', 'STUDY_BUDDY', 'SKILL_EXCHANGE')) |
| match_source_id | UUID | No | — | — | Source application / connection / response record ID |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Conversation initialization timestamp |
| last_message_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Timestamp of most recent message |

- **Deterministic Uniqueness Constraints:**
  - CHECK (user_one_id < user_two_id) (Enforces canonical ascending UUID ordering).
  - UNIQUE (user_one_id, user_two_id) (Guarantees strictly at most one conversation between any two users).
- **Chat Authorization & Trusted Write Path (BR-006):** Created strictly inside authorized match acceptance transactions (Section 5.5). Direct insertions outside this path are prohibited.

---

#### Table: messages
Stores individual text messages within an active conversation thread.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| conversation_id | UUID | No | — | **FK** | References conversations(id) **ON DELETE CASCADE** |
| sender_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| content | TEXT | No | — | — | Text content (CHECK (length(trim(content)) BETWEEN 1 AND 1000), **FR-CHAT-007**) |
| sent_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Message send timestamp |

- **Message Participant Integrity:** Enforced via transactional query / trigger validation (sender_id = conversations.user_one_id OR sender_id = conversations.user_two_id, Section 5.6).

---

#### Table: 
otifications
Stores in-app event alerts and notifications dispatched to users.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| ecipient_id | UUID | No | — | **FK** | References users(id) **ON DELETE CASCADE** |
| 	ype | VARCHAR(50) | No | — | — | Notification type category (e.g., PROJECT_APPLICATION, APPLICATION_ACCEPTED) |
| 	itle | VARCHAR(150) | No | — | — | Alert headline |
| content | TEXT | No | — | — | Notification text message |
| 	arget_url | VARCHAR(255) | Yes | NULL | — | Relative destination screen route (e.g., /projects/applications) |
| is_read | BOOLEAN | No | FALSE | — | Read status flag |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Dispatch timestamp |

---

### 4.7 Module ADMIN & AUDIT: Moderation Table

#### Table: ccount_moderation_logs
Audit log recording administrator moderation actions with entity target traceability.

| Column Name | Data Type | Nullable | Default | PK/FK | Constraints & Notes |
|---|---|:---:|---|:---:|---|
| id | UUID | No | gen_random_uuid() | **PK** | Primary Key |
| dmin_id | UUID | No | — | **FK** | References users(id) **ON DELETE RESTRICT** (Preserves admin identity) |
| 	arget_entity_type | VARCHAR(50) | No | — | — | CHECK (target_entity_type IN ('USER', 'PROJECT_POST', 'STUDY_REQUEST', 'SKILL_LISTING')) |
| 	arget_entity_id | UUID | No | — | — | ID of affected entity (User account or Post/Request/Listing ID) |
| ction | VARCHAR(50) | No | — | — | Action (e.g., SUSPEND_USER, UNBAN_USER, REMOVE_LISTING) |
| eason | TEXT | No | — | — | Mandatory explanation provided by admin |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | — | Moderation action timestamp |


---

## 5. Business Rules & Comprehensive Integrity Enforcement Strategy

This section formally defines how business rules from Phase 1 and system invariants from Phase 2 are implemented across database declarative constraints, database triggers, and transactional service boundaries.

### 5.1 Profile Completeness Computation Strategy (BR-001)
- **Business Rule:** A student must complete their Full Name, add at least 1 Skill, and add at least 1 Course before being permitted to publish listings in Project Match, Study Buddy, or Skill Exchange.
- **Architectural Solution:**
  Profile completeness is calculated dynamically by the following authoritative query expression, preventing stale boolean desynchronization:
  `sql
  -- Authoritative Profile Completeness Expression:
  SELECT (
      sp.full_name IS NOT NULL AND length(trim(sp.full_name)) > 0
      AND EXISTS (SELECT 1 FROM profile_skills ps WHERE ps.profile_id = sp.id)
      AND EXISTS (SELECT 1 FROM profile_courses pc WHERE pc.profile_id = sp.id)
  ) AS is_complete
  FROM student_profiles sp
  WHERE sp.user_id = :current_user_id;
  `
  Listing creation transactions execute this validation check atomically prior to inserting records into project_posts, study_requests, or skill_listings.

---

### 5.2 Concurrency-Safe Listing Quotas Enforcement (BR-002)
- **Business Rule:** A student may have at most **5 active (OPEN)** listings simultaneously per collaboration module.
- **Enforcement Architecture:**
  Because PostgreSQL aggregate queries (COUNT(*)) cannot lock rows using FOR UPDATE directly, listing creation uses an explicit row-level locking transaction on the stable users record to serialize creation attempts safely:
  `sql
  -- Concurrency-Safe Listing Creation Transaction:
  BEGIN;

  -- 1. Acquire exclusive row lock on the authoring user record:
  SELECT id FROM users WHERE id = :user_id FOR UPDATE;

  -- 2. Count current active (OPEN) posts for this author:
  SELECT COUNT(*) FROM project_posts 
  WHERE author_id = :user_id AND status = 'OPEN';

  -- 3. In Application/Service Logic:
  -- IF count >= 5 THEN
  --     ROLLBACK;
  --     RAISE EXCEPTION 'BR-002: Vượt quá giới hạn 5 bài đăng hoạt động';
  -- ELSE
  --     INSERT INTO project_posts (author_id, title, description, category, total_slots, deadline, status)
  --     VALUES (:user_id, :title, :description, :category, :total_slots, :deadline, 'OPEN');
  -- END IF;

  COMMIT;
  `
  *(Identical transaction locks apply to study_requests and skill_listings).*

---

### 5.3 Cross-Table Self-Application Prevention (BR-003)
- **Business Rule:** A student cannot apply to their own project post, connect to their own study request, or propose to their own skill listing.
- **Architectural Classification:** This is a **cross-table integrity invariant** (pplicant_id != project_posts.author_id), which cannot be expressed via a single-table SQL CHECK constraint.
- **Enforcement Strategy:**
  1. *Transactional Guard:* The application submission transaction verifies that the applicant does not match the post author:
     `sql
     SELECT author_id FROM project_posts WHERE id = :post_id;
     -- If author_id == :current_user_id: ABORT transaction with error 'BR-003'
     `
  2. *Database Trigger Guard (Defense-in-Depth):*
     `sql
     CREATE OR REPLACE FUNCTION check_no_self_application() RETURNS TRIGGER AS \$\$
     BEGIN
         IF EXISTS (
             SELECT 1 FROM project_posts 
             WHERE id = NEW.post_id AND author_id = NEW.applicant_id
         ) THEN
             RAISE EXCEPTION 'BR-003: Không thể tự ứng tuyển vào bài đăng của chính mình';
         END IF;
         RETURN NEW;
     END;
     \$\$ LANGUAGE plpgsql;

     CREATE TRIGGER trg_check_no_self_application
     BEFORE INSERT ON project_applications
     FOR EACH ROW EXECUTE FUNCTION check_no_self_application();
     `
  *(Identical cross-table guards enforce study_connections.requester_id != study_requests.author_id and skill_responses.responder_id != skill_listings.author_id).*

---

### 5.4 Single Response Record per Target (BR-004)
- **Business Rule:** A student may create only one response record for a target collaboration listing across its entire lifecycle:
  - **Project Match:** Exactly one application per project post (UNIQUE (post_id, applicant_id)).
  - **Study Buddy:** Exactly one connection request per study request (UNIQUE (request_id, requester_id)).
  - **Skill Exchange:** Exactly one exchange proposal per skill listing (UNIQUE (listing_id, responder_id)).
- **Enforcement Strategy:**
  Declarative Database Unique Constraints:
  `sql
  ALTER TABLE project_applications ADD CONSTRAINT uq_post_applicant UNIQUE (post_id, applicant_id);
  ALTER TABLE study_connections ADD CONSTRAINT uq_request_requester UNIQUE (request_id, requester_id);
  ALTER TABLE skill_responses ADD CONSTRAINT uq_listing_responder UNIQUE (listing_id, responder_id);
  `

---

### 5.5 Chat Authorization & Trusted Write Path (BR-006)
- **Business Rule:** 1-to-1 direct messaging is strictly gated behind an accepted collaboration match across Project Match, Study Buddy, or Skill Exchange.
- **Trusted Write Path & Authorization Architecture:**
  - **Direct INSERT into conversations is NOT an allowed public application path.**
  - Conversation creation MUST occur strictly through the authorized match acceptance transaction/service.
  - The **Trusted Write Path** atomically verifies all of the following preconditions before inserting a record into conversations:
    1. **Source Existence:** The source record exists in the corresponding table (project_applications, study_connections, or skill_responses).
    2. **Status Verification:** Source record status is strictly ACCEPTED.
    3. **Type Consistency:** Source entity type matches the declared match_type.
    4. **Participant Exact Match:** conversations.user_one_id and user_two_id exactly match the two participants involved in the accepted match (post creator + applicant/requester/responder).
    5. **Canonical Ordering:** user_one_id < user_two_id (enforced deterministically).
    6. **Pair Uniqueness:** A conversation thread between these two users does not already exist.
- **Database Layer Safeguards:**
  `sql
  ALTER TABLE conversations ADD CONSTRAINT chk_user_order CHECK (user_one_id < user_two_id);
  ALTER TABLE conversations ADD CONSTRAINT uq_conversation_pair UNIQUE (user_one_id, user_two_id);
  `
- **Polymorphic Reference Boundary Notice:** Standard ANSI SQL foreign keys cannot dynamically point to multiple target tables simultaneously. Therefore, the referential authorization linking match_source_id to match_type is guaranteed by the service transaction layer upon match acceptance.

---

### 5.6 Message Participant Integrity Strategy
- **Invariant:** messages.sender_id MUST be one of the two participants of messages.conversation_id.
- **Architectural Limitation of Standard FK:** The foreign key sender_id REFERENCES users(id) only guarantees that the sender is a valid system user; it does NOT guarantee that the sender belongs to the conversation.
- **Enforcement Strategy:**
  1. *Transactional Verification:* Message sending endpoints query the conversation to verify that current_user_id IN (user_one_id, user_two_id).
  2. *Database Trigger Guard:*
     `sql
     CREATE OR REPLACE FUNCTION check_message_participant() RETURNS TRIGGER AS \$\$
     BEGIN
         IF NOT EXISTS (
             SELECT 1 FROM conversations 
             WHERE id = NEW.conversation_id 
               AND (user_one_id = NEW.sender_id OR user_two_id = NEW.sender_id)
         ) THEN
             RAISE EXCEPTION 'Tin nhắn không hợp lệ: Người gửi không thuộc cuộc trò chuyện này';
         END IF;
         RETURN NEW;
     END;
     \$\$ LANGUAGE plpgsql;

     CREATE TRIGGER trg_check_message_participant
     BEFORE INSERT ON messages
     FOR EACH ROW EXECUTE FUNCTION check_message_participant();
     `

---

### 5.7 Account Suspension & Session Revocation (BR-007)
- **Business Rule:** When an administrator suspends an account, all active user capabilities and login tokens must be immediately revoked.
- **Enforcement Architecture:**
  - users.status lifecycle state transitions to 'SUSPENDED'.
  - Authentication middleware queries status = 'ACTIVE' on every authenticated request. If status is SUSPENDED, access is immediately denied with HTTP 403 Forbidden.

---

### 5.8 Account Deactivation vs Hard Delete Policy
The architecture clearly distinguishes between operational account lifecycle deactivation and permanent hard cascading deletion:

| Lifecycle Action | Database Operation | Data Effect & Cascades | Audit & History Preservation |
|---|---|---|---|
| **Account Deactivation** | UPDATE users SET status = 'DEACTIVATED' | User cannot log in. Active posts transitioned to CLOSED. | **Preserved:** All authored posts, applications, messages, and audit logs remain intact for reporting and historical reference. |
| **Admin Ban** | UPDATE users SET status = 'SUSPENDED' | User blocked from logging in. Sessions revoked. | **Preserved:** Full user history preserved; audit entry created in ccount_moderation_logs. |
| **Hard Delete (GDPR / Purge)** | DELETE FROM users WHERE id = :user_id | **Cascades physically:** student_profiles, project_posts, project_applications, study_requests, study_connections, skill_listings, skill_responses, conversations, messages, and 
otifications are permanently deleted via ON DELETE CASCADE. | **Audit Trail:** ccount_moderation_logs preserves administrator identity via ON DELETE RESTRICT. |

---

### 5.9 Polymorphic Moderation Target Integrity
- **Table:** ccount_moderation_logs (	arget_entity_type, 	arget_entity_id).
- **Integrity Strategy:**
  Standard foreign keys cannot dynamically point to multiple target tables. Entity existence is validated at transaction time based on 	arget_entity_type:
  - 	arget_entity_type = 'USER' $\rightarrow$ Validates 	arget_entity_id exists in users(id).
  - 	arget_entity_type = 'PROJECT_POST' $\rightarrow$ Validates 	arget_entity_id exists in project_posts(id).
  - 	arget_entity_type = 'STUDY_REQUEST' $\rightarrow$ Validates 	arget_entity_id exists in study_requests(id).
  - 	arget_entity_type = 'SKILL_LISTING' $\rightarrow$ Validates 	arget_entity_id exists in skill_listings(id).

---

### 5.10 Master Integrity & Business Rules Matrix (BR-001 to BR-009)

| Rule ID | Invariant Description | Declarative DB Constraint? | Cross-Table? | Enforcement Layer | Failure Behavior / Error |
|:---:|---|:---:|:---:|:---:|---|
| **BR-001** | Profile Completeness prerequisite (Name + 1 Skill + 1 Course) before posting | No (Dynamic query) | Yes | Transactional Query / Service Logic | Rollback listing creation; prompt student to complete profile (SCR-07). |
| **BR-002** | Maximum 5 active (OPEN) listings per user per module | No (Multi-row aggregate) | Yes | Row-locking Transaction (SELECT ... FOR UPDATE on users) | Rollback listing creation; return error: "Vượt quá giới hạn 5 bài đăng hoạt động". |
| **BR-003** | Self-application / self-connection / self-proposal prevention | No (Cross-table compare) | Yes | Transaction Validation + BEFORE INSERT Trigger | Rollback application; return error: "Không thể tự ứng tuyển vào bài đăng của chính mình". |
| **BR-004** | Single response record per target (one application/connection/proposal per post/request/listing) | **Yes** (UNIQUE (post_id, applicant_id)) | No | Declarative Database Constraint | Reject insert; return error: "Bạn đã gửi đơn ứng tuyển cho bài đăng này". |
| **BR-005** | Automated listing closure upon deadline expiration | No (Temporal transition) | No | Scheduled Background Job / Temporal Query Filter | Listing status transitioned from OPEN to EXPIRED. |
| **BR-006** | 1-to-1 chat authorized strictly upon ACCEPTED match | **Yes** (CHECK user_one_id < user_two_id, UNIQUE) | Yes | Database Constraint + Trusted Write Path Transaction | Conversation created strictly upon match acceptance; direct unauthorized insert blocked. |
| **BR-007** | Account suspension instantly revokes session | Partial / No (CHECK status IN (...)) | No | users.status Lifecycle State + Authentication Middleware | Middleware rejects request with 403 Forbidden: "Tài khoản bị tạm khóa". |
| **BR-008** | Verification token expiration after 24 hours | No (TIMESTAMPTZ column only) | No | Verification Service / Timestamp Comparison (erification_expires_at > NOW()) | Reject verification token; prompt user to request fresh link. |
| **BR-009** | Admin listing removal sets status and logs audit | Partial / No (CHECK status IN (...)) | Yes | Authorized Atomic Transaction (UPDATE status + INSERT audit log) | Status updated to REMOVED_BY_ADMIN; audit record inserted into ccount_moderation_logs. |

---

## 6. Relationships, Foreign Keys & Referential Integrity

### 6.1 Referential Integrity Matrix

| Child Table | Foreign Key Column | Referenced Parent Table | On Delete Action | On Update Action | Architectural Rationale |
|---|---|---|:---:|:---:|---|
| student_profiles | user_id | users(id) | **CASCADE** | **CASCADE** | Profile belongs strictly to User. |
| profile_skills | profile_id | student_profiles(id) | **CASCADE** | **CASCADE** | Skills list belongs to profile. |
| profile_skills | skill_id | skills(id) | **RESTRICT** | **CASCADE** | Prevent deleting master skills in active use. |
| profile_courses | profile_id | student_profiles(id) | **CASCADE** | **CASCADE** | Course list belongs to profile. |
| profile_courses | course_id | courses(id) | **RESTRICT** | **CASCADE** | Prevent deleting course catalog items in active use. |
| project_posts | uthor_id | users(id) | **CASCADE** | **CASCADE** | User deletion purges authored vacancy posts. |
| project_post_skills | post_id | project_posts(id) | **CASCADE** | **CASCADE** | Post skill tags deleted with post. |
| project_post_skills | skill_id | skills(id) | **RESTRICT** | **CASCADE** | Master skill preserved. |
| project_applications| post_id | project_posts(id) | **CASCADE** | **CASCADE** | Applications purged if post deleted. |
| project_applications| pplicant_id | users(id) | **CASCADE** | **CASCADE** | Applicant data purged on account deletion. |
| study_requests | uthor_id | users(id) | **CASCADE** | **CASCADE** | Study request purged with author. |
| study_requests | course_id | courses(id) | **RESTRICT** | **CASCADE** | Standard course catalog item preserved. |
| study_connections | equest_id | study_requests(id) | **CASCADE** | **CASCADE** | Connection requests purged with study post. |
| study_connections | equester_id | users(id) | **CASCADE** | **CASCADE** | Peer data purged on account deletion. |
| skill_listings | uthor_id | users(id) | **CASCADE** | **CASCADE** | Listing purged with author account. |
| skill_responses | listing_id | skill_listings(id) | **CASCADE** | **CASCADE** | Proposals purged with skill listing. |
| skill_responses | esponder_id | users(id) | **CASCADE** | **CASCADE** | Responder data purged on account deletion. |
| conversations | user_one_id | users(id) | **CASCADE** | **CASCADE** | Conversation purged if user account removed. |
| conversations | user_two_id | users(id) | **CASCADE** | **CASCADE** | Conversation purged if user account removed. |
| messages | conversation_id | conversations(id) | **CASCADE** | **CASCADE** | Messages belong strictly to conversation thread. |
| messages | sender_id | users(id) | **CASCADE** | **CASCADE** | Purged with thread. |
| 
otifications | ecipient_id | users(id) | **CASCADE** | **CASCADE** | In-app alerts belong to recipient. |
| ccount_moderation_logs| dmin_id | users(id) | **RESTRICT** | **CASCADE** | Audit log preserves administrator actor identity. |

---

## 7. Database Normalization & Integrity Analysis

### 7.1 Normalization Verification (1NF, 2NF, 3NF)

1. **First Normal Form (1NF):**
   - Every column contains atomic values (no delimited skill lists or unnested arrays).
   - Every table possesses a single unique Primary Key (id UUID).
2. **Second Normal Form (2NF):**
   - All non-key attributes are fully functionally dependent on the entire primary key (id).
3. **Third Normal Form (3NF):**
   - No transitive functional dependencies exist. Master catalog descriptions (skills, courses) exist in dedicated tables; student relationships are captured in associative tables (profile_skills, profile_courses, project_post_skills).

---

## 8. Indexing & Query Performance Optimization

### 8.1 Indexing Inventory Strategy

`sql
-- 1. Authentication & User Lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_verification_token ON users(verification_token) WHERE verification_token IS NOT NULL;
CREATE INDEX idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;

-- 2. Student Profile Lookups & Searches
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_major ON student_profiles(major);
CREATE INDEX idx_profile_skills_profile_id ON profile_skills(profile_id);
CREATE INDEX idx_profile_skills_skill_id ON profile_skills(skill_id);
CREATE INDEX idx_profile_courses_profile_id ON profile_courses(profile_id);
CREATE INDEX idx_profile_courses_course_id ON profile_courses(course_id);

-- 3. Project Match Feed & Filter Indexes
CREATE INDEX idx_project_posts_status_created ON project_posts(status, created_at DESC);
CREATE INDEX idx_project_posts_category ON project_posts(category) WHERE status = 'OPEN';
CREATE INDEX idx_project_posts_author ON project_posts(author_id);
CREATE INDEX idx_project_post_skills_post_id ON project_post_skills(post_id);
CREATE INDEX idx_project_post_skills_skill_id ON project_post_skills(skill_id);
CREATE INDEX idx_project_applications_post_id ON project_applications(post_id);
CREATE INDEX idx_project_applications_applicant ON project_applications(applicant_id);
CREATE INDEX idx_project_applications_status ON project_applications(status);

-- 4. Study Buddy Feed & Filter Indexes
CREATE INDEX idx_study_requests_status_created ON study_requests(status, created_at DESC);
CREATE INDEX idx_study_requests_course_id ON study_requests(course_id) WHERE status = 'OPEN';
CREATE INDEX idx_study_requests_study_mode ON study_requests(study_mode) WHERE status = 'OPEN';
CREATE INDEX idx_study_requests_author ON study_requests(author_id);
CREATE INDEX idx_study_connections_request ON study_connections(request_id);
CREATE INDEX idx_study_connections_requester ON study_connections(requester_id);

-- 5. Skill Exchange Feed & Filter Indexes
CREATE INDEX idx_skill_listings_status_created ON skill_listings(status, created_at DESC);
CREATE INDEX idx_skill_listings_type_status ON skill_listings(type, status);
CREATE INDEX idx_skill_listings_author ON skill_listings(author_id);
CREATE INDEX idx_skill_responses_listing ON skill_responses(listing_id);
CREATE INDEX idx_skill_responses_responder ON skill_responses(responder_id);

-- 6. Direct Chat & Messaging Indexes
CREATE INDEX idx_conversations_user_one ON conversations(user_one_id);
CREATE INDEX idx_conversations_user_two ON conversations(user_two_id);
CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_convo_sent ON messages(conversation_id, sent_at ASC);

-- 7. Notifications Indexes
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id, is_read, created_at DESC);

-- 8. Admin Audit Indexes
CREATE INDEX idx_moderation_logs_target ON account_moderation_logs(target_entity_type, target_entity_id);
CREATE INDEX idx_moderation_logs_admin ON account_moderation_logs(admin_id, created_at DESC);
`

---

## 9. Enums, Status State Machines & CHECK Constraints

`mermaid
graph TD
    subgraph User Account States
        U_PENDING["PENDING_VERIFICATION"] -->|Verify Token (BR-008)| U_ACTIVE["ACTIVE"]
        U_ACTIVE -->|Admin Ban (BR-007)| U_SUSPENDED["SUSPENDED"]
        U_SUSPENDED -->|Admin Unban| U_ACTIVE
        U_ACTIVE -->|Deactivate Account| U_DEACT["DEACTIVATED"]
    end

    subgraph Project Post States
        P_OPEN["OPEN"] -->|All Slots Filled| P_FULL["FULL"]
        P_OPEN -->|Owner Close| P_CLOSED["CLOSED"]
        P_OPEN -->|Deadline Passes (BR-005)| P_EXPIRED["EXPIRED"]
        P_OPEN -->|Admin Removal (BR-009)| P_REMOVED["REMOVED_BY_ADMIN"]
        P_FULL -->|Owner Close| P_CLOSED
    end

    subgraph Application States
        A_PENDING["PENDING"] -->|Creator Accept| A_ACCEPTED["ACCEPTED (Authorizes Chat BR-006)"]
        A_PENDING -->|Creator Decline| A_DECLINED["DECLINED"]
        A_PENDING -->|Post Closed / Expired| A_CANCELLED["CANCELLED"]
    end
`

---

## 10. Seed Data & Initial Catalog Strategy

### 10.1 Standard Skills Directory (skills table)
- **Software & Tech:** JavaScript, TypeScript, React, Node.js, Python, Java, C++, SQL, HTML/CSS, Git, Mobile Dev (Flutter/React Native).
- **Design & Media:** Figma, UI/UX Design, Adobe Photoshop, Adobe Illustrator, Canva, Video Editing (Premiere/CapCut).
- **Academic & Soft Skills:** Thuyết trình (Presentation), IELTS Speaking, TOEIC Prep, Viết học thuật (Academic Writing), Quản lý dự án (Agile/Scrum), Xác suất thống kê (Statistics).

### 10.2 Standard University Courses Catalog (courses table)
- INT2204 - Mạng máy tính
- CS101 - Nhập môn lập trình
- CS201 - Cấu trúc dữ liệu và giải thuật
- SE301 - Công nghệ phần mềm
- MTH102 - Giải tích 2
- MTH205 - Xác suất thống kê
- MGT101 - Nhập môn Quản trị kinh doanh
- ENG101 - Tiếng Anh học thuật 1

### 10.3 Default Administrator Account Strategy (users table)
- **Email:** Configured administrative email (e.g., dmin@university.edu.vn).
- **Role:** ADMIN.
- **Status:** ACTIVE.
- **Security & Credential Injection Strategy:**
  - Plaintext credentials MUST NOT be stored in documentation or repository source code.
  - The initial administrator password hash is injected securely during deployment/seeding via environment variable / secret management (SEED_ADMIN_PASSWORD_HASH).
  - Mandatory credential rotation is enforced upon the administrator's initial login.

---

## 11. Database Traceability Matrix

| Physical Table Name | Phase 2 Domain Entity | Phase 1 Requirements Supported | Phase 3 Screen Views Supported | Integrity & Business Rules |
|---|---|---|---|---|
| users | User | FR-AUTH-001 to  06, FR-AUTH-008, FR-ADM-002 | SCR-01 to SCR-05, SCR-23 | Domain CHECK, Unique email, BR-007, BR-008 |
| student_profiles | StudentProfile | FR-PROF-001 to  07, FR-PROF-009 | SCR-06, SCR-07 | 1:1 with User, Dynamic BR-001 check |
| skills | Skill | FR-PROF-003, FR-ADM-010 | SCR-07, SCR-08, SCR-10, SCR-18 | Unique Name |
| profile_skills | ProfileSkill | FR-PROF-003, FR-PROF-004 | SCR-07 | Unique Profile+Skill, Level CHECK |
| courses | Course | FR-PROF-004, FR-SB-001 | SCR-07, SCR-12, SCR-14 | Unique Course Code |
| profile_courses | — | FR-PROF-004 | SCR-07 | Unique Profile+Course |
| project_posts | ProjectPost | FR-PM-001, FR-PM-002, FR-PM-011, FR-PM-014 | SCR-08, SCR-09, SCR-10 | BR-001, BR-002 (Row-lock quota), BR-005 |
| project_post_skills | — | FR-PM-002 | SCR-08, SCR-09, SCR-10 | Unique Post+Skill |
| project_applications| ProjectApplication| FR-PM-006, FR-PM-008, FR-PM-013 | SCR-09, SCR-11 | BR-003 (Self-apply guard), BR-004 (Single response record per target) |
| study_requests | StudyRequest | FR-SB-001, FR-SB-002, FR-SB-009 | SCR-12, SCR-13, SCR-14 | BR-001, BR-002, Course Catalog FK |
| study_connections | StudyConnection | FR-SB-005, FR-SB-007, FR-SB-008 | SCR-13, SCR-15 | BR-003, BR-004 (Single response record per target) |
| skill_listings | SkillListing | FR-SE-001, FR-SE-002, FR-SE-003, FR-SE-013 | SCR-16, SCR-17, SCR-18 | BR-001, BR-002, Type/Level CHECKs |
| skill_responses | SkillResponse | FR-SE-005, FR-SE-007, FR-SE-009, FR-SE-012 | SCR-17, SCR-19 | BR-003, BR-004 (Single response record per target) |
| conversations | Conversation | FR-CHAT-001, FR-CHAT-002, FR-CHAT-005 | SCR-20 | BR-006 (Accepted match gate, trusted write path), CHECK (user_one_id < user_two_id) |
| messages | Message | FR-CHAT-003, FR-CHAT-007 | SCR-20 | Length CHECK (1–1000 chars), Participant trigger guard |
| 
otifications | Notification | FR-NOTIF-001 to  04 | SCR-21 | In-app alerts queue |
| ccount_moderation_logs| — | FR-ADM-003, FR-ADM-005 | SCR-22, SCR-23, SCR-24 | Entity Target Traceability, BR-007, BR-009 |

---

## 12. Approval Sign-Off

> **PHASE 4 STATUS: 🟢 APPROVED**
> This Database Architecture specification is formally approved as the baseline for UniConnect v1.0.
> **Phase 5 — API Specification is 🔓 UNLOCKED.**

| Stakeholder Role | Representative Name | Review Decision | Date | Signature / Note |
|---|---|---|---|---|
| **Project Owner** | Project Owner | ☑ Approved | 2026-08-31 | Formally approved baseline v1.3.1 |
| **Academic Supervisor / Instructor** | Academic Supervisor | ☑ Approved | 2026-08-31 | Verified architecture compliance |
| **Database Architect & Lead Developer** | AI Architect (Antigravity) | ☑ Approved | 2026-08-31 | Schema baseline finalized |

---

*End of 04 — Database Architecture v1.3.1*
*Document Status: APPROVED — Baseline Locked*
*Next Phase: Phase 5 — API Specification (UNLOCKED)*
