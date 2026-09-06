import { calculateProfileCompleteness } from './modules/profile/profile.service';
import {
  validateUserId,
  validateUpdateProfile,
  validateUpdateProfileSkills,
  validateUpdateProfileCourses,
  validateSkillsQuery,
  validateCoursesQuery,
} from './modules/profile/profile.validation';
import { ValidationFailedError } from './utils/errors';
import { StudentProfileRow, ProfileSkillItem, ProfileCourseItem } from './modules/profile/profile.repository';

async function runProfileUnitTests() {
  console.log('=== Running Milestone 6.4 Profile & Master Catalog Unit Verification ===\n');
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

  // 1. Profile Completeness Formula (BR-001)
  console.log('--- Testing Profile Completeness Logic (BR-001) ---');
  const baseProfile: StudentProfileRow = {
    id: '11111111-2222-3333-4444-555555555555',
    user_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    full_name: 'Nguyễn Văn A',
    avatar_url: 'https://example.com/avatar.jpg',
    campus: 'Main Campus',
    major: 'Khoa học máy tính',
    year_of_study: 3,
    bio: 'Sinh viên năm 3 đam mê lập trình.',
    github_url: 'https://github.com/test',
    linkedin_url: 'https://linkedin.com/in/test',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const sampleSkills: ProfileSkillItem[] = [
    { skill_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', name: 'React', proficiency_level: 'INTERMEDIATE' },
  ];

  const sampleCourses: ProfileCourseItem[] = [
    { course_id: 'aaaaaaaa-bbbb-cccc-dddd-111111111111', course_code: 'CS201', course_name: 'CTDL & GT' },
  ];

  const completeResult = calculateProfileCompleteness(baseProfile, sampleSkills, sampleCourses);
  assert(completeResult === true, 'Complete profile with all 7 criteria evaluates to is_profile_complete = true');

  // Incomplete cases
  const noBioProfile = { ...baseProfile, bio: null };
  assert(calculateProfileCompleteness(noBioProfile, sampleSkills, sampleCourses) === false, 'Missing bio makes is_profile_complete = false');

  const noSkills = calculateProfileCompleteness(baseProfile, [], sampleCourses);
  assert(noSkills === false, 'Missing skills makes is_profile_complete = false');

  const noCourses = calculateProfileCompleteness(baseProfile, sampleSkills, []);
  assert(noCourses === false, 'Missing courses makes is_profile_complete = false');

  const invalidYearProfile = { ...baseProfile, year_of_study: 7 };
  assert(calculateProfileCompleteness(invalidYearProfile, sampleSkills, sampleCourses) === false, 'Invalid year_of_study (>6) makes is_profile_complete = false');

  // 2. UUID Validation
  console.log('\n--- Testing UUID Parameter Validation ---');
  const validUuid = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
  assert(validateUserId(validUuid) === validUuid, 'Valid UUID accepted');

  let invalidUuidCaught = false;
  try {
    validateUserId('not-a-valid-uuid');
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidUuidCaught = true;
  }
  assert(invalidUuidCaught === true, 'Invalid UUID strictly rejected');

  // 3. Update Profile DTO Validation
  console.log('\n--- Testing Update Profile DTO Validation ---');
  const validUpdate = validateUpdateProfile({
    full_name: 'Trần Thị B',
    campus: 'Cơ sở 2',
    major: 'Kỹ thuật phần mềm',
    year_of_study: 4,
    bio: 'Đam mê backend architecture',
  });
  assert(validUpdate.full_name === 'Trần Thị B' && validUpdate.year_of_study === 4, 'Valid profile update DTO parsed successfully');

  let invalidYearCaught = false;
  try {
    validateUpdateProfile({ year_of_study: 0 });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidYearCaught = true;
  }
  assert(invalidYearCaught === true, 'year_of_study < 1 rejected');

  // 4. Skills Portfolio Validation
  console.log('\n--- Testing Skills Portfolio Validation ---');
  const validSkillsDto = validateUpdateProfileSkills({
    skills: [
      { skill_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', proficiency_level: 'INTERMEDIATE' },
      { skill_id: '11111111-2222-3333-4444-555555555555', proficiency_level: 'ADVANCED' },
    ],
  });
  assert(validSkillsDto.skills.length === 2, 'Valid skills portfolio parsed successfully');

  let duplicateSkillCaught = false;
  try {
    validateUpdateProfileSkills({
      skills: [
        { skill_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', proficiency_level: 'BEGINNER' },
        { skill_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', proficiency_level: 'ADVANCED' },
      ],
    });
  } catch (err) {
    if (err instanceof ValidationFailedError) duplicateSkillCaught = true;
  }
  assert(duplicateSkillCaught === true, 'Duplicate skill_id in portfolio update strictly rejected');

  let invalidProficiencyCaught = false;
  try {
    validateUpdateProfileSkills({
      skills: [{ skill_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', proficiency_level: 'MASTER' }],
    });
  } catch (err) {
    if (err instanceof ValidationFailedError) invalidProficiencyCaught = true;
  }
  assert(invalidProficiencyCaught === true, 'Invalid proficiency level strictly rejected');

  // 5. Courses Portfolio Validation
  console.log('\n--- Testing Courses Portfolio Validation ---');
  const validCoursesDto = validateUpdateProfileCourses({
    course_ids: [
      'aaaaaaaa-bbbb-cccc-dddd-111111111111',
      '22222222-3333-4444-5555-666666666666',
    ],
  });
  assert(validCoursesDto.course_ids.length === 2, 'Valid courses portfolio parsed successfully');

  let duplicateCourseCaught = false;
  try {
    validateUpdateProfileCourses({
      course_ids: [
        'aaaaaaaa-bbbb-cccc-dddd-111111111111',
        'aaaaaaaa-bbbb-cccc-dddd-111111111111',
      ],
    });
  } catch (err) {
    if (err instanceof ValidationFailedError) duplicateCourseCaught = true;
  }
  assert(duplicateCourseCaught === true, 'Duplicate course_id strictly rejected');

  // 6. Master Catalog Query Validation
  console.log('\n--- Testing Master Catalog Queries Validation ---');
  const skillsQuery = validateSkillsQuery({ q: 'react', category: 'TECH' });
  assert(skillsQuery.q === 'react' && skillsQuery.category === 'TECH', 'Valid skills search query parsed');

  const coursesQuery = validateCoursesQuery({ q: 'CS201' });
  assert(coursesQuery.q === 'CS201', 'Valid courses search query parsed');

  console.log(`\n=======================================================`);
  console.log(` Milestone 6.4 Verification Summary: ${passed}/${total} Tests Passed`);
  console.log(`=======================================================`);
}

runProfileUnitTests().catch((err) => {
  console.error('Profile Test Runner Failed:', err);
  process.exit(1);
});

