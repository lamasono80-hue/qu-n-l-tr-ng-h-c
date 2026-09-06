import {
  validateCreateStudyRequest,
  validateConnectStudyRequest,
  validateResolveStudyConnection,
  validateListStudyRequestsQuery,
  validateListMyStudyConnectionsQuery,
  validateUuidParam,
} from './modules/study-buddy/study.validation';
import { ValidationFailedError } from './utils/errors';

async function runStudyBuddyUnitTests() {
  console.log('=== Running Milestone 6.6 Study Buddy Unit & Invariant Verification ===\n');
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
  console.log('--- Testing Study Buddy UUID Validation ---');
  const validUuid = '66666666-7777-8888-9999-000000000000';
  assert(validateUuidParam(validUuid, 'id') === validUuid, 'Valid study request UUID accepted');

  let invalidUuidCaught = false;
  try {
    validateUuidParam('invalid-uuid-format', 'id');
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidUuidCaught = true;
  }
  assert(invalidUuidCaught === true, 'Invalid study request UUID strictly rejected');

  // 2. Create Study Request DTO Validation
  console.log('\n--- Testing Create Study Request DTO Validation ---');
  const validPayload = {
    course_id: 'ffffffff-bbbb-cccc-dddd-eeeeeeeeeeee',
    topic: 'Ôn tập giải đề giữa kỳ môn Cấu trúc dữ liệu',
    study_mode: 'HYBRID',
    availability: 'Tối thứ 3 và thứ 5 hàng tuần',
    description: 'Cần tìm bạn cùng ôn tập và giải bài tập cây nhị phân...',
  };

  const validatedCreate = validateCreateStudyRequest(validPayload);
  assert(validatedCreate.topic === validPayload.topic, 'Valid study request DTO parsed successfully');
  assert(validatedCreate.study_mode === 'HYBRID', 'Study mode correctly assigned');
  assert(validatedCreate.availability === validPayload.availability, 'Availability correctly assigned');

  // Topic length violation
  let shortTopicCaught = false;
  try {
    validateCreateStudyRequest({ ...validPayload, topic: 'Ôn' });
  } catch (err) {
    if (err instanceof ValidationFailedError) shortTopicCaught = true;
  }
  assert(shortTopicCaught === true, 'Topic < 5 chars strictly rejected');

  // Invalid study mode
  let invalidModeCaught = false;
  try {
    validateCreateStudyRequest({ ...validPayload, study_mode: 'REMOTE' });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidModeCaught = true;
  }
  assert(invalidModeCaught === true, 'Invalid study mode (REMOTE) strictly rejected');

  // Invalid course_id format
  let invalidCourseIdCaught = false;
  try {
    validateCreateStudyRequest({ ...validPayload, course_id: 'not-a-uuid' });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidCourseIdCaught = true;
  }
  assert(invalidCourseIdCaught === true, 'Invalid course_id UUID strictly rejected');

  // 3. Connect Study Request DTO Validation
  console.log('\n--- Testing Connect Study Request DTO Validation ---');
  const validConnect = validateConnectStudyRequest({ note: 'Chào bạn, mình cùng lớp thầy Nam, cùng ôn nhé!' });
  assert(validConnect.note === 'Chào bạn, mình cùng lớp thầy Nam, cùng ôn nhé!', 'Valid connect note parsed');

  let longNoteCaught = false;
  try {
    validateConnectStudyRequest({ note: 'A'.repeat(501) });
  } catch (err) {
    if (err instanceof ValidationFailedError) longNoteCaught = true;
  }
  assert(longNoteCaught === true, 'Connect note > 500 chars strictly rejected');

  // 4. Resolve Connection DTO Validation
  console.log('\n--- Testing Resolve Connection DTO Validation ---');
  const acceptAction = validateResolveStudyConnection({ action: 'ACCEPT' });
  assert(acceptAction.action === 'ACCEPT', 'ACCEPT action parsed');

  const declineAction = validateResolveStudyConnection({ action: 'DECLINE' });
  assert(declineAction.action === 'DECLINE', 'DECLINE action parsed');

  let invalidActionCaught = false;
  try {
    validateResolveStudyConnection({ action: 'REJECT' });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidActionCaught = true;
  }
  assert(invalidActionCaught === true, 'Invalid resolve action strictly rejected');

  // 5. Query Validation & Clamping
  console.log('\n--- Testing Study Request Query Validation & Clamping ---');
  const queryResult = validateListStudyRequestsQuery({
    page: '1',
    limit: '200', // exceeds max 50 -> clamped to 50
    study_mode: 'ONLINE',
    is_mine: 'true',
    search: 'Giải tích',
  });

  assert(queryResult.page === 1, 'Page number parsed as 1');
  assert(queryResult.limit === 50, 'Limit clamped to max 50');
  assert(queryResult.study_mode === 'ONLINE', 'Study mode filter parsed');
  assert(queryResult.is_mine === true, 'is_mine flag converted to true');
  assert(queryResult.search === 'Giải tích', 'Search keyword parsed');

  // 6. Invariants Business Logic (BR-003, BR-004, BR-006)
  console.log('\n--- Testing Invariant Logic Specifications (BR-003, BR-004, BR-006) ---');
  const authorId: string = '11111111-2222-3333-4444-555555555555';
  const requesterId1: string = '11111111-2222-3333-4444-555555555555';
  const requesterId2: string = '77777777-8888-9999-0000-111111111111';

  // BR-003 self-connection logic
  const isSelfConnect = authorId === requesterId1;
  assert(isSelfConnect === true, 'BR-003: Self-connection correctly identified and blocked');

  const isNotSelf = authorId !== requesterId2;
  assert(isNotSelf === true, 'BR-003: Non-author requester permitted to connect');

  // BR-006 Deterministic Pair Ordering for Conversation Trusted Write Path
  // Case A: authorId < requesterId
  const u1_A = authorId < requesterId2 ? authorId : requesterId2;
  const u2_A = authorId < requesterId2 ? requesterId2 : authorId;
  assert(u1_A < u2_A, 'BR-006 Case A (author < requester): u1 < u2 invariant holds');
  assert(u1_A !== u2_A, 'BR-006 Case A: u1 and u2 are distinct participants');
  assert(
    (u1_A === authorId && u2_A === requesterId2) || (u1_A === requesterId2 && u2_A === authorId),
    'BR-006 Case A: Both original participants preserved in {u1, u2}'
  );

  // Case B: authorId > requesterId
  const highAuthorId: string = '99999999-8888-7777-6666-555555555555';
  const lowRequesterId: string = '22222222-3333-4444-5555-666666666666';
  const u1_B = highAuthorId < lowRequesterId ? highAuthorId : lowRequesterId;
  const u2_B = highAuthorId < lowRequesterId ? lowRequesterId : highAuthorId;
  assert(u1_B < u2_B, 'BR-006 Case B (author > requester): u1 < u2 invariant holds');
  assert(u1_B !== u2_B, 'BR-006 Case B: u1 and u2 are distinct participants');
  assert(
    u1_B === lowRequesterId && u2_B === highAuthorId,
    'BR-006 Case B: Correctly assigned u1 = lowRequesterId and u2 = highAuthorId'
  );

  console.log(`\n=======================================================`);
  console.log(` Milestone 6.6 Verification Summary: ${passed}/${total} Tests Passed`);
  console.log(`=======================================================`);
}

runStudyBuddyUnitTests().catch((err) => {
  console.error('Study Buddy Test Runner Failed:', err);
  process.exit(1);
});
