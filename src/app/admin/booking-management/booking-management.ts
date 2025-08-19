import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService } from '../../shared/services/dashboard.service';
import { JobService } from '../../shared/services/job.service';
import { AuthService } from '../../shared/services/auth.service';
import { Job } from '../../shared/models/job.model';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors p-6">
      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Booking Management</h1>
          <button
            (click)="goBack()"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ allJobs.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ getPendingJobs().length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ getInProgressJobs().length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ getCompletedJobs().length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">KSH {{ getTotalValue() | number:'1.0-0' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex space-x-8">
              <button
                (click)="selectedTab = 'all'"
                [class]="selectedTab === 'all' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                All Jobs ({{ allJobs.length }})
              </button>
              <button
                (click)="selectedTab = 'pending'"
                [class]="selectedTab === 'pending' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                Pending ({{ getPendingJobs().length }})
              </button>
              <button
                (click)="selectedTab = 'in_progress'"
                [class]="selectedTab === 'in_progress' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                In Progress ({{ getInProgressJobs().length }})
              </button>
              <button
                (click)="selectedTab = 'completed'"
                [class]="selectedTab === 'completed' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                Completed ({{ getCompletedJobs().length }})
              </button>
            </nav>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 dark:text-gray-400 mt-4">Loading bookings...</p>
        </div>

        <!-- Jobs Table -->
        <div *ngIf="!isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cleaner
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let job of getFilteredJobs()" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4">
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ job.job_title }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ job.job_description }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ job.address }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">{{ job.client_name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ job.client_phone }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div *ngIf="job.cleaner_name" class="text-sm text-gray-900 dark:text-white">{{ job.cleaner_name }}</div>
                    <div *ngIf="job.cleaner_phone" class="text-sm text-gray-500 dark:text-gray-400">{{ job.cleaner_phone }}</div>
                    <div *ngIf="!job.cleaner_name" class="text-sm text-gray-500 dark:text-gray-400">Not assigned</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">{{ formatDate(job.date) }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ job.time }} ({{ job.duration_hours }}h)</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">KSH {{ job.price | number:'1.0-0' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [class]="getStatusClass(job.status)">
                      {{ job.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      (click)="viewJobDetails(job)"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Jobs -->
        <div *ngIf="!isLoading && getFilteredJobs().length === 0" class="text-center py-12">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">No bookings found</h3>
            <p class="text-gray-600 dark:text-gray-400">No bookings match the selected filter</p>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminBookingManagement implements OnInit {
  allJobs: Job[] = [];
  selectedTab = 'all';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllJobs();
  }

  loadAllJobs() {
    this.isLoading = true;
    this.dashboardService.getAllJobs().subscribe({
      next: (jobs: Job[]) => {
        this.allJobs = jobs.sort((a, b) =>
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
        );
      },
      error: (err: any) => {
        console.error('Error loading jobs:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getFilteredJobs(): Job[] {
    switch (this.selectedTab) {
      case 'pending':
        return this.getPendingJobs();
      case 'in_progress':
        return this.getInProgressJobs();
      case 'completed':
        return this.getCompletedJobs();
      default:
        return this.allJobs;
    }
  }

  getPendingJobs(): Job[] {
    return this.allJobs.filter(job => job.status === 'pending');
  }

  getInProgressJobs(): Job[] {
    return this.allJobs.filter(job => job.status === 'in_progress' || job.status === 'accepted');
  }

  getCompletedJobs(): Job[] {
    return this.allJobs.filter(job => job.status === 'completed');
  }

  getTotalValue(): number {
    return this.allJobs.reduce((sum, job) => sum + job.price, 0);
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

  viewJobDetails(job: Job) {
    const details = `Job Details:

Title: ${job.job_title}
Description: ${job.job_description}
Address: ${job.address}
Price: KSH ${job.price}
Duration: ${job.duration_hours} hours
Date: ${this.formatDate(job.date)}
Time: ${job.time}
Status: ${job.status}

Client: ${job.client_name}
Phone: ${job.client_phone}

${job.cleaner_name ? `Cleaner: ${job.cleaner_name}\nCleaner Phone: ${job.cleaner_phone}` : 'No cleaner assigned'}

Created: ${this.formatDate(job.created_at || '')}
${job.accepted_at ? `Accepted: ${this.formatDate(job.accepted_at)}` : ''}
${job.completed_at ? `Completed: ${this.formatDate(job.completed_at)}` : ''}`;

    alert(details);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
