import {
  profileRepository,
  StudentProfileRow,
  ProfileSkillItem,
  ProfileCourseItem,
  MasterSkillRow,
  MasterCourseRow,
} from './profile.repository';
import {
  UpdateProfileDto,
  UpdateProfileSkillsDto,
  UpdateProfileCoursesDto,
  SkillsQueryDto,
  CoursesQueryDto,
} from './profile.validation';
import { NotFoundError, ValidationFailedError } from '../../utils/errors';

export function calculateProfileCompleteness(
  profile: StudentProfileRow,
  skills: ProfileSkillItem[],
  courses: ProfileCourseItem[]
): boolean {
  const hasFullName = Boolean(profile.full_name && profile.full_name.trim().length > 0);
  const hasCampus = Boolean(profile.campus && profile.campus.trim().length > 0);
  const hasMajor = Boolean(profile.major && profile.major.trim().length > 0);
  const hasYear = profile.year_of_study !== null && profile.year_of_study !== undefined && profile.year_of_study >= 1 && profile.year_of_study <= 6;
  const hasBio = Boolean(profile.bio && profile.bio.trim().length > 0);
  const hasSkills = skills.length > 0;
  const hasCourses = courses.length > 0;

  return hasFullName && hasCampus && hasMajor && hasYear && hasBio && hasSkills && hasCourses;
}

export class ProfileService {
  /**
   * API-PROF-01: Get Current User Profile & Completeness Status (BR-001)
   */
  async getMyProfile(userId: string) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Không tìm thấy hồ sơ người dùng', 'PROFILE_NOT_FOUND');
    }

    const skills = await profileRepository.getSkillsByProfileId(profile.id);
    const courses = await profileRepository.getCoursesByProfileId(profile.id);
    const isProfileComplete = calculateProfileCompleteness(profile, skills, courses);

    return {
      id: profile.id,
      user_id: profile.user_id,
      email: profile.email || '',
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      campus: profile.campus,
      major: profile.major,
      year_of_study: profile.year_of_study,
      bio: profile.bio,
      github_url: profile.github_url,
      linkedin_url: profile.linkedin_url,
      is_profile_complete: isProfileComplete,
      skills: skills.map((s) => ({
        skill_id: s.skill_id,
        name: s.name,
        proficiency_level: s.proficiency_level,
      })),
      courses: courses.map((c) => ({
        course_id: c.course_id,
        course_code: c.course_code,
        course_name: c.course_name,
      })),
    };
  }

  /**
   * API-PROF-02: Update Personal Profile Metadata
   */
  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await profileRepository.updateProfile(userId, dto);
    if (!updated) {
      throw new NotFoundError('Không tìm thấy hồ sơ để cập nhật', 'PROFILE_NOT_FOUND');
    }

    return {
      full_name: updated.full_name,
      major: updated.major,
      updated_at: updated.updated_at.toISOString(),
    };
  }

  /**
   * API-PROF-03: View Public Student Profile
   */
  async getPublicProfile(targetUserId: string) {
    const profile = await profileRepository.findByUserId(targetUserId);
    if (!profile || profile.user_status !== 'ACTIVE') {
      throw new NotFoundError('Không tìm thấy hồ sơ sinh viên', 'PROFILE_NOT_FOUND');
    }

    const skills = await profileRepository.getSkillsByProfileId(profile.id);
    const courses = await profileRepository.getCoursesByProfileId(profile.id);

    return {
      user_id: profile.user_id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      campus: profile.campus,
      major: profile.major,
      year_of_study: profile.year_of_study,
      bio: profile.bio,
      github_url: profile.github_url,
      linkedin_url: profile.linkedin_url,
      skills: skills.map((s) => ({
        name: s.name,
        proficiency_level: s.proficiency_level,
      })),
      courses: courses.map((c) => ({
        course_code: c.course_code,
        course_name: c.course_name,
      })),
    };
  }

  /**
   * API-PROF-04: Update Student Skills Portfolio
   */
  async updateMySkills(userId: string, dto: UpdateProfileSkillsDto) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Không tìm thấy hồ sơ sinh viên', 'PROFILE_NOT_FOUND');
    }

    const skillIds = dto.skills.map((s) => s.skill_id);
    const allExist = await profileRepository.validateSkillIdsExist(skillIds);
    if (!allExist) {
      throw new ValidationFailedError('Một hoặc nhiều kỹ năng không tồn tại trong danh mục hệ thống', [
        { field: 'skills', issue: 'SKILL_NOT_FOUND' },
      ]);
    }

    const totalSkills = await profileRepository.replaceSkills(profile.id, dto.skills);

    return {
      total_skills: totalSkills,
    };
  }

  /**
   * API-PROF-05: Update Student Enrolled Courses
   */
  async updateMyCourses(userId: string, dto: UpdateProfileCoursesDto) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Không tìm thấy hồ sơ sinh viên', 'PROFILE_NOT_FOUND');
    }

    const allExist = await profileRepository.validateCourseIdsExist(dto.course_ids);
    if (!allExist) {
      throw new ValidationFailedError('Một hoặc nhiều môn học không tồn tại trong danh mục hệ thống', [
        { field: 'course_ids', issue: 'COURSE_NOT_FOUND' },
      ]);
    }

    const totalCourses = await profileRepository.replaceCourses(profile.id, dto.course_ids);

    return {
      total_courses: totalCourses,
    };
  }

  /**
   * API-PROF-06: Search Master Skills Dictionary
   */
  async getSkills(query: SkillsQueryDto): Promise<MasterSkillRow[]> {
    return profileRepository.searchSkills(query.q, query.category);
  }

  /**
   * API-PROF-07: Search Master Courses Catalog
   */
  async getCourses(query: CoursesQueryDto): Promise<MasterCourseRow[]> {
    return profileRepository.searchCourses(query.q);
  }
}

export const profileService = new ProfileService();
