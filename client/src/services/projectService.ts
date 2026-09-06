// projectService.ts
import { apiRequest } from './apiClient';
import { ProjectPost, ProjectApplication, ProjectCategory } from '../types';

export const projectService = {
  // API-PM-01
  getProjects: (params: { page?: number; limit?: number; category?: ProjectCategory; search?: string; is_mine?: boolean } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.is_mine) query.append('is_mine', 'true');
    return apiRequest<ProjectPost[]>(`/projects?${query.toString()}`);
  },

  // API-PM-02
  getProjectById: (id: string) => apiRequest<ProjectPost>(`/projects/${id}`),

  // API-PM-03
  createProject: (body: {
    title: string;
    category: ProjectCategory;
    description: string;
    total_slots: number;
    deadline: string;
    skill_ids: string[];
  }) =>
    apiRequest<ProjectPost>('/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // API-PM-04
  closeProject: (id: string) =>
    apiRequest<ProjectPost>(`/projects/${id}/close`, {
      method: 'PATCH',
    }),

  // API-PM-05
  applyProject: (id: string, intro_note: string) =>
    apiRequest<{ application_id: string; status: string }>(`/projects/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify({ intro_note }),
    }),

  // API-PM-06
  getProjectApplications: (id: string) =>
    apiRequest<ProjectApplication[]>(`/projects/${id}/applications`),

  // API-PM-07
  resolveApplication: (applicationId: string, action: 'ACCEPT' | 'DECLINE') =>
    apiRequest(`/projects/applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),

  // API-PM-08
  getMyApplications: () =>
    apiRequest<ProjectApplication[]>('/projects/applications/me'),
};
