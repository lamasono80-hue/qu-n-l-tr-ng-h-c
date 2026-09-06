-- =============================================================================
-- Migration 001: Create Schema Tables (17 Physical PostgreSQL Tables)
-- UniConnect – Student Skill & Collaboration Platform
-- Baseline: Phase 4 Database Architecture v1.3.1 (Approved 2026-08-31)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Identity, Authentication & Profile Subsystem (6 Tables)
-- -----------------------------------------------------------------------------

-- 1.1 users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    verification_token VARCHAR(255),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    reset_token VARCHAR(255),
    reset_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_email_domain CHECK (email ~* '^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)*edu\.vn$'),
    CONSTRAINT chk_users_role CHECK (role IN ('STUDENT', 'ADMIN')),
    CONSTRAINT chk_users_status CHECK (status IN ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'))
);

-- 1.2 student_profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    campus VARCHAR(100),
    major VARCHAR(100),
    year_of_study INTEGER,
    bio TEXT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_student_profiles_year CHECK (year_of_study IS NULL OR (year_of_study >= 1 AND year_of_study <= 6))
);

-- 1.3 skills
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'TECH',
    is_system_standard BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_skills_category CHECK (category IN ('TECH', 'DESIGN', 'LANGUAGE', 'ACADEMIC', 'OTHER'))
);

-- 1.4 profile_skills
CREATE TABLE IF NOT EXISTS profile_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL DEFAULT 'BEGINNER',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_skills_profile FOREIGN KEY (profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_profile_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT,
    CONSTRAINT uq_profile_skills UNIQUE (profile_id, skill_id),
    CONSTRAINT chk_profile_skills_level CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED'))
);

-- 1.5 courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code VARCHAR(30) NOT NULL UNIQUE,
    course_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1.6 profile_courses
CREATE TABLE IF NOT EXISTS profile_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    course_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_courses_profile FOREIGN KEY (profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_profile_courses_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    CONSTRAINT uq_profile_courses UNIQUE (profile_id, course_id)
);

-- -----------------------------------------------------------------------------
-- 2. Core Subsystem 1: Project Match Collaboration (3 Tables)
-- -----------------------------------------------------------------------------

-- 2.1 project_posts
CREATE TABLE IF NOT EXISTS project_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'COURSEWORK',
    total_slots INTEGER NOT NULL DEFAULT 1,
    accepted_slots INTEGER NOT NULL DEFAULT 0,
    deadline DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_project_posts_category CHECK (category IN ('COURSEWORK', 'HACKATHON', 'RESEARCH', 'PERSONAL')),
    CONSTRAINT chk_project_posts_slots CHECK (total_slots >= 1 AND total_slots <= 10),
    CONSTRAINT chk_project_posts_accepted CHECK (accepted_slots >= 0 AND accepted_slots <= total_slots),
    CONSTRAINT chk_project_posts_status CHECK (status IN ('OPEN', 'FULL', 'EXPIRED', 'CLOSED', 'REMOVED_BY_ADMIN'))
);

-- 2.2 project_post_skills
CREATE TABLE IF NOT EXISTS project_post_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_post_skills_post FOREIGN KEY (post_id) REFERENCES project_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_post_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT,
    CONSTRAINT uq_project_post_skills UNIQUE (post_id, skill_id)
);

-- 2.3 project_applications (BR-004: Unique post_id + applicant_id)
CREATE TABLE IF NOT EXISTS project_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    applicant_id UUID NOT NULL,
    intro_note VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_applications_post FOREIGN KEY (post_id) REFERENCES project_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_applications_applicant FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_project_applications UNIQUE (post_id, applicant_id),
    CONSTRAINT chk_project_applications_status CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'))
);

-- -----------------------------------------------------------------------------
-- 3. Core Subsystem 2: Study Buddy Collaboration (2 Tables)
-- -----------------------------------------------------------------------------

-- 3.1 study_requests
CREATE TABLE IF NOT EXISTS study_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    course_id UUID NOT NULL,
    topic VARCHAR(100) NOT NULL,
    study_mode VARCHAR(20) NOT NULL DEFAULT 'HYBRID',
    availability VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_requests_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_study_requests_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    CONSTRAINT chk_study_requests_mode CHECK (study_mode IN ('ONLINE', 'OFFLINE', 'HYBRID')),
    CONSTRAINT chk_study_requests_status CHECK (status IN ('OPEN', 'CLOSED', 'REMOVED_BY_ADMIN'))
);

-- 3.2 study_connections (BR-004: Unique request_id + requester_id)
CREATE TABLE IF NOT EXISTS study_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    requester_id UUID NOT NULL,
    note VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_connections_request FOREIGN KEY (request_id) REFERENCES study_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_study_connections_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_study_connections UNIQUE (request_id, requester_id),
    CONSTRAINT chk_study_connections_status CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'))
);

-- -----------------------------------------------------------------------------
-- 4. Core Subsystem 3: Skill Exchange Collaboration (2 Tables)
-- -----------------------------------------------------------------------------

-- 4.1 skill_listings
CREATE TABLE IF NOT EXISTS skill_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'OFFER',
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL DEFAULT 'INTERMEDIATE',
    format VARCHAR(100),
    availability VARCHAR(200),
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_listings_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_skill_listings_type CHECK (type IN ('OFFER', 'REQUEST')),
    CONSTRAINT chk_skill_listings_level CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    CONSTRAINT chk_skill_listings_status CHECK (status IN ('OPEN', 'CLOSED', 'REMOVED_BY_ADMIN'))
);

-- 4.2 skill_responses (BR-004: Unique listing_id + responder_id)
CREATE TABLE IF NOT EXISTS skill_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    responder_id UUID NOT NULL,
    proposal_note VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_responses_listing FOREIGN KEY (listing_id) REFERENCES skill_listings(id) ON DELETE CASCADE,
    CONSTRAINT fk_skill_responses_responder FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_skill_responses UNIQUE (listing_id, responder_id),
    CONSTRAINT chk_skill_responses_status CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'))
);

-- -----------------------------------------------------------------------------
-- 5. Direct Messaging & Notification Subsystem (3 Tables)
-- -----------------------------------------------------------------------------

-- 5.1 conversations (Canonical participant order: user_one_id < user_two_id)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_one_id UUID NOT NULL,
    user_two_id UUID NOT NULL,
    match_type VARCHAR(30) NOT NULL,
    match_source_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversations_user_one FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_user_two FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_conversations_user_order CHECK (user_one_id < user_two_id),
    CONSTRAINT uq_conversations_participants UNIQUE (user_one_id, user_two_id),
    CONSTRAINT chk_conversations_match_type CHECK (match_type IN ('PROJECT_MATCH', 'STUDY_BUDDY', 'SKILL_EXCHANGE'))
);

-- 5.2 messages (FR-CHAT-007: 1 to 1000 chars)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_messages_content_len CHECK (length(content) >= 1 AND length(content) <= 1000)
);

-- 5.3 notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    target_url VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 6. Administration & Moderation Subsystem (1 Table)
-- -----------------------------------------------------------------------------

-- 6.1 account_moderation_logs (Audit Trail)
CREATE TABLE IF NOT EXISTS account_moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    target_entity_type VARCHAR(50) NOT NULL,
    target_entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_moderation_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_moderation_logs_entity_type CHECK (target_entity_type IN ('USER', 'PROJECT_POST', 'STUDY_REQUEST', 'SKILL_LISTING'))
);

