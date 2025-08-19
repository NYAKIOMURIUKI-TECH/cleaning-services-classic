import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { JobService } from '../../shared/services/job.service';
import { User } from '../../shared/models/user.model';
import { JobRequest } from '../../shared/models/job.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss']
})
export class Booking implements OnInit {
  user: User | null = null;

  // Form fields
  jobTitle = '';
  jobDescription = '';
  address = '';
  price: number = 0;
  durationHours: number = 1;
  date = '';
  time = '';

  isSubmitting = false;
  minDate = '';

  constructor(
    private auth: AuthService,
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  createJob() {
    if (this.isSubmitting) return;

    if (!this.user?.id) {
      alert('User not found. Please login again.');
      return;
    }

    this.isSubmitting = true;

    const jobData: JobRequest = {
      job_title: this.jobTitle,
      job_description: this.jobDescription,
      address: this.address,
      price: this.price,
      duration_hours: this.durationHours,
      date: this.date,
      time: this.time,
      client_id: this.user.id
    };

    this.jobService.createJob(jobData).subscribe({
      next: (response: any) => {
        alert('Job created successfully!');
        this.router.navigate(['/client']);
      },
      error: (err: any) => {
        console.error('Error creating job:', err);
        alert(err.error?.message || 'Failed to create job. Please try again.');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/client']);
  }
}
