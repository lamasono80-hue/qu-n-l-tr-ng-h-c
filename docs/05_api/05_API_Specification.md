# 05 — API Specification
# UniConnect – Student Skill & Collaboration Platform

> **Phase:** 5 — API Specification
> **Status:** 🟢 APPROVED
> **Approved:** 🟢 APPROVED BY PROJECT OWNER (2026-08-31)
> **Document Version:** 1.1.0 (Calibrated & Complete 47-Endpoint Baseline)
> **Author:** AI Solutions Architect (Antigravity)
> **Approved Requirements Baseline:** Phase 1 Requirements v1.2.0 (Approved 2026-08-31)
> **Approved Analysis Baseline:** Phase 2 System Analysis v1.2.0 (Approved 2026-08-31)
> **Approved UI/UX Baseline:** Phase 3 UI/UX Specification v1.1.0 (Approved 2026-08-31)
> **Approved Database Baseline:** Phase 4 Database Architecture v1.3.1 (Approved 2026-08-31)
> **Target Context:** Student Final-Course Project (1–3 Members, AI-Assisted)
> **Architecture Pattern:** RESTful JSON API over HTTPS
> **Base URL:** /api/v1
> **Total Endpoints:** 47 API Endpoints across 8 Modules
> **Created:** 2026-08-31
> **Last Updated:** 2026-08-31

---

## Table of Contents

