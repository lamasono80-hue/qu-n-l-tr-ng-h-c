// studyService.ts
import { apiRequest } from './apiClient';
import { StudyRequest, StudyConnection, StudyMode } from '../types';

export const studyService = {
  // API-SB-01
  getStudyRequests: (params: { page?: number; limit?: number; study_mode?: StudyMode; search?: string; is_mine?: boolean } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.study_mode) query.append('study_mode', params.study_mode);
    if (params.search) query.append('search', params.search);
    if (params.is_mine) query.append('is_mine', 'true');
    return apiRequest<StudyRequest[]>(`/study-requests?${query.toString()}`);
  },

  // API-SB-02
  getStudyRequestById: (id: string) => apiRequest<StudyRequest>(`/study-requests/${id}`),

  // API-SB-03
  createStudyRequest: (body: {
    course_id: string;
    topic: string;
    study_mode: StudyMode;
    availability: string;
    description: string;
  }) =>
    apiRequest<StudyRequest>('/study-requests', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // API-SB-04
  closeStudyRequest: (id: string) =>
    apiRequest<StudyRequest>(`/study-requests/${id}/close`, {
      method: 'PATCH',
    }),

  // API-SB-05
  connectStudyRequest: (id: string, note: string) =>
    apiRequest<{ connection_id: string; status: string }>(`/study-requests/${id}/connect`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  // API-SB-06
  resolveConnection: (connectionId: string, action: 'ACCEPT' | 'DECLINE') =>
    apiRequest(`/study-requests/connections/${connectionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),

  // API-SB-07
  getMyConnections: () =>
    apiRequest<StudyConnection[]>('/study-requests/connections/me'),
};
