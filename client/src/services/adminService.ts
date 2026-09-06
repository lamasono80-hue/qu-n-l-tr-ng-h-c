// adminService.ts
import { apiRequest } from './apiClient';
import { SystemStats, AdminUserItem, UserStatus } from '../types';

export const adminService = {
  // API-ADM-01
  getStats: () => apiRequest<SystemStats>('/admin/stats'),

  // API-ADM-02
  getUsers: (params: { page?: number; limit?: number; status?: UserStatus; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    return apiRequest<AdminUserItem[]>(`/admin/users?${query.toString()}`);
  },

  // API-ADM-03
  updateUserStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED', reason: string) =>
    apiRequest<{ user_id: string; new_status: string }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  // API-ADM-04
  removeListing: (entityType: 'PROJECT_POST' | 'STUDY_REQUEST' | 'SKILL_LISTING', entityId: string, reason: string) =>
    apiRequest<{ entity_type: string; entity_id: string; status: string; moderated_at: string }>(
      `/admin/listings/${entityType}/${entityId}/remove`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    ),

  // API-ADM-05
  addSkill: (name: string, category: string) =>
    apiRequest<{ id: string; name: string; category: string; is_system_standard: boolean }>('/admin/skills', {
      method: 'POST',
      body: JSON.stringify({ name, category }),
    }),

  // API-ADM-06
  addCourse: (course_code: string, course_name: string) =>
    apiRequest<{ id: string; course_code: string; course_name: string }>('/admin/courses', {
      method: 'POST',
      body: JSON.stringify({ course_code, course_name }),
    }),
};
