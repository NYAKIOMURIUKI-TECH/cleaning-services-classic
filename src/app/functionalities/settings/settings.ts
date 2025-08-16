import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../services/settings.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  settingsForm: FormGroup;
  selectedImage: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isLoading = false;
  message = '';
  userId: number = 0;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {
    this.settingsForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      location: [''],
      profilePicture: ['']
    });
  }

  ngOnInit() {
    this.getUserId();
    this.loadCurrentProfile();
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
      console.error('No user ID found. Cannot load profile.');
      this.message = 'Please log in to access your profile settings.';
    }
  }

  loadCurrentProfile() {
    if (!this.userId) return;

    this.settingsService.getCurrentProfile(this.userId).subscribe({
      next: (response: any) => {
        if (response.success && response.user) {
          this.settingsForm.patchValue({
            fullName: response.user.fullName || '',
            email: response.user.email || '',
            location: response.user.location || '',
            profilePicture: response.user.profilePicture || ''
          });

          if (response.user.profilePicture) {
            this.previewUrl = response.user.profilePicture;
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        this.message = 'Failed to load profile data';
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.settingsForm.patchValue({ profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.settingsForm.invalid) {
      this.message = 'Please fill in all required fields correctly';
      return;
    }

    if (!this.userId) return;

    this.isLoading = true;
    this.message = '';

    const profileData = {
      fullName: this.settingsForm.value.fullName,
      email: this.settingsForm.value.email,
      location: this.settingsForm.value.location,
      profilePicture: this.settingsForm.value.profilePicture
    };

    this.settingsService.updateProfile(this.userId, profileData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.message = 'Profile updated successfully!';
          alert('Profile updated successfully!');
        } else {
          this.message = response.message || 'Failed to update profile';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Update failed:', error);
        this.message = error.message || 'Failed to update profile';
      }
    });
  }
}
