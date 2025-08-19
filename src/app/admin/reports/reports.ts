import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService } from '../../shared/services/dashboard.service';
import { PaymentService } from '../../shared/services/payment.service';
import { AuthService } from '../../shared/services/auth.service';
import { Job } from '../../shared/models/job.model';
import { Payment } from '../../shared/models/payment.model';

interface SystemReport {
  totalUsers: number;
  totalClients: number;
  totalCleaners: number;
  totalJobs: number;
  completedJobs: number;
  totalRevenue: number;
  averageJobValue: number;
  topPerformingCleaners: any[];
  monthlyStats: any[];
  recentActivity: any[];
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors p-6">
      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-white">System Reports</h1>
          <div class="flex gap-4">
            <button
              (click)="generateReport()"
              [disabled]="isGenerating"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
            >
              {{ isGenerating ? 'Generating...' : 'Generate Report' }}
            </button>
            <button
              (click)="goBack()"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 dark:text-gray-400 mt-4">Loading report data...</p>
        </div>

        <div *ngIf="!isLoading && systemReport">
          <!-- System Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ systemReport.totalUsers }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ systemReport.totalJobs }}</p>
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
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">KSH {{ systemReport.totalRevenue | number:'1.0-0' }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Job Value</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">KSH {{ systemReport.averageJobValue | number:'1.0-0' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Stats -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- User Breakdown -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">User Breakdown</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Total Users</span>
                  <span class="text-lg font-medium text-gray-900 dark:text-white">{{ systemReport.totalUsers }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Clients</span>
                  <span class="text-lg font-medium text-blue-600 dark:text-blue-400">{{ systemReport.totalClients }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Cleaners</span>
                  <span class="text-lg font-medium text-green-600 dark:text-green-400">{{ systemReport.totalCleaners }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Client to Cleaner Ratio</span>
                  <span class="text-lg font-medium text-purple-600 dark:text-purple-400">
                    {{ systemReport.totalCleaners > 0 ? (systemReport.totalClients / systemReport.totalCleaners).toFixed(1) : 0 }}:1
                  </span>
                </div>
              </div>
            </div>

            <!-- Job Performance -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Job Performance</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Total Jobs</span>
                  <span class="text-lg font-medium text-gray-900 dark:text-white">{{ systemReport.totalJobs }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Completed Jobs</span>
                  <span class="text-lg font-medium text-green-600 dark:text-green-400">{{ systemReport.completedJobs }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span class="text-lg font-medium text-blue-600 dark:text-blue-400">
                    {{ systemReport.totalJobs > 0 ? ((systemReport.completedJobs / systemReport.totalJobs) * 100).toFixed(1) : 0 }}%
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Average Job Value</span>
                  <span class="text-lg font-medium text-purple-600 dark:text-purple-400">KSH {{ systemReport.averageJobValue | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Performers -->
          <div class="mb-8" *ngIf="systemReport.topPerformingCleaners.length > 0">
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top Performing Cleaners</h3>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cleaner</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jobs Completed</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Earnings</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Rating</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr *ngFor="let cleaner of systemReport.topPerformingCleaners; let i = index">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-medium text-gray-900 dark:text-white">#{{ i + 1 }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm text-gray-900 dark:text-white">{{ cleaner.name }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm text-gray-900 dark:text-white">{{ cleaner.jobsCompleted }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-semibold text-green-600 dark:text-green-400">KSH {{ cleaner.earnings | number:'1.0-0' }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <span class="text-yellow-400 mr-1">★</span>
                        <span class="text-sm text-gray-900 dark:text-white">{{ cleaner.rating }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recent Activity -->
          <div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent System Activity</h3>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div class="p-6" *ngIf="systemReport.recentActivity.length > 0">
                <div class="space-y-4">
                  <div
                    *ngFor="let activity of systemReport.recentActivity"
                    class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div class="flex items-center">
                      <div class="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-4">
                        <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ activity.title }}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ activity.description }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(activity.date) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="p-6 text-center" *ngIf="systemReport.recentActivity.length === 0">
                <p class="text-gray-600 dark:text-gray-400">No recent activity</p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Data -->
        <div *ngIf="!isLoading && !systemReport" class="text-center py-12">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">No report data</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Click "Generate Report" to create a system report</p>
            <button
              (click)="generateReport()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              Generate Report
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminReports implements OnInit {
  systemReport: SystemReport | null = null;
  isLoading = false;
  isGenerating = false;

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit() {
    // Auto-generate report on load
    this.generateReport();
  }

  generateReport() {
    this.isLoading = true;
    this.isGenerating = true;
    this.systemReport = null;

    // Collect all data for the report
    Promise.all([
      this.loadAllJobs(),
      this.loadAllPayments(),
      this.loadAllUsers()
    ]).then(([jobs, payments, users]) => {
      this.systemReport = this.compileSystemReport(jobs, payments, users);
      this.isLoading = false;
      this.isGenerating = false;
    }).catch(err => {
      console.error('Error generating report:', err);
      this.isLoading = false;
      this.isGenerating = false;
    });
  }

  loadAllJobs(): Promise<Job[]> {
    return new Promise((resolve) => {
      this.dashboardService.getAllJobs().subscribe({
        next: (jobs) => resolve(jobs),
        error: () => resolve([])
      });
    });
  }

  loadAllPayments(): Promise<Payment[]> {
    return new Promise((resolve) => {
      const payments: Payment[] = [];
      let completed = 0;
      const total = 50;

      for (let i = 1; i <= total; i++) {
        this.paymentService.getPaymentDetails(i).subscribe({
          next: (payment) => {
            if (payment) payments.push(payment);
            completed++;
            if (completed === total) resolve(payments);
          },
          error: () => {
            completed++;
            if (completed === total) resolve(payments);
          }
        });
      }
    });
  }

  loadAllUsers(): Promise<any[]> {
    return new Promise((resolve) => {
      const users: any[] = [];
      let completed = 0;
      const total = 30;

      for (let i = 1; i <= total; i++) {
        this.dashboardService.getUserProfile(i).subscribe({
          next: (response) => {
            if (response.success && response.user) users.push(response.user);
            completed++;
            if (completed === total) resolve(users);
          },
          error: () => {
            completed++;
            if (completed === total) resolve(users);
          }
        });
      }
    });
  }

  compileSystemReport(jobs: Job[], payments: Payment[], users: any[]): SystemReport {
    const completedJobs = jobs.filter(j => j.status === 'completed');
    const completedPayments = payments.filter(p => p.status === 'completed');

    const clients = users.filter(u => u.role === 'client');
    const cleaners = users.filter(u => u.role === 'cleaner');

    // Calculate top performing cleaners
    const cleanerPerformance = cleaners.map(cleaner => {
      const cleanerJobs = jobs.filter(j => j.cleaner_id === cleaner.id && j.status === 'completed');
      const cleanerPayments = payments.filter(p =>
        cleanerJobs.some(j => j.id === p.booking_id) && p.status === 'completed'
      );
      const earnings = cleanerPayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        name: cleaner.fullName,
        jobsCompleted: cleanerJobs.length,
        earnings,
        rating: '4.5' // Default rating
      };
    }).sort((a, b) => b.earnings - a.earnings).slice(0, 5);

    // Recent activity from recent jobs
    const recentActivity = jobs
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, 10)
      .map(job => ({
        title: `New Job: ${job.job_title}`,
        description: `${job.client_name} created a job for KSH ${job.price}`,
        date: job.created_at!
      }));

    return {
      totalUsers: users.length,
      totalClients: clients.length,
      totalCleaners: cleaners.length,
      totalJobs: jobs.length,
      completedJobs: completedJobs.length,
      totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      averageJobValue: jobs.length > 0 ? jobs.reduce((sum, j) => sum + j.price, 0) / jobs.length : 0,
      topPerformingCleaners: cleanerPerformance,
      monthlyStats: [],
      recentActivity
    };
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
