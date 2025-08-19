import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import {
  Payment,
  CreatePaymentRequest,
  CreatePaymentResponse,
  InitiatePesapalRequest,
  InitiatePesapalResponse,
  PaymentCallbackResponse
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createPayment(paymentData: CreatePaymentRequest): Observable<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>(`${this.apiUrl}/payments`, paymentData, {
      headers: this.getHeaders()
    });
  }

  initiatePesapalPayment(pesapalData: InitiatePesapalRequest): Observable<InitiatePesapalResponse> {
    return this.http.post<InitiatePesapalResponse>(`${this.apiUrl}/payments/pesapal/initiate`, pesapalData, {
      headers: this.getHeaders()
    });
  }

  getPaymentStatus(orderTrackingId: string, orderMerchantReference: string): Observable<PaymentCallbackResponse> {
    const callbackUrl = `${this.apiUrl}/payments/pesapal/callback?OrderTrackingId=${orderTrackingId}&OrderMerchantReference=${orderMerchantReference}`;
    return this.http.get<PaymentCallbackResponse>(callbackUrl);
  }

  getPaymentDetails(paymentId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/payments/${paymentId}`);
  }

  getCallbackUrl(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/client/payment-callback`;
  }
}
