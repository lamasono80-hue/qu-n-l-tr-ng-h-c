# 02 — System Analysis
# UniConnect – Student Skill & Collaboration Platform

> **Phase:** 2 — System Analysis
> **Status:** 🔵 REVIEW REQUIRED
> **Approved:** ❌ NOT YET APPROVED
> **Document Version:** 1.2.0 (Final Traceability & Scope Calibrated)
> **Author:** AI Systems Analyst (Antigravity)
> **Approved Baseline:** Phase 1 Requirements v1.2.0 (Approved 2026-08-31)
> **Project Context:** Student Final-Course Project (1–3 Members, AI-Assisted)
> **Created:** 2026-08-31
> **Last Updated:** 2026-08-31

---

## Table of Contents

1. [Executive Summary & Analysis Objectives](#1-executive-summary--analysis-objectives)
2. [System Context & Operational Boundaries](#2-system-context--operational-boundaries)
3. [Actors & Role Modeling](#3-actors--role-modeling)
4. [Use Case Analysis & Specifications](#4-use-case-analysis--specifications)
   - 4.1 Use Case Overview Diagram (22 Use Cases)
   - 4.2 Module UC-AUTH: Authentication & Account Management (4 UCs)
   - 4.3 Module UC-PROF: Student Profile & Skills (2 UCs)
   - 4.4 Module UC-PM: Project Match - Core 1 (5 UCs)
   - 4.5 Module UC-SB: Study Buddy - Core 2 (3 UCs)
   - 4.6 Module UC-SE: Skill Exchange - Core 3 (3 UCs)
   - 4.7 Module UC-CHAT: Basic 1-to-1 Messaging (1 UC)
   - 4.8 Module UC-NOTIF: In-App Notifications (1 UC)
   - 4.9 Module UC-ADM: Minimal Admin Moderation (3 UCs)
5. [Business Process & Activity Modeling](#5-business-process--activity-modeling)
   - 5.1 Project Match End-to-End Activity Workflow
   - 5.2 Study Buddy End-to-End Activity Workflow
   - 5.3 Skill Exchange End-to-End Activity Workflow
   - 5.4 Match-to-Chat Transition Process Flow
   - 5.5 Account Verification & Onboarding Flow
6. [Data Flow Analysis (DFD)](#6-data-flow-analysis-dfd)
   - 6.1 DFD Level 0: Context Diagram
   - 6.2 DFD Level 1: Major Functional Decomposition
7. [Domain Object Modeling (Conceptual Model)](#7-domain-object-modeling-conceptual-model)
   - 7.1 Conceptual Domain Diagram (14 Core Classes)
   - 7.2 Domain Entity Descriptions & Multiplicities
8. [Entity State Machine Analysis](#8-entity-state-machine-analysis)
   - 8.1 User Account State Machine
   - 8.2 Project Match & Application State Machine
   - 8.3 Study Buddy Request & Connection State Machine
   - 8.4 Skill Exchange & Response State Machine
9. [Requirements-to-Analysis Traceability Matrix](#9-requirements-to-analysis-traceability-matrix)
10. [Feasibility & Risk Assessment](#10-feasibility--risk-assessment)
11. [Approval Sign-Off](#11-approval-sign-off)

---

## 1. Executive Summary & Analysis Objectives

### 1.1 Purpose of this Document
This **System Analysis Specification** translates the approved **Phase 1 Requirements (v1.2.0: 46 Must Have, 27 Should Have, 28 Could Have)** into formal analytical models:
- Defining system boundaries, interactions, and data flows (**DFD Level 0 and Level 1**).
- Specifying **22 detailed use cases**, core user journeys, alternate branches, and exception scenarios.
- Modeling core business activity flows and entity state transitions.
- Establishing the conceptual domain object model (**14 core domain classes**) without physical database DDL or network API structures.
- Clarifying analysis depth: **Fully Analyzed Core MVP** vs. **Scope-Acknowledged Post-Core (Portfolio)** vs. **Deferred Stretch (Challenges & Events)**.

### 1.2 Analysis Scope & Constraints
- **Scope Baseline:** UniConnect v1.0 MVP scoped to a **single university institution** for a student final-course project.
- **Core Analyzed Modules:** Authentication, Student Profile & Skills, Project Match, Study Buddy, Skill Exchange, Basic 1-to-1 Chat, In-App Notifications, and Minimal Admin Moderation.
- **Deferred / Post-Core Modules:** Student Portfolio (Should Have), Challenges (Could Have), and Events (Could Have) are acknowledged at the scope boundary; detailed behavioral models for these extensions are deferred until implementation is authorized.
- **Methodology Boundary:** Focuses strictly on *what* the system does from a structural and behavioral perspective. Physical database schemas, DDL, table indexes, and cloud storage choices are deferred to **Phase 4 (Database Architecture)**. Concrete REST endpoints, URL paths, and JSON payloads are deferred to **Phase 5 (API Specification)**. Wireframes and visual mockups belong to **Phase 3 (UI/UX Specification)**.

---

## 2. System Context & Operational Boundaries

UniConnect operates as a standalone web application serving student peers and administrative moderators within an institutional environment.

`mermaid
graph TB
    subgraph External Environment
        StudentActor["🧑 Student (User)"]
        AdminActor["🛡️ Administrator"]
        EmailService["✉️ Institutional Email Gateway"]
    end

    subgraph UniConnect Platform Boundary
        AuthBoundary["Authentication & Access Subsystem"]
        ProfileBoundary["Profile & Skill Subsystem"]
        CoreMatchingBoundary["Core Matching Engine<br/>(Project Match / Study Buddy / Skill Exchange)"]
        ChatBoundary["Direct Messaging Subsystem"]
        NotifBoundary["Notification Subsystem"]
        AdminBoundary["Moderation & Admin Subsystem"]
    end

    StudentActor -->|Register / Login / Reset| AuthBoundary
    StudentActor -->|Manage Bio, Skills, Courses| ProfileBoundary
    StudentActor -->|Post, Search, Apply, Exchange| CoreMatchingBoundary
    StudentActor -->|Direct 1-to-1 Chat| ChatBoundary
    StudentActor -->|View Alerts & History| NotifBoundary

    AdminActor -->|Moderate Users & Content| AdminBoundary
    AdminBoundary -->|Suspend User / Remove Post| CoreMatchingBoundary

    AuthBoundary -->|Dispatch Verification & Reset Tokens| EmailService
    EmailService -->|Deliver Token Link| StudentActor
    CoreMatchingBoundary -->|Trigger Event Alerts| NotifBoundary
    CoreMatchingBoundary -->|Create Chat Context upon Match| ChatBoundary
`

---

## 3. Actors & Role Modeling

### 3.1 Primary Actors

| Actor | Type | Description | Operational Responsibilities |
|---|---|---|---|
| **Student** | Human (Primary) | An authenticated student enrolled in the university with a verified institutional email. | - Manages profile, skills, and enrolled courses.<br/>- Creates and manages Project Match vacancies, Study Buddy requests, and Skill listings.<br/>- Submits applications/connections to peer posts.<br/>- Accepts/declines incoming applications.<br/>- Chats directly with confirmed matching partners.<br/>- Receives in-app notifications. |
| **Administrator** | Human (Secondary) | Designated course instructor or system manager with elevated administrative privileges. | - Monitors platform safety and compliance with community guidelines.<br/>- Views, searches, and filters registered accounts.<br/>- Suspends or bans violating accounts.<br/>- Deletes violating or fraudulent listings.<br/>- Curates platform skill dictionary tags. |
| **Guest / Visitor** | Human (External) | Unauthenticated visitor accessing the platform domain. | - Views the public landing page, mission statement, and login/register prompts.<br/>- Cannot view student personal profiles, member directories, or internal post details without authenticating. |
| **Email Gateway** | System (External) | External SMTP/transactional mail delivery service. | - Receives verification tokens and password-reset messages from the system.<br/>- Delivers transactional emails to student inboxes. |


---

## 4. Use Case Analysis & Specifications

### 4.1 Use Case Overview Diagram (22 Detailed Specifications)

`mermaid
graph LR
    subgraph Student Use Cases (19)
        direction TB
        UC_AUTH01((UC-AUTH-01: Register Account))
        UC_AUTH02((UC-AUTH-02: Verify Email))
        UC_AUTH03((UC-AUTH-03: Login))
        UC_AUTH04((UC-AUTH-04: Reset Password))
        UC_PROF01((UC-PROF-01: Manage Profile & Skills))
        UC_PROF02((UC-PROF-02: View Peer Profile))
        
        UC_PM01((UC-PM-01: Create Project Post))
        UC_PM02((UC-PM-02: Browse & Search Projects))
        UC_PM03((UC-PM-03: Apply to Project))
        UC_PM04((UC-PM-04: Review Applications))
        UC_PM05((UC-PM-05: Close/Delete Project))
        
        UC_SB01((UC-SB-01: Create Study Request))
        UC_SB02((UC-SB-02: Connect with Study Buddy))
        UC_SB03((UC-SB-03: Review Study Connection))
        
        UC_SE01((UC-SE-01: Post Skill Offer/Request))
        UC_SE02((UC-SE-02: Propose Skill Exchange))
        UC_SE03((UC-SE-03: Review Exchange Proposal))
        
        UC_CHAT01((UC-CHAT-01: Direct 1-to-1 Messaging))
        UC_NOTIF01((UC-NOTIF-01: View Notifications))
    end

    subgraph Admin Use Cases (3)
        direction TB
        UC_ADM01((UC-ADM-01: View & Filter Users))
        UC_ADM02((UC-ADM-02: Suspend / Ban User))
        UC_ADM03((UC-ADM-03: Remove Violating Post))
    end

    Student["🧑 Student"] --> UC_AUTH01
    Student --> UC_AUTH02
    Student --> UC_AUTH03
    Student --> UC_AUTH04
    Student --> UC_PROF01
    Student --> UC_PROF02
    Student --> UC_PM01
    Student --> UC_PM02
    Student --> UC_PM03
    Student --> UC_PM04
    Student --> UC_PM05
    Student --> UC_SB01
    Student --> UC_SB02
    Student --> UC_SB03
    Student --> UC_SE01
    Student --> UC_SE02
    Student --> UC_SE03
    Student --> UC_CHAT01
    Student --> UC_NOTIF01

    Admin["🛡️ Admin"] --> UC_AUTH03
    Admin --> UC_ADM01
    Admin --> UC_ADM02
    Admin --> UC_ADM03
`

---

### 4.2 Module UC-AUTH: Authentication & Account Management (4 Use Cases)

#### UC-AUTH-01: Register Student Account
- **Primary Actor:** Student (Unauthenticated)
- **Scope Classification:** Core MVP [Must Have: FR-AUTH-001, FR-AUTH-002, FR-AUTH-003]
- **Preconditions:** Student has access to their university email account.
- **Main Flow:**
  1. Student navigates to the Registration page.
  2. Student enters Full Name, institutional email (e.g., student@university.edu.vn), and creates a password.
  3. System validates that the email matches the allowed university domain and is not already registered.
  4. System hashes the password securely and creates an inactive user account.
  5. System generates a secure verification token and dispatches an activation email via the Email Gateway.
  6. System displays a confirmation screen instructing the student to check their inbox.
- **Alternate / Exception Flows:**
  - *3a. Invalid Email Domain:* System rejects registration with an error message: "Vui lòng sử dụng email trường hợp lệ."
  - *3b. Duplicate Email:* System informs the student that an account with this email already exists [SH / Post-Core: FR-AUTH-008].
- **Postconditions:** Inactive student account created; verification token sent.

#### UC-AUTH-02: Verify Email Account
- **Primary Actor:** Student
- **Scope Classification:** Core MVP [Must Have: FR-AUTH-003]
- **Preconditions:** Inactive account created; verification link received in email.
- **Main Flow:**
  1. Student clicks the verification link containing the token.
  2. System validates the token against the account and checks that it has not expired.
  3. System transitions the account state from PENDING_VERIFICATION to ACTIVE.
  4. System redirects the student to the Login / Onboarding screen with a success message.
- **Alternate Flow:**
  - *2a. Expired / Invalid Token:* System displays an error and provides a button to request a fresh verification link.
- **Postconditions:** Account is ACTIVE and eligible for login and profile completion.

#### UC-AUTH-03: User Login & Session Initiation
- **Primary Actor:** Student / Administrator
- **Scope Classification:** Core MVP [Must Have: FR-AUTH-004, FR-AUTH-006]; Session timeout is [SH / Post-Core: FR-AUTH-007]
- **Preconditions:** Account is ACTIVE and verified.
- **Main Flow:**
  1. User enters registered email and password on the Login page.
  2. System validates credentials against stored secure password hash.
  3. System checks account status (verifies account is not SUSPENDED or BANNED).
  4. System initializes an authenticated session with appropriate role claims (Student or Admin).
  5. System redirects user to the main platform dashboard.
- **Alternate Flows:**
  - *2a. Invalid Credentials:* System displays "Email hoặc mật khẩu không chính xác."
  - *3a. Account Suspended:* System displays account suspension notice with administrator contact.
- **Postconditions:** Authenticated session active.

#### UC-AUTH-04: Password Reset
- **Primary Actor:** Student / Administrator
- **Scope Classification:** Core MVP [Must Have: FR-AUTH-005]
- **Preconditions:** Registered account exists.
- **Main Flow:**
  1. User clicks "Quên mật khẩu" and enters registered institutional email.
  2. System verifies email existence, generates a time-limited reset token, and sends a password-reset email.
  3. User clicks reset link, enters new password, and confirms.
  4. System updates password hash, invalidates the token, and prompts login.
- **Postconditions:** Password updated; user can log in with new credentials.

---

### 4.3 Module UC-PROF: Student Profile & Skills (2 Use Cases)

#### UC-PROF-01: Create & Maintain Profile Details
- **Primary Actor:** Student (Authenticated)
- **Scope Classification:** Core MVP [Must Have: FR-PROF-001, FR-PROF-002, FR-PROF-003, FR-PROF-004] with optional extensions [SH / Post-Core: FR-PROF-005, FR-PROF-006, FR-PROF-007] and [CH / Stretch: FR-PROF-008, FR-PROF-010]
- **Preconditions:** Student is logged in with an active account.
- **Main Flow:**
  1. Student navigates to "Hồ sơ cá nhân" (Profile).
  2. Student enters/updates avatar photo, university campus, faculty/major, year of study (1st, 2nd, 3rd, 4th year), and a short biography.
  3. Student selects skills from the standard skill tag list (or enters custom skills) and assigns proficiency levels: Beginner, Intermediate, or Advanced.
  4. Student enters course codes/names currently or previously enrolled.
  5. [SH / Post-Core] Student may optionally provide external links (GitHub, LinkedIn) or adjust profile visibility.
  6. Student clicks "Lưu thay đổi" (Save).
  7. System validates inputs and updates the student profile.
- **Postconditions:** Profile data saved; Business Rule **BR-001** (Complete profile prerequisite) is satisfied.

#### UC-PROF-02: View Peer Public Profile
- **Primary Actor:** Student (Authenticated)
- **Scope Classification:** Core MVP [Must Have: FR-PROF-009]
- **Preconditions:** Student is logged in and views a post or application from a peer.
- **Main Flow:**
  1. Student clicks on a peer's name or avatar.
  2. System renders the peer's public profile displaying Full Name, Major, Year, Bio, Skills (with proficiency badges), and Courses.
- **Postconditions:** Peer profile presented in read-only view.

---

### 4.4 Module UC-PM: Project Match (5 Use Cases)

#### UC-PM-01: Create Project Match Vacancy Post
- **Primary Actor:** Student (Post Creator)
- **Scope Classification:** Core MVP [Must Have: FR-PM-001, FR-PM-002]; Sub-role breakdown is [CH / Stretch: FR-PM-003]
- **Preconditions:** Student has satisfied **BR-001** (completed profile) and has not exceeded active listing limits (**BR-002**).
- **Main Flow:**
  1. Student clicks "Tạo tin tuyển thành viên" (Create Vacancy).
  2. Student enters: Project Title, Category (Coursework, Hackathon, Research, Personal), Description, Required Skills, Total Members Needed, and Application Deadline.
  3. Student submits the post.
  4. System validates required fields and sets post status to OPEN.
  5. Post appears in the Project Match feed.
- **Alternate Flows:**
  - *1a. Profile Incomplete:* System prompts user to complete Name, at least 1 Skill, and 1 Course before creating a post (**BR-001**).
- **Postconditions:** New project vacancy active in OPEN state.

#### UC-PM-02: Browse, Search, & Filter Project Listings
- **Primary Actor:** Student
- **Scope Classification:** Core MVP [Must Have: FR-PM-004]; Advanced multi-criteria filtering is [SH / Post-Core: FR-PM-005]; Bookmarking is [CH / Stretch: FR-PM-012]
- **Main Flow:**
  1. Student navigates to the Project Match feed.
  2. System displays active listings sorted by most recent.
  3. Student inputs search keyword (title/description) or selects filter tags (Required Skills, Category).
  4. System filters and returns matching listings.
- **Postconditions:** Filtered list presented to student.

#### UC-PM-03: Apply to Project Vacancy
- **Primary Actor:** Student (Applicant)
- **Scope Classification:** Core MVP [Must Have: FR-PM-006, FR-PM-013]; In-app notification alert trigger is [SH / Post-Core: FR-PM-007]
- **Preconditions:** Logged in; post is OPEN; applicant is not the post owner (**BR-003**); no pending duplicate application exists (**BR-004**).
- **Main Flow:**
  1. Applicant views project vacancy details and clicks "Ứng tuyển" (Apply).
  2. Applicant enters an optional short introduction note explaining why they are a good fit.
  3. Applicant submits application.
  4. System creates an application record with status PENDING.
  5. [SH / Post-Core] System triggers an in-app notification to the post creator (**FR-NOTIF-001**).
- **Alternate Flows:**
  - *Self-Application Attempt:* System disables the apply button and shows "Bạn không thể ứng tuyển vào bài đăng của chính mình."
- **Postconditions:** Application created in PENDING state; post creator alerted.

#### UC-PM-04: Review Project Applications (Accept / Decline)
- **Primary Actor:** Student (Post Creator)
- **Scope Classification:** Core MVP [Must Have: FR-PM-008, FR-PM-014]; Notification alert trigger is [SH / Post-Core: FR-PM-009]; Group chat creation is [CH / Stretch: FR-PM-010]
- **Preconditions:** Post has at least one PENDING application.
- **Main Flow:**
  1. Post creator opens application management view for their listing.
  2. Post creator views applicant list, intro notes, and clicks applicant profiles to evaluate skills.
  3. Post creator clicks "Chấp nhận" (Accept) or "Từ chối" (Decline) on an application.
  4. System updates application status to ACCEPTED or DECLINED.
  5. [SH / Post-Core] System triggers an in-app notification to the applicant with the decision.
  6. If accepted, system unlocks 1-to-1 direct messaging between the creator and the accepted applicant.
  7. If total accepted members reaches Total Members Needed, system transitions post status to FULL (**FR-PM-014**).
- **Postconditions:** Application resolved; notifications sent; chat unlocked upon acceptance.

#### UC-PM-05: Close / Delete Project Listing
- **Primary Actor:** Student (Post Creator)
- **Scope Classification:** Core MVP [Must Have: FR-PM-011]
- **Main Flow:**
  1. Post creator clicks "Đóng bài đăng" (Close) or "Xóa bài đăng" (Delete).
  2. System updates post status to CLOSED or removes it.
  3. System automatically updates any remaining PENDING applications to CLOSED.
- **Postconditions:** Post no longer accepts applications and is removed from the active feed.

---

### 4.5 Module UC-SB: Study Buddy (3 Use Cases)

#### UC-SB-01: Create Study Buddy Request
- **Primary Actor:** Student
- **Scope Classification:** Core MVP [Must Have: FR-SB-001, FR-SB-002, FR-SB-009, FR-SB-011]; Visual schedule selector is [CH / Stretch: FR-SB-012]
- **Preconditions:** Profile completed (**BR-001**).
- **Main Flow:**
  1. Student clicks "Tìm bạn học" (Find Study Buddy).
  2. Student enters: Course Name/Code, Specific Topic/Goal, Preferred Study Mode (Online, Offline, Hybrid), General Schedule Availability, and Description.
  3. Student submits request.
  4. System validates fields and publishes study request with status OPEN.
- **Postconditions:** Study request published in active feed.

#### UC-SB-02: Connect with Study Buddy
- **Primary Actor:** Student (Interested Peer)
- **Scope Classification:** Core MVP [Must Have: FR-SB-003, FR-SB-005]; Multi-attribute filtering is [SH / Post-Core: FR-SB-004]; Alert is [SH / Post-Core: FR-SB-006]; Bookmarking is [CH / Stretch: FR-SB-010]
- **Preconditions:** Request is OPEN; user is not the request owner (**BR-003**).
- **Main Flow:**
  1. Student browses Study Buddy feed, filters by Course/Subject, and views request details.
  2. Student clicks "Kết nối học tập" (Connect / Study Together) with an optional message.
  3. System creates a study connection request in PENDING state.
  4. [SH / Post-Core] System dispatches an in-app notification to the request owner.
- **Postconditions:** Connection request pending; owner notified.

#### UC-SB-03: Review Study Connection Request
- **Primary Actor:** Student (Request Owner)
- **Scope Classification:** Core MVP [Must Have: FR-SB-007, FR-SB-008]
- **Main Flow:**
  1. Owner views incoming study connection requests.
  2. Owner clicks "Chấp nhận" (Accept) or "Từ chối" (Decline).
  3. System updates connection status to ACCEPTED or DECLINED.
  4. [SH / Post-Core] System notifies the peer.
  5. If accepted, system unlocks 1-to-1 direct chat between the two study partners.
- **Postconditions:** Match established; direct messaging enabled.

---

### 4.6 Module UC-SE: Skill Exchange (3 Use Cases)

#### UC-SE-01: Create Skill Offer or Skill Request
- **Primary Actor:** Student
- **Scope Classification:** Core MVP [Must Have: FR-SE-001, FR-SE-003, FR-SE-012, FR-SE-013]; Detailed schema attributes are [SH / Post-Core: FR-SE-002, FR-SE-004]
- **Preconditions:** Profile completed (**BR-001**).
- **Main Flow:**
  1. Student selects listing type: **Skill Offer** (Chia sẻ kỹ năng) or **Skill Request** (Cần học kỹ năng).
  2. For Offer: enters Skill Offered, Proficiency Level, Format, Availability, Description.
  3. For Request: enters Skill Wanted, Current Level, Preferred Format, Description.
  4. Student submits listing.
  5. System publishes listing to the unified Skill Exchange feed with status OPEN.
- **Postconditions:** Skill listing active in feed.

#### UC-SE-02: Propose Skill Exchange
- **Primary Actor:** Student (Responding Peer)
- **Scope Classification:** Core MVP [Must Have: FR-SE-005, FR-SE-007]; Advanced filtering is [SH / Post-Core: FR-SE-006]; Alert is [SH / Post-Core: FR-SE-008]
- **Preconditions:** Listing is OPEN; user is not listing owner (**BR-003**).
- **Main Flow:**
  1. Student browses Skill Exchange feed, filters by Offer vs. Request and Skill name.
  2. Student clicks "Đề xuất trao đổi" (Propose Exchange) and writes what they can offer/learn in return.
  3. System creates an exchange response in PENDING state.
  4. [SH / Post-Core] System dispatches in-app notification to the listing owner.
- **Postconditions:** Exchange proposal pending; owner notified.

#### UC-SE-03: Review Exchange Proposal
- **Primary Actor:** Student (Listing Owner)
- **Scope Classification:** Core MVP [Must Have: FR-SE-009]; Post-session rating is [CH / Stretch: FR-SE-010, FR-SE-011]
- **Main Flow:**
  1. Owner reviews incoming exchange proposals.
  2. Owner clicks "Đồng ý trao đổi" (Accept) or "Từ chối" (Decline).
  3. System updates response status to ACCEPTED or DECLINED.
  4. [SH / Post-Core] System notifies the proposing student.
  5. If accepted, system unlocks 1-to-1 direct messaging between the two students.
- **Postconditions:** Exchange confirmed; direct messaging enabled.

---

### 4.7 Module UC-CHAT: Basic 1-to-1 Messaging (1 Use Case)

#### UC-CHAT-01: Direct 1-to-1 Text Messaging
- **Primary Actor:** Student (Matched Collaborator)
- **Scope Classification:** Core MVP [Must Have: FR-CHAT-001, FR-CHAT-002, FR-CHAT-003, FR-CHAT-005]; Text-only constraint is [SH / Post-Core: FR-CHAT-007]; Abuse reporting is [SH / Post-Core: FR-CHAT-008]; Read receipts and group chat are [CH / Stretch: FR-CHAT-004, FR-CHAT-006]
- **Preconditions:** An accepted match exists between the two students in Project Match, Study Buddy, or Skill Exchange (**BR-006**).
- **Main Flow:**
  1. Student navigates to "Tin nhắn" (Messages) and selects a conversation with a matched peer.
  2. System verifies that an active accepted match relationship exists between the participants.
  3. Student types a text message and clicks "Gửi" (Send).
  4. System timestamps, persists, and delivers the message to the conversation thread.
  5. System generates an in-app notification for the recipient if they are not actively viewing the chat window.
- **Alternate Flows:**
  - *Unmatched User Access Attempt:* System blocks chat creation and displays "Chỉ có thể nhắn tin với người dùng đã được kết nối/chấp nhận."
- **Postconditions:** Message persisted; recipient notified.

---

### 4.8 Module UC-NOTIF: In-App Notifications (1 Use Case)

#### UC-NOTIF-01: View Notifications & Alerts
- **Primary Actor:** Student / Admin
- **Scope Classification:** Core MVP [Must Have: FR-NOTIF-001, FR-NOTIF-002, FR-NOTIF-003, FR-NOTIF-004]; Mark all read and email alerts are [CH / Stretch: FR-NOTIF-005, FR-NOTIF-006, FR-NOTIF-007]
- **Main Flow:**
  1. User observes the notification bell icon in the top navigation bar with an unread badge counter.
  2. User clicks the bell icon to open the notification dropdown / history list.
  3. System displays recent notification items (e.g., "Nguyễn Văn A đã ứng tuyển vào dự án của bạn", "Lời mời kết nối học tập được chấp nhận") with timestamps.
  4. User clicks a notification item.
  5. System marks the notification as read and navigates directly to the relevant post or application view.
- **Postconditions:** Notification status updated to read.

---

### 4.9 Module UC-ADM: Minimal Admin Moderation (3 Use Cases)

#### UC-ADM-01: View & Filter Student Accounts
- **Primary Actor:** Administrator (Authenticated)
- **Scope Classification:** Core MVP [Must Have: FR-ADM-001, FR-ADM-002]; Listing inspection is [SH / Post-Core: FR-ADM-004]; Seeding/curation is [SH / Post-Core: FR-ADM-009, FR-ADM-010]
- **Preconditions:** Admin session active.
- **Main Flow:**
  1. Admin opens the Admin Dashboard and selects "Quản lý người dùng" (User Management).
  2. System displays a paginated list of registered students showing Name, Email, Major, Account Status (ACTIVE, PENDING, SUSPENDED).
  3. Admin can search by name or email, and filter by status.
- **Postconditions:** User list displayed with administrative controls.

#### UC-ADM-02: Suspend / Ban User Account
- **Primary Actor:** Administrator
- **Scope Classification:** Core MVP [Must Have: FR-ADM-003]
- **Main Flow:**
  1. Admin locates a violating student account in the user list.
  2. Admin clicks "Khóa tài khoản" (Suspend Account) and provides a reason.
  3. System updates account status to SUSPENDED and terminates all active sessions for that user.
  4. Subsequent login attempts by the suspended user are blocked (**BR-007**).
- **Postconditions:** Account suspended; platform access revoked.

#### UC-ADM-03: Remove Violating Listing
- **Primary Actor:** Administrator
- **Scope Classification:** Core MVP [Must Have: FR-ADM-005]; Report review is [SH / Post-Core: FR-ADM-006]
- **Main Flow:**
  1. Admin reviews platform listings and identifies an inappropriate or spam post.
  2. Admin clicks "Xóa bài đăng" (Remove Listing) and specifies a violation reason.
  3. System removes the listing from the public feed and marks its status as REMOVED_BY_ADMIN.
  4. [SH / Post-Core] System may optionally generate an in-app notification informing the post owner of the removal.
- **Postconditions:** Listing removed from active feeds.


---

## 5. Business Process & Activity Modeling

### 5.1 Project Match End-to-End Activity Workflow

`mermaid
sequenceDiagram
    autonumber
    actor Creator as Post Creator (Student)
    participant Sys as UniConnect System
    actor Applicant as Applicant (Student)
    
    Creator->>Sys: Create Vacancy Post (Title, Skills, Slots, Deadline)
    Sys-->>Sys: Validate profile & slot limits (BR-001, BR-002)
    Sys-->>Sys: Set Post Status = OPEN
    
    Applicant->>Sys: Browse / Filter Project Feed
    Applicant->>Sys: Submit Application (Intro Note)
    Sys-->>Sys: Verify not own post & no duplicate (BR-003, BR-004)
    Sys-->>Sys: Create Application (Status = PENDING)
    opt Notification Trigger [SH / Post-Core]
        Sys->>Creator: Dispatch In-App Notification (FR-NOTIF-001)
    end
    
    Creator->>Sys: Review Applicant Profile & Skills
    alt Creator Accepts Application
        Creator->>Sys: Click Accept
        Sys-->>Sys: Update Application Status = ACCEPTED
        opt Notification Trigger [SH / Post-Core]
            Sys->>Applicant: Dispatch In-App Notification (Accepted)
        end
        Sys-->>Sys: Unlock 1-to-1 Direct Chat Context
        Creator->>Applicant: Start Direct Messaging
        opt Slots Reached
            Sys-->>Sys: Update Post Status = FULL (FR-PM-014)
        end
    else Creator Declines Application
        Creator->>Sys: Click Decline
        Sys-->>Sys: Update Application Status = DECLINED
        opt Notification Trigger [SH / Post-Core]
            Sys->>Applicant: Dispatch In-App Notification (Declined)
        end
    end
`

---

### 5.2 Study Buddy End-to-End Activity Workflow

`mermaid
sequenceDiagram
    autonumber
    actor Requester as Request Creator (Student)
    participant Sys as UniConnect System
    actor Peer as Interested Peer (Student)
    
    Requester->>Sys: Post Study Request (Course, Topic, Mode, Availability)
    Sys-->>Sys: Validate profile & set Status = OPEN (BR-001)
    
    Peer->>Sys: Search Study Requests by Course Code / Topic
    Peer->>Sys: Click 'Connect / Study Together'
    Sys-->>Sys: Create Connection Record (Status = PENDING)
    opt Notification Trigger [SH / Post-Core]
        Sys->>Requester: Dispatch In-App Notification (FR-NOTIF-001)
    end
    
    Requester->>Sys: Review Peer Profile
    alt Requester Accepts
        Requester->>Sys: Click Accept
        Sys-->>Sys: Update Connection Status = ACCEPTED
        opt Notification Trigger [SH / Post-Core]
            Sys->>Peer: Dispatch In-App Notification
        end
        Sys-->>Sys: Unlock 1-to-1 Direct Messaging
        Requester->>Peer: Coordinate Study Session via Chat
    else Requester Declines
        Requester->>Sys: Click Decline
        Sys-->>Sys: Update Connection Status = DECLINED
        opt Notification Trigger [SH / Post-Core]
            Sys->>Peer: Dispatch In-App Notification
        end
    end
`

---

### 5.3 Skill Exchange End-to-End Activity Workflow

`mermaid
sequenceDiagram
    autonumber
    actor Poster as Skill Poster (Student)
    participant Sys as UniConnect System
    actor Responder as Proposing Peer (Student)
    
    Poster->>Sys: Create Skill Listing (Offer or Request)
    Sys-->>Sys: Validate profile & set Status = OPEN (BR-001)
    
    Responder->>Sys: Browse Skill Feed (Filter by Offer/Request & Skill Name)
    Responder->>Sys: Submit Exchange Proposal
    Sys-->>Sys: Create Exchange Response (Status = PENDING)
    opt Notification Trigger [SH / Post-Core]
        Sys->>Poster: Dispatch In-App Notification (FR-NOTIF-001)
    end
    
    Poster->>Sys: Review Exchange Proposal & Peer Skills
    alt Poster Accepts
        Poster->>Sys: Click Accept Exchange
        Sys-->>Sys: Update Exchange Status = ACCEPTED
        opt Notification Trigger [SH / Post-Core]
            Sys->>Responder: Dispatch In-App Notification
        end
        Sys-->>Sys: Unlock 1-to-1 Direct Messaging
        Poster->>Responder: Arrange Skill Tutoring/Exchange via Chat
    else Poster Declines
        Poster->>Sys: Click Decline
        Sys-->>Sys: Update Exchange Status = DECLINED
        opt Notification Trigger [SH / Post-Core]
            Sys->>Responder: Dispatch In-App Notification
        end
    end
`

---

### 5.4 Match-to-Chat Transition Process Flow

Direct messaging is strictly gated behind an approved collaboration state across any of the three core modules.

`mermaid
flowchart TD
    Start([User attempts to send direct message]) --> CheckAuth{Is user authenticated?}
    CheckAuth -- No --> DenyAuth[Redirect to Login]
    CheckAuth -- Yes --> CheckMatch{Is there an ACCEPTED match between users?}
    
    CheckMatch -- "Project Match (Accepted)" --> AllowChat[Open Conversation & Allow Messaging]
    CheckMatch -- "Study Buddy (Accepted)" --> AllowChat
    CheckMatch -- "Skill Exchange (Accepted)" --> AllowChat
    
    CheckMatch -- "No accepted match" --> BlockChat[Block Messaging: 'Only matched collaborators can chat' BR-006]
`

---

### 5.5 Account Verification & Onboarding Flow

`mermaid
flowchart TD
    A[Student fills registration form with university email] --> B{Valid university domain?}
    B -- No --> C[Display error: University email required]
    B -- Yes --> D[Create inactive account with PENDING_VERIFICATION]
    D --> E[Generate secure token & send verification email]
    E --> F[Student clicks link in email]
    F --> G{Token valid & not expired?}
    G -- No --> H[Show error & option to resend token]
    G -- Yes --> I[Update status to ACTIVE]
    I --> J[Prompt student to log in & complete Profile BR-001]
    J --> K[Student enters Name, Skills with levels, and Courses]
    K --> L[Profile complete: Core matching features unlocked]
`

---

## 6. Data Flow Analysis (DFD)

> *Note: Data flows are documented at **Level 0 (Context Diagram)** and **Level 1 (Major Functional Decomposition)**. Deeper Level 2 decompositions are deliberately excluded to avoid artificial documentation overhead for a student course project.*

### 6.1 DFD Level 0: Context Diagram

`mermaid
graph TD
    Student["🧑 Student Entity"]
    Admin["🛡️ Administrator Entity"]
    EmailGW["✉️ Email Delivery Gateway"]
    
    subgraph UniConnect System [UniConnect Platform 0.0]
        CoreApp["UniConnect Application Core"]
    end
    
    Student -->|Registration, Profile, Posts, Applications, Messages| CoreApp
    CoreApp -->|Feed results, Match status, Notifications, Chat history| Student
    
    Admin -->|Moderation commands, Account bans, Listing removal| CoreApp
    CoreApp -->|User directory, System metrics, Flagged posts| Admin
    
    CoreApp -->|Verification tokens, Reset links| EmailGW
    EmailGW -->|Transactional emails| Student
`

---

### 6.2 DFD Level 1: Major Functional Decomposition

`mermaid
graph TD
    subgraph Processes
        P1["1.0 Authentication & Session Management"]
        P2["2.0 Profile & Skill Management"]
        P3["3.0 Project Match Processing"]
        P4["4.0 Study Buddy Processing"]
        P5["5.0 Skill Exchange Processing"]
        P6["6.0 Direct Chat Engine"]
        P7["7.0 Notification Engine"]
        P8["8.0 Admin Moderation"]
    end

    subgraph Conceptual Data Stores
        D1[("D1: User Accounts & Auth")]
        D2[("D2: Student Profiles & Skills")]
        D3[("D3: Project Posts & Applications")]
        D4[("D4: Study Requests & Connections")]
        D5[("D5: Skill Listings & Exchanges")]
        D6[("D6: Chat Conversations & Messages")]
        D7[("D7: In-App Notifications")]
    end

    Student["🧑 Student"] -->|Credentials| P1
    P1 <--> D1
    
    Student -->|Profile Info, Skills, Courses| P2
    P2 <--> D2
    
    Student -->|Project Post / Apply| P3
    P3 <--> D3
    P3 -->|Trigger Alert| P7
    P3 -->|Unlock Match| P6
    
    Student -->|Study Post / Connect| P4
    P4 <--> D4
    P4 -->|Trigger Alert| P7
    P4 -->|Unlock Match| P6
    
    Student -->|Skill Post / Exchange| P5
    P5 <--> D5
    P5 -->|Trigger Alert| P7
    P5 -->|Unlock Match| P6
    
    Student <-->|Send / Read Messages| P6
    P6 <--> D6
    P6 -->|New Msg Alert| P7
    
    P7 <--> D7
    P7 -->|Display Alerts| Student
    
    Admin["🛡️ Admin"] -->|Moderate Users / Posts| P8
    P8 -->|Update Status| D1
    P8 -->|Remove Listing| D3
    P8 -->|Remove Listing| D4
    P8 -->|Remove Listing| D5
`

---

## 7. Domain Object Modeling (Conceptual Model)

> *Note: This conceptual model defines **14 core domain classes** capturing essential business entities and relationships. Physical database implementation decisions (e.g., SQL DDL, UUID generators, physical column types, indexing, and storage engines) are technology-neutral here and deferred to **Phase 4 — Database Architecture**. Domain modeling for Post-Core features (such as Student Portfolio) is deferred.*

### 7.1 Conceptual Domain Model Diagram (14 Core Domain Classes)

`mermaid
classDiagram
    class User {
        +id
        +email
        +passwordHash
        +role
        +status
        +createdAt
    }

    class StudentProfile {
        +id
        +fullName
        +avatarUrl
        +campus
        +major
        +yearOfStudy
        +bio
    }

    class Skill {
        +id
        +skillName
        +category
    }

    class ProfileSkill {
        +proficiencyLevel
    }

    class Course {
        +id
        +courseCode
        +courseName
    }

    class ProjectPost {
        +id
        +title
        +description
        +category
        +totalSlots
        +deadline
        +status
        +createdAt
    }

    class ProjectApplication {
        +id
        +introNote
        +status
        +appliedAt
    }

    class StudyRequest {
        +id
        +courseCode
        +topic
        +studyMode
        +availability
        +description
        +status
        +createdAt
    }

    class StudyConnection {
        +id
        +note
        +status
        +requestedAt
    }

    class SkillListing {
        +id
        +type
        +skillName
        +proficiencyLevel
        +format
        +description
        +status
        +createdAt
    }

    class SkillResponse {
        +id
        +proposalNote
        +status
        +respondedAt
    }

    class Conversation {
        +id
        +matchType
        +createdAt
    }

    class Message {
        +id
        +content
        +sentAt
    }

    class Notification {
        +id
        +type
        +title
        +content
        +isRead
        +createdAt
    }

    User "1" -- "1" StudentProfile : has
    StudentProfile "1" -- "*" ProfileSkill : possesses
    Skill "1" -- "*" ProfileSkill : defined_as
    StudentProfile "*" -- "*" Course : enrolled_in

    User "1" -- "*" ProjectPost : authors
    ProjectPost "1" -- "*" ProjectApplication : receives
    User "1" -- "*" ProjectApplication : submits

    User "1" -- "*" StudyRequest : authors
    StudyRequest "1" -- "*" StudyConnection : receives
    User "1" -- "*" StudyConnection : submits

    User "1" -- "*" SkillListing : authors
    SkillListing "1" -- "*" SkillResponse : receives
    User "1" -- "*" SkillResponse : submits

    User "2" -- "*" Conversation : participates_in
    Conversation "1" -- "*" Message : contains
    User "1" -- "*" Message : sends

    User "1" -- "*" Notification : receives
`

### 7.2 Domain Entity Descriptions & Multiplicities

| # | Domain Entity | Description | Key Relationships & Multiplicity |
|---|---|---|---|
| 1 | **User** | Represents an authenticated actor (Student or Admin). | 1:1 with StudentProfile, 1:N with Posts/Requests/Listings, 1:N with Notifications. |
| 2 | **StudentProfile** | Academic and personal identity attributes of a student. | Contains 1:N ProfileSkill entries and N:M Course associations. |
| 3 | **Skill** | Standardized or custom competency tag. | 1:N with ProfileSkill associative objects. |
| 4 | **ProfileSkill** | Associative entity mapping a Student Profile to a Skill with a self-assessed level (Beginner, Intermediate, Advanced). | Links 1 StudentProfile and 1 Skill. |
| 5 | **Course** | Academic subject identified by code and name. | N:M with StudentProfile. Referenced by StudyRequest. |
| 6 | **ProjectPost** | Vacancy listing recruiting peers for collaborative projects. | 1:N with ProjectApplication. Authored by 1 User. |
| 7 | **ProjectApplication** | Application submitted by an applicant peer with an optional note. | Links 1 applicant User to 1 ProjectPost. |
| 8 | **StudyRequest** | Post seeking peer revision partner for a course/subject. | 1:N with StudyConnection. Authored by 1 User. |
| 9 | **StudyConnection** | Expression of interest from a peer to study together. | Links 1 peer User to 1 StudyRequest. |
| 10 | **SkillListing** | Post offering or requesting peer skill transfer (OFFER or REQUEST). | 1:N with SkillResponse. Authored by 1 User. |
| 11 | **SkillResponse** | Proposal submitted by a peer to engage in a skill exchange. | Links 1 responding User to 1 SkillListing. |
| 12 | **Conversation** | Direct messaging context created strictly between 2 matched users. | Connects exactly 2 User entities; contains 1:N Message items. |
| 13 | **Message** | Single text message sent within an active conversation thread. | Belongs to 1 Conversation; authored by 1 sender User. |
| 14 | **Notification** | In-app alert generated upon collaboration events. | Belongs to 1 recipient User. |

---

## 8. Entity State Machine Analysis

### 8.1 User Account State Machine

`mermaid
stateDiagram-v2
    [*] --> PENDING_VERIFICATION: Register with university email
    PENDING_VERIFICATION --> ACTIVE: Click email verification link
    PENDING_VERIFICATION --> [*]: Token expired (unverified purged)
    ACTIVE --> SUSPENDED: Admin flags policy violation (BR-007)
    SUSPENDED --> ACTIVE: Admin unbans account
    ACTIVE --> DEACTIVATED: User requests account deletion
    DEACTIVATED --> [*]
`

---

### 8.2 Project Match & Application State Machine

`mermaid
stateDiagram-v2
    state ProjectPost {
        [*] --> OPEN: Post created (BR-001 valid)
        OPEN --> FULL: All vacancy slots accepted
        OPEN --> EXPIRED: Deadline passes (BR-005)
        OPEN --> CLOSED: Owner manually closes
        FULL --> CLOSED: Owner manually closes
        OPEN --> REMOVED_BY_ADMIN: Admin removes violation
        FULL --> REMOVED_BY_ADMIN: Admin removes violation
        CLOSED --> [*]
        EXPIRED --> [*]
        REMOVED_BY_ADMIN --> [*]
    }

    state ProjectApplication {
        [*] --> PENDING: Applicant applies with note
        PENDING --> ACCEPTED: Creator clicks Accept (Chat Unlocked)
        PENDING --> DECLINED: Creator clicks Decline
        PENDING --> CANCELLED: Post closed or expired
        ACCEPTED --> [*]
        DECLINED --> [*]
        CANCELLED --> [*]
    }
`

---

### 8.3 Study Buddy Request & Connection State Machine

`mermaid
stateDiagram-v2
    state StudyRequest {
        [*] --> OPEN: Request created
        OPEN --> CLOSED: Owner manually closes
        OPEN --> REMOVED_BY_ADMIN: Admin moderation
        CLOSED --> [*]
        REMOVED_BY_ADMIN --> [*]
    }

    state StudyConnection {
        [*] --> PENDING: Peer connects with note
        PENDING --> ACCEPTED: Owner accepts (Chat Unlocked)
        PENDING --> DECLINED: Owner declines
        PENDING --> CANCELLED: Request closed
        ACCEPTED --> [*]
        DECLINED --> [*]
        CANCELLED --> [*]
    }
`

---

### 8.4 Skill Exchange & Response State Machine

`mermaid
stateDiagram-v2
    state SkillListing {
        [*] --> OPEN: Skill Offer / Request created
        OPEN --> CLOSED: Owner closes
        OPEN --> REMOVED_BY_ADMIN: Admin moderation
        CLOSED --> [*]
        REMOVED_BY_ADMIN --> [*]
    }

    state SkillResponse {
        [*] --> PENDING: Peer proposes exchange
        PENDING --> ACCEPTED: Owner accepts (Chat Unlocked)
        PENDING --> DECLINED: Owner declines
        PENDING --> CANCELLED: Listing closed
        ACCEPTED --> [*]
        DECLINED --> [*]
        CANCELLED --> [*]
    }
`

---

## 9. Requirements-to-Analysis Traceability Matrix

> **Traceability Analysis Depth Legend:**
> - **[A] Fully Analyzed Core MVP:** Mapped to detailed Use Cases, Process Workflows, Domain Entities, and State Machines.
> - **[B] Scope-Acknowledged Post-Core:** Mapped to Use Case optional branches and boundary scope statements; detailed design deferred to feature implementation.
> - **[C] Deferred Stretch Extension:** Scope acknowledged in Section 1.2; detailed behavioral models deferred.

| Approved Requirement (Phase 1 Baseline) | Priority & Scope | Analysis Depth | Valid Phase 2 Analysis Artifacts |
|---|---|:---:|---|
| **FR-AUTH-001 to 006** | Must Have / Yes | **[A]** | UC-AUTH-01, UC-AUTH-02, UC-AUTH-03, UC-AUTH-04, Section 5.5, User entity, Section 8.1 |
| **FR-AUTH-007 to 009** | Should Have / Post-Core | **[B]** | UC-AUTH-01, UC-AUTH-03, Section 8.1 State Machine |
| **FR-PROF-001 to 004, 009** | Must Have / Yes | **[A]** | UC-PROF-01, UC-PROF-02, StudentProfile, ProfileSkill, Course entities |
| **FR-PROF-005 to 007** | Should Have / Post-Core | **[B]** | UC-PROF-01 |
| **FR-PROF-008, 010** | Could Have / Stretch | **[C]** | UC-PROF-01, UC-PROF-02 |
| **FR-PORT-001 to 008** | Should Have & Could Have | **[B / C]** | **POST-CORE / DEFERRED:** Scope acknowledged in Section 1.2; detailed domain modeling deferred until feature build is authorized. |
| **FR-PM-001, 002, 004, 006, 008, 011, 013, 014** | Must Have / Yes | **[A]** | UC-PM-01, UC-PM-02, UC-PM-03, UC-PM-04, UC-PM-05, ProjectPost, ProjectApplication, Section 5.1, Section 8.2 |
| **FR-PM-005, 007, 009** | Should Have / Post-Core | **[B]** | UC-PM-02, UC-PM-03, UC-PM-04, Section 5.1 |
| **FR-PM-003, 010, 012** | Could Have / Stretch | **[C]** | UC-PM-01, UC-PM-02, UC-PM-04 |
| **FR-SB-001, 002, 003, 005, 007, 008, 009, 011** | Must Have / Yes | **[A]** | UC-SB-01, UC-SB-02, UC-SB-03, StudyRequest, StudyConnection, Section 5.2, Section 8.3 |
| **FR-SB-004, 006** | Should Have / Post-Core | **[B]** | UC-SB-02, Section 5.2 |
| **FR-SB-010, 012** | Could Have / Stretch | **[C]** | UC-SB-01, UC-SB-02 |
| **FR-SE-001, 003, 005, 007, 009, 012, 013** | Must Have / Yes | **[A]** | UC-SE-01, UC-SE-02, UC-SE-03, SkillListing, SkillResponse, Section 5.3, Section 8.4 |
| **FR-SE-002, 004, 006, 008** | Should Have / Post-Core | **[B]** | UC-SE-01, UC-SE-02, Section 5.3 |
| **FR-SE-010, 011** | Could Have / Stretch | **[C]** | UC-SE-01, UC-SE-03 |
| **FR-CHAT-001, 002, 003, 005** | Must Have / Yes | **[A]** | UC-CHAT-01, Conversation, Message, Section 5.4 |
| **FR-CHAT-007, 008** | Should Have / Post-Core | **[B]** | UC-CHAT-01 |
| **FR-CHAT-004, 006** | Could Have / Stretch | **[C]** | UC-CHAT-01 |
| **FR-NOTIF-001 to 004** | Must Have / Yes | **[A]** | UC-NOTIF-01, Notification, Section 6.2 DFD Level 1 (P7, D7) |
| **FR-NOTIF-005 to 007** | Could Have / Stretch | **[C]** | UC-NOTIF-01 |
| **FR-CHAL-001 to 005** | Could Have / Stretch | **[C]** | **DEFERRED / STRETCH:** Scope acknowledged in Section 1.2; deferred future extension; not part of core Phase 2 behavioral models. |
| **FR-EVT-001 to 005** | Could Have / Stretch | **[C]** | **DEFERRED / STRETCH:** Scope acknowledged in Section 1.2; deferred future extension; not part of core Phase 2 behavioral models. |
| **FR-ADM-001, 002, 003, 005** | Must Have / Yes | **[A]** | UC-ADM-01, UC-ADM-02, UC-ADM-03, Section 8.1 |
| **FR-ADM-004, 006, 009, 010** | Should Have / Post-Core | **[B]** | UC-ADM-01, UC-ADM-03 |
| **FR-ADM-007, 008** | Could Have / Stretch | **[C]** | UC-ADM-01 |
| **BR-001 to BR-010** | Business Rules | **[A]** | Preconditions and decision diamonds across UC-PM, UC-SB, UC-SE, UC-CHAT, and Section 5 |
| **NFR-PERF, NFR-SEC, NFR-USE, NFR-REL, NFR-MAINT** | NFR Controls | **[A]** | System boundary controls and data flows in Section 2, 5.5, 6.1, 6.2 |

---

## 10. Feasibility & Risk Assessment

### 10.1 Feasibility Evaluation (Student Project Context)

| Feasibility Dimension | Evaluation Rating | Analysis & Justification |
|---|:---:|---|
| **Technical Feasibility** | 🟢 **High** | The system uses standard web application design patterns (CRUD operations, relational domain model, token authentication, and polling/WebSocket messaging). Complex ML infrastructure and native mobile builds have been cleanly scoped out. |
| **Operational Feasibility** | 🟢 **High** | Operating within a single university with email verification provides a simple, self-governing community without external IT dependencies. |
| **Schedule & Effort Feasibility** | 🟢 **High** | With 46 Must Have requirements focused on 3 core matching workflows sharing similar state machine patterns, the project is **feasible with prioritization, phased implementation, and AI-assisted development** for a 1–3 student team. |

### 10.2 Identified Analysis Risks & Mitigations

| Risk ID | Risk Description | Severity | Analytical Mitigation Strategy |
|---|---|:---:|---|
| **RSK-01** | **Cold messaging spam / Harassment** | Medium | Business Rule **BR-006** strictly blocks conversation initialization until mutual match acceptance occurs across Project Match, Study Buddy, or Skill Exchange. |
| **RSK-02** | **Incomplete profile match degradation** | Medium | Business Rule **BR-001** prevents users from publishing listings without verified name, skills, and course data. |
| **RSK-03** | **Stale or abandoned vacancy listings** | Low | System enforces automated post closure when deadlines expire (**BR-005**) or vacancy quotas are reached. |

---

## 11. Approval Sign-Off

> **PHASE 2 STATUS: 🔵 REVIEW REQUIRED**
> This System Analysis document is submitted for formal Project Owner review.
> **Phase 3 — UI/UX Design and all subsequent phases remain 🔒 LOCKED until Phase 2 is formally approved.**

| Stakeholder Role | Representative Name | Review Decision | Date | Signature / Note |
|---|---|---|---|---|
| **Project Owner** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |
| **Academic Supervisor / Instructor** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |
| **Technical Lead (Student Team)** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |

---

*End of 02 — System Analysis v1.2.0*
*Document Status: REVIEW REQUIRED — Awaiting Project Owner Approval*
*Next Phase: Phase 3 — UI/UX Design (LOCKED)*
