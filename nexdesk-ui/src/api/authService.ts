import apiClient from './client';
import { LoginCredentials, SignupCredentials, AuthResponse } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // FastAPI expects form-url-encoded payloads for OAuth2 password compliance
    const params = new URLSearchParams();
    params.append('username', credentials.email);
    params.append('password', credentials.password);

    const response = await apiClient.post<AuthResponse>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('nexdesk_token', response.data.access_token);
    }
    return response.data;
  },

  async signup(credentials: SignupCredentials): Promise<any> {
    // FastAPI signup route expects URL query parameters
    const params = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
      role: credentials.role || 'employee'
    });

    const response = await apiClient.post(`/auth/signup?${params.toString()}`);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('nexdesk_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('nexdesk_token');
  }
};
