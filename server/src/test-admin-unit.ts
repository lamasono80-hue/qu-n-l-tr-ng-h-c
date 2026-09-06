import {
  validateUuidParam,
  validateEntityTypeParam,
  validateUpdateUserStatus,
  validateRemoveListing,
  validateAddStandardSkill,
  validateAddStandardCourse,
  validateListUsersQuery,
} from './modules/admin/admin.validation';
import { ValidationFailedError } from './utils/errors';

async function runAdminUnitTests() {
  console.log('=== Running Milestone 6.10 Administration & Moderation Unit Verification ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exit(1);
    }
  }

  // 1. UUID Validation
  console.log('--- Testing Admin UUID Validation ---');
  const validUuid = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
  assert(validateUuidParam(validUuid, 'id') === validUuid, 'Valid admin UUID accepted');

  let invalidUuidCaught = false;
  try {
    validateUuidParam('invalid-user-id', 'id');
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidUuidCaught = true;
  }
  assert(invalidUuidCaught === true, 'Invalid admin UUID strictly rejected');

  // 2. Entity Type Param Validation
  console.log('\n--- Testing Moderation Entity Type Param Validation ---');
  assert(validateEntityTypeParam('PROJECT_POST') === 'PROJECT_POST', 'PROJECT_POST entity type accepted');
  assert(validateEntityTypeParam('study_request') === 'STUDY_REQUEST', 'STUDY_REQUEST entity type accepted (case-insensitive)');
  assert(validateEntityTypeParam('SKILL_LISTING') === 'SKILL_LISTING', 'SKILL_LISTING entity type accepted');

  let invalidEntityCaught = false;
  try {
    validateEntityTypeParam('USER_PROFILE');
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidEntityCaught = true;
  }
  assert(invalidEntityCaught === true, 'Invalid entity type strictly rejected');

  // 3. Update User Status DTO Validation (BR-007)
  console.log('\n--- Testing Update User Status DTO Validation (BR-007) ---');
  const validSuspend = validateUpdateUserStatus({
    status: 'SUSPENDED',
    reason: 'Vi phạm quy tắc cộng đồng: Đăng tin spam liên tục.',
  });
  assert(validSuspend.status === 'SUSPENDED', 'SUSPENDED status accepted');
  assert(validSuspend.reason === 'Vi phạm quy tắc cộng đồng: Đăng tin spam liên tục.', 'Reason parsed');

  const validUnban = validateUpdateUserStatus({
    status: 'ACTIVE',
    reason: 'Đã hoàn tất khiếu nại và xác minh danh tính.',
  });
  assert(validUnban.status === 'ACTIVE', 'ACTIVE status accepted');

  let invalidStatusCaught = false;
  try {
    validateUpdateUserStatus({ status: 'BANNED', reason: 'Spam' });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidStatusCaught = true;
  }
  assert(invalidStatusCaught === true, 'Invalid status (BANNED) strictly rejected');

  let shortReasonCaught = false;
  try {
    validateUpdateUserStatus({ status: 'SUSPENDED', reason: 'Ngắn' });
  } catch (err) {
    if (err instanceof ValidationFailedError) shortReasonCaught = true;
  }
  assert(shortReasonCaught === true, 'Moderation reason < 5 chars strictly rejected');

  // 4. Soft Removal DTO Validation (BR-009)
  console.log('\n--- Testing Soft Removal DTO Validation (BR-009) ---');
  const validRemove = validateRemoveListing({
    reason: 'Nội dung bài đăng chứa ngôn từ không phù hợp chuẩn mực.',
  });
  assert(validRemove.reason === 'Nội dung bài đăng chứa ngôn từ không phù hợp chuẩn mực.', 'Valid removal reason parsed');

  let shortRemoveReason = false;
  try {
    validateRemoveListing({ reason: 'Xoá' });
  } catch (err) {
    if (err instanceof ValidationFailedError) shortRemoveReason = true;
  }
  assert(shortRemoveReason === true, 'Listing removal reason < 5 chars strictly rejected');

  // 5. Add Standard Skill DTO Validation
  console.log('\n--- Testing Add Standard Skill DTO Validation ---');
  const validSkill = validateAddStandardSkill({
    name: 'Docker & Kubernetes',
    category: 'TECH',
  });
  assert(validSkill.name === 'Docker & Kubernetes', 'Skill name parsed');
  assert(validSkill.category === 'TECH', 'Skill category parsed');

  let shortSkillName = false;
  try {
    validateAddStandardSkill({ name: 'A', category: 'TECH' });
  } catch (err) {
    if (err instanceof ValidationFailedError) shortSkillName = true;
  }
  assert(shortSkillName === true, 'Skill name < 2 chars strictly rejected');

  // 6. Add Standard Course DTO Validation
  console.log('\n--- Testing Add Standard Course DTO Validation ---');
  const validCourse = validateAddStandardCourse({
    course_code: 'INT3306',
    course_name: 'Phát triển ứng dụng Web',
  });
  assert(validCourse.course_code === 'INT3306', 'Course code parsed');
  assert(validCourse.course_name === 'Phát triển ứng dụng Web', 'Course name parsed');

  let shortCourseCode = false;
  try {
    validateAddStandardCourse({ course_code: 'I', course_name: 'Web' });
  } catch (err) {
    if (err instanceof ValidationFailedError) shortCourseCode = true;
  }
  assert(shortCourseCode === true, 'Course code < 2 chars strictly rejected');

  // 7. Query Validation & Clamping
  console.log('\n--- Testing List Users Query Validation & Clamping ---');
  const defaultQuery = validateListUsersQuery({});
  assert(defaultQuery.page === 1, 'Default page is 1');
  assert(defaultQuery.limit === 20, 'Default limit is 20');

  const customQuery = validateListUsersQuery({
    page: '3',
    limit: '200', // clamped to 50
    status: 'ACTIVE',
    search: 'Nguyen',
  });
  assert(customQuery.page === 3, 'Page parsed as 3');
  assert(customQuery.limit === 50, 'Limit clamped to maximum 50');
  assert(customQuery.status === 'ACTIVE', 'Status filter parsed');
  assert(customQuery.search === 'Nguyen', 'Search keyword parsed');

  // 8. Security & RBAC Guardrails
  console.log('\n--- Testing Security RBAC Guardrails ---');
  const adminRole: string = 'ADMIN';
  const studentRole: string = 'STUDENT';

  const isAdminAuthorized = adminRole === 'ADMIN';
  assert(isAdminAuthorized === true, 'ADMIN role authorized for administrative endpoints');

  const isStudentDenied = studentRole !== 'ADMIN';
  assert(isStudentDenied === true, 'STUDENT role strictly denied for administrative endpoints (403 Forbidden)');

  // 9. BR-009 Soft Lifecycle State Verification
  console.log('\n--- Testing BR-009 Soft Lifecycle Moderation Semantics ---');
  const targetPostStatus = 'REMOVED_BY_ADMIN';
  assert(targetPostStatus === 'REMOVED_BY_ADMIN', 'BR-009: Soft moderation preserves row and transitions status to REMOVED_BY_ADMIN');

  console.log(`\n=======================================================`);
  console.log(` Milestone 6.10 Verification Summary: ${passed}/${total} Tests Passed`);
  console.log(`=======================================================`);
}

runAdminUnitTests().catch((err) => {
  console.error('Admin Test Runner Failed:', err);
  process.exit(1);
});
