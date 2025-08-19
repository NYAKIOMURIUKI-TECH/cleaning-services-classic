import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { DashboardService, DashboardStats } from '../../shared/services/dashboard.service';
import { JobService } from '../../shared/services/job.service';
import { User } from '../../shared/models/user.model';
import { Job } from '../../shared/models/job.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class Admin implements OnInit {
  user: User | null = null;
  stats: DashboardStats | null = null;
  recentJobs: Job[] = [];
  isLoading = false;

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (!this.user || this.user.role !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    // Load admin stats
    this.dashboardService.getAdminDashboardData().subscribe({
      next: (stats: DashboardStats) => {
        this.stats = stats;
      },
      error: (err: any) => {
        console.error('Error loading admin stats:', err);
      }
    });

    // Load recent jobs (all jobs for admin)
    this.dashboardService.getAllJobs().subscribe({
      next: (jobs: Job[]) => {
        this.recentJobs = jobs
          .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
          .slice(0, 10); // Show last 10 jobs
      },
      error: (err: any) => {
        console.error('Error loading recent jobs:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

viewUsers() {
    this.router.navigate(['/admin/users']);
  }

  viewBookings() {
    this.router.navigate(['/admin/bookings']);
  }

  viewPayments() {
    this.router.navigate(['/admin/payments']);
  }

  viewReports() {
    this.router.navigate(['/admin/reports']);
  }

  logout() {
    this.auth.logout();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
}
