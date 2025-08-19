import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email = '';
  password = '';
  isSubmitting = false;

  constructor(private auth: AuthService) {}

  login() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        // Redirect is handled in the service
      },
      error: (err) => {
        console.error('Login error:', err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
