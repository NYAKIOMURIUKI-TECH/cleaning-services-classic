import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Job, JobRequest, JobResponse, AcceptJobRequest, UpdateJobStatusRequest } from '../models/job.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Client methods
  createJob(jobData: JobRequest): Observable<JobResponse> {
    return this.http.post<JobResponse>(`${this.apiUrl}/bookings`, jobData, {
      headers: this.getHeaders()
    });
  }

  getClientJobs(clientId: number): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/bookings/client/${clientId}`, {
      headers: this.getHeaders()
    });
  }

  // Cleaner methods
  getAvailableJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/cleaner/available-bookings`, {
      headers: this.getHeaders()
    });
  }

  getCleanerJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/cleaner/bookings`, {
      headers: this.getHeaders()
    });
  }

  acceptJob(bookingId: number): Observable<any> {
    const data: AcceptJobRequest = { bookingId };
    return this.http.post(`${this.apiUrl}/cleaner/accept-booking`, data, {
      headers: this.getHeaders()
    });
  }

  updateJobStatus(bookingId: number, status: 'accepted' | 'in_progress' | 'completed' | 'cancelled'): Observable<any> {
    const data: UpdateJobStatusRequest = { bookingId, status };
    return this.http.put(`${this.apiUrl}/cleaner/bookings/status`, data, {
      headers: this.getHeaders()
    });
  }

  // Public methods (no auth required)
  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/bookings`);
  }

  // Get user profile (for getting cleaners list)
  getUserProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/client/profile/${userId}`);
  }
}
