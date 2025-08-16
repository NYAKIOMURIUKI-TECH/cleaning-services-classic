import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  location?: string;
  profilePicture?: string;
  role?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private apiUrl = 'http://localhost:8080/api/client';

  constructor(private http: HttpClient) {}

  // Update profile
  updateProfile(userId: number, profileData: any): Observable<any> {
    console.log('SettingsService: Updating profile for user ID:', userId);
    console.log('Profile data:', profileData);

    return this.http.put(`${this.apiUrl}/${userId}`, profileData, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(response => console.log('SettingsService: Update response:', response)),
      catchError(this.handleError)
    );
  }

  // Get current profile
  getCurrentProfile(userId: number): Observable<any> {
    console.log('SettingsService: Getting current profile for user ID:', userId);

    return this.http.get(`${this.apiUrl}/profile?userId=${userId}`).pipe(
      tap(profile => console.log('SettingsService: Loaded profile:', profile)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('SettingsService Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error ${error.status}: ${error.error?.message || error.message}`;
    }

    console.error('Error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
