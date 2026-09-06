// Global API Envelopes
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
    unread_count?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{ field?: string; issue: string }>;
  };
}

// User & Auth
export type UserRole = 'STUDENT' | 'ADMIN';
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
  avatar_url?: string | null;
  campus?: string | null;
  major?: string | null;
  year_of_study?: number | null;
  bio?: string | null;
  is_profile_complete?: boolean;
}

export interface AuthTokens {
  token: string;
  user: User;
}

// Profile & Master Catalog
export interface StudentSkill {
  skill_id: string;
  skill_name: string;
  category: string;
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface StudentCourse {
  course_id: string;
  course_code: string;
  course_name: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  is_system_standard: boolean;
}

export interface CourseItem {
  id: string;
  course_code: string;
  course_name: string;
}

export interface StudentProfileDetail {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name: string;
  avatar_url: string | null;
  campus: string | null;
  major: string | null;
  year_of_study: number | null;
  bio: string | null;
  is_profile_complete: boolean;
  skills: StudentSkill[];
  courses: StudentCourse[];
}

// Project Match
export type ProjectCategory = 'COURSEWORK' | 'HACKATHON' | 'RESEARCH' | 'PERSONAL';
export type ProjectStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'REMOVED_BY_ADMIN';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface ProjectPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  author_major: string | null;
  title: string;
  category: ProjectCategory;
  description: string;
  total_slots: number;
  accepted_slots: number;
  status: ProjectStatus;
  deadline: string;
  created_at: string;
  skills: Array<{ id: string; name: string }>;
  is_mine?: boolean;
  has_applied?: boolean;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_avatar: string | null;
  applicant_major: string | null;
  applicant_year: number | null;
  intro_note: string;
  status: ApplicationStatus;
  created_at: string;
  project_title?: string;
  matching_skills?: string[];
}

// Study Buddy
export type StudyMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type StudyRequestStatus = 'OPEN' | 'CLOSED' | 'REMOVED_BY_ADMIN';
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface StudyRequest {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  author_major: string | null;
  course_id: string;
  course_code: string;
  course_name: string;
  topic: string;
  study_mode: StudyMode;
  availability: string;
  description: string;
  status: StudyRequestStatus;
  created_at: string;
  is_mine?: boolean;
}

export interface StudyConnection {
  id: string;
  request_id: string;
  requester_id: string;
  requester_name: string;
  requester_avatar: string | null;
  requester_major: string | null;
  note: string;
  status: ConnectionStatus;
  created_at: string;
  course_code?: string;
  topic?: string;
}

// Skill Exchange
export type SkillListingType = 'OFFER' | 'REQUEST';
export type SkillListingStatus = 'OPEN' | 'CLOSED' | 'REMOVED_BY_ADMIN';
export type ResponseStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface SkillListing {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  author_major: string | null;
  type: SkillListingType;
  skill_name: string;
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  format: 'ONE_ON_ONE_ONLINE' | 'ONE_ON_ONE_OFFLINE' | 'SMALL_GROUP';
  description: string;
  status: SkillListingStatus;
  created_at: string;
  is_mine?: boolean;
}

export interface SkillResponse {
  id: string;
  listing_id: string;
  responder_id: string;
  responder_name: string;
  responder_avatar: string | null;
  responder_major: string | null;
  proposal_note: string;
  status: ResponseStatus;
  created_at: string;
  skill_name?: string;
  listing_type?: SkillListingType;
}

// Chat
export interface ConversationItem {
  id: string;
  match_type: 'PROJECT_MATCH' | 'STUDY_BUDDY' | 'SKILL_EXCHANGE';
  peer: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message: {
    content: string;
    sent_at: string;
    is_self: boolean;
  } | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  is_self: boolean;
}

// Notifications
export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  target_url: string | null;
  is_read: boolean;
  created_at: string;
}

// Admin
export interface SystemStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  active_project_posts: number;
  active_study_requests: number;
  active_skill_listings: number;
  total_matches_formed: number;
}

export interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  major: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}
