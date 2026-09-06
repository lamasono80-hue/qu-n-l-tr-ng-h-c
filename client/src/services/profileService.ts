// profileService.ts
import { apiRequest } from './apiClient';
import { StudentProfileDetail, SkillItem, CourseItem } from '../types';

export const profileService = {
  // API-PROF-01
  getMyProfile: () => apiRequest<StudentProfileDetail>('/profiles/me'),

  // API-PROF-02
  updateMyProfile: (body: {
    full_name?: string;
    avatar_url?: string | null;
    campus?: string | null;
    major?: string | null;
    year_of_study?: number | null;
    bio?: string | null;
  }) =>
    apiRequest<StudentProfileDetail>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // API-PROF-03
  getUserProfile: (userId: string) =>
    apiRequest<StudentProfileDetail>(`/profiles/${userId}`),

  // API-PROF-04
  updateMySkills: (skills: Array<{ skill_id: string; proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }>) =>
    apiRequest<StudentProfileDetail>('/profiles/me/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    }),

  // API-PROF-05
  updateMyCourses: (courses: Array<{ course_id: string }>) =>
    apiRequest<StudentProfileDetail>('/profiles/me/courses', {
      method: 'PUT',
      body: JSON.stringify({ courses }),
    }),

  // API-PROF-06
  getSkillsCatalog: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<SkillItem[]>(`/skills${q}`);
  },

  // API-PROF-07
  getCoursesCatalog: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<CourseItem[]>(`/courses${q}`);
  },
};
