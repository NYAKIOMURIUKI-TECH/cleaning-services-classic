import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Booking {
  id: string;
  customerName: string;
  address: string;
  date: string;
  time: string;
  service: string;
  price: number;
  status: string;
  assignedTo?: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: string;
}

interface Rating {
  id: string;
  stars: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-cleaner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cleaner.html',

})
export class Cleaner implements OnInit {
  profile = {
    name: '',
    email: '',
    photoUrl: 'https://via.placeholder.com/150'
  };

  bookings: Booking[] = [];
  payments: Payment[] = [];
  ratings: Rating[] = [];
  activeSection: string = 'dashboard';

  // You'll need to create and inject your AuthService
  private auth: any = {
    getUser: () => ({
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      photoUrl: 'https://via.placeholder.com/150'
    })
  };

  constructor(
    private router: Router,
    private http: HttpClient
    // Add your actual AuthService here when ready
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.profile.name = user.fullName || '';
    this.profile.email = user.email || '';
    this.profile.photoUrl = user.photoUrl || 'https://via.placeholder.com/150';

    // Use user.id as cleanerId
    const cleanerId = user.id;

    this.loadBookings(cleanerId);
    this.loadPayments(cleanerId);
    this.loadRatings(cleanerId);
  }

  loadBookings(cleanerId: number) {
    this.http.get<Booking[]>(`http://localhost:8080/api/bookings/cleaner/${cleanerId}`)
      .subscribe({
        next: (data) => this.bookings = data,
        error: (err) => {
          console.error('Error loading bookings:', err);
          // Fallback to empty array or show error message
          this.bookings = [];
        }
      });
  }

  loadPayments(cleanerId: number) {
    this.http.get<Payment[]>(`http://localhost:8080/api/payments/cleaner/${cleanerId}`)
      .subscribe({
        next: (data) => this.payments = data,
        error: (err) => {
          console.error('Error loading payments:', err);
          this.payments = [];
        }
      });
  }

  loadRatings(cleanerId: number) {
    this.http.get<Rating[]>(`http://localhost:8080/api/ratings/cleaner/${cleanerId}`)
      .subscribe({
        next: (data) => this.ratings = data,
        error: (err) => {
          console.error('Error loading ratings:', err);
          this.ratings = [];
        }
      });
  }

  // Navigation method
  go(section: string) {
    this.activeSection = section;
  }

  // Computed properties
  get totalEarnings(): number {
    return this.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  get averageRating(): number {
    if (this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((total, rating) => total + rating.stars, 0);
    return Math.round((sum / this.ratings.length) * 10) / 10;
  }

  get pendingService(): Booking | null {
    return this.bookings.find(b => b.status === 'pending') || null;
  }

  // Booking management methods
  acceptBooking(bookingId: string) {
    this.http.patch(`http://localhost:8080/api/bookings/${bookingId}/accept`, {})
      .subscribe({
        next: () => {
          // Update local state
          const booking = this.bookings.find(b => b.id === bookingId);
          if (booking) {
            booking.status = 'pending';
            booking.assignedTo = 'You';
          }
        },
        error: (err) => console.error('Error accepting booking:', err)
      });
  }

  declineBooking(bookingId: string) {
    this.http.patch(`http://localhost:8080/api/bookings/${bookingId}/decline`, {})
      .subscribe({
        next: () => {
          // Update local state
          const booking = this.bookings.find(b => b.id === bookingId);
          if (booking) {
            booking.status = 'declined';
          }
        },
        error: (err) => console.error('Error declining booking:', err)
      });
  }

  completeBooking(bookingId: string) {
    this.http.patch(`http://localhost:8080/api/bookings/${bookingId}/complete`, {})
      .subscribe({
        next: () => {
          // Update local state
          const booking = this.bookings.find(b => b.id === bookingId);
          if (booking) {
            booking.status = 'completed';
          }
        },
        error: (err) => console.error('Error completing booking:', err)
      });
  }

  // Profile management
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', file);

      // You'll need to implement photo upload endpoint
      this.http.post<{photoUrl: string}>('http://localhost:8080/api/profile/upload-photo', formData)
        .subscribe({
          next: (response) => {
            this.profile.photoUrl = response.photoUrl;
          },
          error: (err) => console.error('Error uploading photo:', err)
        });
    }
  }

  updateProfile() {
    const profileData = {
      name: this.profile.name,
      email: this.profile.email
    };

    this.http.put('http://localhost:8080/api/profile/update', profileData)
      .subscribe({
        next: () => {
          console.log('Profile updated successfully');
          // Show success message to user
        },
        error: (err) => console.error('Error updating profile:', err)
      });
  }
}