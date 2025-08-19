import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  updateProfile(userId: number, profileData: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, profileData, {
      headers: this.getHeaders()
    });
  }

  changePassword(userId: number, passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/change-password`, passwordData, {
      headers: this.getHeaders()
    });
  }

  getProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`, {
      headers: this.getHeaders()
    });
  }

  getCurrentProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}/profile`, {
      headers: this.getHeaders()
    });
  }
}
