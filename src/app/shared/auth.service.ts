import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        localStorage.setItem('user', JSON.stringify(res.user));

        if (res.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (res.user.role === 'client') {
          this.router.navigate(['/client']); // ✅ Navigate to client dashboard']);
        } else if (res.user.role === 'cleaner') {
          this.router.navigate(['/cleaner']);
        }
      }),
      catchError(err => {
        alert(err.error.message || 'Login failed');
        return throwError(() => err);
      })
    );
  }

  // ✅ ADD THIS:
  register(fullName: string, email: string, password: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { fullName, email, password, role }).pipe(
      tap(() => {
        alert('Registration successful!');
        this.router.navigate(['/login']);
      }),
      catchError(err => {
        alert(err.error.message || 'Registration failed');
        return throwError(() => err);
      })
    );
  }
}
