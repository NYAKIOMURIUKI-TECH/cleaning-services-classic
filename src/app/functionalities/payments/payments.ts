import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments implements OnInit {
  constructor(private http: HttpClient) {}

  completedBookings: any[] = [];
  selectedBooking: any = null;
  paymentMethod: string = '';
  email: string = '';
  
  card = {
    number: '',
    expiry: '',
    cvv: ''
  };
  mobile = {
    phoneNumber: ''
  };

  ngOnInit() {
    this.loadCompletedBookings();
  }

  loadCompletedBookings() {
    // Get completed bookings from backend
    this.http.get('http://localhost:8080/api/bookings')
      .subscribe({
        next: (data: any) => {
          this.completedBookings = data.filter((booking: any) => booking.status === 'completed');
        },
        error: (err) => console.error('Failed to load bookings', err)
      });
  }

  selectBooking(booking: any) {
    if (booking.status !== 'completed') {
      alert('Only completed services can be paid for.');
      return;
    }
    this.selectedBooking = booking;
  }

  pay() {
    if (!this.selectedBooking || !this.paymentMethod || !this.email) {
      alert('Please complete all fields.');
      return;
    }

    if (this.paymentMethod === 'card') {
      if (!this.card.number || !this.card.expiry || !this.card.cvv) {
        alert('Please fill in all card details.');
        return;
      }
    } else if (this.paymentMethod === 'mobile') {
      if (!this.mobile.phoneNumber) {
        alert('Please enter your mobile number.');
        return;
      }
    }

    // Send payment to backend
    const paymentData = {
      bookingId: this.selectedBooking.id,
      paymentMethod: this.paymentMethod,
      email: this.email,
      amount: this.selectedBooking.payment || 1500,
      cardDetails: this.paymentMethod === 'card' ? this.card : null,
      mobileDetails: this.paymentMethod === 'mobile' ? this.mobile : null
    };

    this.http.post('http://localhost:8080/api/payments', paymentData)
      .subscribe({
        next: (response: any) => {
          alert(`Payment successful! Confirmation sent to ${this.email}`);
          this.selectedBooking.paid = true;
          this.resetForm();
        },
        error: (err) => {
          console.error('Payment failed:', err);
          alert('Payment failed. Please try again.');
        }
      });
  }

  resetForm() {
    this.selectedBooking = null;
    this.paymentMethod = '';
    this.email = '';
    this.card = { number: '', expiry: '', cvv: '' };
    this.mobile = { phoneNumber: '' };
  }
}