1. [Executive Summary & Architectural Conventions](#1-executive-summary--architectural-conventions)
   - 1.1 Protocol, Base URL & Content Negotiation
   - 1.2 Global Authentication & Authorization Model
   - 1.3 Standard Response Envelope Structure
   - 1.4 Standard Error Response Structure & Error Codes
   - 1.5 Pagination, Sorting & Filtering Standards
2. [Module 1: Authentication & Account (AUTH - 6 Endpoints)](#2-module-1-authentication--account-auth---6-endpoints)
3. [Module 2: Student Profile & Master Catalog (PROFILE - 7 Endpoints)](#3-module-2-student-profile--master-catalog-profile---7-endpoints)
4. [Module 3: Project Match Collaboration (PROJECT MATCH - 8 Endpoints)](#4-module-3-project-match-collaboration-project-match---8-endpoints)
5. [Module 4: Study Buddy Collaboration (STUDY BUDDY - 7 Endpoints)](#5-module-4-study-buddy-collaboration-study-buddy---7-endpoints)
6. [Module 5: Skill Exchange Collaboration (SKILL EXCHANGE - 7 Endpoints)](#6-module-5-skill-exchange-collaboration-skill-exchange---7-endpoints)
7. [Module 6: Direct Messaging & Chat (CHAT - 3 Endpoints)](#7-module-6-direct-messaging--chat-chat---3-endpoints)
8. [Module 7: In-App Notifications (NOTIFICATIONS - 3 Endpoints)](#8-module-7-in-app-notifications-notifications---3-endpoints)
9. [Module 8: Administration & Moderation (ADMIN - 6 Endpoints)](#9-module-8-administration--moderation-admin---6-endpoints)
10. [Cross-Cutting Security & Business Rule Enforcement](#10-cross-cutting-security--business-rule-enforcement)
11. [Approval Sign-Off](#11-approval-sign-off)

---

## 1. Executive Summary & Architectural Conventions

### 1.1 Protocol, Base URL & Content Negotiation
- **Protocol:** HTTPS / RESTful JSON
- **Base URL Prefix:** /api/v1
- **Request Headers:**
  - Content-Type: application/json
  - Accept: application/json
  - Authorization: Bearer <JWT_TOKEN> (for protected endpoints)

### 1.2 Global Authentication & Authorization Model
- **Authentication:** Stateless Bearer JWT tokens containing userId, ole (STUDENT or ADMIN), and status.
- **Session Revocation Guard (BR-007):** Authentication middleware verifies on every request that the user account status in database is ACTIVE. Accounts with status SUSPENDED or DEACTIVATED receive 403 Forbidden (AUTH_ACCOUNT_SUSPENDED).
- **Role-Based Access Control (RBAC):**
  - **Public:** Registration, login, verification, password recovery, master catalogs search.
  - **Student (Protected):** Profile management, creating listings, submitting applications/connections/proposals, viewing own submitted responses, 1-to-1 messaging, in-app notifications.
  - **Administrator (Admin Only):** System statistics, user status management, listing soft moderation removal, and master catalog administration.

### 1.3 Standard Response Envelope Structure
All successful API responses return HTTP 2xx with the standard envelope:
`json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "total_pages": 5
  }
}
`
*(The meta object is omitted for single-entity responses and included for paginated collections).*

### 1.4 Standard Error Response Structure & Error Codes
All error responses return HTTP 4xx/5xx with the standard error envelope:
`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu gửi lên không hợp lệ",
    "details": [
      {
        "field": "email",
        "issue": "Email phải thuộc tên miền giáo dục (@*.edu.vn)"
      }
    ]
  }
}
`

#### Global Error Code Taxonomy
| HTTP Code | Error Code | Meaning |
|:---:|---|---|
| 400 | VALIDATION_FAILED | Request body or parameters failed schema/format validation |
| 400 | INVALID_INPUT | Semantic error in request payload |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 401 | TOKEN_EXPIRED | JWT token or verification token expired (**BR-008**) |
| 403 | FORBIDDEN | Insufficient permissions for requested action |
| 403 | AUTH_ACCOUNT_SUSPENDED | User account is currently suspended (**BR-007**) |
| 403 | PROFILE_INCOMPLETE | Profile missing Name, Skill, or Course (**BR-001**) |
| 403 | QUOTA_EXCEEDED | Exceeded 5 active listings limit (**BR-002**) |
| 403 | SELF_APPLICATION_BLOCKED | Attempted self-application/proposal (**BR-003**) |
| 404 | NOT_FOUND | Target resource does not exist |
| 409 | CONFLICT | Resource already exists or state conflict |
| 409 | DUPLICATE_SUBMISSION | Duplicate application/connection/proposal (**BR-004**) |
| 500 | INTERNAL_SERVER_ERROR | Unhandled server error |

### 1.5 Pagination, Sorting & Filtering Standards
- **Page query param:** page=1 (Default: 1, 1-indexed)
- **Limit query param:** limit=10 (Default: 10, Maximum: 50)
- **Sort query param:** sort=created_at and order=desc (Default: newest first)
- **My Listings Filter param (is_mine):** Standardized boolean filter across feeds:
  - is_mine=false (Default): Returns listings from all eligible university students.
  - is_mine=true: Returns only listings authored by the authenticated student (supports SCR-08, SCR-12, SCR-16).


---

## 2. Module 1: Authentication & Account (AUTH - 6 Endpoints)

---

### API-AUTH-01: Register Student Account
- **HTTP Method:** POST
- **Path:** /api/v1/auth/register
- **Purpose:** Registers a new student account using institutional email and dispatches verification token.
- **Auth Requirement:** None (Public)
- **Traceability:** UC-AUTH-01, FR-AUTH-001, FR-AUTH-002, FR-AUTH-003, SCR-01, users table
- **Validation Rules:**
  - email: String, required, format email, must end with configured educational domain (.edu.vn).
  - password: String, required, 8–100 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char (NFR-SEC-001).
  - ull_name: String, required, 2–100 chars.
- **Business Rules:** DR-04, DR-05, BR-008 (Token 24h lifespan). Initial user status is PENDING_VERIFICATION.
- **Request Body:**
  `json
  {
    "email": "student1@university.edu.vn",
    "password": "Password123@",
    "full_name": "Nguyễn Văn A"
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
    "data": {
      "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "student1@university.edu.vn",
      "status": "PENDING_VERIFICATION"
    }
  }
  `
- **Error Responses:**
  - 400 Bad Request (VALIDATION_FAILED): "Email phải thuộc tên miền giáo dục hợp lệ (@*.edu.vn)"
  - 409 Conflict (EMAIL_ALREADY_EXISTS): "Email này đã được đăng ký trong hệ thống"

---

### API-AUTH-02: Verify Email Address
- **HTTP Method:** POST
- **Path:** /api/v1/auth/verify-email
- **Purpose:** Confirms email ownership via security token and activates the student account.
- **Auth Requirement:** None (Public)
- **Traceability:** UC-AUTH-02, FR-AUTH-003, SCR-03, users table, BR-008
- **Request Body:**
  `json
  {
    "token": "a1b2c3d4e5f67890abcdef1234567890"
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.",
    "data": {
      "email": "student1@university.edu.vn",
      "status": "ACTIVE"
    }
  }
  `
- **Error Responses:**
  - 400 Bad Request (INVALID_TOKEN): "Mã xác thực không hợp lệ hoặc không tồn tại"
  - 401 Unauthorized (TOKEN_EXPIRED): "Mã xác thực đã hết hạn sau 24 giờ. Vui lòng yêu cầu mã mới." (**BR-008**)

---

### API-AUTH-03: Resend Email Verification Token
- **HTTP Method:** POST
- **Path:** /api/v1/auth/resend-verification
- **Purpose:** Generates a new 24-hour verification token for an unverified account.
- **Auth Requirement:** None (Public)
- **Traceability:** UC-AUTH-02, FR-AUTH-003, SCR-03, users table, BR-008
- **Request Body:**
  `json
  {
    "email": "student1@university.edu.vn"
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Mã xác thực mới đã được gửi tới email của bạn."
  }
  `
- **Error Responses:**
  - 400 Bad Request (ACCOUNT_ALREADY_VERIFIED): "Tài khoản này đã được xác thực trước đó"
  - 404 Not Found (USER_NOT_FOUND): "Không tìm thấy tài khoản với email đã cung cấp"

---

### API-AUTH-04: User Login
- **HTTP Method:** POST
- **Path:** /api/v1/auth/login
- **Purpose:** Authenticates student or administrator credentials and returns JWT bearer access token.
- **Auth Requirement:** None (Public)
- **Traceability:** UC-AUTH-03, FR-AUTH-004, SCR-04, users table, BR-007
- **Request Body:**
  `json
  {
    "email": "student1@university.edu.vn",
    "password": "Password123@"
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expires_in": 86400,
      "user": {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "email": "student1@university.edu.vn",
        "role": "STUDENT",
        "status": "ACTIVE"
      }
    }
  }
  `
- **Error Responses:**
  - 401 Unauthorized (INVALID_CREDENTIALS): "Email hoặc mật khẩu không chính xác"
  - 403 Forbidden (ACCOUNT_NOT_VERIFIED): "Tài khoản chưa xác thực email. Vui lòng kiểm tra hộp thư."
  - 403 Forbidden (AUTH_ACCOUNT_SUSPENDED): "Tài khoản của bạn đã bị khóa bởi Quản trị viên." (**BR-007**)

---

### API-AUTH-05: Request Password Reset Link
- **HTTP Method:** POST
- **Path:** /api/v1/auth/forgot-password
- **Purpose:** Requests a 1-hour password reset token dispatched via email.
- **Auth Requirement:** None (Public)
- **Traceability:** UC-AUTH-04, FR-AUTH-005, SCR-05, users table
- **Request Body:**
  `json
  {
    "email": "student1@university.edu.vn"
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đi."
  }
  `

---

### API-AUTH-06: Reset Password with Token
- **HTTP Method:** POST
- **Path:** /api/v1/auth/reset-password
- **Purpose:** Updates account password using verified reset token.
- **Auth Requirement:** None (Public)
- **Traceability:** UC-AUTH-04, FR-AUTH-006, SCR-05, users table
- **Request Body:**
  `json
  {
    "token": "reset_token_hex_string_12345",
    "new_password": "NewSecurePassword123@"
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới."
  }
  `
- **Error Responses:**
  - 400 Bad Request (TOKEN_EXPIRED_OR_INVALID): "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (1 giờ)."

---

## 3. Module 2: Student Profile & Master Catalog (PROFILE - 7 Endpoints)

---

### API-PROF-01: Get Current User Profile & Completeness Status
- **HTTP Method:** GET
- **Path:** /api/v1/profiles/me
- **Purpose:** Retrieves authenticated student's full profile details along with dynamic profile completeness flag.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-PROF-01, FR-PROF-001 to  07, SCR-06, student_profiles, profile_skills, profile_courses, BR-001
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": {
      "id": "11111111-2222-3333-4444-555555555555",
      "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "student1@university.edu.vn",
      "full_name": "Nguyễn Văn A",
      "avatar_url": "https://example.edu.vn/avatar.jpg",
      "campus": "Cơ sở 1 - Hà Nội",
      "major": "Công nghệ thông tin",
      "year_of_study": 3,
      "bio": "Sinh viên năm 3 đam mê lập trình web và trí tuệ nhân tạo.",
      "github_url": "https://github.com/student1",
      "linkedin_url": "https://linkedin.com/in/student1",
      "is_profile_complete": true,
      "skills": [
        {
          "skill_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          "name": "React",
          "proficiency_level": "INTERMEDIATE"
        }
      ],
      "courses": [
        {
          "course_id": "ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj",
          "course_code": "CS201",
          "course_name": "Cấu trúc dữ liệu và giải thuật"
        }
      ]
    }
  }
  `

---

### API-PROF-02: Update Personal Profile Metadata
- **HTTP Method:** PUT
- **Path:** /api/v1/profiles/me
- **Purpose:** Updates personal details, campus, major, year, bio, and external links.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-PROF-02, FR-PROF-002, FR-PROF-009, SCR-07, student_profiles
- **Request Body:**
  `json
  {
    "full_name": "Nguyễn Văn A",
    "avatar_url": "https://example.edu.vn/avatar2.jpg",
    "campus": "Cơ sở 1 - Hà Nội",
    "major": "Khoa học máy tính",
    "year_of_study": 3,
    "bio": "Sinh viên năm 3 đam mê công nghệ phần mềm.",
    "github_url": "https://github.com/nguyenvana",
    "linkedin_url": "https://linkedin.com/in/nguyenvana"
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Cập nhật hồ sơ thành công",
    "data": {
      "full_name": "Nguyễn Văn A",
      "major": "Khoa học máy tính",
      "updated_at": "2026-08-31T13:30:00Z"
    }
  }
  `

---

### API-PROF-03: View Public Student Profile
- **HTTP Method:** GET
- **Path:** /api/v1/profiles/:userId
- **Purpose:** Retrieves public profile, declared skills, and courses of another student.
- **Auth Requirement:** Bearer JWT (STUDENT or ADMIN)
- **Traceability:** UC-PROF-01, FR-PROF-008, SCR-06, student_profiles
- **Path Parameter:** userId (UUID, required)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": {
      "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "full_name": "Nguyễn Văn A",
      "avatar_url": "https://example.edu.vn/avatar.jpg",
      "campus": "Cơ sở 1 - Hà Nội",
      "major": "Khoa học máy tính",
      "year_of_study": 3,
      "bio": "Sinh viên năm 3 đam mê lập trình.",
      "github_url": "https://github.com/nguyenvana",
      "linkedin_url": "https://linkedin.com/in/nguyenvana",
      "skills": [
        { "name": "React", "proficiency_level": "INTERMEDIATE" }
      ],
      "courses": [
        { "course_code": "CS201", "course_name": "Cấu trúc dữ liệu và giải thuật" }
      ]
    }
  }
  `
- **Error Responses:**
  - 404 Not Found (PROFILE_NOT_FOUND): "Không tìm thấy hồ sơ sinh viên"

---

### API-PROF-04: Update Student Skills Portfolio
- **HTTP Method:** PUT
- **Path:** /api/v1/profiles/me/skills
- **Purpose:** Synchronizes the student's declared skills and proficiency levels.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-PROF-02, FR-PROF-003, SCR-07, profile_skills, skills
- **Request Body:**
  `json
  {
    "skills": [
      {
        "skill_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        "proficiency_level": "INTERMEDIATE"
      },
      {
        "skill_id": "11111111-2222-3333-4444-555555555555",
        "proficiency_level": "ADVANCED"
      }
    ]
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Cập nhật danh sách kỹ năng thành công",
    "data": {
      "total_skills": 2
    }
  }
  `

---

### API-PROF-05: Update Student Enrolled Courses
- **HTTP Method:** PUT
- **Path:** /api/v1/profiles/me/courses
- **Purpose:** Synchronizes the student's enrolled or completed courses.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-PROF-02, FR-PROF-004, SCR-07, profile_courses, courses
- **Request Body:**
  `json
  {
    "course_ids": [
      "ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj",
      "22222222-3333-4444-5555-666666666666"
    ]
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Cập nhật danh sách môn học thành công",
    "data": {
      "total_courses": 2
    }
  }
  `

---

### API-PROF-06: Search Master Skills Dictionary
- **HTTP Method:** GET
- **Path:** /api/v1/skills
- **Purpose:** Retrieves standardized skill tags with category filtering and keyword autocomplete.
- **Auth Requirement:** Bearer JWT (STUDENT or ADMIN)
- **Traceability:** FR-PROF-003, FR-ADM-010, SCR-07, SCR-10, skills table
- **Query Parameters:**
  - q (String, optional): Search keyword
  - category (String, optional): Category filter (TECH, DESIGN, LANGUAGE, ACADEMIC)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        "name": "React",
        "category": "TECH",
        "is_system_standard": true
      }
    ]
  }
  `

---

### API-PROF-07: Search Master Courses Catalog
- **HTTP Method:** GET
- **Path:** /api/v1/courses
- **Purpose:** Retrieves standardized course codes and subjects for autocomplete.
- **Auth Requirement:** Bearer JWT (STUDENT or ADMIN)
- **Traceability:** FR-PROF-004, FR-SB-001, SCR-07, SCR-14, courses table
- **Query Parameters:**
  - q (String, optional): Search keyword across course code or name
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj",
        "course_code": "CS201",
        "course_name": "Cấu trúc dữ liệu và giải thuật"
      }
    ]
  }
  `


---

## 4. Module 3: Project Match Collaboration (PROJECT MATCH - 8 Endpoints)

---

### API-PM-01: List & Filter Project Vacancies
- **HTTP Method:** GET
- **Path:** /api/v1/projects
- **Purpose:** Retrieves paginated project vacancy listings with multi-attribute filtering, category search, and "My Listings" support.
- **Auth Requirement:** Bearer JWT (STUDENT or ADMIN)
- **Traceability:** UC-PM-01, FR-PM-001, FR-PM-003, FR-PM-005, SCR-08, project_posts, project_post_skills, skills
- **Query Parameters:**
  - page (Integer, default: 1)
  - limit (Integer, default: 10)
  - category (Enum: COURSEWORK, HACKATHON, RESEARCH, PERSONAL, optional)
  - skill_id (UUID, optional)
  - status (Enum: OPEN, FULL, CLOSED, default: OPEN)
  - is_mine (Boolean, default: alse): If 	rue, filters only posts authored by the authenticated student (**SCR-08** "Bài của tôi").
  - search (String, optional): Search keyword in title or description
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "33333333-4444-5555-6666-777777777777",
        "title": "Tuyển Frontend Dev dự án Khóa luận Tốt nghiệp",
        "description": "Cần 1 bạn thành thạo React và TailwindCSS xây dựng giao diện...",
        "category": "COURSEWORK",
        "total_slots": 2,
        "accepted_slots": 1,
        "deadline": "2026-09-15",
        "status": "OPEN",
        "author": {
          "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "full_name": "Nguyễn Văn A",
          "major": "Công nghệ thông tin",
          "avatar_url": "https://example.edu.vn/avatar.jpg"
        },
        "required_skills": [
          { "skill_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", "name": "React" }
        ],
        "created_at": "2026-08-31T10:00:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  }
  `

---

### API-PM-02: Get Project Vacancy Details
- **HTTP Method:** GET
- **Path:** /api/v1/projects/:id
- **Purpose:** Retrieves full detailed view of a single project vacancy post.
- **Auth Requirement:** Bearer JWT (STUDENT or ADMIN)
- **Traceability:** UC-PM-02, FR-PM-002, SCR-09, project_posts
- **Path Parameter:** id (UUID, required)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": {
      "id": "33333333-4444-5555-6666-777777777777",
      "title": "Tuyển Frontend Dev dự án Khóa luận Tốt nghiệp",
      "description": "Cần 1 bạn thành thạo React và TailwindCSS...",
      "category": "COURSEWORK",
      "total_slots": 2,
      "accepted_slots": 1,
      "deadline": "2026-09-15",
      "status": "OPEN",
      "author": {
        "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "full_name": "Nguyễn Văn A",
        "major": "Công nghệ thông tin",
        "avatar_url": "https://example.edu.vn/avatar.jpg"
      },
      "required_skills": [
        { "skill_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", "name": "React" }
      ],
      "is_author": false,
      "has_applied": false,
      "created_at": "2026-08-31T10:00:00Z"
    }
  }
  `

---

### API-PM-03: Create Project Vacancy Post
- **HTTP Method:** POST
- **Path:** /api/v1/projects
- **Purpose:** Publishes a new project recruitment post.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-PM-03, FR-PM-004, SCR-10, project_posts, project_post_skills, BR-001, BR-002
- **Validation Rules:**
  - 	itle: String, 10–150 chars.
  - description: String, 20–2000 chars.
  - category: Enum (COURSEWORK, HACKATHON, RESEARCH, PERSONAL).
  - 	otal_slots: Integer, 1–10.
  - deadline: Date string (YYYY-MM-DD), must be in the future.
  - skill_ids: Array of UUIDs, 1–10 skills.
- **Business Rules:**
  - **BR-001:** Author must have completed profile (Name + 1 Skill + 1 Course).
  - **BR-002:** Author cannot have $\ge 5$ active (OPEN) project posts (enforced via row-locking transaction).
- **Request Body:**
  `json
  {
    "title": "Tuyển Mobile Dev làm app Flutter thi Hackathon",
    "description": "Nhóm 3 người đang cần 1 bạn chuyên Flutter để xây dựng MVP thi đấu...",
    "category": "HACKATHON",
    "total_slots": 1,
    "deadline": "2026-09-20",
    "skill_ids": [
      "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    ]
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Đăng tin tuyển thành viên dự án thành công",
    "data": {
      "id": "44444444-5555-6666-7777-888888888888",
      "status": "OPEN",
      "created_at": "2026-08-31T13:35:00Z"
    }
  }
  `
- **Error Responses:**
  - 403 Forbidden (PROFILE_INCOMPLETE): "Bạn cần hoàn thiện hồ sơ (Họ tên, 1 kỹ năng, 1 môn học) trước khi đăng tin." (**BR-001**)
  - 403 Forbidden (QUOTA_EXCEEDED): "Bạn đã đạt giới hạn tối đa 5 bài đăng hoạt động trong mục Dự án." (**BR-002**)

---

### API-PM-04: Close Project Vacancy Post
- **HTTP Method:** PATCH
- **Path:** /api/v1/projects/:id/close
- **Purpose:** Post creator manually closes recruitment vacancy.
- **Auth Requirement:** Bearer JWT (Post Creator only)
- **Traceability:** UC-PM-03, FR-PM-011, SCR-09, project_posts
- **Path Parameter:** id (UUID, required)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đã đóng bài đăng tuyển dụng thành công",
    "data": {
      "id": "44444444-5555-6666-7777-888888888888",
      "status": "CLOSED"
    }
  }
  `
- **Error Responses:**
  - 403 Forbidden (NOT_POST_AUTHOR): "Chỉ người tạo bài đăng mới có quyền đóng bài viết này."

---

### API-PM-05: Submit Project Application
- **HTTP Method:** POST
- **Path:** /api/v1/projects/:id/apply
- **Purpose:** Candidate student submits application to join project team.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-PM-04, FR-PM-006, FR-PM-013, SCR-09, project_applications, 
otifications, BR-003, BR-004
- **Validation Rules:**
  - intro_note: String, optional, max 500 chars.
- **Business Rules:**
  - **BR-003:** Cannot apply to own project post.
  - **BR-004:** Single response record per target (cannot submit multiple applications to same post).
- **Request Body:**
  `json
  {
    "intro_note": "Chào bạn, mình có kinh nghiệm 1 năm Flutter và từng làm 2 dự án tương tự."
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Gửi đơn ứng tuyển thành công",
    "data": {
      "application_id": "55555555-6666-7777-8888-999999999999",
      "status": "PENDING",
      "applied_at": "2026-08-31T13:40:00Z"
    }
  }
  `
- **Error Responses:**
  - 403 Forbidden (SELF_APPLICATION_BLOCKED): "Không thể tự ứng tuyển vào bài đăng của chính mình." (**BR-003**)
  - 409 Conflict (DUPLICATE_SUBMISSION): "Bạn đã gửi đơn ứng tuyển cho bài đăng này." (**BR-004**)

---

### API-PM-06: List Received Applications for Project Post
- **HTTP Method:** GET
- **Path:** /api/v1/projects/:id/applications
- **Purpose:** Post creator views received candidate applications submitted to their post.
- **Auth Requirement:** Bearer JWT (Post Creator only)
- **Traceability:** UC-PM-05, FR-PM-007, SCR-11, project_applications, student_profiles
- **Path Parameter:** id (UUID, required)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "55555555-6666-7777-8888-999999999999",
        "status": "PENDING",
        "intro_note": "Chào bạn, mình có kinh nghiệm 1 năm Flutter...",
        "applied_at": "2026-08-31T13:40:00Z",
        "applicant": {
          "user_id": "88888888-9999-0000-1111-222222222222",
          "full_name": "Trần Thị B",
          "major": "Khoa học máy tính",
          "avatar_url": "https://example.edu.vn/avatar_b.jpg",
          "skills": [
            { "name": "Flutter", "proficiency_level": "INTERMEDIATE" }
          ]
        }
      }
    ]
  }
  `

---

### API-PM-07: Resolve Project Application (Accept / Decline)
- **HTTP Method:** PATCH
- **Path:** /api/v1/projects/applications/:applicationId
- **Purpose:** Post creator accepts or declines a candidate application.
- **Auth Requirement:** Bearer JWT (Post Creator only)
- **Traceability:** UC-PM-05, FR-PM-008, FR-PM-010, FR-PM-012, SCR-11, project_applications, project_posts, conversations, 
otifications, BR-006
- **Business Rules:**
  - **BR-006:** Accepting application atomically increments ccepted_slots, marks post FULL if ccepted_slots == total_slots, authorizes and creates direct 1-to-1 conversation via Trusted Write Path, and dispatches in-app alert.
- **Request Body:**
  `json
  {
    "action": "ACCEPT"
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đã chấp nhận đơn ứng tuyển và mở kênh trò chuyện trực tiếp.",
    "data": {
      "application_id": "55555555-6666-7777-8888-999999999999",
      "status": "ACCEPTED",
      "conversation_id": "77777777-8888-9999-0000-111111111111"
    }
  }
  `

---

### API-PM-08: List Student's Own Submitted Project Applications
- **HTTP Method:** GET
- **Path:** /api/v1/projects/applications/me
- **Purpose:** Retrieves paginated history of applications submitted by the current student with status tracking.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-PM-04, FR-PM-009, SCR-11, project_applications, project_posts, student_profiles
- **Query Parameters:**
  - page (Integer, default: 1)
  - limit (Integer, default: 10)
  - status (Enum: PENDING, ACCEPTED, DECLINED, CANCELLED, optional)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "55555555-6666-7777-8888-999999999999",
        "status": "PENDING",
        "intro_note": "Chào bạn, mình có kinh nghiệm 1 năm Flutter...",
        "applied_at": "2026-08-31T13:40:00Z",
        "resolved_at": null,
        "project": {
          "id": "33333333-4444-5555-6666-777777777777",
          "title": "Tuyển Frontend Dev dự án Khóa luận Tốt nghiệp",
          "category": "COURSEWORK",
          "author_name": "Nguyễn Văn A"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  }
  `

---

## 5. Module 4: Study Buddy Collaboration (STUDY BUDDY - 7 Endpoints)

---

### API-SB-01: List & Filter Study Requests
- **HTTP Method:** GET
- **Path:** /api/v1/study-requests
- **Purpose:** Retrieves active study buddy search requests with course, mode, and "My Listings" filtering.
- **Auth Requirement:** Bearer JWT (STUDENT or ADMIN)
- **Traceability:** UC-SB-01, FR-SB-001, FR-SB-004, SCR-12, study_requests, courses
- **Query Parameters:**
  - course_id (UUID, optional)
  - study_mode (Enum: ONLINE, OFFLINE, HYBRID, optional)
  - status (Enum: OPEN, CLOSED, default: OPEN)
  - is_mine (Boolean, default: alse): If 	rue, filters only study requests authored by authenticated user (**SCR-12** "Bài của tôi").
  - page (Integer, default: 1)
  - limit (Integer, default: 10)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "66666666-7777-8888-9999-000000000000",
        "topic": "Ôn tập giải đề giữa kỳ môn Cấu trúc dữ liệu",
        "course": {
          "course_id": "ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj",
          "course_code": "CS201",
          "course_name": "Cấu trúc dữ liệu và giải thuật"
        },
        "study_mode": "HYBRID",
        "availability": "Tối thứ 3 và thứ 5 hàng tuần",
        "description": "Cần tìm bạn học cùng để giải bài tập cây nhị phân...",
        "status": "OPEN",
        "author": {
          "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "full_name": "Nguyễn Văn A",
          "avatar_url": "https://example.edu.vn/avatar.jpg"
        },
        "created_at": "2026-08-31T11:00:00Z"
      }
    ]
  }
  `

---

### API-SB-02: Get Study Request Details
- **HTTP Method:** GET
- **Path:** /api/v1/study-requests/:id
- **Purpose:** Retrieves detail of a single study buddy request.
- **Auth Requirement:** Bearer JWT (STUDENT or ADMIN)
- **Traceability:** UC-SB-01, FR-SB-002, SCR-13, study_requests
- **Path Parameter:** id (UUID, required)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": {
      "id": "66666666-7777-8888-9999-000000000000",
      "topic": "Ôn tập giải đề giữa kỳ môn Cấu trúc dữ liệu",
      "course": {
        "course_id": "ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj",
        "course_code": "CS201",
        "course_name": "Cấu trúc dữ liệu và giải thuật"
      },
      "study_mode": "HYBRID",
      "availability": "Tối thứ 3 và thứ 5 hàng tuần",
      "description": "Cần tìm bạn học cùng...",
      "status": "OPEN",
      "author": {
        "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "full_name": "Nguyễn Văn A"
      },
      "is_author": false,
      "has_connected": false
    }
  }
  `

---

### API-SB-03: Create Study Buddy Request
- **HTTP Method:** POST
- **Path:** /api/v1/study-requests
- **Purpose:** Publishes a new study partner search request.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-SB-02, FR-SB-003, SCR-14, study_requests, BR-001, BR-002
- **Validation Rules:**
  - course_id: UUID, required, must exist in courses catalog.
  - 	opic: String, 5–100 chars.
  - study_mode: Enum (ONLINE, OFFLINE, HYBRID).
  - vailability: String, required, max 200 chars.
  - description: String, optional, max 1000 chars.
- **Business Rules:** BR-001 (Profile completeness check), BR-002 (Max 5 active posts).
- **Request Body:**
  `json
  {
    "course_id": "ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj",
    "topic": "Ôn thi cuối kỳ Giải tích 2",
    "study_mode": "ONLINE",
    "availability": "Cuối tuần (Thứ 7, CN)",
    "description": "Cần tìm bạn cùng luyện đề thi các năm trước."
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Đăng yêu cầu tìm bạn học thành công",
    "data": {
      "id": "77777777-8888-9999-0000-222222222222",
      "status": "OPEN"
    }
  }
  `

---

### API-SB-04: Close Study Buddy Request
- **HTTP Method:** PATCH
- **Path:** /api/v1/study-requests/:id/close
- **Purpose:** Post creator closes study partner search.
- **Auth Requirement:** Bearer JWT (Request Creator only)
- **Traceability:** UC-SB-02, FR-SB-009, SCR-13, study_requests
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đã đóng bài tìm bạn học thành công"
  }
  `

---

### API-SB-05: Send Study Connection Request
- **HTTP Method:** POST
- **Path:** /api/v1/study-requests/:id/connect
- **Purpose:** Peer student requests to connect for studying.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-SB-03, FR-SB-005, SCR-13, study_connections, 
otifications, BR-003, BR-004
- **Business Rules:** BR-003 (No self-connection), BR-004 (Single response record per target).
- **Request Body:**
  `json
  {
    "note": "Chào bạn, mình cũng đang học lớp thầy Nam, chúng mình cùng ôn nhé!"
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Gửi yêu cầu kết nối học tập thành công",
    "data": {
      "connection_id": "88888888-9999-0000-1111-333333333333",
      "status": "PENDING"
    }
  }
  `

---

### API-SB-06: Resolve Study Connection (Accept / Decline)
- **HTTP Method:** PATCH
- **Path:** /api/v1/study-requests/connections/:connectionId
- **Purpose:** Request creator accepts or declines a study connection.
- **Auth Requirement:** Bearer JWT (Request Creator only)
- **Traceability:** UC-SB-03, FR-SB-007, FR-SB-008, SCR-15, study_connections, conversations, 
otifications, BR-006
- **Business Rules:** BR-006 (Accepting authorizes and creates 1-to-1 conversation via Trusted Write Path).
- **Request Body:**
  `json
  {
    "action": "ACCEPT"
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đã chấp nhận kết nối học tập và mở kênh chat.",
    "data": {
      "connection_id": "88888888-9999-0000-1111-333333333333",
      "status": "ACCEPTED",
      "conversation_id": "99999999-0000-1111-2222-333333333333"
    }
  }
  `

---

### API-SB-07: List Student's Own Sent Study Connection Requests
- **HTTP Method:** GET
- **Path:** /api/v1/study-requests/connections/me
- **Purpose:** Retrieves paginated history of study buddy connection requests submitted by the current student.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-SB-03, FR-SB-006, SCR-11, SCR-15, study_connections, study_requests, courses
- **Query Parameters:**
  - page (Integer, default: 1)
  - limit (Integer, default: 10)
  - status (Enum: PENDING, ACCEPTED, DECLINED, CANCELLED, optional)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "88888888-9999-0000-1111-333333333333",
        "status": "PENDING",
        "note": "Chào bạn, mình cũng đang học lớp thầy Nam...",
        "requested_at": "2026-08-31T12:00:00Z",
        "study_request": {
          "id": "66666666-7777-8888-9999-000000000000",
          "topic": "Ôn tập giải đề giữa kỳ môn Cấu trúc dữ liệu",
          "course_code": "CS201",
          "author_name": "Nguyễn Văn A"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  }
  `

---

## 6. Module 5: Skill Exchange Collaboration (SKILL EXCHANGE - 7 Endpoints)

---

### API-SE-01: List & Filter Skill Exchange Listings
- **HTTP Method:** GET
- **Path:** /api/v1/skill-listings
- **Purpose:** Retrieves active skill sharing offers and learning requests with "My Listings" support.
- **Auth Requirement:** Bearer JWT (STUDENT or ADMIN)
- **Traceability:** UC-SE-01, FR-SE-001, FR-SE-004, SCR-16, skill_listings
- **Query Parameters:**
  - 	ype (Enum: OFFER, REQUEST, optional)
  - proficiency_level (Enum: BEGINNER, INTERMEDIATE, ADVANCED, optional)
  - is_mine (Boolean, default: alse): If 	rue, filters only skill listings authored by authenticated student (**SCR-16** "Bài của tôi").
  - page (Integer, default: 1)
  - limit (Integer, default: 10)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "aaaaaaaa-1111-2222-3333-444444444444",
        "author": {
          "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "full_name": "Nguyễn Văn A"
        },
        "type": "OFFER",
        "skill_name": "Figma UI Design",
        "proficiency_level": "ADVANCED",
        "format": "1-on-1 Online",
        "availability": "Tối thứ 7",
        "description": "Mình có thể hướng dẫn các bạn làm UI Dashboard bằng Figma...",
        "status": "OPEN",
        "created_at": "2026-08-31T11:30:00Z"
      }
    ]
  }
  `

---

### API-SE-02: Get Skill Listing Details
- **HTTP Method:** GET
- **Path:** /api/v1/skill-listings/:id
- **Purpose:** Retrieves detail view of a single skill listing.
- **Auth Requirement:** Bearer JWT (STUDENT or ADMIN)
- **Traceability:** UC-SE-01, FR-SE-002, SCR-17, skill_listings
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": {
      "id": "aaaaaaaa-1111-2222-3333-444444444444",
      "type": "OFFER",
      "skill_name": "Figma UI Design",
      "proficiency_level": "ADVANCED",
      "description": "Hướng dẫn làm UI Dashboard bằng Figma...",
      "status": "OPEN",
      "author": {
        "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "full_name": "Nguyễn Văn A"
      },
      "is_author": false,
      "has_responded": false
    }
  }
  `

---

### API-SE-03: Create Skill Listing
- **HTTP Method:** POST
- **Path:** /api/v1/skill-listings
- **Purpose:** Publishes a skill offer or skill request.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-SE-02, FR-SE-003, SCR-18, skill_listings, BR-001, BR-002
- **Validation Rules:**
  - 	ype: Enum (OFFER, REQUEST).
  - skill_name: String, 2–100 chars.
  - proficiency_level: Enum (BEGINNER, INTERMEDIATE, ADVANCED).
  - description: String, 20–2000 chars.
- **Business Rules:** BR-001 (Profile check), BR-002 (Max 5 active listings).
- **Request Body:**
  `json
  {
    "type": "OFFER",
    "skill_name": "Figma UI Design",
    "proficiency_level": "ADVANCED",
    "format": "1-on-1 Online",
    "availability": "Tối thứ 7",
    "description": "Mình có thể chia sẻ kinh nghiệm thiết kế Design System trên Figma."
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Đăng bài trao đổi kỹ năng thành công",
    "data": {
      "id": "bbbbbbbb-2222-3333-4444-555555555555",
      "status": "OPEN"
    }
  }
  `

---

### API-SE-04: Close Skill Listing
- **HTTP Method:** PATCH
- **Path:** /api/v1/skill-listings/:id/close
- **Purpose:** Listing author closes skill listing.
- **Auth Requirement:** Bearer JWT (Listing Creator only)
- **Traceability:** UC-SE-02, FR-SE-013, SCR-17, skill_listings
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đã đóng bài đăng trao đổi kỹ năng thành công"
  }
  `

---

### API-SE-05: Send Skill Exchange Proposal
- **HTTP Method:** POST
- **Path:** /api/v1/skill-listings/:id/respond
- **Purpose:** Peer student submits an exchange proposal.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-SE-03, FR-SE-005, SCR-17, skill_responses, 
otifications, BR-003, BR-004
- **Business Rules:** BR-003 (No self-proposal), BR-004 (Single response record per target).
- **Request Body:**
  `json
  {
    "proposal_note": "Mình có thể dạy lại bạn lập trình Python cơ bản đổi lấy hướng dẫn Figma nhé!"
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Gửi đề xuất trao đổi kỹ năng thành công",
    "data": {
      "response_id": "cccccccc-3333-4444-5555-666666666666",
      "status": "PENDING"
    }
  }
  `

---

### API-SE-06: Resolve Skill Proposal (Accept / Decline)
- **HTTP Method:** PATCH
- **Path:** /api/v1/skill-listings/responses/:responseId
- **Purpose:** Listing author accepts or declines an exchange proposal.
- **Auth Requirement:** Bearer JWT (Listing Creator only)
- **Traceability:** UC-SE-03, FR-SE-007, FR-SE-012, SCR-19, skill_responses, conversations, 
otifications, BR-006
- **Business Rules:** BR-006 (Accepting authorizes and creates 1-to-1 conversation via Trusted Write Path).
- **Request Body:**
  `json
  {
    "action": "ACCEPT"
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đã chấp nhận đề xuất trao đổi kỹ năng và mở kênh chat.",
    "data": {
      "response_id": "cccccccc-3333-4444-5555-666666666666",
      "status": "ACCEPTED",
      "conversation_id": "dddddddd-4444-5555-6666-777777777777"
    }
  }
  `

---

### API-SE-07: List Student's Own Sent Skill Exchange Proposals
- **HTTP Method:** GET
- **Path:** /api/v1/skill-listings/responses/me
- **Purpose:** Retrieves paginated history of skill exchange proposals submitted by current student.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-SE-03, FR-SE-006, SCR-11, SCR-19, skill_responses, skill_listings
- **Query Parameters:**
  - page (Integer, default: 1)
  - limit (Integer, default: 10)
  - status (Enum: PENDING, ACCEPTED, DECLINED, CANCELLED, optional)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "cccccccc-3333-4444-5555-666666666666",
        "status": "PENDING",
        "proposal_note": "Mình có thể dạy lại bạn lập trình Python...",
        "responded_at": "2026-08-31T12:30:00Z",
        "skill_listing": {
          "id": "aaaaaaaa-1111-2222-3333-444444444444",
          "type": "OFFER",
          "skill_name": "Figma UI Design",
          "author_name": "Nguyễn Văn A"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  }
  `


---

## 7. Module 6: Direct Messaging & Chat (CHAT - 3 Endpoints)

---

### API-CHAT-01: List Active Conversations
- **HTTP Method:** GET
- **Path:** /api/v1/conversations
- **Purpose:** Retrieves all active 1-to-1 conversations for the authenticated user, ordered by recent activity.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-CHAT-01, FR-CHAT-001, SCR-20, conversations, messages, users, student_profiles
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "77777777-8888-9999-0000-111111111111",
        "match_type": "PROJECT_MATCH",
        "peer": {
          "user_id": "88888888-9999-0000-1111-222222222222",
          "full_name": "Trần Thị B",
          "avatar_url": "https://example.edu.vn/avatar_b.jpg"
        },
        "last_message": {
          "content": "Chào bạn, mình vừa gửi tài liệu dự án nhé!",
          "sent_at": "2026-08-31T13:45:00Z",
          "is_self": false
        },
        "created_at": "2026-08-31T13:42:00Z"
      }
    ]
  }
  `

---

### API-CHAT-02: Get Conversation Message History
- **HTTP Method:** GET
- **Path:** /api/v1/conversations/:id/messages
- **Purpose:** Retrieves paginated chronological message history for a specific conversation.
- **Auth Requirement:** Bearer JWT (Participants of Conversation only)
- **Traceability:** UC-CHAT-01, FR-CHAT-002, SCR-20, messages, conversations
- **Path Parameter:** id (UUID, required)
- **Query Parameters:**
  - page (Integer, default: 1)
  - limit (Integer, default: 30)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "eeeeeeee-5555-6666-7777-888888888888",
        "sender_id": "88888888-9999-0000-1111-222222222222",
        "content": "Chào bạn, mình vừa gửi tài liệu dự án nhé!",
        "sent_at": "2026-08-31T13:45:00Z",
        "is_self": false
      }
    ],
    "meta": {
      "page": 1,
      "limit": 30,
      "total": 1,
      "total_pages": 1
    }
  }
  `
- **Error Responses:**
  - 403 Forbidden (NOT_CONVERSATION_PARTICIPANT): "Bạn không có quyền truy cập cuộc trò chuyện này."

---

### API-CHAT-03: Send Text Message
- **HTTP Method:** POST
- **Path:** /api/v1/conversations/:id/messages
- **Purpose:** Sends a direct text message within an authorized conversation.
- **Auth Requirement:** Bearer JWT (Participants only)
- **Traceability:** UC-CHAT-01, FR-CHAT-003, FR-CHAT-007, SCR-20, messages, conversations
- **Validation Rules:**
  - content: String, required, 1–1000 chars, text-only (**FR-CHAT-007**).
- **Business Rules:**
  - Sender must be either user_one_id or user_two_id of the target conversation.
  - Updates conversations.last_message_at to CURRENT_TIMESTAMP.
- **Request Body:**
  `json
  {
    "content": "Cảm ơn bạn, mình đã nhận được tài liệu rồi nhé!"
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Gửi tin nhắn thành công",
    "data": {
      "id": "ffffffff-6666-7777-8888-999999999999",
      "conversation_id": "77777777-8888-9999-0000-111111111111",
      "sender_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "content": "Cảm ơn bạn, mình đã nhận được tài liệu rồi nhé!",
      "sent_at": "2026-08-31T13:46:00Z"
    }
  }
  `
- **Error Responses:**
  - 400 Bad Request (VALIDATION_FAILED): "Nội dung tin nhắn không được vượt quá 1000 ký tự."

---

## 8. Module 7: In-App Notifications (NOTIFICATIONS - 3 Endpoints)

---

### API-NOTIF-01: List In-App Notifications
- **HTTP Method:** GET
- **Path:** /api/v1/notifications
- **Purpose:** Retrieves paginated notification alerts with unread badge count.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-NOTIF-01, FR-NOTIF-001, FR-NOTIF-004, SCR-21, 
otifications table
- **Query Parameters:**
  - page (Integer, default: 1)
  - limit (Integer, default: 20)
  - unread_only (Boolean, default: false)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "12121212-3434-5656-7878-909090909090",
        "type": "PROJECT_APPLICATION",
        "title": "Có đơn ứng tuyển mới",
        "content": "Sinh viên Trần Thị B đã gửi đơn ứng tuyển vào bài đăng 'Tuyển Frontend Dev'.",
        "target_url": "/projects/33333333-4444-5555-6666-777777777777/applications",
        "is_read": false,
        "created_at": "2026-08-31T13:40:00Z"
      }
    ],
    "meta": {
      "unread_count": 1,
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
  `

