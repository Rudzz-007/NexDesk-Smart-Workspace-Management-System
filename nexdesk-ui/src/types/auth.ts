export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  role?: 'admin' | 'employee';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserSession {
  email: string;
  role: string;
  exp: number;
}
