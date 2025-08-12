import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import{SettingsService} from '../../services/settings.service';
import { FormsModule,ReactiveFormsModule,FormBuilder, FormGroup} from '@angular/forms';
@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  //styleUrls: ['./settings.scss']
})
export class Settings {
settingsForm: FormGroup;
  selectedImage: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {
    this.settingsForm = this.fb.group({
      name: [''],
      email: [''],
      location: [''],
      profilePicture: [null],
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.selectedImage = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = e => this.previewUrl = reader.result;
    reader.readAsDataURL(file);
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('name', this.settingsForm.value.name);
    formData.append('email', this.settingsForm.value.email);
    formData.append('location', this.settingsForm.value.location);

    if (this.selectedImage) {
      formData.append('profilePicture', this.selectedImage);
    }

    this.settingsService.updateProfile(formData).subscribe({
      next: res => alert('Profile updated successfully'),
      error: err => console.error('Update failed', err)
    });
  }
}