---

### API-NOTIF-02: Mark Notification as Read
- **HTTP Method:** PATCH
- **Path:** /api/v1/notifications/:id/read
- **Purpose:** Marks a single notification alert as read.
- **Auth Requirement:** Bearer JWT (Recipient only)
- **Traceability:** UC-NOTIF-01, FR-NOTIF-002, SCR-21, 
otifications
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đã đánh dấu thông báo đã đọc"
  }
  `

---

### API-NOTIF-03: Mark All Notifications as Read
- **HTTP Method:** PATCH
- **Path:** /api/v1/notifications/read-all
- **Purpose:** Marks all unread notifications of the current user as read.
- **Auth Requirement:** Bearer JWT (STUDENT)
- **Traceability:** UC-NOTIF-01, FR-NOTIF-003, SCR-21, 
otifications
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đã đánh dấu tất cả thông báo là đã đọc"
  }
  `

---

## 9. Module 8: Administration & Moderation (ADMIN - 6 Endpoints)

---

### API-ADM-01: Get System Analytics & Dashboard Stats
- **HTTP Method:** GET
- **Path:** /api/v1/admin/stats
- **Purpose:** Retrieves aggregated metrics on total users, active listings, and collaborations.
- **Auth Requirement:** Bearer JWT (ADMIN only)
- **Traceability:** UC-ADM-01, FR-ADM-001, SCR-22, users, project_posts, study_requests, skill_listings
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": {
      "total_users": 150,
      "active_users": 142,
      "suspended_users": 8,
      "active_project_posts": 25,
      "active_study_requests": 38,
      "active_skill_listings": 19,
      "total_matches_formed": 64
    }
  }
  `

---

### API-ADM-02: List & Search User Accounts
- **HTTP Method:** GET
- **Path:** /api/v1/admin/users
- **Purpose:** Searches student accounts with status filters for administrative monitoring.
- **Auth Requirement:** Bearer JWT (ADMIN only)
- **Traceability:** UC-ADM-02, FR-ADM-002, SCR-23, users, student_profiles
- **Query Parameters:**
  - status (Enum: PENDING_VERIFICATION, ACTIVE, SUSPENDED, DEACTIVATED, optional)
  - search (String, optional): Email or full name search
  - page (Integer, default: 1)
  - limit (Integer, default: 20)
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "data": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "email": "student1@university.edu.vn",
        "full_name": "Nguyễn Văn A",
        "major": "Công nghệ thông tin",
        "role": "STUDENT",
        "status": "ACTIVE",
        "created_at": "2026-08-31T09:00:00Z"
      }
    ]
  }
  `

