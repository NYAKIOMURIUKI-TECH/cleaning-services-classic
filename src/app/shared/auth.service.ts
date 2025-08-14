import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Make sure this interface and Role type are available or imported
export type Role = 'client' | 'cleaner' | 'admin';

export interface User {
  fullName?: string;
  email: string;
  password: string;
  role: Role;
  photoUrl?: string; // Optional, for cleaner profile
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUser: User | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    const payload = { email, password };

    return this.http.post(`${this.apiUrl}/login`, payload).pipe(
      tap((res: any) => {
        const user: User = res.user;
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (user.role === 'client') {
          this.router.navigate(['/client']);
        } else if (user.role === 'cleaner') {
          this.router.navigate(['/cleaner']);
        }
      }),
      catchError(err => {
        alert(err.error.message || 'Login failed');
        return throwError(() => err);
      })
    );
  }

  register(fullName: string, email: string, password: string, role: Role): Observable<any> {
    const payload = { fullName, email, password, role };

    return this.http.post(`${this.apiUrl}/register`, payload).pipe(
      tap((res: any) => {
        const user: User = res.user;
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        this.redirectUser(user.role);
      }),
      catchError(err => {
        alert(err.error.message || 'Registration failed');
        return throwError(() => err);
      })
    );
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
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'cleaner') {
      this.router.navigate(['/cleaner']);
    } else {
      this.router.navigate(['/client']);
    }
  }}
