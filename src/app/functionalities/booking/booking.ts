import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {HttpClient} from '@angular/common/http';


@Component({
  selector: 'app-booking',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.scss'
})
export class Booking implements OnInit {
  constructor(private http: HttpClient) {}
  services = ['Cleaning', 'Laundry', 'Plumbing','Carpet Cleaning','Window Cleaning']; // Can be dynamic
  bookings: any[] = []; // This will be fetched from backend in real use
  showForm = false;

  booking = {
    service: '',
    date: '',
    time: ''
  };
  ngOnInit() {
    this.loadBookings();
  }

  // ADD THIS METHOD  
  loadBookings() {
    this.http.get('http://localhost:8080/api/bookings')
      .subscribe({
        next: (data: any) => {
          this.bookings = data;
        },
        error: (err) => console.error('Failed to load bookings', err)
      });
  }

  toggleBookingForm() {
    this.showForm = !this.showForm;
  }

  confirmBooking() {
  console.log('Form booking data before send:', this.booking);

  const selectedDateTime = new Date(`${this.booking.date}T${this.booking.time}`);
  const currentDateTime = new Date();

  if (selectedDateTime < currentDateTime) {
    alert('Oooops! Past event. Please choose a future date and time.');
    return;
  }

  const confirm = window.confirm('Are you sure? You won’t be able to edit this after confirming.');
  if (!confirm) return;

  this.http.post('http://localhost:8080/api/bookings', this.booking)
    .subscribe({
      next: (res: any) => {
        console.log('Backend response:', res);

        // If backend sends only { bookingId }, create the row from form data
        const newBooking = res.booking
          ? res.booking
          : {
              id: res.bookingId,           // from backend
              service: this.booking.service,
              date: this.booking.date,
              time: this.booking.time,
              status: 'pending'            // default for display
            };

        this.bookings.push(newBooking);
        alert(res.message || 'Booking created');
        this.booking = { service: '', date: '', time: '' };
        this.showForm = false;
      },
      error: (err) => {
        console.error('Error occurred:', err);
        alert('Failed to create booking. Please try again.');
      }
    });
}

  deleteBooking(id: number) {
  const confirm = window.confirm('Are you sure you want to cancel this booking?');
  if (confirm) {
    // Call backend API to delete from MySQL
    this.http.delete(`http://localhost:8080/api/bookings/${id}`)
      .subscribe({
        next: (res: any) => {
          // Only remove from frontend array AFTER backend confirms deletion
          this.bookings = this.bookings.filter(b => b.id !== id);
          alert('Booking cancelled successfully');
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Failed to cancel booking');
        }
      });
  }
}
  viewBooking(booking: any) {
    alert(`Booking Details:\nService: ${booking.service}\nDate: ${booking.date}\nTime: ${booking.time}`);
  }
}