---

### API-ADM-03: Update User Account Status (Suspend / Unban)
- **HTTP Method:** PATCH
- **Path:** /api/v1/admin/users/:id/status
- **Purpose:** Suspends or reinstates a user account, logging the moderation action.
- **Auth Requirement:** Bearer JWT (ADMIN only)
- **Traceability:** UC-ADM-02, FR-ADM-003, SCR-23, users, ccount_moderation_logs, BR-007
- **Validation Rules:**
  - status: Enum (ACTIVE, SUSPENDED).
  - eason: String, required, 5–500 chars.
- **Business Rules:**
  - **BR-007:** Setting status to SUSPENDED immediately blocks user requests in authentication middleware.
  - Inserts audit record into ccount_moderation_logs atomically.
- **Request Body:**
  `json
  {
    "status": "SUSPENDED",
    "reason": "Vi phạm quy tắc cộng đồng: Đăng tin spam liên tục."
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Cập nhật trạng thái người dùng thành công và đã ghi nhật ký kiểm duyệt.",
    "data": {
      "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "new_status": "SUSPENDED"
    }
  }
  `

---

### API-ADM-04: Soft Moderation Removal of Violating Listing
- **HTTP Method:** POST
- **Path:** /api/v1/admin/listings/:entityType/:entityId/remove
- **Purpose:** Performs a soft lifecycle state transition of a violating listing to REMOVED_BY_ADMIN and records an atomic audit log entry.
- **Auth Requirement:** Bearer JWT (ADMIN only)
- **Traceability:** UC-ADM-03, FR-ADM-005, SCR-24, project_posts, study_requests, skill_listings, ccount_moderation_logs, BR-009
- **Architectural Semantics:**
  - **NOT a physical row deletion.** Performs soft lifecycle state update status -> 'REMOVED_BY_ADMIN'.
  - Atomically inserts a record into ccount_moderation_logs within the same database transaction.
