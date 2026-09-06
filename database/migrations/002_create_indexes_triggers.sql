-- =============================================================================
-- Migration 002: Create Indexes, Integrity Functions & Triggers
-- UniConnect â€“ Student Skill & Collaboration Platform
-- Baseline: Phase 4 Database Architecture v1.3.1 (Approved 2026-08-31)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Performance & Search Indexes
-- -----------------------------------------------------------------------------

-- users
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- student_profiles
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_major ON student_profiles(major);
CREATE INDEX IF NOT EXISTS idx_student_profiles_campus ON student_profiles(campus);

-- skills & profile_skills
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile_id ON profile_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_skill_id ON profile_skills(skill_id);

-- courses & profile_courses
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_profile_courses_profile_id ON profile_courses(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_courses_course_id ON profile_courses(course_id);

-- project_posts & relations
CREATE INDEX IF NOT EXISTS idx_project_posts_author ON project_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_project_posts_status ON project_posts(status);
CREATE INDEX IF NOT EXISTS idx_project_posts_category ON project_posts(category);
CREATE INDEX IF NOT EXISTS idx_project_posts_deadline ON project_posts(deadline);
CREATE INDEX IF NOT EXISTS idx_project_post_skills_post ON project_post_skills(post_id);
CREATE INDEX IF NOT EXISTS idx_project_post_skills_skill ON project_post_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_post ON project_applications(post_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_applicant ON project_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_status ON project_applications(status);

-- study_requests & relations
CREATE INDEX IF NOT EXISTS idx_study_requests_author ON study_requests(author_id);
CREATE INDEX IF NOT EXISTS idx_study_requests_course ON study_requests(course_id);
CREATE INDEX IF NOT EXISTS idx_study_requests_status ON study_requests(status);
CREATE INDEX IF NOT EXISTS idx_study_connections_request ON study_connections(request_id);
CREATE INDEX IF NOT EXISTS idx_study_connections_requester ON study_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_study_connections_status ON study_connections(status);

-- skill_listings & relations
CREATE INDEX IF NOT EXISTS idx_skill_listings_author ON skill_listings(author_id);
CREATE INDEX IF NOT EXISTS idx_skill_listings_type ON skill_listings(type);
CREATE INDEX IF NOT EXISTS idx_skill_listings_status ON skill_listings(status);
CREATE INDEX IF NOT EXISTS idx_skill_responses_listing ON skill_responses(listing_id);
CREATE INDEX IF NOT EXISTS idx_skill_responses_responder ON skill_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_skill_responses_status ON skill_responses(status);

-- conversations & messages
CREATE INDEX IF NOT EXISTS idx_conversations_user_one ON conversations(user_one_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_two ON conversations(user_two_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sent ON messages(conversation_id, sent_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- notifications & audit logs
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target ON account_moderation_logs(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_admin ON account_moderation_logs(admin_id);

-- -----------------------------------------------------------------------------
-- 2. Message Participant Integrity Guard Trigger (Phase 4 Section 5.6)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_check_message_participant()
RETURNS TRIGGER AS $$
DECLARE
    v_user_one UUID;
    v_user_two UUID;
BEGIN
    SELECT user_one_id, user_two_id INTO v_user_one, v_user_two
    FROM conversations
    WHERE id = NEW.conversation_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conversation % does not exist', NEW.conversation_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    IF NEW.sender_id <> v_user_one AND NEW.sender_id <> v_user_two THEN
        RAISE EXCEPTION 'Sender % is not a participant of conversation %', NEW.sender_id, NEW.conversation_id
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    -- Update last_message_at timestamp on conversation
    UPDATE conversations
    SET last_message_at = NEW.sent_at
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_message_participant ON messages;
CREATE TRIGGER trg_enforce_message_participant
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION fn_check_message_participant();

-- -----------------------------------------------------------------------------
-- 3. Cross-Table Self-Application / Connection Guard Triggers (BR-003)
-- -----------------------------------------------------------------------------

-- 3.1 Project Match: Prevent self-application
CREATE OR REPLACE FUNCTION fn_prevent_self_project_application()
RETURNS TRIGGER AS $$
DECLARE
    v_author_id UUID;
BEGIN
    SELECT author_id INTO v_author_id
    FROM project_posts
    WHERE id = NEW.post_id;

    IF NEW.applicant_id = v_author_id THEN
        RAISE EXCEPTION 'Author cannot apply to their own project post (BR-003)'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_self_project_application ON project_applications;
CREATE TRIGGER trg_prevent_self_project_application
    BEFORE INSERT ON project_applications
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_self_project_application();

-- 3.2 Study Buddy: Prevent self-connection
CREATE OR REPLACE FUNCTION fn_prevent_self_study_connection()
RETURNS TRIGGER AS $$
DECLARE
    v_author_id UUID;
BEGIN
    SELECT author_id INTO v_author_id
    FROM study_requests
    WHERE id = NEW.request_id;

    IF NEW.requester_id = v_author_id THEN
        RAISE EXCEPTION 'Author cannot send connection request to their own study request (BR-003)'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_self_study_connection ON study_connections;
CREATE TRIGGER trg_prevent_self_study_connection
    BEFORE INSERT ON study_connections
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_self_study_connection();

-- 3.3 Skill Exchange: Prevent self-proposal
CREATE OR REPLACE FUNCTION fn_prevent_self_skill_response()
RETURNS TRIGGER AS $$
DECLARE
    v_author_id UUID;
BEGIN
    SELECT author_id INTO v_author_id
    FROM skill_listings
    WHERE id = NEW.listing_id;

    IF NEW.responder_id = v_author_id THEN
        RAISE EXCEPTION 'Author cannot send proposal to their own skill listing (BR-003)'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_self_skill_response ON skill_responses;
CREATE TRIGGER trg_prevent_self_skill_response
    BEFORE INSERT ON skill_responses
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_self_skill_response();
