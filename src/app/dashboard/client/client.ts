import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client',
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule],
  templateUrl: './client.html',
  styleUrls: ['./client.scss']
})
export class Client implements OnInit {
  services: any[] = [];
  myBookings: any[] = [];
  bookingForm = {
    serviceId: '',
    date: '',
    time: '',
  };
  userId: number = 0;

  constructor(private clientService: ClientService, private routerModule: RouterModule) {}

  ngOnInit(): void {
    this.getUserId();
    this.loadServices();
    this.loadMyBookings();
  }

  getUserId() {
    const storedUserId = localStorage.getItem('userId') ||
                         localStorage.getItem('user_id') ||
                         sessionStorage.getItem('userId') ||
                         sessionStorage.getItem('user_id');

    if (storedUserId) {
      this.userId = parseInt(storedUserId);
      console.log('Found user ID:', this.userId);
    } else {
      console.error('No user ID found. Some features may not work.');
    }
  }

  loadServices() {
    // Hardcoded services to avoid 404
    this.services = [
      { name: 'Basic Cleaning', description: 'Basic cleaning service' },
      { name: 'Premium Cleaning', description: 'Deep cleaning' },
      { name: 'Window Cleaning', description: 'Professional window cleaning' }
    ];
  }

  loadMyBookings() {
    this.clientService.getMyBookings().subscribe({  // <-- No arguments now
      next: (data: any) => this.myBookings = data,
      error: (error: any) => console.error('Failed to load bookings:', error)
    });
  }

  bookService() {
    if (!this.userId) return;

    const bookingData = {
      ...this.bookingForm,
      clientId: this.userId  // Attach user ID
    };

    this.clientService.bookService(bookingData).subscribe({
      next: res => {
        alert('Booking sent!');
        this.loadMyBookings(); // Refresh list
      },
      error: (err: any) => alert('Booking failed: ' + err.message)
    });
  }
}
