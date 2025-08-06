import { Component } from '@angular/core';
import{ RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-payments',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments {
  //add the logic for reading the completed bookings from backend(the cleaner's side)
  completedBookings = [
    { id: 1, service: 'Window Cleaning', date: '2025-08-06', time: '10:00 AM', status: 'completed', paid: false , payment:'1500'},
    { id: 2, service: 'Carpet Cleaning', date: '2025-08-01', time: '3:00 PM', status: 'pending', paid: false }
  ];

  selectedBooking: any = null;
  paymentMethod: string = '';
  email: string = '';
  selectedMethod = '';
  card = {
    number: '',
    expiry: '',
    cvv: ''
  };
  mobile = {
    phoneNumber: ''
  };

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

    if (this.selectedMethod === 'card') {
      if (!this.card.number || !this.card.expiry || !this.card.cvv) {
        alert('Please fill in all card details.');
        return;
      }
      // Simulate sending confirmation email
      console.log('Confirmation email sent to customer@example.com');
      alert('Card payment successful!');
    } else if (this.selectedMethod === 'mobile') {
      if (!this.mobile.phoneNumber) {
        alert('Please enter your mobile number.');
        return;
      }
      console.log('Confirmation email sent to customer@example.com');
      alert('Mobile money payment successful!');
    } else {
      alert('Please select a payment method.');
    }

    // Dummy payment simulation
    this.selectedBooking.paid = true;
    console.log(`Payment confirmed for ${this.selectedBooking.service}`);
    console.log(`Receipt sent to: ${this.email}`);

    alert(`Payment successful! Confirmation sent to ${this.email}`);

    // Reset
    this.selectedBooking = null;
    this.paymentMethod = '';
    this.email = '';
  }
}

