// src/app/services/customer.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private apiUrl = 'http://localhost:3000/api'; // Change as needed

  constructor(private http: HttpClient) {}

  getServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/services`);
  }

  bookService(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, data);
  }

  getMyBookings(customerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/bookings/customer/${customerId}`);
  }
}
