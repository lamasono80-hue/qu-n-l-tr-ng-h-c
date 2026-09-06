// skillExchangeService.ts
import { apiRequest } from './apiClient';
import { SkillListing, SkillResponse, SkillListingType } from '../types';

export const skillExchangeService = {
  // API-SE-01
  getSkillListings: (params: { page?: number; limit?: number; type?: SkillListingType; proficiency_level?: string; search?: string; is_mine?: boolean } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.type) query.append('type', params.type);
    if (params.proficiency_level) query.append('proficiency_level', params.proficiency_level);
    if (params.search) query.append('search', params.search);
    if (params.is_mine) query.append('is_mine', 'true');
    return apiRequest<SkillListing[]>(`/skill-listings?${query.toString()}`);
  },

  // API-SE-02
  getSkillListingById: (id: string) => apiRequest<SkillListing>(`/skill-listings/${id}`),

  // API-SE-03
  createSkillListing: (body: {
    type: SkillListingType;
    skill_name: string;
    proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    format: 'ONE_ON_ONE_ONLINE' | 'ONE_ON_ONE_OFFLINE' | 'SMALL_GROUP';
    description: string;
  }) =>
    apiRequest<SkillListing>('/skill-listings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // API-SE-04
  closeSkillListing: (id: string) =>
    apiRequest<SkillListing>(`/skill-listings/${id}/close`, {
      method: 'PATCH',
    }),

  // API-SE-05
  respondSkillListing: (id: string, proposal_note: string) =>
    apiRequest<{ response_id: string; status: string }>(`/skill-listings/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ proposal_note }),
    }),

  // API-SE-06
  resolveResponse: (responseId: string, action: 'ACCEPT' | 'DECLINE') =>
    apiRequest(`/skill-listings/responses/${responseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),

  // API-SE-07
  getMyResponses: () =>
    apiRequest<SkillResponse[]>('/skill-listings/responses/me'),
};
