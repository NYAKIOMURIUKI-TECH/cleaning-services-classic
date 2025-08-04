// src/app/shared/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, Role } from './models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: User | null = null;

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    // In real app: fetch user from backend
    const user: User = {
      email,
      password,
      role: email.includes('admin') ? 'admin' :
            email.includes('cleaner') ? 'cleaner' : 'customer'
    };

    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    this.redirectUser(user.role);
    return true;
  }

  register(email: string, password: string, role: Role): void {
    const user: User = { email, password, role };
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    this.redirectUser(role);
  }

  getUser(): User | null {
    return this.currentUser ?? JSON.parse(localStorage.getItem('user')!);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  private redirectUser(role: Role) {
    if (role === 'admin') this.router.navigate(['/admin']);
    else if (role === 'cleaner') this.router.navigate(['/cleaner']);
    else this.router.navigate(['/customer']);
  }
}
