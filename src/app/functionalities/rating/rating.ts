import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rating',
  standalone: true, // ✅ Declare this as a standalone component
  imports: [CommonModule, ReactiveFormsModule], // ✅ Use ReactiveFormsModule
  templateUrl: './rating.html',
  styleUrls: ['./rating.scss']
})
export class Rating {
  ratingForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.ratingForm = this.fb.group({
      cleanerName: ['', Validators.required],
      customerName: ['', Validators.required],
      rating: ['', Validators.required],
      wouldRecommend: [false],
      testimonial: ['']
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.ratingForm.valid) {
      console.log('Rating submitted:', this.ratingForm.value);
      alert('Thank you for your feedback!');

      this.ratingForm.reset();
      this.submitted = false;
    }
  }
}
