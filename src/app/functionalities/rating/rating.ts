import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './rating.html',
  styleUrl: './rating.scss'
})
export class Rating implements OnInit {
  ratingForm!: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.ratingForm = this.fb.group({
      cleanerName: ['', Validators.required],
      clientName: ['', Validators.required],    // Changed from customerName
      rating: ['', Validators.required],
      wouldRecommend: [false],
      testimonial: ['']
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.ratingForm.valid) {
      const ratingData = {
        cleanerName: this.ratingForm.value.cleanerName,
        clientName: this.ratingForm.value.clientName,    // Changed from customerName
        rating: parseInt(this.ratingForm.value.rating),
        wouldRecommend: this.ratingForm.value.wouldRecommend,
        testimonial: this.ratingForm.value.testimonial
      };

      this.http.post('http://localhost:8080/api/ratings', ratingData)
        .subscribe({
          next: (response: any) => {
            alert('Rating submitted successfully!');
            this.ratingForm.reset();
            this.submitted = false;
          },
          error: (err) => {
            console.error('Rating submission failed:', err);
            alert('Failed to submit rating. Please try again.');
          }
        });
    } else {
      alert('Please fill in all required fields.');
    }
  }
}