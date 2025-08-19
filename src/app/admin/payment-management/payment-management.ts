import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../../shared/services/payment.service';
import { AuthService } from '../../shared/services/auth.service';
import { Payment } from '../../shared/models/payment.model';

interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  thisMonthRevenue: number;
}

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors p-6">
      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Payment Management</h1>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payments</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ paymentStats.totalPayments }}</p>
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
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ paymentStats.completedPayments }}</p>
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
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ paymentStats.pendingPayments }}</p>
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
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">KSH {{ paymentStats.totalRevenue | number:'1.0-0' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">KSH {{ paymentStats.thisMonthRevenue | number:'1.0-0' }}</p>
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
                All Payments ({{ allPayments.length }})
              </button>
              <button
                (click)="selectedTab = 'completed'"
                [class]="selectedTab === 'completed' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                Completed ({{ getCompletedPayments().length }})
              </button>
              <button
                (click)="selectedTab = 'pending'"
                [class]="selectedTab === 'pending' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                Pending ({{ getPendingPayments().length }})
              </button>
            </nav>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 dark:text-gray-400 mt-4">Loading payments...</p>
        </div>

        <!-- Payments Table -->
        <div *ngIf="!isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client & Cleaner
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let payment of getFilteredPayments()" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">#{{ payment.id }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ payment.transaction_id }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ payment.job_title }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ payment.address }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(payment.date) }} at {{ payment.time }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">Client: {{ payment.client_name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Cleaner: {{ payment.cleaner_name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">KSH {{ payment.amount | number:'1.0-0' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">{{ payment.payment_method }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [class]="getPaymentStatusClass(payment.status)">
                      {{ payment.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">{{ formatDate(payment.paid_at) }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(payment.created_at) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      (click)="viewPaymentDetails(payment)"
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

        <!-- No Payments -->
        <div *ngIf="!isLoading && getFilteredPayments().length === 0" class="text-center py-12">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">No payments found</h3>
            <p class="text-gray-600 dark:text-gray-400">No payments match the selected filter</p>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminPaymentManagement implements OnInit {
  allPayments: Payment[] = [];
  selectedTab = 'all';
  isLoading = false;
  paymentStats: PaymentStats = {
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0
  };

  constructor(
    private auth: AuthService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllPayments();
  }

  loadAllPayments() {
    this.isLoading = true;
    this.allPayments = [];

    // Load payments by checking payment IDs 1-100
    for (let paymentId = 1; paymentId <= 100; paymentId++) {
      this.paymentService.getPaymentDetails(paymentId).subscribe({
        next: (payment: Payment) => {
          if (payment) {
            this.allPayments.push(payment);
            this.calculatePaymentStats();
          }
        },
        error: () => {
          // Payment doesn't exist, continue
        }
      });
    }

    // Stop loading after delay to allow API calls to complete
    setTimeout(() => {
      this.allPayments.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      this.calculatePaymentStats();
      this.isLoading = false;
    }, 3000);
  }

  calculatePaymentStats() {
    const completedPayments = this.allPayments.filter(p => p.status === 'completed');
    const pendingPayments = this.allPayments.filter(p => p.status !== 'completed');

    // Calculate this month's revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthPayments = completedPayments.filter(payment => {
      const paymentDate = new Date(payment.paid_at);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    this.paymentStats = {
      totalPayments: this.allPayments.length,
      completedPayments: completedPayments.length,
      pendingPayments: pendingPayments.length,
      totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      thisMonthRevenue: thisMonthPayments.reduce((sum, p) => sum + p.amount, 0)
    };
  }

  getFilteredPayments(): Payment[] {
    switch (this.selectedTab) {
      case 'completed':
        return this.getCompletedPayments();
      case 'pending':
        return this.getPendingPayments();
      default:
        return this.allPayments;
    }
  }

  getCompletedPayments(): Payment[] {
    return this.allPayments.filter(payment => payment.status === 'completed');
  }

  getPendingPayments(): Payment[] {
    return this.allPayments.filter(payment => payment.status !== 'completed');
  }

  getPaymentStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  viewPaymentDetails(payment: Payment) {
    const details = `Payment Details:

Payment ID: #${payment.id}
Transaction ID: ${payment.transaction_id}
Amount: KSH ${payment.amount}
Status: ${payment.status}
Payment Method: ${payment.payment_method}

Job: ${payment.job_title}
Address: ${payment.address}
Date: ${this.formatDate(payment.date)} at ${payment.time}

Client: ${payment.client_name}
Cleaner: ${payment.cleaner_name}

Created: ${this.formatDate(payment.created_at)}
Paid: ${this.formatDate(payment.paid_at)}`;

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