- **Path Parameters:**
  - entityType: Enum (PROJECT_POST, STUDY_REQUEST, SKILL_LISTING)
  - entityId: UUID (ID of target listing)
- **Validation Rules:**
  - eason: String, required, 5–500 chars.
- **Request Body:**
  `json
  {
    "reason": "Nội dung bài đăng chứa ngôn từ không phù hợp với chuẩn mực học đường."
  }
  `
- **Success Response (200 OK):**
  `json
  {
    "success": true,
    "message": "Đã gỡ bài đăng vi phạm thành công và ghi nhật ký kiểm duyệt.",
    "data": {
      "entity_type": "PROJECT_POST",
      "entity_id": "33333333-4444-5555-6666-777777777777",
      "status": "REMOVED_BY_ADMIN",
      "moderated_at": "2026-08-31T14:00:00Z"
    }
  }
  `

---

### API-ADM-05: Add System Standard Skill
- **HTTP Method:** POST
- **Path:** /api/v1/admin/skills
- **Purpose:** Adds a new standardized skill to the master dictionary.
- **Auth Requirement:** Bearer JWT (ADMIN only)
- **Traceability:** FR-ADM-010, skills table
- **Request Body:**
  `json
  {
    "name": "Docker & Kubernetes",
    "category": "TECH"
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Thêm kỹ năng chuẩn hệ thống thành công",
    "data": {
      "id": "99999999-1111-2222-3333-444444444444",
      "name": "Docker & Kubernetes",
      "category": "TECH",
      "is_system_standard": true
    }
  }
  `

