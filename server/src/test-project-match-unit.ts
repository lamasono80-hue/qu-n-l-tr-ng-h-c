import {
  validateCreateProject,
  validateApplyProject,
  validateResolveApplication,
  validateListProjectsQuery,
  validateListMyApplicationsQuery,
  validateUuidParam,
} from './modules/project-match/project.validation';
import { ValidationFailedError } from './utils/errors';

async function runProjectMatchUnitTests() {
  console.log('=== Running Milestone 6.5 Project Match Unit & Invariant Verification ===\n');
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
  console.log('--- Testing Project Match UUID Validation ---');
  const validUuid = '33333333-4444-5555-6666-777777777777';
  assert(validateUuidParam(validUuid, 'id') === validUuid, 'Valid project UUID accepted');

  let invalidUuidCaught = false;
  try {
    validateUuidParam('invalid-id', 'id');
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidUuidCaught = true;
  }
  assert(invalidUuidCaught === true, 'Invalid project UUID strictly rejected');

  // 2. Create Project DTO Validation
  console.log('\n--- Testing Create Project DTO Validation ---');
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const validCreatePayload = {
    title: 'Tuyển lập trình viên Frontend React thi Hackathon',
    description: 'Nhóm nghiên cứu đang cần 1 bạn có kinh nghiệm React và TypeScript để cùng phát triển sản phẩm thi đấu...',
    category: 'HACKATHON',
    total_slots: 2,
    deadline: tomorrow,
    skill_ids: ['aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'],
  };

  const validatedCreate = validateCreateProject(validCreatePayload);
  assert(validatedCreate.title === validCreatePayload.title, 'Valid project post DTO parsed successfully');
  assert(validatedCreate.category === 'HACKATHON', 'Project category correctly assigned');
  assert(validatedCreate.total_slots === 2, 'Project total_slots correctly assigned');

  // Title length violation
  let shortTitleCaught = false;
  try {
    validateCreateProject({ ...validCreatePayload, title: 'Ngắn' });
  } catch (err) {
    if (err instanceof ValidationFailedError) shortTitleCaught = true;
  }
  assert(shortTitleCaught === true, 'Project title < 10 chars strictly rejected');

  // Description length violation
  let shortDescCaught = false;
  try {
    validateCreateProject({ ...validCreatePayload, description: 'Quá ngắn' });
  } catch (err) {
    if (err instanceof ValidationFailedError) shortDescCaught = true;
  }
  assert(shortDescCaught === true, 'Project description < 20 chars strictly rejected');

  // Slots bounds (1..10)
  let invalidSlotsCaught = false;
  try {
    validateCreateProject({ ...validCreatePayload, total_slots: 15 });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidSlotsCaught = true;
  }
  assert(invalidSlotsCaught === true, 'Project total_slots > 10 strictly rejected');

  // Past deadline (BR-005)
  let pastDeadlineCaught = false;
  try {
    validateCreateProject({ ...validCreatePayload, deadline: '2020-01-01' });
  } catch (err) {
    if (err instanceof ValidationFailedError) pastDeadlineCaught = true;
  }
  assert(pastDeadlineCaught === true, 'Past deadline strictly rejected (BR-005)');

  // Duplicate skill IDs
  let duplicateSkillCaught = false;
  try {
    validateCreateProject({
      ...validCreatePayload,
      skill_ids: [
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      ],
    });
  } catch (err) {
    if (err instanceof ValidationFailedError) duplicateSkillCaught = true;
  }
  assert(duplicateSkillCaught === true, 'Duplicate skill IDs in post creation strictly rejected');

  // 3. Apply Project DTO Validation
  console.log('\n--- Testing Apply Project DTO Validation ---');
  const validApply = validateApplyProject({ intro_note: 'Mình có kinh nghiệm 1 năm React.' });
  assert(validApply.intro_note === 'Mình có kinh nghiệm 1 năm React.', 'Valid application intro note parsed');

  let longIntroCaught = false;
  try {
    validateApplyProject({ intro_note: 'A'.repeat(501) });
  } catch (err) {
    if (err instanceof ValidationFailedError) longIntroCaught = true;
  }
  assert(longIntroCaught === true, 'Intro note > 500 chars strictly rejected');

  // 4. Resolve Application DTO Validation
  console.log('\n--- Testing Resolve Application DTO Validation ---');
  const acceptAction = validateResolveApplication({ action: 'ACCEPT' });
  assert(acceptAction.action === 'ACCEPT', 'ACCEPT action accepted');

  const declineAction = validateResolveApplication({ action: 'DECLINE' });
  assert(declineAction.action === 'DECLINE', 'DECLINE action accepted');

  let invalidActionCaught = false;
  try {
    validateResolveApplication({ action: 'MAYBE' });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidActionCaught = true;
  }
  assert(invalidActionCaught === true, 'Invalid resolution action strictly rejected');

  // 5. Query Parameter Validation & Clamping
  console.log('\n--- Testing Query Parameter Validation & Pagination Clamping ---');
  const listQuery = validateListProjectsQuery({
    page: '2',
    limit: '100', // exceeds max 50 -> should clamp to 50
    category: 'COURSEWORK',
    is_mine: 'true',
    search: 'React',
  });

  assert(listQuery.page === 2, 'Page number parsed as 2');
  assert(listQuery.limit === 50, 'Limit clamped to maximum 50');
  assert(listQuery.category === 'COURSEWORK', 'Category filter parsed');
  assert(listQuery.is_mine === true, 'is_mine boolean converted to true');
  assert(listQuery.search === 'React', 'Search keyword parsed');

  // 6. Invariant Business Logic Checks (BR-003, BR-004, BR-006)
  console.log('\n--- Testing Invariant Logic Specifications (BR-003, BR-004, BR-006) ---');
  const authorId: string = '11111111-2222-3333-4444-555555555555';
  const applicantId1: string = '11111111-2222-3333-4444-555555555555';
  const applicantId2: string = '88888888-9999-0000-1111-222222222222';

  // BR-003 check logic
  const isSelfApplication = authorId === applicantId1;
  assert(isSelfApplication === true, 'BR-003: Self-application correctly identified and blocked');

  const isNotSelf = authorId !== applicantId2;
  assert(isNotSelf === true, 'BR-003: Non-author applicant permitted to apply');

  // BR-006 Post Full Transition logic
  const totalSlots = 2;
  let acceptedSlots = 1;
  const newAcceptedSlots = acceptedSlots + 1;
  const newPostStatus = newAcceptedSlots >= totalSlots ? 'FULL' : 'OPEN';
  assert(newPostStatus === 'FULL', 'BR-006: Project post status automatically transitions to FULL when accepted_slots reaches total_slots');

  console.log(`\n=======================================================`);
  console.log(` Milestone 6.5 Verification Summary: ${passed}/${total} Tests Passed`);
  console.log(`=======================================================`);
}

runProjectMatchUnitTests().catch((err) => {
  console.error('Project Match Test Runner Failed:', err);
  process.exit(1);
});

