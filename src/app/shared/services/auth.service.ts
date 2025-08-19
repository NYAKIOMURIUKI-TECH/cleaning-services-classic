import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, Role, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUser: User | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const payload: LoginRequest = { email, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((res: LoginResponse) => {
        console.log('Login response:', res);

        if (res.user && res.token) {
          this.currentUser = res.user;

          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(res.user));
            localStorage.setItem('token', res.token);
            console.log('User stored:', res.user);
            console.log('Token stored');
          }

          console.log('Redirecting user with role:', res.user.role);
          this.redirectUser(res.user.role);
        } else {
          console.error('Login response missing user or token:', res);
          alert('Login failed: Invalid response from server');
        }
      }),
      catchError(err => {
        console.error('Login error:', err);
        alert(err.error?.message || 'Login failed');
        return throwError(() => err);
      })
    );
  }

  register(registrationData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, registrationData).pipe(
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      if (!this.currentUser) {
        const userData = localStorage.getItem('user');
        if (userData) {
          this.currentUser = JSON.parse(userData);
        }
      }
      return this.currentUser;
    }
    return this.currentUser;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null && this.getToken() !== null;
  }

  logout() {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  private redirectUser(role: Role) {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'cleaner':
        this.router.navigate(['/cleaner']);
        break;
      case 'client':
        this.router.navigate(['/client']);
        break;
    }
  }
}
