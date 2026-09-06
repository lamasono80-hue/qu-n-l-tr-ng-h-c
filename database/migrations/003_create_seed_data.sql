-- =============================================================================
-- Migration 003: Standard Catalogs & Initial Seed Data
-- UniConnect – Student Skill & Collaboration Platform
-- Baseline: Phase 4 Database Architecture v1.3.1 (Approved 2026-08-31)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Standard Skills Catalog (FR-PROF-003, FR-ADM-010)
-- -----------------------------------------------------------------------------

INSERT INTO skills (id, name, category, is_system_standard) VALUES
    ('10000000-0000-0000-0000-000000000001', 'JavaScript', 'TECH', TRUE),
    ('10000000-0000-0000-0000-000000000002', 'TypeScript', 'TECH', TRUE),
    ('10000000-0000-0000-0000-000000000003', 'React', 'TECH', TRUE),
    ('10000000-0000-0000-0000-000000000004', 'Node.js', 'TECH', TRUE),
    ('10000000-0000-0000-0000-000000000005', 'Python', 'TECH', TRUE),
    ('10000000-0000-0000-0000-000000000006', 'Java', 'TECH', TRUE),
    ('10000000-0000-0000-0000-000000000007', 'Flutter', 'TECH', TRUE),
    ('10000000-0000-0000-0000-000000000008', 'PostgreSQL', 'TECH', TRUE),
    ('10000000-0000-0000-0000-000000000009', 'Docker', 'TECH', TRUE),
    ('10000000-0000-0000-0000-000000000010', 'Tailwind CSS', 'TECH', TRUE),
    ('20000000-0000-0000-0000-000000000001', 'Figma UI/UX', 'DESIGN', TRUE),
    ('20000000-0000-0000-0000-000000000002', 'Adobe Photoshop', 'DESIGN', TRUE),
    ('20000000-0000-0000-0000-000000000003', 'Adobe Illustrator', 'DESIGN', TRUE),
    ('30000000-0000-0000-0000-000000000001', 'Tiếng Anh Giao tiếp', 'LANGUAGE', TRUE),
    ('30000000-0000-0000-0000-000000000002', 'IELTS Preparation', 'LANGUAGE', TRUE),
    ('30000000-0000-0000-0000-000000000003', 'Tiếng Nhật N3/N2', 'LANGUAGE', TRUE),
    ('40000000-0000-0000-0000-000000000001', 'Viết Báo cáo Nghiên cứu', 'ACADEMIC', TRUE),
    ('40000000-0000-0000-0000-000000000002', 'Thuyết trình Học thuật', 'ACADEMIC', TRUE)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Standard University Course Catalog (FR-PROF-004, FR-SB-001, FR-ADM-011)
-- -----------------------------------------------------------------------------

INSERT INTO courses (id, course_code, course_name) VALUES
    ('50000000-0000-0000-0000-000000000001', 'CS101', 'Nhập môn Lập trình'),
    ('50000000-0000-0000-0000-000000000002', 'CS201', 'Cấu trúc Dữ liệu và Giải thuật'),
    ('50000000-0000-0000-0000-000000000003', 'CS301', 'Cơ sở Dữ liệu'),
    ('50000000-0000-0000-0000-000000000004', 'INT2204', 'Mạng Máy tính'),
    ('50000000-0000-0000-0000-000000000005', 'INT3306', 'Phát triển Ứng dụng Web'),
    ('50000000-0000-0000-0000-000000000006', 'MATH101', 'Giải tích 1'),
    ('50000000-0000-0000-0000-000000000007', 'MATH102', 'Giải tích 2'),
    ('50000000-0000-0000-0000-000000000008', 'MATH201', 'Đại số Tuyến tính'),
    ('50000000-0000-0000-0000-000000000009', 'MATH301', 'Xác suất Thống kê'),
    ('50000000-0000-0000-0000-000000000010', 'SE401', 'Kiến trúc Phần mềm')
ON CONFLICT (course_code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Default Administrator Account (Phase 4 Section 6.1)
-- Credentials MUST be injected through environment variable SEED_ADMIN_PASSWORD_HASH
-- -----------------------------------------------------------------------------

-- Note: The administrative account is seeded dynamically via database/seed.ts using
-- the SEED_ADMIN_PASSWORD_HASH environment variable to ensure zero plaintext credential storage.
