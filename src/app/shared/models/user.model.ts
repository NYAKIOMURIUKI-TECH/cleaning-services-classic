// src/app/shared/models/user.model.ts
export type Role = 'admin' | 'client' | 'cleaner';

export interface User {
  email: string;
  password: string;
  role: Role;
}
