import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Job } from '../models/job.model';
import { Payment } from '../models/payment.model';

export interface DashboardStats {
  totalJobs: number;
  pendingJobs: number;
  acceptedJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  totalEarnings?: number;
  averageRating?: number;
  totalRevenue?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Client dashboard data
  getClientDashboardData(clientId: number): Observable<DashboardStats> {
    return this.http.get<Job[]>(`${this.apiUrl}/bookings/client/${clientId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(jobs => this.calculateClientStats(jobs))
    );
  }

  // Cleaner dashboard data
  getCleanerDashboardData(cleanerId: number): Observable<DashboardStats> {
    return forkJoin({
      myJobs: this.http.get<Job[]>(`${this.apiUrl}/cleaner/bookings`, {
        headers: this.getHeaders()
      }),
      averageRating: this.http.get<any>(`${this.apiUrl}/ratings/user/${cleanerId}/average`)
    }).pipe(
      map(({ myJobs, averageRating }) => this.calculateCleanerStats(myJobs, averageRating))
    );
  }

  // Admin dashboard data
  getAdminDashboardData(): Observable<DashboardStats> {
    return this.getAllJobs().pipe(
      map(jobs => this.calculateAdminStats(jobs))
    );
  }

  // Get all jobs for admin (public endpoint)
  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/bookings`);
  }

  // Get user ratings
  getUserRatings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ratings/user/${userId}`);
  }

  // Get user profile
  getUserProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/client/profile/${userId}`);
  }

  private calculateClientStats(jobs: Job[]): DashboardStats {
    return {
      totalJobs: jobs.length,
      pendingJobs: jobs.filter(j => j.status === 'pending').length,
      acceptedJobs: jobs.filter(j => j.status === 'accepted').length,
      inProgressJobs: jobs.filter(j => j.status === 'in_progress').length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      totalEarnings: jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.price, 0)
    };
  }

  private calculateCleanerStats(jobs: Job[], ratingData: any): DashboardStats {
    const completedJobs = jobs.filter(j => j.status === 'completed');

    return {
      totalJobs: jobs.length,
      pendingJobs: jobs.filter(j => j.status === 'pending').length,
      acceptedJobs: jobs.filter(j => j.status === 'accepted').length,
      inProgressJobs: jobs.filter(j => j.status === 'in_progress').length,
      completedJobs: completedJobs.length,
      totalEarnings: completedJobs.reduce((sum, j) => sum + j.price, 0),
      averageRating: parseFloat(ratingData.averageRating) || 0
    };
  }

  private calculateAdminStats(jobs: Job[]): DashboardStats {
    const completedJobs = jobs.filter(j => j.status === 'completed');

    return {
      totalJobs: jobs.length,
      pendingJobs: jobs.filter(j => j.status === 'pending').length,
      acceptedJobs: jobs.filter(j => j.status === 'accepted').length,
      inProgressJobs: jobs.filter(j => j.status === 'in_progress').length,
      completedJobs: completedJobs.length,
      totalRevenue: completedJobs.reduce((sum, j) => sum + j.price, 0)
    };
  }
}