---

### API-ADM-06: Add Standard Course to Catalog
- **HTTP Method:** POST
- **Path:** /api/v1/admin/courses
- **Purpose:** Adds a new standardized university course to the catalog.
- **Auth Requirement:** Bearer JWT (ADMIN only)
- **Traceability:** FR-ADM-011, courses table
- **Request Body:**
  `json
  {
    "course_code": "INT3306",
    "course_name": "Phát triển ứng dụng Web"
  }
  `
- **Success Response (201 Created):**
  `json
  {
    "success": true,
    "message": "Thêm môn học vào danh mục chuẩn thành công",
    "data": {
      "id": "88888888-2222-3333-4444-555555555555",
      "course_code": "INT3306",
      "course_name": "Phát triển ứng dụng Web"
    }
  }
  `

---

## 10. Cross-Cutting Security & Business Rule Enforcement

### 10.1 End-to-End Business Rule Enforcement in API Layer

| Rule ID | Invariant & Behavior | HTTP Status on Violation | Error Code | Enforcement Logic in API Pipeline |
|:---:|---|:---:|---|---|
| **BR-001** | Profile Completeness prerequisite | 403 Forbidden | PROFILE_INCOMPLETE | Evaluated in API-PM-03, API-SB-03, API-SE-03 before inserting listings. |
| **BR-002** | Maximum 5 active listings quota | 403 Forbidden | QUOTA_EXCEEDED | Row-locking transaction (SELECT id FROM users ... FOR UPDATE) in API-PM-03, API-SB-03, API-SE-03. |
| **BR-003** | Self-application prevention | 403 Forbidden | SELF_APPLICATION_BLOCKED | Verified in API-PM-05, API-SB-05, API-SE-05 (uthor_id != current_user_id). |
| **BR-004** | Single response record per target | 409 Conflict | DUPLICATE_SUBMISSION | Handled via DB UNIQUE constraint in API-PM-05, API-SB-05, API-SE-05. |
| **BR-005** | Deadline expiration | Handled automatically | POST_EXPIRED | Filtered out of active feeds in API-PM-01, API-SB-01. |
| **BR-006** | Accepted match unlocks chat | 200 OK (creates chat) | — | Trusted Write Path in API-PM-07, API-SB-06, API-SE-06 atomically creates conversation. |
| **BR-007** | Account suspension session revocation | 403 Forbidden | AUTH_ACCOUNT_SUSPENDED | Global Authentication Middleware checks users.status == 'ACTIVE'. |
| **BR-008** | Verification token expiration | 401 Unauthorized | TOKEN_EXPIRED | Verified in API-AUTH-02 (erification_expires_at > NOW()). |
| **BR-009** | Admin removal + audit log | 200 OK | — | Atomic transaction in API-ADM-04 updating status + inserting ccount_moderation_logs. |

---

## 11. Approval Sign-Off

> **PHASE 5 STATUS: 🟢 APPROVED (2026-08-31)**
> This API Specification (v1.1.0) is submitted for formal Project Owner review.
> **Phase 6 — Development and all subsequent phases remain 🔒 LOCKED until Phase 5 is formally approved.**

| Stakeholder Role | Representative Name | Review Decision | Date | Signature / Note |
|---|---|---|---|---|
| **Project Owner** | Project Owner | ☑ Approved | 2026-08-31 | Formal Phase 5 Approval Signed |
| **Academic Supervisor / Instructor** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |
| **Solutions Architect & Lead Developer** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |

---

*End of 05 — API Specification v1.1.0*
*Document Status: 🟢 APPROVED — Baseline Locked*
*Next Phase: Phase 6 — Development (LOCKED)*

