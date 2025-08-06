import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-booking',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.scss'
})
export class Booking {
  services = ['Cleaning', 'Laundry', 'Plumbing','Carpet Cleaning','Window Cleaning']; // Can be dynamic
  bookings: any[] = []; // This will be fetched from backend in real use
  showForm = false;

  booking = {
    service: '',
    date: '',
    time: '',
    location: '',
    note: '',
    status: 'pending'
  };

  toggleBookingForm() {
    this.showForm = !this.showForm;
  }

  confirmBooking() {
  const selectedDateTime = new Date(`${this.booking.date}T${this.booking.time}`);
  const currentDateTime = new Date();

  if (selectedDateTime < currentDateTime) {
    alert('Oooops! Past event. Please choose a future date and time.');
    return;
  }

  const confirm = window.confirm('Are you sure? You won’t be able to edit this after confirming.');
  if (confirm) {
    const newBooking = { ...this.booking, id: Date.now() }; // Simulate ID
    this.bookings.push(newBooking); // Replace with API call
    this.booking = { service: '', date: '', time: '', location: '', note: '', status: 'pending' };
    this.showForm = false;
  }
}


  deleteBooking(id: number) {
    const confirm = window.confirm('Are you sure you want to cancel this booking?');
    if (confirm) {
      this.bookings = this.bookings.filter(b => b.id !== id); // Replace with API call
    }
  }

  viewBooking(booking: any) {
    alert(`Booking Details:\nService: ${booking.service}\nDate: ${booking.date}\nTime: ${booking.time}\nStatus: ${booking.status}`);
  }
}
