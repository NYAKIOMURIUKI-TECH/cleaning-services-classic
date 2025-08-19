import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { JobService } from '../../../shared/services/job.service';
import { PaymentService } from '../../../shared/services/payment.service';
import { User } from '../../../shared/models/user.model';
import { Job } from '../../../shared/models/job.model';
import { Payment } from '../../../shared/models/payment.model';

interface EarningsStats {
  totalEarnings: number;
  completedJobs: number;
  pendingPayments: number;
  thisMonthEarnings: number;
  averageJobValue: number;
}

@Component({
  selector: 'app-payment-cleaner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-cleaner.html',
  styleUrls: ['./payment-cleaner.scss']
})
export class PaymentCleaner implements OnInit {
  user: User | null = null;
  myJobs: Job[] = [];
  payments: Payment[] = [];
  earningsStats: EarningsStats = {
    totalEarnings: 0,
    completedJobs: 0,
    pendingPayments: 0,
    thisMonthEarnings: 0,
    averageJobValue: 0
  };
  isLoading = false;

  constructor(
    private auth: AuthService,
    private jobService: JobService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadEarningsData();
  }

  loadEarningsData() {
    this.isLoading = true;

    // Load cleaner's jobs first
    this.jobService.getCleanerJobs().subscribe({
      next: (jobs: Job[]) => {
        this.myJobs = jobs;
        this.loadPaymentsForJobs();
        this.calculateEarningsStats();
      },
      error: (err: any) => {
        console.error('Error loading jobs:', err);
        this.isLoading = false;
      }
    });
  }

  loadPaymentsForJobs() {
    this.payments = [];

    // Get payments for completed jobs by checking payment IDs
    for (let paymentId = 1; paymentId <= 100; paymentId++) {
      this.paymentService.getPaymentDetails(paymentId).subscribe({
        next: (payment: Payment) => {
          if (payment) {
            // Check if this payment belongs to any of my completed jobs
            const relatedJob = this.myJobs.find(job => job.id === payment.booking_id);
            if (relatedJob && relatedJob.status === 'completed') {
              this.payments.push(payment);
              this.calculateEarningsStats();
            }
          }
        },
        error: (err: any) => {
          // Payment doesn't exist, continue
        }
      });
    }

    this.isLoading = false;
  }

  calculateEarningsStats() {
    const completedJobs = this.myJobs.filter(job => job.status === 'completed');
    const completedPayments = this.payments.filter(payment => payment.status === 'completed');

    // Calculate total earnings from completed payments
    const totalEarnings = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate this month's earnings
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthPayments = completedPayments.filter(payment => {
      const paymentDate = new Date(payment.paid_at);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    const thisMonthEarnings = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate pending payments (completed jobs without payments)
    const paidJobIds = completedPayments.map(payment => payment.booking_id);
    const pendingJobs = completedJobs.filter(job => !paidJobIds.includes(job.id!));
    const pendingPayments = pendingJobs.reduce((sum, job) => sum + job.price, 0);

    // Calculate average job value
    const averageJobValue = completedJobs.length > 0 ?
      completedJobs.reduce((sum, job) => sum + job.price, 0) / completedJobs.length : 0;

    this.earningsStats = {
      totalEarnings,
      completedJobs: completedJobs.length,
      pendingPayments,
      thisMonthEarnings,
      averageJobValue
    };
  }

  getJobsWithPaymentStatus(): (Job & { paymentStatus: string, paymentAmount?: number })[] {
    return this.myJobs
      .filter(job => job.status === 'completed')
      .map(job => {
        const payment = this.payments.find(p => p.booking_id === job.id);
        return {
          ...job,
          paymentStatus: payment?.status || 'pending',
          paymentAmount: payment?.amount
        };
      });
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/cleaner']);
  }
}
