import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/services`);
  }

  bookService(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, data);
  }

  getMyBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bookings`);
  }

  deleteBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/${id}`);
  }
}