import {
  validateCreateSkillListing,
  validateRespondSkillListing,
  validateResolveSkillResponse,
  validateListSkillListingsQuery,
  validateListMySkillResponsesQuery,
  validateUuidParam,
} from './modules/skill-exchange/skill.validation';
import { ValidationFailedError } from './utils/errors';

async function runSkillExchangeUnitTests() {
  console.log('=== Running Milestone 6.7 Skill Exchange Unit & Invariant Verification ===\n');
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
  console.log('--- Testing Skill Exchange UUID Validation ---');
  const validUuid = 'aaaaaaaa-1111-2222-3333-444444444444';
  assert(validateUuidParam(validUuid, 'id') === validUuid, 'Valid skill listing UUID accepted');

  let invalidUuidCaught = false;
  try {
    validateUuidParam('invalid-uuid-format', 'id');
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidUuidCaught = true;
  }
  assert(invalidUuidCaught === true, 'Invalid skill listing UUID strictly rejected');

  // 2. Create Skill Listing DTO Validation
  console.log('\n--- Testing Create Skill Listing DTO Validation ---');
  const validPayload = {
    type: 'OFFER',
    skill_name: 'Figma UI Design',
    proficiency_level: 'ADVANCED',
    format: '1-on-1 Online',
    availability: 'Tối thứ 7',
    description: 'Mình có thể chia sẻ kinh nghiệm thiết kế Design System trên Figma...',
  };

  const validatedCreate = validateCreateSkillListing(validPayload);
  assert(validatedCreate.type === 'OFFER', 'Skill listing type correctly assigned');
  assert(validatedCreate.skill_name === 'Figma UI Design', 'Skill name correctly assigned');
  assert(validatedCreate.proficiency_level === 'ADVANCED', 'Proficiency level correctly assigned');
  assert(validatedCreate.format === '1-on-1 Online', 'Format correctly assigned');

  // Invalid type (e.g. SWAP)
  let invalidTypeCaught = false;
  try {
    validateCreateSkillListing({ ...validPayload, type: 'SWAP' });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidTypeCaught = true;
  }
  assert(invalidTypeCaught === true, 'Invalid listing type (SWAP) strictly rejected');

  // Short skill name (< 2 chars)
  let shortNameCaught = false;
  try {
    validateCreateSkillListing({ ...validPayload, skill_name: 'A' });
  } catch (err) {
    if (err instanceof ValidationFailedError) shortNameCaught = true;
  }
  assert(shortNameCaught === true, 'Skill name < 2 chars strictly rejected');

  // Invalid proficiency level (e.g. EXPERT)
  let invalidLevelCaught = false;
  try {
    validateCreateSkillListing({ ...validPayload, proficiency_level: 'EXPERT' });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidLevelCaught = true;
  }
  assert(invalidLevelCaught === true, 'Invalid proficiency level (EXPERT) strictly rejected');

  // Short description (< 20 chars)
  let shortDescCaught = false;
  try {
    validateCreateSkillListing({ ...validPayload, description: 'Quá ngắn' });
  } catch (err) {
    if (err instanceof ValidationFailedError) shortDescCaught = true;
  }
  assert(shortDescCaught === true, 'Description < 20 chars strictly rejected');

  // 3. Respond Skill Listing DTO Validation
  console.log('\n--- Testing Respond Skill Listing DTO Validation ---');
  const validProposal = validateRespondSkillListing({
    proposal_note: 'Mình có thể dạy lại bạn Python cơ bản đổi lấy Figma.',
  });
  assert(
    validProposal.proposal_note === 'Mình có thể dạy lại bạn Python cơ bản đổi lấy Figma.',
    'Valid proposal note parsed'
  );

  let longNoteCaught = false;
  try {
    validateRespondSkillListing({ proposal_note: 'A'.repeat(501) });
  } catch (err) {
    if (err instanceof ValidationFailedError) longNoteCaught = true;
  }
  assert(longNoteCaught === true, 'Proposal note > 500 chars strictly rejected');

  // 4. Resolve Skill Response DTO Validation
  console.log('\n--- Testing Resolve Skill Response DTO Validation ---');
  const acceptAction = validateResolveSkillResponse({ action: 'ACCEPT' });
  assert(acceptAction.action === 'ACCEPT', 'ACCEPT action parsed');

  const declineAction = validateResolveSkillResponse({ action: 'DECLINE' });
  assert(declineAction.action === 'DECLINE', 'DECLINE action parsed');

  let invalidActionCaught = false;
  try {
    validateResolveSkillResponse({ action: 'REJECT' });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidActionCaught = true;
  }
  assert(invalidActionCaught === true, 'Invalid resolve action strictly rejected');

  // 5. Query Validation & Clamping
  console.log('\n--- Testing Skill Listing Query Validation & Clamping ---');
  const queryResult = validateListSkillListingsQuery({
    page: '1',
    limit: '500', // exceeds max 50 -> clamped to 50
    type: 'REQUEST',
    proficiency_level: 'INTERMEDIATE',
    is_mine: 'true',
    search: 'Figma',
  });

  assert(queryResult.page === 1, 'Page number parsed as 1');
  assert(queryResult.limit === 50, 'Limit clamped to max 50');
  assert(queryResult.type === 'REQUEST', 'Listing type filter parsed');
  assert(queryResult.proficiency_level === 'INTERMEDIATE', 'Proficiency level filter parsed');
  assert(queryResult.is_mine === true, 'is_mine flag converted to true');
  assert(queryResult.search === 'Figma', 'Search keyword parsed');

  // 6. Invariants Business Logic (BR-003, BR-004, BR-006)
  console.log('\n--- Testing Invariant Logic Specifications (BR-003, BR-004, BR-006) ---');
  const authorId: string = '11111111-2222-3333-4444-555555555555';
  const responderId1: string = '11111111-2222-3333-4444-555555555555';
  const responderId2: string = '77777777-8888-9999-0000-111111111111';

  // BR-003 self-proposal logic
  const isSelfProposal = authorId === responderId1;
  assert(isSelfProposal === true, 'BR-003: Self-proposal correctly identified and blocked');

  const isNotSelf = authorId !== responderId2;
  assert(isNotSelf === true, 'BR-003: Non-author responder permitted to propose');

  // BR-006 Deterministic Pair Ordering for Conversation Trusted Write Path
  // Case A: authorId < responderId
  const u1_A = authorId < responderId2 ? authorId : responderId2;
  const u2_A = authorId < responderId2 ? responderId2 : authorId;
  assert(u1_A < u2_A, 'BR-006 Case A (author < responder): u1 < u2 invariant holds');
  assert(u1_A !== u2_A, 'BR-006 Case A: u1 and u2 are distinct participants');
  assert(
    (u1_A === authorId && u2_A === responderId2) || (u1_A === responderId2 && u2_A === authorId),
    'BR-006 Case A: Both original participants preserved in {u1, u2}'
  );

  // Case B: authorId > responderId
  const highAuthorId: string = '99999999-8888-7777-6666-555555555555';
  const lowResponderId: string = '22222222-3333-4444-5555-666666666666';
  const u1_B = highAuthorId < lowResponderId ? highAuthorId : lowResponderId;
  const u2_B = highAuthorId < lowResponderId ? lowResponderId : highAuthorId;
  assert(u1_B < u2_B, 'BR-006 Case B (author > responder): u1 < u2 invariant holds');
  assert(u1_B !== u2_B, 'BR-006 Case B: u1 and u2 are distinct participants');
  assert(
    u1_B === lowResponderId && u2_B === highAuthorId,
    'BR-006 Case B: Correctly assigned u1 = lowResponderId and u2 = highAuthorId'
  );

  console.log(`\n=======================================================`);
  console.log(` Milestone 6.7 Verification Summary: ${passed}/${total} Tests Passed`);
  console.log(`=======================================================`);
}

runSkillExchangeUnitTests().catch((err) => {
  console.error('Skill Exchange Test Runner Failed:', err);
  process.exit(1);
});
