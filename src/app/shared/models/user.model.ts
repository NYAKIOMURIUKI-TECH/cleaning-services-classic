export type Role = 'client' | 'cleaner' | 'admin';

export interface User {
  id?: number;
  fullName: string;
  email: string;
  role: Role;
  phone?: string;
  location?: string;

  // Cleaner-specific fields
  bio?: string;
  skills?: string;
  experience_years?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string;
  experience_years?: number;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
