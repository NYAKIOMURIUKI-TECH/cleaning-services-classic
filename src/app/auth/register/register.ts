import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { Role } from '../../shared/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  fullName = '';
  email = '';
  password = '';
  phone = '';
  location = '';
  role: Role | '' = '';

  // Cleaner-specific fields
  bio = '';
  skills = '';
  experienceYears: number | null = null;

  isSubmitting = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRoleChange() {
    // Reset cleaner-specific fields when role changes
    if (this.role !== 'cleaner') {
      this.bio = '';
      this.skills = '';
      this.experienceYears = null;
    }
  }

  register() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    // Prepare registration data
    const registrationData: any = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      phone: this.phone,
      location: this.location,
      role: this.role
    };

    // Add cleaner-specific data if role is cleaner
    if (this.role === 'cleaner') {
      registrationData.bio = this.bio;
      registrationData.skills = this.skills;
      registrationData.experience_years = this.experienceYears;
    }

    this.auth.register(registrationData)
      .subscribe({
        next: (response) => {
          alert('Registration successful! Please login.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Registration error:', err);
          alert(err.error?.message || 'Registration failed. Please try again.');
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }
}
