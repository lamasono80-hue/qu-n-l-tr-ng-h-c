# Development Traceability Matrix
# UniConnect – Student Skill & Collaboration Platform

> **Phase:** 6 — Development
> **Document Version:** 1.0.0
> **Status:** 🟡 IN PROGRESS
> **Created:** 2026-08-31
> **Approved Baselines:** Phase 1 (v1.2.0), Phase 2 (v1.2.0), Phase 3 (v1.1.0), Phase 4 (v1.3.1), Phase 5 (v1.1.0)

---

## 1. Traceability Overview

This matrix maps each of the **47 Approved API Endpoints** and **24 Approved UI Screens** to their designated implementation files in the backend (server/) and frontend (client/).

---

## 2. API Implementation Mapping (47 Endpoints)

| API ID | Method & Path | Target Controller / Router File | Target Service File | Database Tables |
|---|---|---|---|---|
| **API-AUTH-01..06** | /api/v1/auth/* | server/src/modules/auth/auth.controller.ts | server/src/modules/auth/auth.service.ts | users |
| **API-PROF-01..07** | /api/v1/profiles/*, /skills, /courses | server/src/modules/profile/profile.controller.ts | server/src/modules/profile/profile.service.ts | student_profiles, skills, profile_skills, courses, profile_courses |
| **API-PM-01..08** | /api/v1/projects/* | server/src/modules/project-match/project.controller.ts | server/src/modules/project-match/project.service.ts | project_posts, project_post_skills, project_applications, conversations, 
otifications |
| **API-SB-01..07** | /api/v1/study-requests/* | server/src/modules/study-buddy/study.controller.ts | server/src/modules/study-buddy/study.service.ts | study_requests, study_connections, courses, conversations, 
otifications |
| **API-SE-01..07** | /api/v1/skill-listings/* | server/src/modules/skill-exchange/skill.controller.ts | server/src/modules/skill-exchange/skill.service.ts | skill_listings, skill_responses, conversations, 
otifications |
| **API-CHAT-01..03** | /api/v1/conversations/* | server/src/modules/chat/chat.controller.ts | server/src/modules/chat/chat.service.ts | conversations, messages, users, student_profiles |
| **API-NOTIF-01..03**| /api/v1/notifications/* | server/src/modules/notifications/notification.controller.ts | server/src/modules/notifications/notification.service.ts | 
otifications |
| **API-ADM-01..06** | /api/v1/admin/* | server/src/modules/admin/admin.controller.ts | server/src/modules/admin/admin.service.ts | users, ccount_moderation_logs, project_posts, study_requests, skill_listings, skills, courses |

---

## 3. UI Screen Implementation Mapping (24 Screens)

| Screen ID | Screen Name | Target Page Component File | Associated API IDs |
|---|---|---|---|
| **SCR-01** | Landing Page | client/src/pages/auth/LandingPage.tsx | API-AUTH-01, API-PROF-06, API-PROF-07 |
| **SCR-02** | Student Register | client/src/pages/auth/RegisterPage.tsx | API-AUTH-01 |
| **SCR-03** | Email Verification | client/src/pages/auth/VerifyEmailPage.tsx | API-AUTH-02, API-AUTH-03 |
| **SCR-04** | User Login | client/src/pages/auth/LoginPage.tsx | API-AUTH-04 |
| **SCR-05** | Forgot / Reset Password | client/src/pages/auth/ForgotPasswordPage.tsx | API-AUTH-05, API-AUTH-06 |
| **SCR-06** | Profile View | client/src/pages/profile/ProfileViewPage.tsx | API-PROF-01, API-PROF-03 |
| **SCR-07** | Edit Profile | client/src/pages/profile/EditProfilePage.tsx | API-PROF-02, API-PROF-04, API-PROF-05, API-PROF-06, API-PROF-07 |
| **SCR-08** | Project Feed & Filters | client/src/pages/project-match/ProjectFeedPage.tsx | API-PM-01, API-PROF-06 |
| **SCR-09** | Project Detail | client/src/pages/project-match/ProjectDetailPage.tsx | API-PM-02, API-PM-04, API-PM-05 |
| **SCR-10** | Create Project Post | client/src/pages/project-match/CreateProjectPage.tsx | API-PM-03, API-PROF-06 |
| **SCR-11** | Project Applications Management | client/src/pages/project-match/ProjectApplicationsPage.tsx | API-PM-06, API-PM-07, API-PM-08 |
| **SCR-12** | Study Buddy Feed | client/src/pages/study-buddy/StudyFeedPage.tsx | API-SB-01, API-PROF-07 |
| **SCR-13** | Study Request Detail | client/src/pages/study-buddy/StudyDetailPage.tsx | API-SB-02, API-SB-04, API-SB-05 |
| **SCR-14** | Create Study Request | client/src/pages/study-buddy/CreateStudyRequestPage.tsx | API-SB-03, API-PROF-07 |
| **SCR-15** | Study Connection Management | client/src/pages/study-buddy/StudyConnectionsPage.tsx | API-SB-06, API-SB-07 |
| **SCR-16** | Skill Exchange Feed | client/src/pages/skill-exchange/SkillFeedPage.tsx | API-SE-01 |
| **SCR-17** | Skill Listing Detail | client/src/pages/skill-exchange/SkillDetailPage.tsx | API-SE-02, API-SE-04, API-SE-05 |
| **SCR-18** | Create Skill Listing | client/src/pages/skill-exchange/CreateSkillListingPage.tsx | API-SE-03 |
| **SCR-19** | Skill Proposals Management | client/src/pages/skill-exchange/SkillProposalsPage.tsx | API-SE-06, API-SE-07 |
| **SCR-20** | 1-to-1 Direct Chat | client/src/pages/chat/ChatPage.tsx | API-CHAT-01, API-CHAT-02, API-CHAT-03 |
| **SCR-21** | In-App Notifications | client/src/pages/notifications/NotificationsPage.tsx | API-NOTIF-01, API-NOTIF-02, API-NOTIF-03 |
| **SCR-22** | Admin Dashboard | client/src/pages/admin/AdminDashboardPage.tsx | API-ADM-01 |
| **SCR-23** | Admin User Accounts | client/src/pages/admin/AdminUsersPage.tsx | API-ADM-02, API-ADM-03 |
| **SCR-24** | Admin Content Moderation | client/src/pages/admin/AdminModerationPage.tsx | API-ADM-04, API-ADM-05, API-ADM-06 |

---

*End of Development Traceability Matrix v1.0.0*
