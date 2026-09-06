// AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { StudentLayout } from '../components/layout/StudentLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// 24 Screens
import { LandingPage } from '../pages/auth/LandingPage'; // SCR-01
import { RegisterPage } from '../pages/auth/RegisterPage'; // SCR-02
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage'; // SCR-03
import { LoginPage } from '../pages/auth/LoginPage'; // SCR-04
import { PasswordRecoveryPage } from '../pages/auth/PasswordRecoveryPage'; // SCR-05

import { DashboardPage } from '../pages/profile/DashboardPage'; // SCR-06
import { ProfilePage } from '../pages/profile/ProfilePage'; // SCR-07

import { ProjectFeedPage } from '../pages/project-match/ProjectFeedPage'; // SCR-08
import { ProjectDetailPage } from '../pages/project-match/ProjectDetailPage'; // SCR-09
import { CreateProjectPage } from '../pages/project-match/CreateProjectPage'; // SCR-10
import { ProjectApplicationsPage } from '../pages/project-match/ProjectApplicationsPage'; // SCR-11

import { StudyBuddyFeedPage } from '../pages/study-buddy/StudyBuddyFeedPage'; // SCR-12
import { StudyBuddyDetailPage } from '../pages/study-buddy/StudyBuddyDetailPage'; // SCR-13
import { CreateStudyRequestPage } from '../pages/study-buddy/CreateStudyRequestPage'; // SCR-14
import { StudyConnectionsPage } from '../pages/study-buddy/StudyConnectionsPage'; // SCR-15

import { SkillExchangeFeedPage } from '../pages/skill-exchange/SkillExchangeFeedPage'; // SCR-16
import { SkillExchangeDetailPage } from '../pages/skill-exchange/SkillExchangeDetailPage'; // SCR-17
import { CreateSkillPostPage } from '../pages/skill-exchange/CreateSkillPostPage'; // SCR-18
import { SkillProposalsPage } from '../pages/skill-exchange/SkillProposalsPage'; // SCR-19

import { ChatPage } from '../pages/chat/ChatPage'; // SCR-20
import { NotificationsPage } from '../pages/notifications/NotificationsPage'; // SCR-21

import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'; // SCR-22
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'; // SCR-23
import { AdminModerationPage } from '../pages/admin/AdminModerationPage'; // SCR-24

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Guest Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
        <Route path="/reset-password" element={<PasswordRecoveryPage />} />
      </Route>

      {/* 2. Authenticated Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile/:userId?" element={<ProfilePage />} />

          {/* Project Match Module */}
          <Route path="/projects" element={<ProjectFeedPage />} />
          <Route path="/projects/create" element={<CreateProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/applications" element={<ProjectApplicationsPage />} />
          <Route path="/my-applications/projects" element={<ProjectApplicationsPage />} />

          {/* Study Buddy Module */}
          <Route path="/study-buddy" element={<StudyBuddyFeedPage />} />
          <Route path="/study-buddy/create" element={<CreateStudyRequestPage />} />
          <Route path="/study-buddy/:id" element={<StudyBuddyDetailPage />} />
          <Route path="/study-buddy/:id/connections" element={<StudyConnectionsPage />} />
          <Route path="/my-connections/study" element={<StudyConnectionsPage />} />

          {/* Skill Exchange Module */}
          <Route path="/skill-exchange" element={<SkillExchangeFeedPage />} />
          <Route path="/skill-exchange/create" element={<CreateSkillPostPage />} />
          <Route path="/skill-exchange/:id" element={<SkillExchangeDetailPage />} />
          <Route path="/skill-exchange/:id/proposals" element={<SkillProposalsPage />} />
          <Route path="/my-proposals/skills" element={<SkillProposalsPage />} />

          {/* Chat & Notifications */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* 3. Authenticated Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="moderation" element={<AdminModerationPage />} />
        </Route>
      </Route>

      {/* 4. Fallback 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
