import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Role } from '../../shared/auth.service';
import { Router } from '@angular/router';

type Section = 'dashboard' | 'bookings' | 'payments' | 'settings' | 'ratings';

interface Booking {
  id: string;
  customerName: string;
  address: string;
  date: string;
  time: string;
  service: string;
  price: number;
  status: 'new' | 'pending' | 'completed' | 'declined';
  assignedTo?: string; // "You" when accepted
}


interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'processing';
}

interface Rating {
  id: string;
  stars: number;    // 1–5
  comment: string;
  date: string;
}


@Component({
  selector: 'app-cleaner',
  imports: [CommonModule, FormsModule],
  templateUrl: './cleaner.html',
  styleUrl: './cleaner.scss'
})
export class Cleaner implements OnInit {
constructor(private auth: AuthService, private router: Router) {}
   // UI state
  activeSection: Section = 'dashboard';

  // Profile (editable in Settings)
   profile = {
    name: '',
    email: '',
    photoUrl: '' as string | ArrayBuffer | null
  };

  // Dummy data
  bookings: Booking[] = [
    { id: 'B-101', customerName: 'John Doe', address: 'Westlands, Nairobi', date: '2025-08-14', time: '10:00 AM', service: 'Deep Cleaning', price: 4500, status: 'new' },
    { id: 'B-102', customerName: 'Mary W.', address: 'Kilimani, Nairobi', date: '2025-08-15', time: '2:00 PM', service: 'General Cleaning', price: 2500, status: 'new' },
    { id: 'B-099', customerName: 'Kevin O.', address: 'Parklands', date: '2025-08-12', time: '9:00 AM', service: 'Carpet Wash', price: 3000, status: 'completed', assignedTo: 'You' }
  ];

  payments: Payment[] = [
    { id: 'P-8801', amount: 3000, date: '2025-08-12', status: 'paid' },
    { id: 'P-8802', amount: 4500, date: '2025-08-14', status: 'processing' }
  ];

  ratings: Rating[] = [
    { id: 'R-1', stars: 5, comment: 'Excellent job! Very thorough.', date: '2025-08-10' },
    { id: 'R-2', stars: 4, comment: 'Great work, arrived on time.', date: '2025-08-11' },
    { id: 'R-3', stars: 5, comment: 'Super clean! Highly recommend.', date: '2025-08-12' }
  ];

  // Derived stats
  get averageRating(): number {
    if (!this.ratings.length) return 0;
    const sum = this.ratings.reduce((a, r) => a + r.stars, 0);
    return +(sum / this.ratings.length).toFixed(1);
  }
  get totalEarnings(): number {
    // Sum of PAID + (optionally) completed bookings — keeping it simple: sum paid
    return this.payments
      .filter(p => p.status === 'paid')
      .reduce((a, p) => a + p.amount, 0);
  }
  get pendingService(): Booking | undefined {
    return this.bookings.find(b => b.status === 'pending' && b.assignedTo === 'You');
  }
  recentActivity: string[] = [];

  ngOnInit(): void {
    const user = this.auth.getUser(); // Adjust based on your AuthService
    if (!user) {
      this.router.navigate(['/login']); // Redirect if not logged in
      return;
    }

    this.profile.name = user.fullName  || '';
    this.profile.email = user.email || '';
    this.profile.photoUrl = user.photoUrl || '';

    this.log(`Signed in as cleaner: ${this.profile.name}`);
  }

  // Section navigation
  go(section: Section) {
    this.activeSection = section;
    this.log(`Navigated to ${section}.`);
  }

  // Bookings actions
  acceptBooking(id: string) {
    const b = this.bookings.find(x => x.id === id);
    if (!b || b.status !== 'new') return;
    b.status = 'pending';
    b.assignedTo = 'You';
    this.log(`Accepted booking ${id}.`);
    this.activeSection = 'bookings';
  }

  declineBooking(id: string) {
    const b = this.bookings.find(x => x.id === id);
    if (!b || (b.status !== 'new' && b.status !== 'pending')) return;
    b.status = 'declined';
    b.assignedTo = undefined;
    this.log(`Declined booking ${id}.`);
  }

  completeBooking(id: string) {
    const b = this.bookings.find(x => x.id === id);
    if (!b) return;
    if (b.assignedTo !== 'You' || b.status !== 'pending') {
      alert('Only the assigned cleaner can mark this as completed.');
      return;
    }
    b.status = 'completed';
    this.log(`Completed booking ${id}.`);
    // Simulate payment moving to "processing" for this completed job
    this.payments.push({
      id: 'P-' + Math.floor(Math.random() * 9000 + 1000),
      amount: b.price,
      date: new Date().toISOString().split('T')[0],
      status: 'processing'
    });
  }

  // Settings actions
  updateProfile() {
    this.log('Updated profile details.');
    alert('Profile updated (dummy).');
  }

  onPhotoSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.profile.photoUrl = reader.result);
    reader.readAsDataURL(file);
    this.log('Updated profile photo.');
  }

  // Utilities
  private log(msg: string) {
    const t = new Date().toLocaleTimeString();
    this.recentActivity.unshift(`[${t}] ${msg}`);
    this.recentActivity = this.recentActivity.slice(0, 8);
  }
}
