import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { JobService } from '../../../shared/services/job.service';
import { User } from '../../../shared/models/user.model';
import { Job } from '../../../shared/models/job.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.scss']
})
export class Bookings implements OnInit {
  user: User | null = null;
  myJobs: Job[] = [];
  availableJobs: Job[] = [];
  activeTab: 'my-jobs' | 'available-jobs' = 'my-jobs';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadMyJobs();
    this.loadAvailableJobs();
  }

  loadMyJobs() {
    this.isLoading = true;
    this.jobService.getCleanerJobs().subscribe({
      next: (jobs: Job[]) => {
        this.myJobs = jobs;
      },
      error: (err: any) => {
        console.error('Error loading my jobs:', err);
        alert('Failed to load my jobs');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadAvailableJobs() {
    this.jobService.getAvailableJobs().subscribe({
      next: (jobs: Job[]) => {
        this.availableJobs = jobs;
      },
      error: (err: any) => {
        console.error('Error loading available jobs:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/cleaner']);
  }

  switchTab(tab: 'my-jobs' | 'available-jobs') {
    this.activeTab = tab;
  }

  acceptJob(jobId: number) {
    if (!confirm('Are you sure you want to accept this job?')) return;

    this.jobService.acceptJob(jobId).subscribe({
      next: (response) => {
        alert('Job accepted successfully');
        this.loadMyJobs();
        this.loadAvailableJobs();
      },
      error: (err: any) => {
        console.error('Error accepting job:', err);
        alert(err.error?.message || 'Failed to accept job');
      }
    });
  }

  updateJobStatus(jobId: number, status: 'in_progress' | 'completed') {
    const confirmMessage = status === 'in_progress' ?
      'Are you sure you want to start this job?' :
      'Are you sure you want to mark this job as completed?';

    if (!confirm(confirmMessage)) return;

    this.jobService.updateJobStatus(jobId, status).subscribe({
      next: (response) => {
        const successMessage = status === 'in_progress' ?
          'Job started successfully' :
          'Job completed successfully';
        alert(successMessage);
        this.loadMyJobs();
      },
      error: (err: any) => {
        console.error('Error updating job status:', err);
        alert(err.error?.message || 'Failed to update job status');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
}
