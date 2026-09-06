# 03 — UI/UX Specification
# UniConnect – Student Skill & Collaboration Platform

> **Phase:** 3 — UI/UX Design
> **Status:** 🔵 REVIEW REQUIRED
> **Approved:** ❌ NOT YET APPROVED
> **Document Version:** 1.1.0 (Final Consistency & Scope Calibrated)
> **Author:** AI UI/UX Architect (Antigravity)
> **Approved Requirements Baseline:** Phase 1 Requirements v1.2.0 (Approved 2026-08-31)
> **Approved Analysis Baseline:** Phase 2 System Analysis v1.2.0 (Approved 2026-08-31)
> **Target Context:** Student Final-Course Project (1–3 Members, AI-Assisted)
> **Primary Language:** Vietnamese (Tiếng Việt)
> **Created:** 2026-08-31
> **Last Updated:** 2026-08-31

---

## Table of Contents

1. [Executive Summary & Design Principles](#1-executive-summary--design-principles)
2. [Design System & Style Guide](#2-design-system--style-guide)
   - 2.1 Color System & Semantic Palette
   - 2.2 Typography Scale & Text Styles
   - 2.3 Spacing, Grid & Layout System
   - 2.4 Responsive Breakpoints & Viewport Targets
   - 2.5 UI Component Design Tokens
3. [Information Architecture & Navigation Shells](#3-information-architecture--navigation-shells)
   - 3.1 Global Site Map
   - 3.2 Guest / Public App Shell
   - 3.3 Authenticated Student App Shell
   - 3.4 Administrator App Shell
4. [Detailed Screen & View Specifications (24 UI/UX Screen & View Specifications)](#4-detailed-screen--view-specifications-24-uiux-screen--view-specifications)
   - 4.1 Authentication & Onboarding (SCR-01 to SCR-05)
   - 4.2 Student Dashboard & Profile (SCR-06 to SCR-07)
   - 4.3 Project Match - Core 1 (SCR-08 to SCR-11)
   - 4.4 Study Buddy - Core 2 (SCR-12 to SCR-15)
   - 4.5 Skill Exchange - Core 3 (SCR-16 to SCR-19)
   - 4.6 Communication & Notifications (SCR-20 to SCR-21)
   - 4.7 Minimal Admin Panel (SCR-22 to SCR-24)
5. [Global UX States & Interaction Patterns](#5-global-ux-states--interaction-patterns)
   - 5.1 Form Validation & Error Feedback
   - 5.2 Loading, Skeleton & Shimmer Standards
   - 5.3 Empty State Patterns
   - 5.4 Toast Notifications & Action Confirmations
   - 5.5 Multi-Device Responsive Adaptation Matrix
6. [UI/UX Traceability Matrix](#6-uiux-traceability-matrix)
7. [Approval Sign-Off](#7-approval-sign-off)

---

## 1. Executive Summary & Design Principles

### 1.1 Purpose of this Specification
This **UI/UX Specification** defines the complete user interface structure, interaction flows, visual design tokens, and state behaviors for **UniConnect v1.0**. It translates the approved functional requirements and system use cases into **24 UI/UX Screen & View Specifications** without jumping into frontend code implementation.

### 1.2 Core Design Principles
1. **Student-Centric Clarity (Rõ ràng & Trực quan):** Academic and project networking must be frictionless. Complex forms are broken into digestible steps with clear hints.
2. **Vietnamese-First Microcopy (Giao diện Tiếng Việt Chuẩn mực):** All buttons, alerts, form labels, and placeholders use natural, friendly, and academically appropriate Vietnamese terminology.
3. **Responsive by Default (Đa nền tảng linh hoạt):** Every view is designed to adapt seamlessly across Mobile (smartphones portrait < 768px), Tablet (768px–1024px), and Desktop (> 1024px).
4. **Actionable Status Visibility (Minh bạch trạng thái):** Users always know the real-time status of their applications, connection requests, unread messages, and notifications.
5. **Low Cognitive Load (Tránh rườm rà):** Focuses 100% on the core collaboration mission: finding teammates, study buddies, and skill exchange partners.

---

## 2. Design System & Style Guide

### 2.1 Color System & Semantic Palette

`mermaid
graph LR
    subgraph Brand & Primary
        P1["Primary Blue<br/>#2563EB (Tailwind blue-600)"]
        P2["Primary Dark<br/>#1D4ED8 (Tailwind blue-700)"]
        P3["Primary Light / Tint<br/>#EFF6FF (Tailwind blue-50)"]
    end
    
    subgraph Accent & Secondary
        S1["Secondary Indigo<br/>#4F46E5 (indigo-600)"]
        S2["Teal Accent<br/>#0D9488 (teal-600)"]
    end

    subgraph Semantic Feedback
        Success["Success Green<br/>#16A34A (green-600)"]
        Warning["Warning Amber<br/>#D97706 (amber-600)"]
        Danger["Danger Red<br/>#DC2626 (red-600)"]
        Info["Info Cyan<br/>#0284C7 (sky-600)"]
    end

    subgraph Neutral Grayscale
        N900["Text Main: #0F172A (slate-900)"]
        N600["Text Muted: #475569 (slate-600)"]
        N200["Border: #E2E8F0 (slate-200)"]
        N50["Background: #F8FAFC (slate-50)"]
        N0["Card White: #FFFFFF"]
    end
`

| Color Role | Hex Code | Token Name | Usage |
|---|---|---|---|
| **Primary Brand** | #2563EB | color-primary | Primary buttons, active nav items, key links, focus rings. |
| **Primary Hover/Active** | #1D4ED8 | color-primary-dark | Hover and pressed state for primary actions. |
| **Primary Background Tint**| #EFF6FF | color-primary-light| Selected rows, active tabs background, subtle highlights. |
| **Secondary Accent** | #0D9488 | color-secondary | Skill Exchange tags, skill badge highlights, secondary accents. |
| **Success** | #16A34A | color-success | Accepted status badges, verified indicators, success toasts. |
| **Warning** | #D97706 | color-warning | Pending status badges, deadline warning alerts. |
| **Danger / Error** | #DC2626 | color-danger | Declined/Banned status badges, form validation errors, delete modals. |
| **Info** | #0284C7 | color-info | System announcements, guide tooltips. |
| **Surface Background** | #F8FAFC | color-bg-app | Overall page background. |
| **Surface Card** | #FFFFFF | color-bg-card | Content containers, modal dialogs, feed post cards. |
| **Text Primary** | #0F172A | color-text-main | Page headers, card titles, primary body copy. |
| **Text Secondary** | #475569 | color-text-muted| Timestamps, metadata, helper text, placeholders. |
| **Border / Divider** | #E2E8F0 | color-border | Card borders, table dividers, input borders. |

---

### 2.2 Typography Scale & Text Styles

- **Font Family:** Inter, Roboto, system-ui, -apple-system, sans-serif.
- **Base Font Size:** 16px (1rem).

| Style Level | Size (Desktop / Mobile) | Weight | Line Height | Example Usage |
|---|---|---|---|---|
| **Display / H1** | 32px (2rem) / 26px (1.625rem) | Bold (700) | 1.25 | Landing page headline, major page headers |
| **Heading / H2** | 24px (1.5rem) / 20px (1.25rem) | SemiBold (600) | 1.3 | Feed section headers, modal titles |
| **Subheading / H3** | 18px (1.125rem) / 16px (1rem) | SemiBold (600) | 1.4 | Post card titles, profile section headers |
| **Body Large** | 16px (1rem) / 15px (0.9375rem) | Regular (400) | 1.5 | Lead paragraphs, listing descriptions |
| **Body Regular** | 14px (0.875rem) / 14px (0.875rem) | Regular (400) | 1.5 | General UI text, table rows, form inputs |
| **Body Small / Meta** | 12px (0.75rem) / 12px (0.75rem) | Medium (500) | 1.4 | Timestamps, badge labels, helper text |
| **Button Text** | 14px (0.875rem) / 14px (0.875rem) | SemiBold (600) | 1.25 | Button labels, tabs, interactive elements |

---

### 2.3 Spacing, Grid & Layout System

- **Base Grid Unit:** 8px (4px for tight micro-spacing).
- **Spacing Scale:**
  - space-1 (4px): Badge padding, icon gap.
  - space-2 (8px): Input inner padding, small tag gap.
  - space-3 (12px): Form element vertical spacing, card list gap.
  - space-4 (16px): Card inner padding, standard container padding.
  - space-6 (24px): Card outer margin, section separation.
  - space-8 (32px): Page section padding.
  - space-12 (48px): Landing page hero padding.

---

### 2.4 Responsive Breakpoints & Viewport Targets

| Viewport Category | Breakpoint Range | Target Devices | Primary Layout Adaptation |
|---|---|---|---|
| **Mobile** | < 768px (Base: 360px–414px) | Smartphones (iPhone, Samsung Galaxy) | Single column vertical layout, bottom fixed navigation bar, full-screen modals. |
| **Tablet** | 768px – 1024px | iPads, Android tablets | Collapsible sidebar, 2-column grid for feeds, floating action buttons. |
| **Desktop** | > 1024px (Max container: 1200px) | Laptops, Desktop monitors | Persistent left sidebar, 2 or 3-column feed grid, split-pane chat interface. |

---

### 2.5 UI Component Design Tokens

- **Buttons:**
  - *Primary Button:* Solid Blue background (#2563EB), white text, rounded 8px (ounded-lg), height 40px (Desktop) / 44px (Mobile touch target).
  - *Secondary Button:* Outline Slate (#E2E8F0), dark text, hover light gray.
  - *Danger Button:* Solid Red (#DC2626), white text (used for Delete/Ban actions with modal confirmation).
- **Status Badges:**
  - OPEN / MỞ: Green text on soft green pill (#DCFCE7).
  - PENDING / CHỜ DUYỆT: Amber text on soft amber pill (#FEF3C7).
  - ACCEPTED / ĐÃ CHẤP NHẬN: Blue text on soft blue pill (#DBEAFE).
  - FULL / ĐÃ ĐỦ SỐ LƯỢNG: Slate text on soft slate pill (#E2E8F0).
  - CLOSED / ĐÃ ĐÓNG: Muted gray pill (#F1F5F9).

---

## 3. Information Architecture & Navigation Shells

### 3.1 Global Site Map

`mermaid
graph TD
    GuestEntry["🌐 Public Visitor"] --> SCR01["SCR-01: Landing Page"]
    SCR01 --> SCR02["SCR-02: Register"]
    SCR01 --> SCR04["SCR-04: Login"]
    SCR02 --> SCR03["SCR-03: Email Verification"]
    SCR04 --> SCR05["SCR-05: Forgot/Reset Password"]

    StudentEntry["🧑 Authenticated Student"] --> Shell["Student App Shell"]
    Shell --> SCR06["SCR-06: Dashboard / Home"]
    Shell --> SCR07["SCR-07: Student Profile & Skills"]
    Shell --> PM_Module["Project Match"]
    Shell --> SB_Module["Study Buddy"]
    Shell --> SE_Module["Skill Exchange"]
    Shell --> SCR20["SCR-20: Direct Chat"]
    Shell --> SCR21["SCR-21: Notifications Center"]

    PM_Module --> SCR08["SCR-08: Project Feed"]
    PM_Module --> SCR09["SCR-09: Project Detail & Apply"]
    PM_Module --> SCR10["SCR-10: Create Project Post"]
    PM_Module --> SCR11["SCR-11: Application Management"]

    SB_Module --> SCR12["SCR-12: Study Buddy Feed"]
    SB_Module --> SCR13["SCR-13: Study Buddy Detail & Connect"]
    SB_Module --> SCR14["SCR-14: Create Study Request"]
    SB_Module --> SCR15["SCR-15: Connection Management"]

    SE_Module --> SCR16["SCR-16: Skill Exchange Feed"]
    SE_Module --> SCR17["SCR-17: Skill Detail & Propose"]
    SE_Module --> SCR18["SCR-18: Create Skill Post"]
    SE_Module --> SCR19["SCR-19: Response Management"]

    AdminEntry["🛡️ Administrator"] --> AdminShell["Admin App Shell"]
    AdminShell --> SCR22["SCR-22: Admin Dashboard Overview"]
    AdminShell --> SCR23["SCR-23: User Management"]
    AdminShell --> SCR24["SCR-24: Listing Moderation"]
`

---

### 3.2 Guest / Public App Shell
- **Header:** Brand Logo (**UniConnect**), Tagline ("Nền tảng Kết nối & Trao đổi Kỹ năng Sinh viên"), Navigation links ("Giới thiệu", "Tính năng"), Action buttons ("Đăng ký", "Đăng nhập").
- **Footer:** University context disclaimer, academic project notes, copyright statement.

---

### 3.3 Authenticated Student App Shell
- **Top Navigation Bar (Desktop & Mobile):**
  - Left: Logo & Search Bar.
  - Right:
    - Notification Bell with unread badge counter (SCR-21 trigger).
    - Direct Messages Icon with unread badge counter (SCR-20 trigger).
    - User Avatar dropdown ("Hồ sơ của tôi", "Cài đặt", "Đăng xuất").
- **Left Sidebar Navigation (Desktop > 1024px):**
  - Trang chủ (SCR-06)
  - Tìm nhóm dự án (SCR-08)
  - Tìm bạn học (SCR-12)
  - Trao đổi kỹ năng (SCR-16)
  - Tin nhắn (SCR-20)
  - Quản lý bài đăng của tôi (Dropdown for SCR-11, SCR-15, SCR-19)
  - Hồ sơ cá nhân (SCR-07)
- **Bottom Navigation Bar (Mobile < 768px):**
  - 5 Fixed Quick-Access Icons: [Trang chủ] | [Dự án] | [Bạn học] | [Kỹ năng] | [Tin nhắn]

---

### 3.4 Administrator App Shell
- **Dedicated Admin Header:** Distinct Dark Blue / Slate Theme badge ("🛡️ Quản trị hệ thống").
- **Admin Sidebar:**
  - Tổng quan hệ thống (SCR-22)
  - Quản lý người dùng (SCR-23)
  - Kiểm duyệt bài đăng (SCR-24)
  - Trở về giao diện sinh viên (Switch view)


---

## 4. Detailed Screen & View Specifications (24 UI/UX Screen & View Specifications)

---

### 4.1 Authentication & Onboarding (SCR-01 to SCR-05)

#### 4.1.1 SCR-01: Landing Page (Trang giới thiệu công khai)
- **Screen ID:** SCR-01
- **Name:** Landing Page / Trang chủ khách
- **Purpose:** Public landing page introducing UniConnect mission, core features (Project Match, Study Buddy, Skill Exchange), and directing visitors to register or log in.
- **Target User:** Guest / Unauthenticated Visitor (ROLE-03).
- **Entry Point:** Root URL (/).
- **Navigation:** Links to SCR-02 (Register) and SCR-04 (Login).
- **Layout Structure:**
  - *Hero Section:* High-contrast headline ("Kết nối Kỹ năng & Hợp tác Học tập Sinh viên"), sub-headline, and two CTA buttons: "Tham gia ngay" (Primary) and "Tìm hiểu thêm" (Outline).
  - *Core Feature Highlights (3-column cards):*
    1. 🚀 **Tìm nhóm Dự án (Project Match):** Tìm bạn cùng làm đồ án, thi hackathon dựa trên kỹ năng.
    2. 📚 **Tìm bạn Cùng tiến (Study Buddy):** Tìm bạn ôn tập môn học, cùng lịch rảnh.
    3. 💡 **Trao đổi Kỹ năng (Skill Exchange):** Chia sẻ kiến thức peer-to-peer 1-1 không mất phí.
  - *Call to Action Banner:* "Chỉ dành riêng cho sinh viên trường - Đăng ký bằng email trường."
  - *Footer:* Academic project credits and terms.
- **Primary Actions:** "Đăng ký tài khoản sinh viên" (Navigates to SCR-02).
- **Secondary Actions:** "Đăng nhập" (Navigates to SCR-04).
- **Form Fields / Inputs:** None (informational view).
- **States:**
  - *Loading State:* Quick static render / hero text placeholder.
  - *Empty State:* N/A.
  - *Error State:* Global 500 error boundary if server unreachable.
  - *Success State:* N/A.
- **Permission Behavior:** Accessible to all visitors without authentication.
- **Responsive Adaptation:**
  - *Desktop:* 3-column feature grid, side-by-side hero text & illustration.
  - *Tablet:* 2-column feature grid.
  - *Mobile:* Stacked 1-column layout, full-width CTA buttons.
- **Related Requirements:** FR-AUTH-001, DR-02 (Guest access: landing page only).
- **Related Use Cases:** UC-AUTH-01, Section 5.5.

---

#### 4.1.2 SCR-02: Student Registration (Đăng ký tài khoản)
- **Screen ID:** SCR-02
- **Name:** Registration Screen / Màn hình Đăng ký
- **Purpose:** Allow new university students to register an account using their institutional email address.
- **Target User:** Unauthenticated Student.
- **Entry Point:** Header "Đăng ký" button on SCR-01 or link from SCR-04.
- **Layout Structure:** Centered card container (Max-width 480px) on clean background with university logo.
- **Components & UI Elements:**
  - Card Title: "Tạo tài khoản UniConnect"
  - Form Fields:
    1. **Họ và tên (Full Name):** Text input, placeholder: "Nguyễn Văn A".
    2. **Email trường (University Email):** Email input, placeholder: "mssv@university.edu.vn", with helper text: "Chỉ chấp nhận email có đuôi trường hợp lệ".
    3. **Mật khẩu (Password):** Password input with Show/Hide toggle icon. Helper text: "Tối thiểu 8 ký tự".
    4. **Xác nhận mật khẩu (Confirm Password):** Password input.
  - Checkbox: "Tôi đồng ý với Quy định cộng đồng và Chính sách bảo mật dữ liệu sinh viên."
  - Button: "Đăng ký tài khoản" (Primary).
  - Link: "Đã có tài khoản? Đăng nhập ngay" (Links to SCR-04).
- **Form Validation Rules:**
  - *Full Name:* Required, 2–100 characters.
  - *Email:* Required, valid email format, must end with approved university domain (**FR-AUTH-002**). Duplicate email check is [SH / Post-Core: FR-AUTH-008].
  - *Password:* Required, minimum 8 characters.
  - *Confirm Password:* Must match Password exactly.
  - *Terms Checkbox:* Required before submission.
- **States:**
  - *Loading State:* Button displays loading spinner and is disabled ("Đang xử lý...").
  - *Error State:* Inline red text below erroneous fields (e.g., "Email trường không hợp lệ", "Email này đã được đăng ký").
  - *Success State:* Redirects to SCR-03 (Email Verification screen) and displays success message.
- **Permission Behavior:** Publicly accessible. Authenticated users redirected to SCR-06.
- **Responsive Adaptation:** Full width with 16px horizontal margins on mobile devices.
- **Related Requirements:** FR-AUTH-001, FR-AUTH-002, FR-AUTH-003, FR-AUTH-008.
- **Related Use Cases:** UC-AUTH-01.

---

#### 4.1.3 SCR-03: Email Verification Notice (Xác thực Email)
- **Screen ID:** SCR-03
- **Name:** Email Verification / Thông báo xác thực
- **Purpose:** Notify student that a verification email was dispatched and provide account activation confirmation when clicking token link.
- **Target User:** Student awaiting activation or verifying token.
- **Entry Point:** Automatic redirect after SCR-02 or via verification email link (/verify?token=...).
- **Layout Structure:** Centered card with animated email icon.
- **Components & UI Elements:**
  - *Dispatched Notice View:*
    - Title: "Kiểm tra hộp thư của bạn"
    - Body copy: "Chúng tôi đã gửi liên kết xác thực đến email **[user@university.edu.vn]**. Vui lòng nhấp vào liên kết trong email để kích hoạt tài khoản."
    - Button: "Gửi lại email xác thực" (Secondary, with 60s cooldown timer).
    - Link: "Quay lại Đăng nhập" (SCR-04).
  - *Token Processing View (When landing from email link):*
    - Success Card: Green checkmark icon, "Tài khoản kích hoạt thành công!", Button: "Đăng nhập ngay" (Primary, links to SCR-04).
    - Failure Card: Red alert icon, "Liên kết xác thực không hợp lệ hoặc đã hết hạn.", Button: "Yêu cầu gửi lại liên kết".
- **States:**
  - *Loading State:* Spinner showing "Đang xác thực tài khoản...".
  - *Error State:* Error banner on invalid/expired token.
  - *Success State:* Green confirmation card with direct login CTA.
- **Related Requirements:** FR-AUTH-003, BR-008.
- **Related Use Cases:** UC-AUTH-02.

---

#### 4.1.4 SCR-04: Student / Admin Login (Đăng nhập)
- **Screen ID:** SCR-04
- **Name:** Login Screen / Đăng nhập
- **Purpose:** Authenticate registered students and administrators.
- **Target User:** Registered Student / Administrator.
- **Entry Point:** Header "Đăng nhập" button on SCR-01 or /login.
- **Layout Structure:** Centered card container (Max-width 440px).
- **Components & UI Elements:**
  - Title: "Đăng nhập UniConnect"
  - Form Fields:
    1. **Email trường:** Email input, placeholder: "email@university.edu.vn".
    2. **Mật khẩu:** Password input with Show/Hide toggle.
  - Flex Row: "Ghi nhớ đăng nhập" (Checkbox) and "Quên mật khẩu?" (Link to SCR-05).
  - Button: "Đăng nhập" (Primary, full width).
  - Link: "Chưa có tài khoản? Đăng ký ngay" (Link to SCR-02).
- **Validation Rules:**
  - *Email:* Required, valid email format.
  - *Password:* Required.
- **States:**
  - *Loading State:* Disabled button with spinner ("Đang đăng nhập...").
  - *Error State:* Red banner: "Email hoặc mật khẩu không chính xác." or "Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên."
  - *Success State:* Redirects Student to SCR-06 (Dashboard) or Admin to SCR-22 (Admin Dashboard).
- **Related Requirements:** FR-AUTH-004, FR-AUTH-006, BR-007, BR-009.
- **Related Use Cases:** UC-AUTH-03.

---

#### 4.1.5 SCR-05: Forgot / Reset Password (Quên / Đặt lại mật khẩu)
- **Screen ID:** SCR-05
- **Name:** Password Recovery / Khôi phục mật khẩu
- **Purpose:** Allow users to request a password reset link and submit a new password.
- **Target User:** Student / Admin who forgot password.
- **Entry Point:** "Quên mật khẩu?" link on SCR-04.
- **Layout Structure:** Centered card (Max-width 440px).
- **Components & UI Elements:**
  - *Step 1 (Request Link):* Email input, "Gửi liên kết khôi phục" button, Link back to SCR-04.
  - *Step 2 (Reset Password Form via token):* New Password input, Confirm Password input, "Cập nhật mật khẩu" button.
- **Validation Rules:**
  - New password minimum 8 characters; confirmation must match.
- **States:**
  - *Success State:* Green banner: "Đã gửi email khôi phục" (Step 1) / "Mật khẩu đã được cập nhật thành công!" (Step 2, with CTA to SCR-04).
- **Related Requirements:** FR-AUTH-005.
- **Related Use Cases:** UC-AUTH-04.

---

### 4.2 Student Dashboard & Profile (SCR-06 to SCR-07)

#### 4.2.1 SCR-06: Student Home / Dashboard (Trang chủ sinh viên)
- **Screen ID:** SCR-06
- **Name:** Student Dashboard / Bảng tin tổng quan
- **Purpose:** Central hub for authenticated students showing quick navigation, active collaborations, recommended feeds, and profile completion callout.
- **Target User:** Authenticated Student (ROLE-01).
- **Entry Point:** Main login landing, navigation item "Trang chủ".
- **Layout Structure:**
  - *Top Welcome Banner:* Personalized greeting ("Xin chào, [Tên sinh viên]!"), Major & Year, quick shortcut to create posts.
  - *Incomplete Profile Alert (if BR-001 not met):* Amber warning banner ("⚠️ Vui lòng cập nhật kỹ năng và môn học để mở khóa tính năng đăng tin!") with CTA button "Cập nhật ngay" (SCR-07).
  - *3-Column Quick Access Hub:*
    1. 🚀 **Tìm nhóm Dự án:** Button "Đăng tin tuyển" (SCR-10) \| "Khám phá dự án" (SCR-08).
    2. 📚 **Tìm bạn học:** Button "Tạo yêu cầu" (SCR-14) \| "Tìm bạn học" (SCR-12).
    3. 💡 **Trao đổi kỹ năng:** Button "Đăng tin kỹ năng" (SCR-18) \| "Khám phá kỹ năng" (SCR-16).
  - *Active Activity Section:* Summary cards for "Bài đăng đang mở của bạn" and "Yêu cầu / Ứng tuyển đang chờ phản hồi".
- **Primary Actions:** Direct navigation to post creation and feed browsing.
- **States:**
  - *Loading State:* Card skeleton placeholders.
  - *Empty State (No active posts):* Friendly card with illustration: "Bạn chưa có bài đăng nào. Bắt đầu tìm kiếm cộng sự ngay!"
- **Related Requirements:** FR-PROF-001, BR-001.
- **Related Use Cases:** UC-PROF-01, UC-PM-01.

---

#### 4.2.2 SCR-07: Student Profile & Skills (Hồ sơ cá nhân & Kỹ năng)
- **Screen ID:** SCR-07
- **Name:** Student Profile / Hồ sơ sinh viên
- **Purpose:** View and manage student identity, bio, skills with proficiency levels, enrolled courses, and optional portfolio links. Also serves as the public profile view for peers.
- **Target User:** Student (Self or Peer).
- **Entry Point:** Sidebar/Header "Hồ sơ của tôi" or clicking a peer's avatar in feeds.
- **Layout Structure:**
  - *Header Card:* Avatar, Full Name, University Campus, Faculty/Major, Year of Study, Bio text, [SH / Post-Core: FR-PROF-007] Button "Chỉnh sửa hồ sơ" (if owner).
  - *Skills Section (Kỹ năng & Mức độ thành thạo):*
    - Skill Tag Badges with color-coded proficiency pills:
      - Beginner / Mới bắt đầu: Soft Gray badge.
      - Intermediate / Khá: Soft Blue badge.
      - Advanced / Thành thạo: Soft Teal/Green badge.
    - Button: "+ Thêm kỹ năng" (Opens Skill Selector modal).
  - *Courses Section (Môn học quan tâm / Đã học):*
    - List of course codes and names (e.g., CS101 - Lập trình C++, SE301 - Công nghệ phần mềm).
    - Button: "+ Thêm môn học".
  - *[SH / Post-Core: FR-PROF-005, FR-PROF-006] External Links:* GitHub, LinkedIn URLs, and profile visibility toggle.
  - *[CH / Stretch: FR-PROF-008, FR-PROF-010] Completeness & Portfolio Summary:* Visual profile completeness progress bar.
- **Modal Component (Edit Profile & Skills):**
  - Text fields for Full Name, Campus, Major, Year (Dropdown: Năm 1 -> Năm 4), Bio.
  - Skill tag search & select with dropdown level selector.
  - Course text input tags.
- **Validation Rules:**
  - At least 1 Skill and 1 Course required for complete status (**BR-001**).
- **Related Requirements:** FR-PROF-001, FR-PROF-002, FR-PROF-003, FR-PROF-004, FR-PROF-005, FR-PROF-006, FR-PROF-007, FR-PROF-008, FR-PROF-009, FR-PROF-010, BR-001.
- **Related Use Cases:** UC-PROF-01, UC-PROF-02.

---

### 4.3 Project Match — Core 1 (SCR-08 to SCR-11)

#### 4.3.1 SCR-08: Project Match Feed (Khám phá dự án)
- **Screen ID:** SCR-08
- **Name:** Project Match Feed / Danh sách tuyển nhóm
- **Purpose:** Search, filter, and browse open project team vacancies across coursework, hackathons, and research projects.
- **Target User:** Authenticated Student.
- **Entry Point:** Main navigation "Tìm nhóm dự án".
- **Layout Structure:**
  - *Header Bar:* Page Title ("Tìm nhóm dự án"), Search input (keyword), "+ Đăng tin tuyển" button (Primary, links to SCR-10).
  - *Filter Toolbar:*
    - Category pills: Tất cả | Môn học | Hackathon | Nghiên cứu | Cá nhân.
    - [SH / Post-Core: FR-PM-005] Multi-criteria filter tag dropdown (Required Skills, Category, Open slots only).
    - [CH / Stretch: FR-PM-012] Bookmark listing shortcut.
  - *Card Grid (2 columns on desktop, 1 column on mobile):*
    - Card Anatomy:
      - Top row: Category Badge (e.g., Hackathon) + Status Badge (MỞ / OPEN).
      - Title: Project Name (e.g., "Tuyển 2 bạn làm đồ án Web Quản lý thư viện").
      - Author row: Avatar + Name + Major + Post timestamp.
      - Description: 2-line clamped summary.
      - Required Skills: Tag chips (e.g., React, NodeJS, UI Design).
      - Footer: Member count badge ("👥 Còn 2/4 chỗ") + Deadline ("⏳ Hạn: 15/09") + Button "Xem chi tiết" (SCR-09).
- **States:**
  - *Loading State:* 6 animated card skeletons.
  - *Empty State:* "Không tìm thấy dự án phù hợp với bộ lọc. Hãy thử tìm từ khóa khác hoặc tạo bài đăng mới!"
- **Related Requirements:** FR-PM-001, FR-PM-002, FR-PM-004, FR-PM-005, FR-PM-012.
- **Related Use Cases:** UC-PM-02.

---

#### 4.3.2 SCR-09: Project Detail & Apply Modal (Chi tiết tuyển nhóm & Ứng tuyển)
- **Screen ID:** SCR-09
- **Name:** Project Detail View / Chi tiết bài đăng tuyển
- **Purpose:** View full project description, creator details, required skills, and submit an application.
- **Target User:** Authenticated Student (Applicant or Owner).
- **Entry Point:** Clicking any project card in SCR-08.
- **Layout Structure:**
  - *Detail View:*
    - Header: Project Title, Category, Status badge, Timestamp.
    - Creator Info Box: Avatar, Name, Year, Major, link to SCR-07.
    - Full Description: Multiline text explaining project goals, workload, and expectations.
    - Requirements Grid:
      - Required Skills list with target levels.
      - Total Slots & Remaining open slots.
      - Application Deadline date countdown.
    - Bottom Action Bar:
      - *If Viewer is NOT Owner:* Button "Ứng tuyển tham gia" (Primary) -> Opens Application Modal.
      - *If Viewer IS Owner:* Button "Quản lý ứng viên" (SCR-11) and Button "Đóng bài đăng" (Opens modal confirmation -> sets status to CLOSED, remains on SCR-09 with status badge updated or navigates to SCR-11).
      - *If Already Applied:* Muted badge "Đã gửi ứng tuyển (Đang chờ duyệt)".
- **Application Modal Component:**
  - Title: "Ứng tuyển dự án: [Tên dự án]"
  - Summary of applicant's skills matching project requirements.
  - Field: **Lời giới thiệu ngắn (Introduction Note):** Textarea, placeholder: "Giới thiệu ngắn về kỹ năng, kinh nghiệm hoặc lý do bạn muốn tham gia..." (Max 500 characters).
  - Actions: "Hủy" (Secondary), "Gửi ứng tuyển" (Primary).
- **Validation Rules:**
  - Cannot apply to own post (**BR-003**).
  - Cannot submit duplicate pending application (**BR-004**).
- **Success State:** Toast notification: "Đã gửi đơn ứng tuyển thành công!", status button updates to "Đã gửi ứng tuyển". [SH / Post-Core: FR-PM-007] Triggers notification to post owner.
- **Related Requirements:** FR-PM-006, FR-PM-007, FR-PM-011, FR-PM-013, BR-003, BR-004, BR-005.
- **Related Use Cases:** UC-PM-03, UC-PM-05.

---

#### 4.3.3 SCR-10: Create Project Vacancy (Đăng tin tuyển thành viên)
- **Screen ID:** SCR-10
- **Name:** Create Project Post / Đăng tin tuyển nhóm
- **Purpose:** Allow student project leaders to publish a vacancy post specifying required skills and team requirements.
- **Target User:** Authenticated Student with completed profile (**BR-001**).
- **Entry Point:** "+ Đăng tin tuyển" button on SCR-06 or SCR-08.
- **Layout Structure:** Clean single-column form container (Max-width 640px).
- **Form Fields:**
  1. **Tiêu đề bài đăng (Project Title):** Text input, placeholder: "VD: Tuyển Frontend Developer cho đề tài Khóa luận AI...".
  2. **Thể loại dự án (Category):** Dropdown (Môn học / Coursework, Cuộc thi / Hackathon, Nghiên cứu / Research, Dự án cá nhân / Personal).
  3. **Mô tả chi tiết (Description):** Rich textarea (min 20, max 2000 chars).
  4. **Kỹ năng cần tìm (Required Skills):** Multi-select tag input with auto-complete from system skill dictionary.
  5. **Số thành viên cần tuyển (Total Members Needed):** Number stepper (1 to 10).
  6. **Hạn chót nhận ứng tuyển (Application Deadline):** Date picker (must be a future date).
  7. [CH / Stretch: FR-PM-003] Optional sub-role vacancy breakdown.
- **Validation Rules:**
  - Title: Required, 10–150 chars.
  - Category: Required.
  - Description: Required, min 20 chars.
  - Skills: At least 1 required skill tag.
  - Members Needed: Integer between 1 and 10.
  - Deadline: Required, future date.
  - Anti-spam limit: Student cannot exceed 5 active posts (**BR-002**).
- **Actions:** "Hủy bỏ" (Outline), "Đăng tin ngay" (Primary).
- **Success State:** Toast: "Đăng tin tuyển thành công!", redirects to SCR-08.
- **Related Requirements:** FR-PM-001, FR-PM-002, FR-PM-003, BR-001, BR-002.
- **Related Use Cases:** UC-PM-01.

---

#### 4.3.4 SCR-11: Application Management (Quản lý ứng viên dự án)
- **Screen ID:** SCR-11
- **Name:** Project Applications View / Quản lý đơn ứng tuyển
- **Purpose:** Allow project post owners to review incoming applicant profiles, read intro notes, and Accept or Decline candidates.
- **Target User:** Project Post Creator.
- **Entry Point:** "Quản lý bài đăng" navigation or "Quản lý ứng viên" button on SCR-09.
- **Layout Structure:**
  - *Post Header Banner:* Post Title, Open slots counter ("Đã duyệt: 1/3 thành viên"), Status pill.
  - *Applicant List (Table / Card stack):*
    - Each Applicant Card:
      - Left: Applicant Avatar + Full Name + Major & Year.
      - Center: Intro Note snippet + Highlighted matching skills tags.
      - Right Actions:
        - Button "Xem hồ sơ" (Opens peer profile SCR-07).
        - Button "Chấp nhận" (Green Outline / Solid).
        - Button "Từ chối" (Red Outline).
  - *Accepted Members Tray:* Shows list of confirmed teammates with quick button "Nhắn tin trực tiếp" (SCR-20) or [CH / Stretch: FR-PM-010] "Tạo nhóm chat".
- **Actions:**
  - *Accept Action:* Triggers confirmation dialog: "Chấp nhận [Tên sinh viên] vào dự án?". On confirm: updates status to ACCEPTED, sends [SH / Post-Core: FR-PM-009] notification, unlocks 1-to-1 chat (SCR-20).
  - *Decline Action:* Updates status to DECLINED, sends [SH / Post-Core: FR-PM-009] notification.
- **States:**
  - *Empty State (No applicants yet):* "Chưa có ứng viên nào nộp đơn. Bài đăng của bạn đang hiển thị trên bảng tin."
- **Related Requirements:** FR-PM-008, FR-PM-009, FR-PM-010, FR-PM-014, FR-CHAT-002.
- **Related Use Cases:** UC-PM-04.

---

### 4.4 Study Buddy — Core 2 (SCR-12 to SCR-15)

#### 4.4.1 SCR-12: Study Buddy Feed (Tìm bạn học)
- **Screen ID:** SCR-12
- **Name:** Study Buddy Feed / Bảng tin bạn cùng tiến
- **Purpose:** Search, filter, and discover peer study requests by course code, topic, study format, and availability.
- **Target User:** Authenticated Student.
- **Entry Point:** Sidebar navigation "Tìm bạn học".
- **Layout Structure:**
  - *Header:* Title ("Tìm bạn cùng học"), Search bar ("Nhập mã môn học, tên môn hoặc chủ đề..."), Button "+ Tạo yêu cầu tìm bạn học" (SCR-14).
  - *Filter Bar:*
    - Mode pills: Tất cả | Online | Trực tiếp (Offline) | Kết hợp (Hybrid).
    - [SH / Post-Core: FR-SB-004] Multi-attribute search filters (Course, Mode, Schedule).
    - [CH / Stretch: FR-SB-010] Bookmark study request.
  - *Card Grid (2 columns):*
    - Card Anatomy:
      - Course Code Badge (e.g., MTH102) + Study Mode badge (Offline - Thư viện).
      - Topic Title: "Cần tìm bạn học chung ôn thi cuối kỳ Giải tích 2".
      - Author: Avatar + Name + Post timestamp.
      - Availability: "📅 Lịch rảnh: Tối Thứ 3, Chiều Thứ 7".
      - Description: Goal & study style notes.
      - Action: Button "Kết nối học tập" (SCR-13).
- **States:**
  - *Loading State:* Card skeletons.
  - *Empty State:* "Không tìm thấy nhóm học phù hợp. Tạo ngay yêu cầu tìm bạn học mới!"
- **Related Requirements:** FR-SB-001, FR-SB-002, FR-SB-003, FR-SB-004, FR-SB-010.
- **Related Use Cases:** UC-SB-02.


---

#### 4.4.2 SCR-13: Study Buddy Detail & Connect Modal (Chi tiết tìm bạn học & Kết nối)
- **Screen ID:** SCR-13
- **Name:** Study Buddy Detail / Chi tiết yêu cầu học tập
- **Purpose:** View full study goal, schedule, format, and allow peers to submit a study connection request.
- **Target User:** Authenticated Student.
- **Entry Point:** Clicking any study card on SCR-12.
- **Components & Layout:**
  - Course Title & Code banner.
  - Study Mode, Target Goal (Ôn thi, Làm bài tập lớn, Luyện đề).
  - Creator identity box (Name, Major, Bio, Courses enrolled).
  - Availability schedule block.
  - Action Button:
    - *Non-owner:* "Gửi lời mời học chung" (Opens Connect Modal).
    - *Owner:* "Xem danh sách kết nối" (SCR-15) and "Đóng yêu cầu" (Opens confirmation modal $\rightarrow$ sets status to CLOSED, remains on SCR-13 or redirects to SCR-15).
- **Connect Modal Form:**
  - Field: **Lời nhắn kết nối (Note):** Textarea ("Chào bạn, mình cũng đang học môn này và rảnh các buổi tối...").
  - Actions: "Hủy" \| "Gửi kết nối" (Primary).
- **Validation Rules:** Cannot connect to own request (**BR-003**).
- **Success State:** Toast: "Đã gửi lời mời học chung thành công!", button updates to "Đã gửi yêu cầu". [SH / Post-Core: FR-SB-006] Dispatches in-app notification to request owner.
- **Related Requirements:** FR-SB-005, FR-SB-006, FR-SB-011, BR-003.
- **Related Use Cases:** UC-SB-02.

---

#### 4.4.3 SCR-14: Create Study Request (Đăng tin tìm bạn học)
- **Screen ID:** SCR-14
- **Name:** Create Study Request / Đăng tin tìm bạn cùng học
- **Purpose:** Allow a student to publish a study buddy request for a specific course or topic.
- **Target User:** Authenticated Student with completed profile (**BR-001**).
- **Entry Point:** "+ Tạo yêu cầu tìm bạn học" on SCR-06 or SCR-12.
- **Layout Structure:** Clean form container (Max-width 600px).
- **Form Fields:**
  1. **Môn học (Course Code & Name):** Text input with course auto-complete from user's profile or standard catalog (e.g., "INT2204 - Mạng máy tính").
  2. **Chủ đề / Mục tiêu (Topic / Goal):** Text input, placeholder: "VD: Ôn tập đề thi giữa kỳ, Luyện giải bài tập chương 3-5...".
  3. **Hình thức học (Study Mode):** Radio cards (Trực tuyến / Online, Trực tiếp / Offline, Kết hợp / Hybrid).
  4. **Thời gian rảnh dự kiến (Availability Schedule):** Text input, placeholder: "VD: Tối Thứ 2-4-6 từ 19h-21h, Chiều Chủ Nhật".
  5. [CH / Stretch: FR-SB-012] Optional interactive weekly timetable schedule grid selector.
  6. **Mô tả chi tiết (Description):** Textarea for study style, expectations, and goals.
- **Validation Rules:**
  - Course: Required.
  - Topic: Required, 5–100 chars.
  - Study Mode: Required.
  - Availability: Required.
  - Anti-spam: Max 5 active study requests (**BR-002**).
- **Success State:** Toast: "Đã tạo yêu cầu tìm bạn học thành công!", redirects to SCR-12.
- **Related Requirements:** FR-SB-001, FR-SB-002, FR-SB-009, FR-SB-012, BR-001, BR-002.
- **Related Use Cases:** UC-SB-01.

---

#### 4.4.4 SCR-15: Study Connection Management (Quản lý kết nối học tập)
- **Screen ID:** SCR-15
- **Name:** Study Connections / Quản lý kết nối bạn học
- **Purpose:** Review incoming study connection requests from peers and Accept or Decline.
- **Target User:** Study Request Creator.
- **Entry Point:** "Quản lý kết nối" or link from SCR-13.
- **Layout Structure:**
  - Card list of incoming requests showing Peer Avatar, Name, Major, Note message, and request timestamp.
  - Action buttons: "Xem hồ sơ" (SCR-07), "Đồng ý" (Green), "Từ chối" (Red outline).
- **Actions:**
  - *Accept:* Status updates to ACCEPTED, sends [SH / Post-Core: FR-SB-006] in-app notification to peer, and enables 1-to-1 direct messaging (SCR-20).
  - *Decline:* Status updates to DECLINED, sends [SH / Post-Core: FR-SB-006] in-app notification.
- **Related Requirements:** FR-SB-007, FR-SB-008, FR-CHAT-002.
- **Related Use Cases:** UC-SB-03.

---

### 4.5 Skill Exchange — Core 3 (SCR-16 to SCR-19)

#### 4.5.1 SCR-16: Skill Exchange Feed (Trao đổi kỹ năng)
- **Screen ID:** SCR-16
- **Name:** Skill Exchange Feed / Sàn trao đổi kỹ năng
- **Purpose:** Search and browse peer skill sharing posts, toggle between "Chia sẻ kỹ năng" (Offers) and "Cần học kỹ năng" (Requests).
- **Target User:** Authenticated Student.
- **Entry Point:** Sidebar navigation "Trao đổi kỹ năng".
- **Layout Structure:**
  - *Top Segmented Control (Tabs):*
    - **Tất cả (All)**
    - **🎓 Chia sẻ kỹ năng (Offers):** Bài đăng của sinh viên muốn hướng dẫn/dạy kỹ năng.
    - **🙋 Cần học kỹ năng (Requests):** Bài đăng của sinh viên muốn tìm người kèm/chỉ dẫn.
  - *Search & Tag Filter:* Search by skill name (e.g., Python, Photoshop, IELTS Speaking, Figma).
  - [SH / Post-Core: FR-SE-006] Multi-attribute search filters (Skill level, Format, Availability).
  - *Card Grid (2 columns):*
    - Card Anatomy:
      - Type Pill: Green badge (CHIA SẺ KỸ NĂNG) vs. Purple badge (CẦN HỌC KỸ NĂNG).
      - Skill Name & Level (e.g., Figma UI Design - Thành thạo).
      - Creator row: Avatar + Name + Major.
      - Teaching / Learning Format: 1-kèm-1, Online Google Meet, Trực tiếp thư viện.
      - Description snippet.
      - Action Button: "Xem chi tiết & Đề xuất" (SCR-17).
- **States:**
  - *Loading State:* Skeletons.
  - *Empty State:* "Chưa có bài đăng kỹ năng nào. Hãy là người đầu tiên chia sẻ kỹ năng của bạn!"
- **Related Requirements:** FR-SE-001, FR-SE-003, FR-SE-005, FR-SE-006.
- **Related Use Cases:** UC-SE-02.

---

#### 4.5.2 SCR-17: Skill Exchange Detail & Proposal Modal (Chi tiết trao đổi & Đề xuất)
- **Screen ID:** SCR-17
- **Name:** Skill Exchange Detail / Chi tiết trao đổi kỹ năng
- **Purpose:** View full skill description, format, creator qualifications, and submit an exchange proposal.
- **Target User:** Authenticated Student.
- **Entry Point:** Clicking any skill card on SCR-16.
- **Components & Layout:**
  - Type Banner (OFFER vs. REQUEST), Skill Title, Proficiency Level badge.
  - Creator profile summary card (with direct link to SCR-07).
  - Format, estimated sessions, and schedule.
  - Detailed Description.
  - [CH / Stretch: FR-SE-010, FR-SE-011] Peer reviews / ratings summary block.
  - Action Button:
    - *Non-owner:* "Đề xuất trao đổi kỹ năng" -> Opens Proposal Modal.
    - *Owner:* "Quản lý đề xuất" (SCR-19) \| "Đóng bài đăng" (Opens modal confirmation -> sets status to CLOSED, remains on SCR-17 or redirects to SCR-19).
- **Proposal Modal Form:**
  - Title: "Đề xuất trao đổi với [Tên sinh viên]"
  - Field: **Nội dung đề xuất (Proposal Note):** Textarea ("Mình có thể chia sẻ lại kỹ năng React nếu bạn hướng dẫn mình Figma...").
  - Actions: "Hủy" \| "Gửi đề xuất" (Primary).
- **Validation Rules:** Cannot respond to own post (**BR-003**).
- **Success State:** Toast: "Đã gửi đề xuất trao đổi thành công!", button changes to "Đã gửi đề xuất". [SH / Post-Core: FR-SE-008] Dispatches notification to post owner.
- **Related Requirements:** FR-SE-007, FR-SE-008, FR-SE-010, FR-SE-011, FR-SE-012, BR-003.
- **Related Use Cases:** UC-SE-02.

---

#### 4.5.3 SCR-18: Create Skill Offer / Request (Đăng tin chia sẻ / cần học kỹ năng)
- **Screen ID:** SCR-18
- **Name:** Create Skill Post / Đăng tin kỹ năng
- **Purpose:** Publish a skill sharing offer or a learning request to the platform community.
- **Target User:** Authenticated Student with completed profile (**BR-001**).
- **Entry Point:** "+ Đăng tin kỹ năng" button on SCR-06 or SCR-16.
- **Layout Structure:** Clean form container (Max-width 640px).
- **Form Fields:**
  1. **Loại tin đăng (Listing Type):** Segmented buttons:
     - 🎓 Tôi muốn chia sẻ kỹ năng (Offer)
     - 🙋 Tôi muốn tìm người hướng dẫn (Request)
  2. **Tên kỹ năng (Skill Name):** Input with auto-complete from system skill tags (e.g., Python Cơ bản, Thiết kế Canva, Thuyết trình).
  3. **Mức độ thành thạo (Proficiency Level):** Dropdown (Mới bắt đầu, Khá, Thành thạo).
  4. [SH / Post-Core: FR-SE-002, FR-SE-004] **Hình thức trao đổi (Format):** Radio buttons (1-kèm-1 Online, 1-kèm-1 Trực tiếp, Nhóm nhỏ).
  5. [SH / Post-Core: FR-SE-002, FR-SE-004] **Thời gian rảnh dự kiến (General Schedule):** Text input.
  6. **Mô tả chi tiết (Description):** Rich textarea (min 20 chars).
- **Validation Rules:**
  - Type: Required.
  - Skill Name: Required, 2–50 chars.
  - Proficiency Level: Required.
  - Description: Required, min 20 chars.
  - Anti-spam: Max 5 active skill listings (**BR-002**).
- **Success State:** Toast: "Đã đăng bài chia sẻ kỹ năng thành công!", redirects to SCR-16.
- **Related Requirements:** FR-SE-001, FR-SE-002, FR-SE-003, FR-SE-004, FR-SE-013, BR-001, BR-002.
- **Related Use Cases:** UC-SE-01.

---

#### 4.5.4 SCR-19: Exchange Response Management (Quản lý đề xuất trao đổi)
- **Screen ID:** SCR-19
- **Name:** Exchange Proposals View / Quản lý đề xuất trao đổi
- **Purpose:** Review incoming exchange proposals from peers and Accept or Decline.
- **Target User:** Skill Listing Creator.
- **Entry Point:** "Quản lý bài đăng" or link from SCR-17.
- **Layout Structure:**
  - Listing summary banner (Skill Name, Type, Status).
  - Proposals List:
    - Peer Avatar + Name + Major + Post timestamp.
    - Proposal Note explaining what the peer offers in exchange.
    - Action Buttons: "Xem hồ sơ" (SCR-07), "Đồng ý trao đổi" (Green), "Từ chối" (Red outline).
- **Actions:**
  - *Accept:* Updates status to ACCEPTED, sends [SH / Post-Core: FR-SE-008] in-app notification, unlocks 1-to-1 direct messaging (SCR-20).
  - *Decline:* Updates status to DECLINED, sends [SH / Post-Core: FR-SE-008] polite notification.
- **Related Requirements:** FR-SE-008, FR-SE-009, FR-CHAT-002.
- **Related Use Cases:** UC-SE-03.

---

### 4.6 Communication & Notifications (SCR-20 to SCR-21)

#### 4.6.1 SCR-20: In-Platform Direct Messaging (Trò chuyện trực tiếp 1-1)
- **Screen ID:** SCR-20
- **Name:** Direct Chat View / Trò chuyện trực tiếp
- **Purpose:** 1-to-1 text messaging interface allowing matched student peers to communicate and coordinate project, study, or skill exchange activities.
- **Target User:** Matched Authenticated Student (BR-006).
- **Entry Point:** Top bar message icon, sidebar "Tin nhắn", or "Nhắn tin" CTA on accepted application cards (SCR-11, SCR-15, SCR-19).
- **Layout Structure (Split-Pane on Desktop, 2-Screen Flow on Mobile):**
  - *Left Pane (Conversations List, 320px width on Desktop):*
    - Search conversations input.
    - Conversation Item: Peer Avatar, Peer Full Name, Match Badge (e.g., Dự án: Web QLTH, Bạn học: MTH102, Kỹ năng: Figma), Last message snippet, timestamp, unread dot counter.
  - *Right Pane (Active Chat Thread):*
    - Thread Header: Peer Avatar, Peer Name, Peer Major, Match Context Badge, Button "Xem hồ sơ" (SCR-07), [SH / Post-Core: FR-CHAT-008] Button "Báo cáo vi phạm".
    - Message Bubble Area:
      - Chronological scrollable message stream.
      - Sent Messages: Right-aligned Blue bubbles (#2563EB) with white text.
      - Received Messages: Left-aligned Slate bubbles (#F1F5F9) with dark text.
      - Message timestamps below each group.
      - [CH / Stretch: FR-CHAT-004] Message read receipt status indicators.
    - Message Input Bar (Bottom):
      - [SH / Post-Core: FR-CHAT-007] Text-only constraint: Text input "Nhập tin nhắn..." (Single or multiline auto-expand; file and audio attachments are excluded for v1.0).
      - Character limit counter (Max 1000 chars per message).
      - Send Button: Blue paper-plane icon button (Disabled when input is empty).
- **Permission & Security Rules:**
  - Cold messaging is strictly blocked (**BR-006**). Users can only chat if an accepted match exists across Project Match, Study Buddy, or Skill Exchange.
  - [CH / Stretch: FR-CHAT-006] Multi-user group chat is deferred.
- **States:**
  - *Empty State (No active conversations):* "Bạn chưa có cuộc trò chuyện nào. Hãy kết nối trong Tìm nhóm, Bạn học hoặc Trao đổi kỹ năng để bắt đầu trò chuyện!"
  - *Loading State:* Shimmer message bubbles.
- **Responsive Adaptation:**
  - *Desktop:* Two-pane side-by-side layout.
  - *Mobile:* Screen 1 = Conversations List. Tapping a conversation opens Screen 2 = Full-screen Chat Thread with Back button.
- **Related Requirements:** FR-CHAT-001, FR-CHAT-002, FR-CHAT-003, FR-CHAT-004, FR-CHAT-005, FR-CHAT-006, FR-CHAT-007, FR-CHAT-008, BR-006.
- **Related Use Cases:** UC-CHAT-01, Section 5.4.

---

#### 4.6.2 SCR-21: In-App Notification Center (Trung tâm thông báo)
- **Screen ID:** SCR-21
- **Name:** Notifications Center / Thông báo
- **Purpose:** Display chronological list of system and collaboration alerts (applications, match acceptances, responses, new messages) with unread status tracking.
- **Target User:** Authenticated Student / Administrator.
- **Entry Point:** Top bar Bell icon (/notifications or dropdown menu).
- **Layout Structure:**
  - *Header:* Title ("Thông báo"), Unread count badge ("3 chưa đọc"), [CH / Stretch: FR-NOTIF-005] Button "Đánh dấu tất cả đã đọc", [CH / Stretch: FR-NOTIF-006] Button "Xóa thông báo cũ".
  - *Notification Items List:*
    - Each Item contains:
      - Category Icon:
        - 🚀 Blue icon for Project Match events.
        - 📚 Green icon for Study Buddy events.
        - 💡 Purple icon for Skill Exchange events.
        - 💬 Sky icon for new messages.
      - Main Content: Formatted text (e.g., "**Trần Thị B** đã gửi đơn ứng tuyển vào dự án **Đồ án Web** của bạn.").
      - Timestamp: Relative time (e.g., "5 phút trước", "Hôm qua lúc 14:30").
      - Unread indicator: Blue dot indicator for unread items.
  - *Interaction:* Clicking any notification marks it as read and immediately redirects the user to the relevant screen (SCR-11, SCR-15, SCR-19, or SCR-20).
- **States:**
  - *Empty State:* "Bạn không có thông báo mới."
- **Related Requirements:** FR-NOTIF-001, FR-NOTIF-002, FR-NOTIF-003, FR-NOTIF-004, FR-NOTIF-005, FR-NOTIF-006, FR-NOTIF-007.
- **Related Use Cases:** UC-NOTIF-01.

---

### 4.7 Minimal Admin Panel (SCR-22 to SCR-24)

#### 4.7.1 SCR-22: Admin Dashboard Overview (Tổng quan quản trị)
- **Screen ID:** SCR-22
- **Name:** Admin Dashboard / Bảng điều khiển quản trị
- **Purpose:** Provide platform administrators with an entry overview of moderation shortcuts and platform access control.
- **Target User:** Administrator (ROLE-02).
- **Entry Point:** Header "Trang quản trị" (visible only to Admin role) or /admin.
- **Layout Structure:**
  - *Header (MUST HAVE - FR-ADM-001):* Title ("Quản trị UniConnect"), Admin identity badge, Quick link back to Student view.
  - *Primary Navigation Shortcuts (MUST HAVE - FR-ADM-001):*
    - Card Button: "👥 Quản lý người dùng" (SCR-23).
    - Card Button: "🛡️ Kiểm duyệt bài đăng" (SCR-24).
  - *[CH / Stretch: FR-ADM-008] Platform Metrics Summary (Optional / Stretch):*
    - Card 1: 👥 **Tổng người dùng:** Count of registered student accounts.
    - Card 2: 🚀 **Tin tuyển nhóm:** Count of active project vacancies.
    - Card 3: 📚 **Yêu cầu bạn học:** Count of active study requests.
    - Card 4: 💡 **Tin trao đổi kỹ năng:** Count of active skill listings.
- **Access Control:** Restricted strictly to ROLE-02 (**FR-ADM-001**). Unauthenticated or student users are redirected to 403 Forbidden error page.
- **Related Requirements:** FR-ADM-001, FR-ADM-008.
- **Related Use Cases:** Section 4.9.

---

#### 4.7.2 SCR-23: Admin User Management (Quản lý người dùng)
- **Screen ID:** SCR-23
- **Name:** User Management / Danh sách người dùng
- **Purpose:** Search, filter, inspect, and manage student account statuses (Active vs. Suspended).
- **Target User:** Administrator.
- **Entry Point:** Admin navigation "Quản lý người dùng".
- **Layout Structure:**
  - *Search & Filter Bar:* Search by student name or email; Filter by Status (Tất cả, Hoạt động, Chờ xác thực, Đã khóa).
  - [SH / Post-Core: FR-ADM-009, FR-ADM-010] Quick admin tools for tag curation / category presets.
  - *User Data Table:*
    - Columns:
      1. **Sinh viên:** Avatar + Full Name.
      2. **Email trường:** Email address.
      3. **Khoa / Ngành:** Faculty / Major.
      4. **Ngày tham gia:** Registration date.
      5. **Trạng thái:** Status badge (ACTIVE - Green, PENDING - Amber, SUSPENDED - Red).
      6. **Hành động (Actions):**
         - Button "Xem hồ sơ" (SCR-07).
         - Button "Khóa tài khoản" (Danger red, if Active) -> Opens Ban Confirmation Modal.
         - Button "Mở khóa" (Success green, if Suspended).
- **Ban Account Modal Component:**
  - Title: "Xác nhận khóa tài khoản: [Tên sinh viên]"
  - Warning copy: "Tài khoản bị khóa sẽ ngay lập tức bị ngắt phiên đăng nhập và không thể tạo bài đăng hay gửi tin nhắn."
  - Field: **Lý do khóa tài khoản (Reason):** Dropdown + Textarea (e.g., Spam, Nội dung không phù hợp, Vi phạm quy tắc cộng đồng).
  - Actions: "Hủy" \| "Xác nhận khóa" (Danger Red).
- **Success State:** Toast: "Đã khóa tài khoản thành công!", row status badge updates to SUSPENDED.
- **Related Requirements:** FR-ADM-002, FR-ADM-003, FR-ADM-009, FR-ADM-010, BR-007.
- **Related Use Cases:** UC-ADM-01, UC-ADM-02.

---

#### 4.7.3 SCR-24: Admin Content Moderation (Kiểm duyệt bài đăng)
- **Screen ID:** SCR-24
- **Name:** Content Moderation / Kiểm duyệt bài đăng
- **Purpose:** Allow administrators to review all active platform listings across Project Match, Study Buddy, and Skill Exchange, and delete violating posts.
- **Target User:** Administrator.
- **Entry Point:** Admin navigation "Kiểm duyệt bài đăng".
- **Layout Structure:**
  - *Module Tabs:* Tất cả bài đăng \| Tuyển nhóm dự án \| Tìm bạn học \| Trao đổi kỹ năng.
  - *Search Input:* Search by post title or author name.
  - [SH / Post-Core: FR-ADM-006] Tab for user-submitted content reports queue.
  - *[SH / Post-Core: FR-ADM-004] Moderation Table / Card Stack:*
    - Columns:
      1. **Loại tin:** Module badge (Project Match, Study Buddy, Skill Exchange).
      2. **Tiêu đề / Nội dung:** Post title + description preview.
      3. **Tác giả:** Author Name + Email.
      4. **Ngày đăng:** Timestamp.
      5. **Trạng thái:** Status badge (OPEN, FULL, CLOSED).
      6. **Hành động:** Button "Xem chi tiết" \| Button "Xóa bài đăng" (Danger Red).
- **Delete Post Modal Component:**
  - Title: "Xóa bài đăng vi phạm"
  - Field: **Lý do gỡ bài:** Text input / Dropdown.
  - Actions: "Hủy" \| "Gỡ bài đăng" (Danger Red).
- **Success State:** Toast: "Đã gỡ bài đăng vi phạm!", listing removed from public feeds.
- **Related Requirements:** FR-ADM-004, FR-ADM-005, FR-ADM-006, BR-009.
- **Related Use Cases:** UC-ADM-03.


---

## 5. Global UX States & Interaction Patterns

### 5.1 Form Validation & Error Feedback
- **Validation Trigger:** Client-side validation occurs on input blur (onBlur) and form submission (onSubmit).
- **Visual Feedback:**
  - Erroneous fields receive a subtle red border (order-red-500, #DC2626) and soft red focus ring.
  - Error message text appears immediately below the input in 12px red font (	ext-red-600) with an inline alert icon.
  - Form submit buttons remain clickable but trigger an instant scroll-to-first-error focus if validation fails.
- **Server Error Mapping:** Unexpected 500 errors or network failures render a global Toast alert: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."

---

### 5.2 Loading, Skeleton & Shimmer Standards
- **Page Load:** Rather than full-screen blocking spinners, content areas render animated **Skeleton Loaders** (subtle gray pulse #E2E8F0 to #F1F5F9) matching the exact shape of incoming cards, profile headers, or table rows.
- **Button Actions:** Interactive buttons (e.g., "Đăng nhập", "Gửi ứng tuyển", "Tạo bài đăng") display a compact 16px white spinner inside the button, replace label with "Đang xử lý...", and are disabled against duplicate clicks.

---

### 5.3 Empty State Patterns
All listing feeds, applications lists, chat windows, and notification centers adhere to a consistent **3-Element Empty State**:
1. **Icon / Illustration:** Soft slate line illustration related to the feature (e.g., empty search glass, empty inbox).
2. **Clear Title & Subtitle:** Friendly explanation (e.g., "Chưa có bài đăng nào", "Hãy là người đầu tiên tạo tin tuyển thành viên!").
3. **Actionable CTA Button:** Direct primary action button (e.g., "+ Đăng tin ngay", "Khám phá môn học khác").

---

### 5.4 Toast Notifications & Action Confirmations
- **Toast Position:** Fixed top-right on Desktop (Top-center on Mobile).
- **Toast Lifespan:** Auto-dismiss after 4 seconds (with manual close 'x' icon).
- **Toast Types:**
  - *Success (Green):* "Đã gửi đơn ứng tuyển thành công!"
  - *Error (Red):* "Đã xảy ra lỗi. Vui lòng kiểm tra lại thông tin."
  - *Info (Blue):* "Bạn có 1 tin nhắn mới từ Nguyễn Văn A."
- **Destructive Action Confirmations:** All destructive operations (Delete Post, Ban Account, Reject Application) require an explicit modal confirmation step to prevent accidental clicks.

---

### 5.5 Multi-Device Responsive Adaptation Matrix

| UI Component | Desktop View (> 1024px) | Tablet View (768px – 1024px) | Mobile View (< 768px) |
|---|---|---|---|
| **App Navigation** | Persistent Left Sidebar | Collapsible Hamburger Menu | Fixed Bottom Tab Bar (5 icons) |
| **Feed Grid Layout** | 2 or 3 Column Card Grid | 2 Column Card Grid | 1 Column Full-Width Card Stack |
| **Direct Chat** | Split-Pane (List + Chat side-by-side) | Split-Pane with narrower list | 2-Screen Flow (List $\rightarrow$ Fullscreen Thread) |
| **Forms & Modals** | Centered Modal Dialogs (600px) | Centered Modal Dialogs (80%) | Bottom Sheet or Fullscreen View |
| **Admin Data Tables** | Full Multi-Column Data Tables | Horizontal Scrollable Tables | Responsive Card Stacks per User/Post |

---

## 6. UI/UX Traceability Matrix

| Screen ID | Screen Name (Vietnamese / English) | Primary Requirement IDs | Related Use Case IDs |
|---|---|---|---|
| **SCR-01** | Landing Page / Trang chủ khách | FR-AUTH-001, DR-02 | UC-AUTH-01, Section 5.5 |
| **SCR-02** | Student Registration / Đăng ký tài khoản | FR-AUTH-001, FR-AUTH-002, FR-AUTH-003, FR-AUTH-008 | UC-AUTH-01 |
| **SCR-03** | Email Verification / Xác thực tài khoản | FR-AUTH-003, BR-008 | UC-AUTH-02 |
| **SCR-04** | Login Screen / Đăng nhập | FR-AUTH-004, FR-AUTH-006, BR-007 | UC-AUTH-03 |
| **SCR-05** | Password Reset / Quên & Đặt lại mật khẩu | FR-AUTH-005 | UC-AUTH-04 |
| **SCR-06** | Student Dashboard / Bảng tin tổng quan | FR-PROF-001, BR-001 | UC-PROF-01 |
| **SCR-07** | Student Profile & Skills / Hồ sơ cá nhân | FR-PROF-001 to  04, FR-PROF-005 to  07, FR-PROF-008, FR-PROF-009, FR-PROF-010, BR-001 | UC-PROF-01, UC-PROF-02 |
| **SCR-08** | Project Match Feed / Khám phá dự án | FR-PM-001, FR-PM-002, FR-PM-004, FR-PM-005, FR-PM-012 | UC-PM-02 |
| **SCR-09** | Project Detail & Apply / Chi tiết dự án | FR-PM-006, FR-PM-007, FR-PM-011, FR-PM-013, BR-003, BR-004, BR-005 | UC-PM-03, UC-PM-05 |
| **SCR-10** | Create Project Vacancy / Đăng tin tuyển nhóm | FR-PM-001, FR-PM-002, FR-PM-003, BR-001, BR-002 | UC-PM-01 |
| **SCR-11** | Project Application Management / Quản lý ứng viên | FR-PM-008, FR-PM-009, FR-PM-010, FR-PM-014, FR-CHAT-002 | UC-PM-04 |
| **SCR-12** | Study Buddy Feed / Bảng tin bạn cùng tiến | FR-SB-001, FR-SB-002, FR-SB-003, FR-SB-004, FR-SB-010 | UC-SB-02 |
| **SCR-13** | Study Buddy Detail & Connect / Chi tiết bạn học | FR-SB-005, FR-SB-006, FR-SB-011, BR-003 | UC-SB-02 |
| **SCR-14** | Create Study Request / Đăng tin tìm bạn học | FR-SB-001, FR-SB-002, FR-SB-009, FR-SB-012, BR-001, BR-002 | UC-SB-01 |
| **SCR-15** | Study Connection Management / Quản lý kết nối học | FR-SB-007, FR-SB-008, FR-CHAT-002 | UC-SB-03 |
| **SCR-16** | Skill Exchange Feed / Sàn trao đổi kỹ năng | FR-SE-001, FR-SE-003, FR-SE-005, FR-SE-006 | UC-SE-02 |
| **SCR-17** | Skill Detail & Propose / Chi tiết trao đổi kỹ năng | FR-SE-007, FR-SE-008, FR-SE-010, FR-SE-011, FR-SE-012, BR-003 | UC-SE-02 |
| **SCR-18** | Create Skill Post / Đăng tin chia sẻ kỹ năng | FR-SE-001, FR-SE-002, FR-SE-003, FR-SE-004, FR-SE-013, BR-001, BR-002 | UC-SE-01 |
| **SCR-19** | Exchange Response Management / Quản lý đề xuất | FR-SE-008, FR-SE-009, FR-CHAT-002 | UC-SE-03 |
| **SCR-20** | Direct Chat / Trò chuyện trực tiếp 1-1 | FR-CHAT-001, FR-CHAT-002, FR-CHAT-003, FR-CHAT-004, FR-CHAT-005, FR-CHAT-006, FR-CHAT-007, FR-CHAT-008, BR-006 | UC-CHAT-01, Section 5.4 |
| **SCR-21** | Notifications Center / Trung tâm thông báo | FR-NOTIF-001, FR-NOTIF-002, FR-NOTIF-003, FR-NOTIF-004, FR-NOTIF-005, FR-NOTIF-006, FR-NOTIF-007 | UC-NOTIF-01 |
| **SCR-22** | Admin Dashboard / Bảng điều khiển quản trị | FR-ADM-001, FR-ADM-008 | Section 4.9 |
| **SCR-23** | Admin User Management / Quản lý người dùng | FR-ADM-002, FR-ADM-003, FR-ADM-009, FR-ADM-010, BR-007 | UC-ADM-01, UC-ADM-02 |
| **SCR-24** | Admin Content Moderation / Kiểm duyệt bài đăng | FR-ADM-004, FR-ADM-005, FR-ADM-006, BR-009 | UC-ADM-03 |

---

## 7. Approval Sign-Off

> **PHASE 3 STATUS: 🔵 REVIEW REQUIRED**
> This UI/UX Specification document is submitted for formal Project Owner review.
> **Phase 4 — Database Architecture and all subsequent phases remain 🔒 LOCKED until Phase 3 is formally approved.**

| Stakeholder Role | Representative Name | Review Decision | Date | Signature / Note |
|---|---|---|---|---|
| **Project Owner** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |
| **Academic Supervisor / Instructor** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |
| **UI/UX Designer & Lead Developer** | ____________________ | ☐ Approved / ☐ Changes Requested | ____________ | ____________________ |

---

*End of 03 — UI/UX Specification v1.1.0*
*Document Status: REVIEW REQUIRED — Awaiting Project Owner Approval*
*Next Phase: Phase 4 — Database Architecture (LOCKED)*
