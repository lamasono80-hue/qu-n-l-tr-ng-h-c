import { hashPassword, comparePassword } from './utils/password';
import { signJwtToken, verifyJwtToken } from './utils/jwt';
import { generateSecureToken } from './utils/token';
import { validateRegister, validateLogin, validateVerifyEmail, validateResetPassword } from './modules/auth/auth.validation';
import { ValidationFailedError, UnauthorizedError, ForbiddenError } from './utils/errors';

async function runAuthUnitTests() {
  console.log('=== Running Milestone 6.3 Auth Unit & Security Verification ===\n');
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

  // 1. Password Hashing (Bcrypt Cost 12)
  console.log('--- Testing Password Security (NFR-SEC-001) ---');
  const plainPassword = 'Password123@!';
  const hash = await hashPassword(plainPassword);
  assert(hash.startsWith('$2a$12$') || hash.startsWith('$2b$12$'), 'Bcrypt hash generated with cost factor 12');
  const isCorrect = await comparePassword(plainPassword, hash);
  assert(isCorrect === true, 'Bcrypt compare matches correct password');
  const isWrong = await comparePassword('WrongPassword123@', hash);
  assert(isWrong === false, 'Bcrypt compare rejects wrong password');

  // 2. JWT Signing & Runtime Validation
  console.log('\n--- Testing JWT Security & Runtime Validation ---');
  const userPayload = { userId: '11111111-2222-3333-4444-555555555555', email: 'student1@university.edu.vn', role: 'STUDENT' as const };
  const token = signJwtToken(userPayload);
  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT token generated in valid 3-part header.payload.sig format');
  const decoded = verifyJwtToken(token);
  assert(decoded.userId === userPayload.userId && decoded.email === userPayload.email && decoded.role === 'STUDENT', 'JWT token decoded and verified successfully');

  let tamperedCaught = false;
  try {
    verifyJwtToken(token + 'tampered');
  } catch (err) {
    if (err instanceof UnauthorizedError) tamperedCaught = true;
  }
  assert(tamperedCaught === true, 'JWT verification strictly rejects tampered signatures');

  // 3. Cryptographic Token Generation
  console.log('\n--- Testing Cryptographic Token Generation ---');
  const secureToken = generateSecureToken(32);
  assert(typeof secureToken === 'string' && secureToken.length === 64, 'Token generator produces 64 hex characters (32 bytes entropy)');

  // 4. Registration DTO Validation
  console.log('\n--- Testing Input Validation & Institutional Domain Verification ---');
  const validReg = validateRegister({
    email: 'student.test@hust.edu.vn',
    password: 'SecurePassword123#',
    full_name: 'Nguyễn Văn B',
  });
  assert(validReg.email === 'student.test@hust.edu.vn', 'Valid institutional email accepted (.edu.vn)');

  let invalidDomainCaught = false;
  try {
    validateRegister({
      email: 'student.test@gmail.com',
      password: 'SecurePassword123#',
      full_name: 'Nguyễn Văn B',
    });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidDomainCaught = true;
  }
  assert(invalidDomainCaught === true, 'Non-educational email domain strictly rejected (@gmail.com)');

  let weakPasswordCaught = false;
  try {
    validateRegister({
      email: 'student.test@university.edu.vn',
      password: 'weak',
      full_name: 'Nguyễn Văn B',
    });
  } catch (err) {
    if (err instanceof ValidationFailedError) weakPasswordCaught = true;
  }
  assert(weakPasswordCaught === true, 'Weak password strictly rejected (<8 chars, missing special char)');

  console.log(`\n=======================================================`);
  console.log(` Milestone 6.3 Verification Summary: ${passed}/${total} Tests Passed`);
  console.log(`=======================================================`);
}

runAuthUnitTests().catch((err) => {
  console.error('Test Runner Failed:', err);
  process.exit(1);
});

