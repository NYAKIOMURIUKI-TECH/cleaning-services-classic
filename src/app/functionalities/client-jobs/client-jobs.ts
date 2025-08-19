import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { JobService } from '../../shared/services/job.service';
import { User } from '../../shared/models/user.model';
import { Job } from '../../shared/models/job.model';

@Component({
  selector: 'app-client-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-jobs.html',
  styleUrls: ['./client-jobs.scss']
})
export class ClientJobs implements OnInit {
  user: User | null = null;
  jobs: Job[] = [];
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

    this.loadJobs();
  }

  loadJobs() {
    if (!this.user?.id) return;

    this.isLoading = true;
    this.jobService.getClientJobs(this.user.id).subscribe({
      next: (jobs: Job[]) => {
        this.jobs = jobs;
      },
      error: (err: any) => {
        console.error('Error loading jobs:', err);
        alert('Failed to load jobs');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  goBack() {
    this.router.navigate(['/client']);
  }

  rateJob(jobId: number) {
    // Navigate to rating page
    this.router.navigate(['/client/ratings'], { queryParams: { jobId: jobId } });
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
      case 'confirmed':
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
