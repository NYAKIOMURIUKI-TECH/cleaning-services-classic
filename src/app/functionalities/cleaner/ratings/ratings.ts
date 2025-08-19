import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { User } from '../../../shared/models/user.model';

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

interface AverageRating {
  userId: string;
  totalRatings: number;
  averageRating: string;
  recommendations: number;
  recommendationPercentage: string;
}

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ratings.html',
  styleUrls: ['./ratings.scss']
})
export class Ratings implements OnInit {
  user: User | null = null;
  ratings: RatingData[] = [];
  averageRating: AverageRating | null = null;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadRatings();
    this.loadAverageRating();
  }

  loadRatings() {
    if (!this.user?.id) return;

    this.isLoading = true;
    this.http.get<RatingData[]>(`http://localhost:8080/api/ratings/user/${this.user.id}`).subscribe({
      next: (ratings: RatingData[]) => {
        this.ratings = ratings;
      },
      error: (err: any) => {
        console.error('Error loading ratings:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadAverageRating() {
    if (!this.user?.id) return;

    this.http.get<AverageRating>(`http://localhost:8080/api/ratings/user/${this.user.id}/average`).subscribe({
      next: (averageRating: AverageRating) => {
        this.averageRating = averageRating;
      },
      error: (err: any) => {
        console.error('Error loading average rating:', err);
      }
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  getAverageStarArray(): boolean[] {
    if (!this.averageRating) return Array(5).fill(false);
    const avgRating = parseFloat(this.averageRating.averageRating);
    return Array(5).fill(false).map((_, i) => i < Math.round(avgRating));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/cleaner']);
  }
}
