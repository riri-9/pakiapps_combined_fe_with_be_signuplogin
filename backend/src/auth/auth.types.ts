export type AuthRole = 'customer' | 'driver' | 'operator';

export interface AuthUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
}

export interface AuthResponse {
  message: string;
  user: AuthUserResponse;
  session?: AuthSessionResponse;
}
