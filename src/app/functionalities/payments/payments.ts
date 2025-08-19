import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../shared/services/auth.service';
import { JobService } from '../../shared/services/job.service';
import { PaymentService } from '../../shared/services/payment.service';
import { User } from '../../shared/models/user.model';
import { Job } from '../../shared/models/job.model';
import { Payment } from '../../shared/models/payment.model';

interface JobWithPaymentStatus extends Job {
  paymentStatus?: string;
  paymentId?: number;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss']
})
export class Payments implements OnInit {
  user: User | null = null;
  completedJobs: JobWithPaymentStatus[] = [];
  paymentHistory: Payment[] = [];
  selectedJob: Job | null = null;

  currentStep: string = 'list';
  paymentUrl: SafeResourceUrl | null = null;

  // Form data
  customerName = '';
  phoneNumber = '';

  // Processing states
  isProcessing = false;
  currentPaymentId: number | null = null;
  orderTrackingId: string | null = null;
  orderMerchantReference: string | null = null;

  // Callback handling
  callbackMessage = '';
  callbackSuccess = false;

  constructor(
    private auth: AuthService,
    private jobService: JobService,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.customerName = this.user.fullName;
    this.phoneNumber = this.user.phone || '';

    this.route.queryParams.subscribe(params => {
      if (params['OrderTrackingId'] && params['OrderMerchantReference']) {
        this.handlePesapalCallback(params['OrderTrackingId'], params['OrderMerchantReference']);
      } else {
        this.loadData();
      }
    });
  }

  handlePesapalCallback(orderTrackingId: string, orderMerchantReference: string) {
    this.currentStep = 'callback';
    this.orderTrackingId = orderTrackingId;
    this.orderMerchantReference = orderMerchantReference;

    this.paymentService.getPaymentStatus(orderTrackingId, orderMerchantReference).subscribe({
      next: (response) => {
        this.callbackSuccess = response.success;
        this.callbackMessage = response.message;

        if (response.success) {
          setTimeout(() => {
            this.currentStep = 'success';
            this.loadData();
          }, 2000);
        } else {
          setTimeout(() => {
            this.currentStep = 'list';
            this.loadData();
          }, 3000);
        }
      },
      error: (err: any) => {
        console.error('Error processing callback:', err);
        this.callbackSuccess = false;
        this.callbackMessage = 'Error processing payment callback';

        setTimeout(() => {
          this.currentStep = 'list';
          this.loadData();
        }, 3000);
      }
    });
  }

  loadData() {
    if (!this.user?.id) return;

    this.jobService.getClientJobs(this.user.id).subscribe({
      next: (jobs: Job[]) => {
        this.completedJobs = jobs.filter(job => job.status === 'completed').map(job => ({
          ...job,
          paymentStatus: 'pending',
          paymentId: undefined
        }));

        this.loadPaymentHistory();
      },
      error: (err: any) => {
        console.error('Error loading jobs:', err);
      }
    });
  }

  loadPaymentHistory() {
    this.paymentHistory = [];

    for (let paymentId = 1; paymentId <= 50; paymentId++) {
      this.paymentService.getPaymentDetails(paymentId).subscribe({
        next: (payment: Payment) => {
          if (payment) {
            const relatedJob = this.completedJobs.find(job => job.id === payment.booking_id);
            if (relatedJob) {
              relatedJob.paymentStatus = payment.status;
              relatedJob.paymentId = payment.id;
            }

            if (relatedJob && payment.status === 'completed') {
              this.paymentHistory.push(payment);
            }
          }
        },
        error: (err: any) => {
          // Payment ID doesn't exist, continue to next
        }
      });
    }
  }

  initiatePayment(job: Job) {
    this.selectedJob = job;
    this.currentStep = 'payment';
  }

  proceedToPesapal() {
    if (!this.selectedJob || this.isProcessing) return;

    this.isProcessing = true;

    const paymentData = {
      bookingId: this.selectedJob.id!,
      amount: this.selectedJob.price
    };

    this.paymentService.createPayment(paymentData).subscribe({
      next: (response) => {
        this.currentPaymentId = response.paymentId;

        const pesapalData = {
          paymentId: response.paymentId,
          customerName: this.customerName,
          phoneNumber: this.phoneNumber
        };

        this.paymentService.initiatePesapalPayment(pesapalData).subscribe({
          next: (pesapalResponse) => {
            this.orderTrackingId = pesapalResponse.orderTrackingId;
            this.orderMerchantReference = `CLEANING_${response.paymentId}_${Date.now()}`;
            this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pesapalResponse.redirectUrl);
          },
          error: (err: any) => {
            console.error('Error initiating Pesapal payment:', err);
            alert(err.error?.message || 'Failed to initiate payment');
          },
          complete: () => {
            this.isProcessing = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Error creating payment:', err);
        alert(err.error?.message || 'Failed to create payment');
        this.isProcessing = false;
      }
    });
  }

  isJobPaid(job: JobWithPaymentStatus): boolean {
    return job.paymentStatus === 'completed';
  }

  getPaymentStatusText(job: JobWithPaymentStatus): string {
    switch (job.paymentStatus) {
      case 'completed':
        return 'Paid';
      case 'pending':
        return 'Payment Required';
      default:
        return 'Payment Required';
    }
  }

  getPaymentStatusClass(job: JobWithPaymentStatus): string {
    switch (job.paymentStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  }

  checkPaymentStatus() {
    if (!this.orderTrackingId || !this.orderMerchantReference) return;

    this.paymentService.getPaymentStatus(this.orderTrackingId, this.orderMerchantReference).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentStep = 'success';
        } else {
          alert('Payment not completed yet. Please try again.');
        }
      },
      error: (err: any) => {
        console.error('Error checking payment status:', err);
        alert('Error checking payment status');
      }
    });
  }

  cancelPayment() {
    this.currentStep = 'list';
    this.selectedJob = null;
    this.paymentUrl = null;
    this.currentPaymentId = null;
    this.orderTrackingId = null;
    this.orderMerchantReference = null;
  }

  returnToPayments() {
    this.currentStep = 'list';
    this.selectedJob = null;
    this.paymentUrl = null;
    this.currentPaymentId = null;
    this.orderTrackingId = null;
    this.orderMerchantReference = null;
    this.loadData();
  }

  goBack() {
    this.router.navigate(['/client']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStepClass(step: number): string {
    const currentStepNumber = this.currentStep === 'payment' ? 1 :
                             this.currentStep === 'success' ? 3 : 1;

    if (step <= currentStepNumber) {
      return 'bg-blue-600 text-white';
    } else {
      return 'bg-gray-300 text-gray-600';
    }
  }
}
