// src/app/shared/models/user.model.ts
export type Role = 'admin' | 'customer' | 'cleaner';

export interface User {
  email: string;
  password: string;
  role: Role;
}
