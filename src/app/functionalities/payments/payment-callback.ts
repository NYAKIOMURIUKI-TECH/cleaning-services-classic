import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../shared/services/payment.service';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors p-6">
      <div class="max-w-2xl mx-auto text-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">

          <div *ngIf="isProcessing">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Processing Payment...</h2>
            <p class="text-gray-600 dark:text-gray-400">Please wait while we verify your payment with Pesapal.</p>
          </div>

          <div *ngIf="!isProcessing && paymentSuccess">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-green-600 mb-4">Payment Successful!</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">{{ message }}</p>
            <button
              (click)="redirectToPayments()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              View Payments
            </button>
          </div>

          <div *ngIf="!isProcessing && !paymentSuccess">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-red-600 mb-4">Payment Failed</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">{{ message }}</p>
            <div class="flex gap-4 justify-center">
              <button
                (click)="redirectToPayments()"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Try Again
              </button>
              <button
                (click)="redirectToDashboard()"
                class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class PaymentCallback implements OnInit {
  isProcessing = true;
  paymentSuccess = false;
  message = '';
  orderTrackingId = '';
  orderMerchantReference = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderTrackingId = params['OrderTrackingId'];
      this.orderMerchantReference = params['OrderMerchantReference'];

      if (this.orderTrackingId && this.orderMerchantReference) {
        this.processPaymentCallback();
      } else {
        this.isProcessing = false;
        this.paymentSuccess = false;
        this.message = 'Invalid payment callback parameters';
      }
    });
  }

  processPaymentCallback() {
    this.paymentService.getPaymentStatus(this.orderTrackingId, this.orderMerchantReference).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.paymentSuccess = response.success;
        this.message = response.message;
      },
      error: (err: any) => {
        console.error('Error processing payment callback:', err);
        this.isProcessing = false;
        this.paymentSuccess = false;
        this.message = 'Error processing payment callback. Please contact support.';
      }
    });
  }

  redirectToPayments() {
    this.router.navigate(['/client/payments']);
  }

  redirectToDashboard() {
    this.router.navigate(['/client']);
  }
}
