export interface AuthUser {
  email?: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}
