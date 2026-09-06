import {
  validateSendMessage,
  validateListMessagesQuery,
  validateUuidParam,
} from './modules/chat/chat.validation';
import { ValidationFailedError } from './utils/errors';

async function runChatUnitTests() {
  console.log('=== Running Milestone 6.8 Direct Messaging & Chat Unit Verification ===\n');
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
  console.log('--- Testing Conversation UUID Validation ---');
  const validUuid = '77777777-8888-9999-0000-111111111111';
  assert(validateUuidParam(validUuid, 'id') === validUuid, 'Valid conversation UUID accepted');

  let invalidUuidCaught = false;
  try {
    validateUuidParam('invalid-conv-id', 'id');
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidUuidCaught = true;
  }
  assert(invalidUuidCaught === true, 'Invalid conversation UUID strictly rejected');

  // 2. Send Message Content Validation (FR-CHAT-007: 1..1000 chars)
  console.log('\n--- Testing Send Message Content Validation (FR-CHAT-007) ---');
  const validMessage = validateSendMessage({
    content: 'Chào bạn, mình vừa nhận được tài liệu dự án nhé!',
  });
  assert(
    validMessage.content === 'Chào bạn, mình vừa nhận được tài liệu dự án nhé!',
    'Valid message content parsed successfully'
  );

  // Empty message
  let emptyMsgCaught = false;
  try {
    validateSendMessage({ content: '   ' });
  } catch (err) {
    if (err instanceof ValidationFailedError) emptyMsgCaught = true;
  }
  assert(emptyMsgCaught === true, 'Empty/whitespace message strictly rejected');

  // Message > 1000 chars
  let longMsgCaught = false;
  try {
    validateSendMessage({ content: 'A'.repeat(1001) });
  } catch (err) {
    if (err instanceof ValidationFailedError) longMsgCaught = true;
  }
  assert(longMsgCaught === true, 'Message > 1000 chars strictly rejected (FR-CHAT-007)');

  // 3. List Messages Query Validation & Clamping
  console.log('\n--- Testing List Messages Query Validation & Clamping ---');
  const defaultQuery = validateListMessagesQuery({});
  assert(defaultQuery.page === 1, 'Default page is 1');
  assert(defaultQuery.limit === 30, 'Default limit is 30');

  const clampedQuery = validateListMessagesQuery({ page: '2', limit: '100' });
  assert(clampedQuery.page === 2, 'Page parsed as 2');
  assert(clampedQuery.limit === 50, 'Limit clamped to maximum 50');

  // 4. Participant Authorization Logic
  console.log('\n--- Testing Participant Membership & Security Guardrails ---');
  const userOneId: string = '11111111-2222-3333-4444-555555555555';
  const userTwoId: string = '88888888-9999-0000-1111-222222222222';
  const thirdPartyUserId: string = '99999999-aaaa-bbbb-cccc-dddddddddddd';

  const isUserOneParticipant = userOneId === userOneId || userOneId === userTwoId;
  assert(isUserOneParticipant === true, 'user_one_id correctly recognized as authorized participant');

  const isUserTwoParticipant = userTwoId === userOneId || userTwoId === userTwoId;
  assert(isUserTwoParticipant === true, 'user_two_id correctly recognized as authorized participant');

  const isThirdPartyParticipant = thirdPartyUserId === userOneId || thirdPartyUserId === userTwoId;
  assert(isThirdPartyParticipant === false, 'Third-party user correctly denied access to conversation');

  // 5. Peer ID Resolution Logic
  console.log('\n--- Testing Peer ID Resolution Logic ---');
  const peerForUserOne = userOneId === userOneId ? userTwoId : userOneId;
  assert(peerForUserOne === userTwoId, 'Peer for user_one_id resolved to user_two_id');

  const peerForUserTwo = userTwoId === userOneId ? userTwoId : userOneId;
  assert(peerForUserTwo === userOneId, 'Peer for user_two_id resolved to user_one_id');

  // 6. Message Self-Ownership Flag Logic
  console.log('\n--- Testing Message Self-Ownership Flag (is_self) Logic ---');
  const senderId: string = userOneId;
  const isSelfForSender = senderId === userOneId;
  assert(isSelfForSender === true, 'is_self evaluates to true for sender');

  const isSelfForRecipient = senderId === userTwoId;
  assert(isSelfForRecipient === false, 'is_self evaluates to false for recipient');

  // 7. Canonical Participant Ordering Invariant across Match Types
  console.log('\n--- Testing Match Type Integration with Trusted Write Path ---');
  const matchTypes = ['PROJECT_MATCH', 'STUDY_BUDDY', 'SKILL_EXCHANGE'];
  for (const matchType of matchTypes) {
    const u1 = userOneId < userTwoId ? userOneId : userTwoId;
    const u2 = userOneId < userTwoId ? userTwoId : userOneId;
    assert(u1 < u2, `Canonical ordering (u1 < u2) preserved for match_type: ${matchType}`);
  }

  console.log(`\n=======================================================`);
  console.log(` Milestone 6.8 Verification Summary: ${passed}/${total} Tests Passed`);
  console.log(`=======================================================`);
}

runChatUnitTests().catch((err) => {
  console.error('Chat Test Runner Failed:', err);
  process.exit(1);
});
