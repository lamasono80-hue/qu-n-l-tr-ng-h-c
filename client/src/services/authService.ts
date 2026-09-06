// authService.ts
import { apiRequest } from './apiClient';
import { AuthTokens } from '../types';

export const authService = {
  // API-AUTH-01
  register: (body: { email: string; password: string; full_name: string }) =>
    apiRequest<{ user_id: string; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // API-AUTH-02
  verifyEmail: (token: string) =>
    apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  // API-AUTH-03
  resendVerification: (email: string) =>
    apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // API-AUTH-04
  login: (body: { email: string; password: string }) =>
    apiRequest<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // API-AUTH-05
  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // API-AUTH-06
  resetPassword: (body: { token: string; new_password: string }) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
