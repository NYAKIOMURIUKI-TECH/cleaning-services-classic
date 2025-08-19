import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { JobService } from '../../shared/services/job.service';
import { User } from '../../shared/models/user.model';
import { Job } from '../../shared/models/job.model';

interface RatingData {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  would_recommend: number;
  testimonial: string;
  created_at: string;
  job_title: string;
  reviewer_name: string;
}

interface RatingRequest {
  bookingId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  wouldRecommend: boolean;
  testimonial: string;
}

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './rating.html',
  styleUrls: ['./rating.scss']
})
export class Rating implements OnInit {
  ratingForm!: FormGroup;
  submitted = false;
  user: User | null = null;
  completedJobs: Job[] = [];
  selectedJobId: number | null = null;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private auth: AuthService,
    private jobService: JobService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeForm();
    this.loadCompletedJobs();

    // Check if we have a jobId from query params (from client-jobs page)
    this.route.queryParams.subscribe(params => {
      if (params['jobId']) {
        this.selectedJobId = parseInt(params['jobId']);
        this.selectJobForRating(this.selectedJobId);
      }
    });
  }

  initializeForm() {
    this.ratingForm = this.fb.group({
      jobId: ['', Validators.required],
      rating: ['', Validators.required],
      wouldRecommend: [false],
      testimonial: ['']
    });
  }

  loadCompletedJobs() {
    if (!this.user?.id) return;

    this.isLoading = true;
    this.jobService.getClientJobs(this.user.id).subscribe({
      next: (jobs: Job[]) => {
        // Only show completed jobs that have a cleaner assigned
        this.completedJobs = jobs.filter(job =>
          job.status === 'completed' && job.cleaner_id && job.cleaner_name
        );
      },
      error: (err: any) => {
        console.error('Error loading completed jobs:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  selectJobForRating(jobId: number) {
    this.selectedJobId = jobId;
    this.ratingForm.patchValue({ jobId: jobId });
  }

  getSelectedJob(): Job | null {
    if (!this.selectedJobId) return null;
    return this.completedJobs.find(job => job.id === this.selectedJobId) || null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.ratingForm.valid && this.user && this.selectedJobId) {
      const selectedJob = this.getSelectedJob();
      if (!selectedJob || !selectedJob.cleaner_id) {
        alert('Please select a valid completed job with an assigned cleaner.');
        return;
      }

      this.isSubmitting = true;

      const ratingData: RatingRequest = {
        bookingId: this.selectedJobId,
        reviewerId: this.user.id!,
        revieweeId: selectedJob.cleaner_id,
        rating: parseInt(this.ratingForm.value.rating),
        wouldRecommend: this.ratingForm.value.wouldRecommend,
        testimonial: this.ratingForm.value.testimonial || ''
      };

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.auth.getToken()}`,
        'Content-Type': 'application/json'
      });

      this.http.post('http://localhost:8080/api/ratings', ratingData, { headers })
        .subscribe({
          next: (response: any) => {
            alert('Rating submitted successfully!');
            this.ratingForm.reset();
            this.submitted = false;
            this.selectedJobId = null;
            // Redirect back to client dashboard
            this.router.navigate(['/client']);
          },
          error: (err) => {
            console.error('Rating submission failed:', err);
            alert(err.error?.message || 'Failed to submit rating. Please try again.');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
    } else {
      alert('Please fill in all required fields and select a job to rate.');
    }
  }

  goBack() {
    this.router.navigate(['/client']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
